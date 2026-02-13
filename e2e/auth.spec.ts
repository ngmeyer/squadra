import { test, expect } from '@playwright/test';
import { mockAuthSession } from './helpers/auth';

test.describe('Root Page Redirects', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page).toHaveTitle(/Login|Sign In/i);
  });

  test('authenticated user is redirected to admin dashboard', async ({ page, context }) => {
    // Mock authenticated session with proper Supabase format
    await mockAuthSession(context);
    
    await page.goto('/');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin');
  });
});

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1, h2')).toContainText(/Login|Sign In/i);
  });

  test('login form has email input', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('login form has password input', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('login form has submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText(/Sign In|Login/i);
  });

  test('magic link option is available', async ({ page }) => {
    const magicLinkText = page.locator('text=/magic link/i');
    await expect(magicLinkText).toBeVisible();
  });
});
