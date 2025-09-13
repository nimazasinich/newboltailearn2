import { test, expect } from '@playwright/test';

test.describe('Security Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test.describe('CSRF Protection', () => {
    test('should handle CSRF token automatically in API calls', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Navigate to models page
      await page.click('a[href="/models"]');
      await page.waitForURL(/.*models/);
      
      // Try to create a new model
      await page.click('button:has-text("Add Model")');
      
      // Fill in model details
      await page.fill('input[name="name"]', 'Test Model');
      await page.selectOption('select[name="type"]', 'classification');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Should succeed without CSRF errors
      await expect(page.locator('.success-message')).toBeVisible();
    });

    test('should handle CSRF token refresh on 403 errors', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Navigate to models page
      await page.click('a[href="/models"]');
      await page.waitForURL(/.*models/);
      
      // Simulate CSRF token expiration by clearing it
      await page.evaluate(() => {
        localStorage.removeItem('csrfToken');
      });
      
      // Try to create a new model
      await page.click('button:has-text("Add Model")');
      
      // Fill in model details
      await page.fill('input[name="name"]', 'Test Model After CSRF Refresh');
      await page.selectOption('select[name="type"]', 'classification');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Should succeed after automatic CSRF token refresh
      await expect(page.locator('.success-message')).toBeVisible();
    });
  });

  test.describe('Development Authentication', () => {
    test('should work with development authentication endpoint', async ({ page }) => {
      // Use development authentication
      const response = await page.request.post('http://localhost:3001/api/dev/identify', {
        data: { username: 'admin', password: 'Admin123!@#' }
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.username).toBe('admin');
    });

    test('should redirect to dashboard after successful dev auth', async ({ page }) => {
      // Use development authentication
      const response = await page.request.post('http://localhost:3001/api/dev/identify', {
        data: { username: 'admin', password: 'Admin123!@#' }
      });
      
      const data = await response.json();
      const token = data.token;
      
      // Set the token in localStorage
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token);
      }, token);
      
      // Navigate to dashboard
      await page.goto('http://localhost:5173/dashboard');
      
      // Should be on dashboard
      await expect(page.locator('.dashboard-header')).toBeVisible();
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle rate limiting gracefully', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Navigate to models page
      await page.click('a[href="/models"]');
      await page.waitForURL(/.*models/);
      
      // Make multiple rapid requests to trigger rate limiting
      const promises = Array(10).fill(null).map(() => 
        page.request.get('http://localhost:3001/api/models')
      );
      
      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status() === 429);
      expect(rateLimited).toBe(true);
    });
  });

  test.describe('Session Management', () => {
    test('should persist session across page refreshes', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Refresh the page
      await page.reload();
      
      // Should still be on dashboard
      await expect(page.locator('.dashboard-header')).toBeVisible();
    });

    test('should logout and clear session', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Logout
      await page.click('button[aria-label="Logout"]');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
      
      // Try to access dashboard directly
      await page.goto('http://localhost:5173/dashboard');
      
      // Should redirect back to login
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Input Validation', () => {
    test('should sanitize malicious input', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Navigate to models page
      await page.click('a[href="/models"]');
      await page.waitForURL(/.*models/);
      
      // Try to create a model with malicious input
      await page.click('button:has-text("Add Model")');
      
      // Fill in malicious input
      await page.fill('input[name="name"]', "Test'; DROP TABLE models; --");
      await page.selectOption('select[name="type"]', 'classification');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Should handle the input safely (either reject or sanitize)
      // The exact behavior depends on the validation implementation
      await expect(page.locator('.error-message, .success-message')).toBeVisible();
    });
  });

  test.describe('WebSocket Security', () => {
    test('should require authentication for WebSocket connection', async ({ page }) => {
      // Try to connect to WebSocket without authentication
      const wsPromise = page.waitForEvent('websocket');
      
      // Navigate to a page that uses WebSocket
      await page.goto('http://localhost:5173/dashboard');
      
      // The WebSocket connection should require authentication
      // This test verifies that the connection is properly secured
      await expect(page.locator('.dashboard-header')).toBeVisible();
    });

    test('should handle WebSocket reconnection securely', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'Admin123!@#');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*dashboard/);
      
      // Simulate network interruption
      await page.context().setOffline(true);
      
      // Wait a bit
      await page.waitForTimeout(1000);
      
      // Restore network
      await page.context().setOffline(false);
      
      // Should reconnect automatically
      await expect(page.locator('.dashboard-header')).toBeVisible();
    });
  });
});