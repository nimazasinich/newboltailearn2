import { test, expect } from '@playwright/test';

test.describe('Training Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Navigate to training page
    await page.click('a[href*="/training"]');
    await page.waitForURL(/.*training/);
  });

  test('should display training interface', async ({ page }) => {
    await expect(page.locator('.training-container')).toBeVisible();
    await expect(page.locator('.model-selector')).toBeVisible();
    await expect(page.locator('.dataset-selector')).toBeVisible();
    await expect(page.locator('.training-config')).toBeVisible();
  });

  test('should select model and dataset', async ({ page }) => {
    // Select model
    await page.selectOption('.model-selector select', { index: 1 });
    
    // Select dataset
    await page.selectOption('.dataset-selector select', { index: 1 });
    
    // Start training button should be enabled
    await expect(page.locator('button.start-training')).toBeEnabled();
  });

  test('should configure training parameters', async ({ page }) => {
    // Select model and dataset
    await page.selectOption('.model-selector select', { index: 1 });
    await page.selectOption('.dataset-selector select', { index: 1 });
    
    // Configure parameters
    await page.fill('input[name="epochs"]', '10');
    await page.fill('input[name="batch_size"]', '32');
    await page.fill('input[name="learning_rate"]', '0.001');
    
    // Verify values
    await expect(page.locator('input[name="epochs"]')).toHaveValue('10');
    await expect(page.locator('input[name="batch_size"]')).toHaveValue('32');
    await expect(page.locator('input[name="learning_rate"]')).toHaveValue('0.001');
  });

  test('should start training session (dry run)', async ({ page }) => {
    // Select model and dataset
    await page.selectOption('.model-selector select', { index: 1 });
    await page.selectOption('.dataset-selector select', { index: 1 });
    
    // Configure for dry run
    await page.fill('input[name="epochs"]', '1');
    await page.check('input[name="dry_run"]');
    
    // Start training
    await page.click('button.start-training');
    
    // Should show progress
    await expect(page.locator('.training-progress')).toBeVisible();
    await expect(page.locator('.progress-bar')).toBeVisible();
  });

  test('should display training logs', async ({ page }) => {
    // Check for logs container
    await expect(page.locator('.training-logs')).toBeVisible();
    
    // Start a dry run
    await page.selectOption('.model-selector select', { index: 1 });
    await page.selectOption('.dataset-selector select', { index: 1 });
    await page.fill('input[name="epochs"]', '1');
    await page.check('input[name="dry_run"]');
    await page.click('button.start-training');
    
    // Should show log entries
    await expect(page.locator('.log-entry')).toBeVisible();
  });

  test('should handle training cancellation', async ({ page }) => {
    // Start training
    await page.selectOption('.model-selector select', { index: 1 });
    await page.selectOption('.dataset-selector select', { index: 1 });
    await page.click('button.start-training');
    
    // Cancel button should appear
    await expect(page.locator('button.cancel-training')).toBeVisible();
    
    // Cancel training
    await page.click('button.cancel-training');
    
    // Should show cancellation message
    await expect(page.locator('.training-cancelled')).toBeVisible();
  });
});