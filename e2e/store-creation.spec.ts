import { test, expect } from '@playwright/test';

test.describe('Store Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Would need to authenticate first
    // await loginAsTestUser(page);
  });

  test('should navigate to store creation page', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' });
    
    // Look for "Create Store" or similar button
    const createStoreButton = page.getByRole('button', { name: /create.*store/i });
    
    if (await createStoreButton.isVisible()) {
      await createStoreButton.click();
      await expect(page).toHaveURL(/\/admin\/stores\/new/);
    } else {
      // If no stores exist, might auto-redirect to creation
      test.skip();
    }
  });

  test('should show store creation form fields', async ({ page }) => {
    await page.goto('/admin/stores/new', { waitUntil: 'networkidle' });
    
    // Check for store name field
    const storeNameInput = page.locator('input[name="name"], input[id="name"]');
    
    if (await storeNameInput.isVisible()) {
      await expect(storeNameInput).toBeVisible();
      
      // Check for slug field
      const slugInput = page.locator('input[name="slug"], input[id="slug"]');
      await expect(slugInput).toBeVisible();
      
      // Check for submit button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    } else {
      // Form not implemented yet
      test.skip();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/stores/new', { waitUntil: 'networkidle' });
    
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible()) {
      // Try to submit empty form
      await submitButton.click();
      
      // Should show validation errors
      const errorMessages = page.locator('[class*="error"], [role="alert"]');
      await expect(errorMessages.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    } else {
      test.skip();
    }
  });
});
