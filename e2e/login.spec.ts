import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should load login page successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login page elements
    await expect(page).toHaveURL(/\/login/);
    
    // Look for common login elements (adjust based on actual implementation)
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should have email and password fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check for form inputs (adjust selectors based on implementation)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });
});
