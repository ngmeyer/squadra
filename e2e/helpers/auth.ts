import { Page, BrowserContext } from '@playwright/test';

/**
 * Mock authentication helper for E2E tests
 * In production, replace with actual Supabase test user login
 */
export async function mockAuthSession(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'sb-dnsrrddirtfzwdwuezpk-auth-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ]);
}

/**
 * Login with test credentials (when auth is fully implemented)
 * TODO: Implement with real Supabase auth
 */
export async function loginAsTestUser(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = password || process.env.TEST_USER_PASSWORD || 'testpassword123';

  await page.goto('/login');
  
  // Fill in login form
  await page.locator('input[type="email"], input[name="email"]').fill(testEmail);
  await page.locator('input[type="password"], input[name="password"]').fill(testPassword);
  
  // Submit form
  await page.locator('button[type="submit"]').click();
  
  // Wait for redirect to admin
  await page.waitForURL(/\/admin/, { timeout: 5000 }).catch(() => {
    console.log('Login redirect timeout - auth may not be fully implemented');
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name.includes('auth-token'));
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Clear auth cookies
  await page.context().clearCookies();
  
  // Navigate to logout endpoint if it exists
  await page.goto('/auth/logout').catch(() => {});
}
