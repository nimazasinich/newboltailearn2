import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'Landing Page', selector: 'h1' },
  { path: '/overview', name: 'Overview', selector: '[data-testid="overview-page"], h1' },
  { path: '/dashboard-advanced', name: 'Dashboard', selector: '[data-testid="dashboard-page"], h1' },
  { path: '/analytics', name: 'Analytics', selector: '[data-testid="analytics-page"], h1' },
  { path: '/data', name: 'Data', selector: '[data-testid="data-page"], h1' },
  { path: '/logs', name: 'Logs', selector: '[data-testid="logs-page"], h1' },
  { path: '/models', name: 'Models', selector: '[data-testid="models-page"], h1' },
  { path: '/monitoring', name: 'Monitoring', selector: '[data-testid="monitoring-page"], h1' },
  { path: '/training', name: 'Training', selector: '[data-testid="training-page"], h1' },
  { path: '/team', name: 'Team', selector: '[data-testid="team-page"], h1' },
  { path: '/settings', name: 'Settings', selector: '[data-testid="settings-page"], h1' },
  { path: '/download', name: 'Download', selector: '[data-testid="download-page"], h1' },
];

test.describe('Route Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for page loads
    page.setDefaultTimeout(10000);
  });

  for (const route of routes) {
    test(`should navigate to ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      
      // Wait for the page to load and check for the expected selector
      await expect(page.locator(route.selector).first()).toBeVisible({ timeout: 5000 });
      
      // Check that we're on the correct URL
      expect(page.url()).toContain(route.path);
    });
  }

  test('should redirect /dashboard to /dashboard-advanced', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for redirect
    await page.waitForURL('**/dashboard-advanced', { timeout: 5000 });
    
    // Verify we're on the dashboard advanced page
    expect(page.url()).toContain('/dashboard-advanced');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    
    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Page not found')).toBeVisible();
  });
});

test.describe('Sidebar Navigation', () => {
  test('should navigate via sidebar links', async ({ page }) => {
    // Start from overview page (has sidebar)
    await page.goto('/overview');
    
    // Wait for sidebar to be visible
    await expect(page.locator('[data-testid="sidebar"], nav').first()).toBeVisible({ timeout: 5000 });
    
    // Test a few key navigation items
    const navItems = [
      { text: 'نمای کلی', expectedPath: '/overview' },
      { text: 'داشبورد پیشرفته', expectedPath: '/dashboard-advanced' },
      { text: 'تحلیل‌ها', expectedPath: '/analytics' },
      { text: 'مدل‌ها', expectedPath: '/models' },
    ];
    
    for (const item of navItems) {
      // Click on the navigation item
      await page.click(`text=${item.text}`);
      
      // Wait for navigation
      await page.waitForURL(`**${item.expectedPath}`, { timeout: 5000 });
      
      // Verify we're on the correct page
      expect(page.url()).toContain(item.expectedPath);
      
      // Verify page has loaded (has some content)
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Loading States', () => {
  test('should show loading indicators', async ({ page }) => {
    await page.goto('/overview');
    
    // Check if loading spinner appears initially (might be too fast to catch)
    // This is more of a smoke test to ensure the page loads without errors
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    
    // Verify page has loaded with content
    await expect(page.locator('body')).not.toHaveText('در حال بارگذاری');
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Block API requests to simulate network issues
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/overview');
    
    // Should still render the page structure even with API errors
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
    
    // May show error messages or fallback content
    // This test ensures the app doesn't completely break
  });
});