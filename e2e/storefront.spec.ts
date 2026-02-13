import { test, expect } from '@playwright/test';

test.describe('Public Storefront', () => {
  test('storefront loads for a valid store', async ({ page }) => {
    // Note: This assumes a store with slug 'demo-store' exists
    // In a real test, you'd create the store first or use a known test store
    await page.goto('/s/demo-store');
    
    // Storefront should load without authentication
    await expect(page.locator('h1, [class*="store-name"], [class*="title"]')).toBeVisible();
  });

  test('storefront shows campaign information', async ({ page }) => {
    await page.goto('/s/demo-store');
    
    // Look for campaign content
    const campaignContent = page.locator('[class*="campaign"], [class*="product"], h2').first();
    await expect(campaignContent).toBeVisible();
  });

  test('storefront has navigation', async ({ page }) => {
    await page.goto('/s/demo-store');
    
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('invalid store slug returns 404 or error page', async ({ page }) => {
    await page.goto('/s/non-existent-store-12345');
    
    // Should show 404 or error message
    const errorContent = page.locator('text=/not found|404|error/i, h1:has-text(/not found|404/i)').first();
    await expect(errorContent).toBeVisible();
  });
});

test.describe('Storefront - Campaign View', () => {
  test('individual campaign page loads', async ({ page }) => {
    // Assumes campaign with ID exists
    await page.goto('/s/demo-store/campaign-1');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('product variants are displayed', async ({ page }) => {
    await page.goto('/s/demo-store/campaign-1');
    
    // Look for variant selectors (size, color, etc.)
    const variants = page.locator('button[role="radio"], select, [class*="variant"], [class*="option"]').first();
    await expect(variants).toBeVisible();
  });

  test('add to cart button is present', async ({ page }) => {
    await page.goto('/s/demo-store/campaign-1');
    
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add"), [class*="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible();
  });

  test('product images are displayed', async ({ page }) => {
    await page.goto('/s/demo-store/campaign-1');
    
    const images = page.locator('img').first();
    await expect(images).toBeVisible();
  });
});
