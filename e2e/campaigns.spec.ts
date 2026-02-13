import { test, expect } from '@playwright/test';

test.describe('Campaign Management', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/campaigns');
  });

  test('campaigns page loads', async ({ page }) => {
    await expect(page).toHaveURL('/campaigns');
    await expect(page.locator('h1')).toContainText(/Campaigns/i);
  });

  test('create campaign button is present', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("New"), a:has-text("New")').first();
    await expect(createButton).toBeVisible();
  });

  test('campaigns table or list is present', async ({ page }) => {
    const table = page.locator('table, [class*="list"], [role="list"]').first();
    await expect(table).toBeVisible();
  });
});

test.describe('Campaign Creation Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/campaigns/new');
  });

  test('create campaign form loads', async ({ page }) => {
    await expect(page).toHaveURL('/campaigns/new');
    await expect(page.locator('h1')).toContainText(/Create Campaign|New Campaign/i);
  });

  test('campaign name input is present', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible();
  });

  test('store selection is present', async ({ page }) => {
    const storeSelect = page.locator('select[name="store"], button[role="combobox"]').first();
    await expect(storeSelect).toBeVisible();
  });

  test('date inputs are present', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"], input[type="datetime-local"]').first();
    await expect(dateInputs).toBeVisible();
  });

  test('create button is present', async ({ page }) => {
    const createButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await expect(createButton).toBeVisible();
  });
});
