import { test, expect } from '@playwright/test';

// TODO: These tests require seeded data. Either:
// 1. Add a test data seeding script to run before tests
// 2. Create stores/campaigns via API in beforeAll hooks
// 3. Use test.skip until data seeding is implemented

test.describe('Public Storefront', () => {
  test.skip('storefront loads for a valid store', async ({ page }) => {
    // REQUIRES: A store with slug 'demo-store' to exist in the database
    // TODO: Seed test data or create store via API before running this test
    await page.goto('/s/demo-store', { waitUntil: 'networkidle' });
    
    // Storefront should load without authentication
    await expect(page.locator('h1, [class*="store-name"], [class*="title"]')).toBeVisible();
  });

  test.skip('storefront shows campaign information', async ({ page }) => {
    // REQUIRES: Seeded store and campaign data
    await page.goto('/s/demo-store', { waitUntil: 'networkidle' });
    
    // Look for campaign content
    const campaignContent = page.locator('[class*="campaign"], [class*="product"], h2').first();
    await expect(campaignContent).toBeVisible();
  });

  test.skip('storefront has navigation', async ({ page }) => {
    // REQUIRES: Seeded store data
    await page.goto('/s/demo-store', { waitUntil: 'networkidle' });
    
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('invalid store slug returns 404 or error page', async ({ page }) => {
    await page.goto('/s/non-existent-store-12345', { waitUntil: 'networkidle' });
    
    // Should show 404 or error message
    const errorContent = page.locator('text=/not found|404|error/i, h1:has-text(/not found|404/i)').first();
    await expect(errorContent).toBeVisible();
  });
});

test.describe('Storefront - Campaign View', () => {
  test.skip('individual campaign page loads', async ({ page }) => {
    // REQUIRES: Seeded campaign data
    await page.goto('/s/demo-store/campaign-1', { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test.skip('product variants are displayed', async ({ page }) => {
    // REQUIRES: Seeded campaign with variants
    await page.goto('/s/demo-store/campaign-1', { waitUntil: 'networkidle' });
    
    // Look for variant selectors (size, color, etc.)
    const variants = page.locator('button[role="radio"], select, [class*="variant"], [class*="option"]').first();
    await expect(variants).toBeVisible();
  });

  test.skip('add to cart button is present', async ({ page }) => {
    // REQUIRES: Seeded campaign data
    await page.goto('/s/demo-store/campaign-1', { waitUntil: 'networkidle' });
    
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add"), [class*="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible();
  });

  test.skip('product images are displayed', async ({ page }) => {
    // REQUIRES: Seeded campaign with images
    await page.goto('/s/demo-store/campaign-1', { waitUntil: 'networkidle' });
    
    const images = page.locator('img').first();
    await expect(images).toBeVisible();
  });
});
