import { test, expect } from '@playwright/test';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3001';

// Test configuration
const testConfig = {
  timeout: 30000,
  retries: 2
};

test.describe('Phase 3 Integration Tests', () => {
  
  test.describe('Advanced Analytics Dashboard', () => {
    test('should load analytics dashboard', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/analytics`);
      
      // Wait for dashboard to load
      await page.waitForSelector('[data-testid="analytics-dashboard"]', { timeout: 10000 });
      
      // Check for key metrics cards
      await expect(page.locator('[data-testid="total-models-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="best-accuracy-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="training-hours-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-health-card"]')).toBeVisible();
    });

    test('should display model performance charts', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/analytics`);
      
      // Wait for charts to load
      await page.waitForSelector('[data-testid="performance-chart"]', { timeout: 15000 });
      
      // Check for chart elements
      await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="distribution-chart"]')).toBeVisible();
    });

    test('should filter analytics by time range', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/analytics`);
      
      // Select different time range
      await page.selectOption('[data-testid="time-range-select"]', '30d');
      
      // Wait for data to update
      await page.waitForTimeout(2000);
      
      // Verify filter is applied
      const selectedValue = await page.inputValue('[data-testid="time-range-select"]');
      expect(selectedValue).toBe('30d');
    });

    test('should export analytics data', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/analytics`);
      
      // Click export button
      await page.click('[data-testid="export-csv-btn"]');
      
      // Wait for download to start
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
    });

    test('should show real-time updates', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/analytics`);
      
      // Enable auto refresh
      await page.click('[data-testid="auto-refresh-toggle"]');
      
      // Wait for updates
      await page.waitForTimeout(5000);
      
      // Verify auto refresh is enabled
      const isEnabled = await page.isChecked('[data-testid="auto-refresh-toggle"]');
      expect(isEnabled).toBe(true);
    });
  });

  test.describe('Model Performance Optimization', () => {
    test('should start hyperparameter optimization', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/models`);
      
      // Create a test model first
      await page.click('[data-testid="create-model-btn"]');
      await page.fill('[data-testid="model-name-input"]', 'Test Optimization Model');
      await page.selectOption('[data-testid="model-type-select"]', 'persian-bert');
      await page.click('[data-testid="save-model-btn"]');
      
      // Wait for model to be created
      await page.waitForSelector('[data-testid="model-row"]', { timeout: 10000 });
      
      // Start optimization
      await page.click('[data-testid="optimize-model-btn"]');
      
      // Configure optimization
      await page.selectOption('[data-testid="optimization-type"]', 'hyperparameter');
      await page.fill('[data-testid="target-accuracy"]', '0.9');
      await page.click('[data-testid="start-optimization-btn"]');
      
      // Wait for optimization to start
      await page.waitForSelector('[data-testid="optimization-status"]', { timeout: 10000 });
      
      // Verify optimization is running
      const status = await page.textContent('[data-testid="optimization-status"]');
      expect(status).toContain('running');
    });

    test('should display optimization progress', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/optimization`);
      
      // Wait for optimization list to load
      await page.waitForSelector('[data-testid="optimization-list"]', { timeout: 10000 });
      
      // Check for optimization progress
      await expect(page.locator('[data-testid="optimization-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="best-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="iterations"]')).toBeVisible();
    });

    test('should show optimization recommendations', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/optimization`);
      
      // Wait for recommendations to load
      await page.waitForSelector('[data-testid="recommendations"]', { timeout: 10000 });
      
      // Check for recommendation items
      const recommendations = await page.locator('[data-testid="recommendation-item"]').count();
      expect(recommendations).toBeGreaterThan(0);
    });

    test('should export optimization results', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/optimization`);
      
      // Click export button
      await page.click('[data-testid="export-optimization-btn"]');
      
      // Wait for download
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
    });
  });

  test.describe('Docker Deployment', () => {
    test('should build Docker image successfully', async () => {
      const { execSync } = require('child_process');
      
      try {
        // Build Docker image
        const buildOutput = execSync('docker build -t persian-legal-ai:test .', { 
          encoding: 'utf8',
          timeout: 300000 // 5 minutes
        });
        
        expect(buildOutput).toContain('Successfully built');
      } catch (error) {
        throw new Error(`Docker build failed: ${error.message}`);
      }
    });

    test('should run Docker container successfully', async () => {
      const { execSync } = require('child_process');
      
      try {
        // Start container
        execSync('docker run -d --name test-container -p 3002:3001 persian-legal-ai:test', {
          timeout: 30000
        });
        
        // Wait for container to start
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Test API endpoint
        const response = await axios.get('http://localhost:3002/api/monitoring', {
          timeout: 10000
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('cpu');
        expect(response.data).toHaveProperty('memory');
        
        // Clean up
        execSync('docker stop test-container && docker rm test-container');
        
      } catch (error) {
        // Clean up on error
        try {
          execSync('docker stop test-container && docker rm test-container');
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError.message);
        }
        throw error;
      }
    });

    test('should run with docker-compose', async () => {
      const { execSync } = require('child_process');
      
      try {
        // Start services
        execSync('docker-compose up -d', { timeout: 60000 });
        
        // Wait for services to start
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Test API endpoint
        const response = await axios.get('http://localhost:3001/api/monitoring', {
          timeout: 10000
        });
        
        expect(response.status).toBe(200);
        
        // Clean up
        execSync('docker-compose down');
        
      } catch (error) {
        // Clean up on error
        try {
          execSync('docker-compose down');
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError.message);
        }
        throw error;
      }
    });
  });

  test.describe('API Integration', () => {
    test('should return advanced analytics data', async () => {
      const response = await axios.get(`${API_BASE}/analytics/advanced`, {
        timeout: 10000
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('modelPerformance');
      expect(response.data).toHaveProperty('trainingAnalytics');
      expect(response.data).toHaveProperty('systemAnalytics');
      expect(response.data).toHaveProperty('recommendations');
    });

    test('should start model optimization', async () => {
      // First create a model
      const modelResponse = await axios.post(`${API_BASE}/models`, {
        name: 'Test Optimization Model',
        type: 'persian-bert',
        dataset_id: 'iran-legal-qa',
        config: {
          epochs: 5,
          batchSize: 32,
          learningRate: 0.001
        }
      });
      
      const modelId = modelResponse.data.id;
      
      // Start optimization
      const optimizationResponse = await axios.post(`${API_BASE}/models/${modelId}/optimize`, {
        optimizationType: 'hyperparameter',
        parameters: {
          learningRate: 0.001,
          batchSize: 32,
          epochs: 5
        },
        constraints: {
          targetAccuracy: 0.9,
          maxTrainingTime: 3600
        }
      });
      
      expect(optimizationResponse.status).toBe(200);
      expect(optimizationResponse.data).toHaveProperty('optimizationId');
      
      // Clean up
      await axios.delete(`${API_BASE}/models/${modelId}`);
    });

    test('should get optimization status', async () => {
      const response = await axios.get(`${API_BASE}/optimization/status`, {
        timeout: 10000
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('optimizations');
    });

    test('should export analytics in different formats', async () => {
      // Test CSV export
      const csvResponse = await axios.get(`${API_BASE}/analytics/export?format=csv`, {
        timeout: 10000
      });
      expect(csvResponse.status).toBe(200);
      
      // Test JSON export
      const jsonResponse = await axios.get(`${API_BASE}/analytics/export?format=json`, {
        timeout: 10000
      });
      expect(jsonResponse.status).toBe(200);
      expect(jsonResponse.data).toHaveProperty('modelStats');
    });
  });

  test.describe('System Performance', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array(10).fill().map(() => 
        axios.get(`${API_BASE}/monitoring`, { timeout: 5000 })
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('cpu');
        expect(response.data).toHaveProperty('memory');
      });
    });

    test('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      // Make multiple requests
      const requests = Array(20).fill().map(() => 
        axios.get(`${API_BASE}/analytics`, { timeout: 10000 })
      );
      
      await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(30000); // 30 seconds
    });

    test('should handle WebSocket connections', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/monitoring`);
      
      // Wait for WebSocket connection
      await page.waitForSelector('[data-testid="websocket-status"]', { timeout: 10000 });
      
      // Check WebSocket status
      const status = await page.textContent('[data-testid="websocket-status"]');
      expect(status).toContain('connected');
      
      // Wait for real-time updates
      await page.waitForTimeout(5000);
      
      // Verify metrics are updating
      const cpuValue = await page.textContent('[data-testid="cpu-usage"]');
      expect(cpuValue).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/analytics`);
      
      // Simulate network error
      await page.route('**/api/analytics', route => route.abort());
      
      // Wait for error handling
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      
      // Verify error message is displayed
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('Error');
    });

    test('should handle invalid optimization parameters', async () => {
      try {
        await axios.post(`${API_BASE}/models/999/optimize`, {
          optimizationType: 'invalid',
          parameters: {}
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist optimization results', async () => {
      // Create and start optimization
      const modelResponse = await axios.post(`${API_BASE}/models`, {
        name: 'Persistence Test Model',
        type: 'persian-bert',
        dataset_id: 'iran-legal-qa'
      });
      
      const modelId = modelResponse.data.id;
      
      // Start optimization
      const optimizationResponse = await axios.post(`${API_BASE}/models/${modelId}/optimize`, {
        optimizationType: 'hyperparameter',
        parameters: { learningRate: 0.001 }
      });
      
      const optimizationId = optimizationResponse.data.optimizationId;
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if optimization is persisted
      const statusResponse = await axios.get(`${API_BASE}/optimization/${optimizationId}`);
      expect(statusResponse.status).toBe(200);
      expect(statusResponse.data).toHaveProperty('id', optimizationId);
      
      // Clean up
      await axios.delete(`${API_BASE}/models/${modelId}`);
    });
  });
});

// Helper functions
async function waitForElement(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { timeout });
}

async function waitForApiResponse(url, timeout = 10000) {
  const response = await axios.get(url, { timeout });
  return response;
}