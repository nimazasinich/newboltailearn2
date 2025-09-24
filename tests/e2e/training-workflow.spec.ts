import { test, expect } from '@playwright/test';

test.describe('Persian Legal AI - Complete Training Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8080');
    
    // Wait for the application to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('Complete training workflow: login → upload dataset → train model → monitor progress', async ({ page }) => {
    // Step 1: Login (if authentication is required)
    const loginButton = page.locator('[data-testid="login-button"]');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.fill('[data-testid="username-input"]', 'admin');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="submit-login"]');
      await page.waitForSelector('[data-testid="dashboard"]');
    }

    // Step 2: Navigate to Training Management
    await page.click('[data-testid="training-nav"]');
    await page.waitForSelector('[data-testid="training-management"]');

    // Step 3: Create New Training Session
    await page.click('[data-testid="new-training-button"]');
    await page.waitForSelector('[data-testid="training-form"]');

    // Fill training form
    await page.fill('[data-testid="model-name"]', 'Persian Legal BERT Test');
    await page.selectOption('[data-testid="model-type"]', 'persian-bert');
    await page.fill('[data-testid="epochs"]', '5');
    await page.fill('[data-testid="batch-size"]', '16');
    await page.fill('[data-testid="learning-rate"]', '0.001');

    // Step 4: Upload Dataset
    const fileInput = page.locator('[data-testid="dataset-upload"]');
    await fileInput.setInputFiles('datasets/files/sample-legal-mini.zip');
    
    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]', { timeout: 30000 });

    // Step 5: Start Training
    await page.click('[data-testid="start-training-button"]');
    
    // Wait for training to start
    await page.waitForSelector('[data-testid="training-started"]');

    // Step 6: Monitor Training Progress
    const progressBar = page.locator('[data-testid="training-progress"]');
    const accuracyDisplay = page.locator('[data-testid="accuracy-display"]');
    const epochDisplay = page.locator('[data-testid="epoch-display"]');

    // Wait for progress updates
    await expect(progressBar).toBeVisible();
    await expect(accuracyDisplay).toBeVisible();
    await expect(epochDisplay).toBeVisible();

    // Monitor progress for at least 3 epochs
    let progressValue = 0;
    let accuracyValue = 0;
    let epochValue = 0;

    for (let i = 0; i < 3; i++) {
      // Wait for progress update
      await page.waitForTimeout(3000);
      
      // Check that progress is increasing
      const currentProgress = await progressBar.getAttribute('value');
      const currentAccuracy = await accuracyDisplay.textContent();
      const currentEpoch = await epochDisplay.textContent();

      if (currentProgress) {
        const progress = parseFloat(currentProgress);
        expect(progress).toBeGreaterThan(progressValue);
        progressValue = progress;
      }

      if (currentAccuracy) {
        const accuracy = parseFloat(currentAccuracy.replace('%', ''));
        expect(accuracy).toBeGreaterThanOrEqual(accuracyValue);
        accuracyValue = accuracy;
      }

      if (currentEpoch) {
        const epoch = parseInt(currentEpoch);
        expect(epoch).toBeGreaterThan(epochValue);
        epochValue = epoch;
      }
    }

    // Step 7: Wait for Training Completion
    await page.waitForSelector('[data-testid="training-completed"]', { timeout: 60000 });
    
    // Verify final results
    const finalAccuracy = await accuracyDisplay.textContent();
    expect(finalAccuracy).toContain('%');
    
    const finalProgress = await progressBar.getAttribute('value');
    expect(parseFloat(finalProgress || '0')).toBe(100);

    // Step 8: Verify Model is Available
    await page.click('[data-testid="models-nav"]');
    await page.waitForSelector('[data-testid="models-list"]');
    
    const modelCard = page.locator('[data-testid="model-card"]').first();
    await expect(modelCard).toBeVisible();
    
    const modelStatus = await modelCard.locator('[data-testid="model-status"]').textContent();
    expect(modelStatus).toContain('Trained');

    // Step 9: Test Model Inference
    await page.click('[data-testid="test-model-button"]');
    await page.waitForSelector('[data-testid="inference-form"]');
    
    await page.fill('[data-testid="test-text"]', 'قرارداد فروش ملک در تاریخ ۱۴۰۳/۰۱/۱۵ بین آقای احمد محمدی و خانم فاطمه احمدی منعقد گردید.');
    await page.click('[data-testid="classify-button"]');
    
    // Wait for classification result
    await page.waitForSelector('[data-testid="classification-result"]');
    const result = await page.locator('[data-testid="classification-result"]').textContent();
    expect(result).toBeTruthy();
    expect(result).toContain('Category:');
  });

  test('Training error handling', async ({ page }) => {
    // Navigate to training
    await page.goto('http://localhost:8080/#/training');
    await page.waitForSelector('[data-testid="training-management"]');

    // Start training with invalid data
    await page.click('[data-testid="new-training-button"]');
    await page.fill('[data-testid="model-name"]', '');
    await page.click('[data-testid="start-training-button"]');

    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('WebSocket connection and real-time updates', async ({ page }) => {
    // Navigate to training page
    await page.goto('http://localhost:8080/#/training');
    
    // Listen for WebSocket messages
    const wsMessages: any[] = [];
    page.on('websocket', ws => {
      ws.on('framereceived', event => {
        try {
          const data = JSON.parse(event.payload as string);
          wsMessages.push(data);
        } catch (e) {
          // Ignore non-JSON messages
        }
      });
    });

    // Start a training session
    await page.click('[data-testid="new-training-button"]');
    await page.fill('[data-testid="model-name"]', 'WebSocket Test Model');
    await page.selectOption('[data-testid="model-type"]', 'persian-bert');
    await page.click('[data-testid="start-training-button"]');

    // Wait for WebSocket messages
    await page.waitForTimeout(5000);
    
    // Verify we received training progress messages
    const progressMessages = wsMessages.filter(msg => msg.type === 'training-progress');
    expect(progressMessages.length).toBeGreaterThan(0);
    
    // Verify message structure
    const progressMessage = progressMessages[0];
    expect(progressMessage).toHaveProperty('sessionId');
    expect(progressMessage).toHaveProperty('epoch');
    expect(progressMessage).toHaveProperty('progress');
    expect(progressMessage).toHaveProperty('accuracy');
  });
});
