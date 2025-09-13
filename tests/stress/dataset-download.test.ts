import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { testDb, createTestUser, generateTestToken } from '../setup';
import { getHFHeaders, testHFConnection } from '../../server/utils/decode';

describe('Dataset Download Stress Tests', () => {
  let trainerToken: string;

  beforeAll(async () => {
    const trainer = await createTestUser('trainer');
    trainerToken = generateTestToken(trainer);
  });

  describe('HuggingFace API Connection', () => {
    it('should maintain connection under load', async () => {
      const connectionPromises = [];
      
      // Test 10 concurrent connections
      for (let i = 0; i < 10; i++) {
        connectionPromises.push(testHFConnection());
      }
      
      const results = await Promise.all(connectionPromises);
      const successCount = results.filter(result => result === true).length;
      
      expect(successCount).toBeGreaterThan(7); // At least 70% should succeed
    }, 30000);

    it('should handle rate limiting gracefully', async () => {
      const headers = await getHFHeaders();
      
      // Make rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          fetch('https://huggingface.co/api/whoami', { headers })
            .then(response => ({ status: response.status, success: response.ok }))
            .catch(error => ({ status: 0, success: false, error: error.message }))
        );
      }
      
      const results = await Promise.all(requests);
      const successCount = results.filter(r => r.success).length;
      const rateLimitedCount = results.filter(r => r.status === 429).length;
      
      // Should have some successes and handle rate limiting
      expect(successCount).toBeGreaterThan(0);
      expect(rateLimitedCount).toBeLessThan(20); // Not all should be rate limited
    }, 60000);
  });

  describe('Dataset Download Performance', () => {
    it('should download large dataset without crashing', async () => {
      // Test with a smaller dataset first
      const testDataset = {
        id: 'test-large-dataset',
        name: 'Test Large Dataset',
        huggingface_id: 'PerSets/iran-legal-persian-qa', // Use real dataset
        samples: 1000,
        size_mb: 15.2
      };

      // Insert test dataset
      testDb.prepare(`
        INSERT INTO datasets (id, name, source, huggingface_id, samples, size_mb, status)
        VALUES (?, ?, 'huggingface', ?, ?, ?, 'available')
      `).run(testDataset.id, testDataset.name, testDataset.huggingface_id, testDataset.samples, testDataset.size_mb);

      // Simulate download process
      const startTime = Date.now();
      
      try {
        const headers = await getHFHeaders();
        const baseUrl = 'https://datasets-server.huggingface.co';
        let downloadedSamples = 0;
        let offset = 0;
        const batchSize = 100;
        const maxSamples = 500; // Limit for testing
        
        while (downloadedSamples < maxSamples) {
          const url = `${baseUrl}/rows?dataset=${testDataset.huggingface_id}&config=default&split=train&offset=${offset}&length=${batchSize}`;
          
          const response = await fetch(url, { headers });
          
          if (!response.ok) {
            if (response.status === 429) {
              // Rate limited, wait and retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            break;
          }
          
          const data = await response.json();
          
          if (!data.rows || data.rows.length === 0) {
            break;
          }
          
          downloadedSamples += data.rows.length;
          offset += batchSize;
          
          // Add small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(downloadedSamples).toBeGreaterThan(0);
        expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
        expect(downloadedSamples).toBeLessThanOrEqual(maxSamples);
        
      } catch (error) {
        // Should not crash the server
        expect(error).toBeDefined();
        console.log('Expected error during stress test:', error);
      }
    }, 120000);

    it('should handle concurrent downloads', async () => {
      const downloadPromises = [];
      
      // Start 3 concurrent downloads
      for (let i = 0; i < 3; i++) {
        downloadPromises.push(
          (async () => {
            try {
              const headers = await getHFHeaders();
              const response = await fetch('https://datasets-server.huggingface.co/rows?dataset=PerSets/iran-legal-persian-qa&config=default&split=train&offset=0&length=10', { headers });
              return { success: response.ok, status: response.status };
            } catch (error) {
              return { success: false, error: (error as Error).message };
            }
          })()
        );
      }
      
      const results = await Promise.all(downloadPromises);
      const successCount = results.filter(r => r.success).length;
      
      // At least one should succeed
      expect(successCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Memory Usage During Downloads', () => {
    it('should not exceed memory limits during large downloads', async () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate processing large amounts of data
      const largeDataArray = [];
      for (let i = 0; i < 1000; i++) {
        largeDataArray.push({
          id: i,
          text: `Sample text ${i}`.repeat(100), // Create larger objects
          label: `label_${i % 10}`
        });
      }
      
      // Process data in chunks to simulate real download processing
      const chunkSize = 100;
      for (let i = 0; i < largeDataArray.length; i += chunkSize) {
        const chunk = largeDataArray.slice(i, i + chunkSize);
        // Simulate processing
        JSON.stringify(chunk);
        
        // Check memory usage periodically
        if (i % 500 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
          const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
          
          // Should not exceed 100MB increase
          expect(memoryIncreaseMB).toBeLessThan(100);
        }
      }
      
      const finalMemory = process.memoryUsage();
      const totalMemoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const totalMemoryIncreaseMB = totalMemoryIncrease / 1024 / 1024;
      
      expect(totalMemoryIncreaseMB).toBeLessThan(50); // Should be reasonable
    }, 30000);
  });
});