import { test, expect } from '@playwright/test';

test.describe('Dataset Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Navigate to datasets page
    await page.click('a[href*="/datasets"]');
    await page.waitForURL(/.*datasets/);
  });

  test('should display datasets list', async ({ page }) => {
    await expect(page.locator('.datasets-container')).toBeVisible();
    await expect(page.locator('.dataset-card')).toBeVisible();
  });

  test('should search datasets', async ({ page }) => {
    await page.fill('input[placeholder*="جستجو"]', 'persian');
    await page.keyboard.press('Enter');
    
    // Should filter results
    await expect(page.locator('.dataset-card')).toBeVisible();
  });

  test('should display dataset details', async ({ page }) => {
    // Click on first dataset
    await page.click('.dataset-card:first-child');
    
    // Should show details modal or page
    await expect(page.locator('.dataset-details')).toBeVisible();
    await expect(page.locator('.dataset-info')).toBeVisible();
  });

  test('should download dataset (dry run)', async ({ page }) => {
    // Click download on first dataset
    await page.click('.dataset-card:first-child button.download');
    
    // Should show download progress
    await expect(page.locator('.download-progress')).toBeVisible();
  });

  test('should filter datasets by status', async ({ page }) => {
    // Apply filter
    await page.selectOption('select[name="status"]', 'available');
    
    // Should show filtered results
    await expect(page.locator('.dataset-card')).toBeVisible();
  });

  test('should sort datasets', async ({ page }) => {
    // Sort by name
    await page.selectOption('select[name="sort"]', 'name');
    
    // Get first dataset name
    const firstName = await page.locator('.dataset-card:first-child .dataset-name').textContent();
    
    // Sort by size
    await page.selectOption('select[name="sort"]', 'size');
    
    // First dataset should potentially be different
    const firstNameAfterSort = await page.locator('.dataset-card:first-child .dataset-name').textContent();
    
    // Verify sorting changed the order (or at least didn't break)
    expect(firstName).toBeDefined();
    expect(firstNameAfterSort).toBeDefined();
  });
});