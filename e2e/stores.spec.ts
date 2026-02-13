import { test, expect } from '@playwright/test';
import { mockAuthSession } from './helpers/auth';

test.describe('Store Management', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated session with proper Supabase format
    await mockAuthSession(context);
    
    await page.goto('/stores');
  });

  test('stores page loads', async ({ page }) => {
    await expect(page).toHaveURL('/stores');
    await expect(page.locator('h1')).toContainText(/Stores/i);
  });

  test('create store button is present', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("New"), a:has-text("New")').first();
    await expect(createButton).toBeVisible();
  });

  test('stores table or list is present', async ({ page }) => {
    const table = page.locator('table, [class*="list"], [role="list"]').first();
    // Table may be empty but should exist
    await expect(table).toBeVisible();
  });
});

test.describe('Store Creation Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated session with proper Supabase format
    await mockAuthSession(context);
    
    await page.goto('/stores/new');
  });

  test('create store form loads', async ({ page }) => {
    await expect(page).toHaveURL('/stores/new');
    await expect(page.locator('h1')).toContainText(/Create Store|New Store/i);
  });

  test('store name input is present', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible();
  });

  test('store slug input is present', async ({ page }) => {
    const slugInput = page.locator('input[name="slug"], input[placeholder*="slug" i], input[placeholder*="url" i]').first();
    await expect(slugInput).toBeVisible();
  });

  test('create button is present', async ({ page }) => {
    const createButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await expect(createButton).toBeVisible();
  });
});
