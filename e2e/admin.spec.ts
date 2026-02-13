import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated session
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/admin');
  });

  test('admin dashboard loads for authenticated users', async ({ page }) => {
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('h1')).toContainText(/Dashboard|Admin/i);
  });

  test('sidebar navigation is visible', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('stores link is present', async ({ page }) => {
    const storesLink = page.locator('a[href="/stores"], text=/stores/i').first();
    await expect(storesLink).toBeVisible();
  });

  test('campaigns link is present', async ({ page }) => {
    const campaignsLink = page.locator('a[href="/campaigns"], text=/campaigns/i').first();
    await expect(campaignsLink).toBeVisible();
  });

  test('orders link is present', async ({ page }) => {
    const ordersLink = page.locator('a[href="/orders"], text=/orders/i').first();
    await expect(ordersLink).toBeVisible();
  });

  test('dashboard shows key metrics', async ({ page }) => {
    // Check for common metric cards
    const metricCards = page.locator('[class*="card"], [class*="stat"], [class*="metric"]');
    const count = await metricCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Admin Dashboard - Unauthenticated', () => {
  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);
  });
});
