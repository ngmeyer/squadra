import { Page, BrowserContext } from '@playwright/test';

/**
 * Mock authentication helper for E2E tests
 * Creates a valid Supabase session format that the SSR client can parse
 */
export async function mockAuthSession(context: BrowserContext) {
  // Create dynamic timestamps (expires in 1 hour)
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 3600;

  // Create a mock session in the format Supabase expects
  const mockSession = {
    access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoke2V4cGlyZXNBdH0sImlhdCI6JHtub3d9LCJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.mock`,
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: expiresAt,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01T00:00:00Z',
      phone: '',
      confirmation_sent_at: null,
      confirmed_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      identities: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    }
  };

  // Set the auth cookie in the format Supabase SSR expects
  await context.addCookies([
    {
      name: 'sb-dnsrrddirtfzwdwuezpk-auth-token',
      value: JSON.stringify(mockSession),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ]);
}

/**
 * Alternative: Use a simpler cookie format that works with the test helpers
 * This sets multiple cookies that the middleware might check
 */
export async function mockAuthSessionSimple(context: BrowserContext) {
  // Try setting multiple cookie formats
  await context.addCookies([
    {
      name: 'sb-access-token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.test',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    },
    {
      name: 'sb-refresh-token',
      value: 'test-refresh-token',
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
  return cookies.some(cookie => 
    cookie.name.includes('auth-token') || 
    cookie.name.includes('access-token')
  );
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
