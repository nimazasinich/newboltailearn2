import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should display dashboard components', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('.dashboard-header')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    
    // Check statistics cards
    await expect(page.locator('.stats-card')).toHaveCount(4);
  });

  test('should navigate to models page', async ({ page }) => {
    await page.click('a[href*="/models"]');
    await expect(page).toHaveURL(/.*models/);
    await expect(page.locator('h1')).toContainText(/مدل‌ها|Models/i);
  });

  test('should navigate to datasets page', async ({ page }) => {
    await page.click('a[href*="/datasets"]');
    await expect(page).toHaveURL(/.*datasets/);
    await expect(page.locator('h1')).toContainText(/دیتاست‌ها|Datasets/i);
  });

  test('should navigate to training page', async ({ page }) => {
    await page.click('a[href*="/training"]');
    await expect(page).toHaveURL(/.*training/);
    await expect(page.locator('h1')).toContainText(/آموزش|Training/i);
  });

  test('should display real-time metrics', async ({ page }) => {
    // Check for metrics components
    await expect(page.locator('.metrics-chart')).toBeVisible();
    await expect(page.locator('.activity-feed')).toBeVisible();
  });

  test('should handle WebSocket connection', async ({ page }) => {
    // Check for WebSocket status indicator
    await expect(page.locator('.connection-status')).toBeVisible();
    
    // Should show connected status
    await expect(page.locator('.connection-status')).toHaveClass(/connected/);
  });
});