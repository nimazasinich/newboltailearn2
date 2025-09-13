import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Persian Legal AI/i);
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'invalid_user');
    await page.fill('input[type="password"]', 'invalid_pass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Use test credentials
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('.dashboard-header')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(/.*dashboard/);
    
    // Logout
    await page.click('button[aria-label="Logout"]');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should persist session on refresh', async ({ page }) => {
    // Login
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(/.*dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('.dashboard-header')).toBeVisible();
  });
});