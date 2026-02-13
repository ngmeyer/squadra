# E2E Tests for Squadra

End-to-end tests using Playwright to ensure the entire application flow works correctly.

## Test Coverage

### ✅ Implemented Tests

1. **Root Page Redirects** (`root-page.spec.ts`)
   - Unauthenticated users → `/login`
   - Authenticated users → `/admin`

2. **Login Page** (`login.spec.ts`)
   - Page loads successfully
   - Form fields are present
   - Submit button exists

3. **Admin Dashboard** (`admin-dashboard.spec.ts`)
   - Auth-protected route redirect
   - Dashboard loads for authenticated users

4. **Store Creation Flow** (`store-creation.spec.ts`)
   - Navigation to store creation
   - Form validation
   - Required fields

5. **Campaign Creation Flow** (`campaign-creation.spec.ts`)
   - Campaign form fields
   - Date validation
   - Form submission

6. **Public Storefront** (`storefront.spec.ts`)
   - Storefront page loads
   - Store branding display
   - Campaign listings
   - Product display
   - 404 handling

## Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Configuration

Tests are configured in `playwright.config.ts`:
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel execution**: Enabled (except in CI)
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Traces**: On first retry

## Environment Variables

For CI/CD, set these secrets in GitHub:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

For local testing with real auth:
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

## Test Helpers

### Authentication (`helpers/auth.ts`)

```typescript
import { mockAuthSession, loginAsTestUser, logout } from './helpers/auth';

// Mock auth for quick tests
await mockAuthSession(context);

// Real login (when implemented)
await loginAsTestUser(page, 'test@example.com', 'password');

// Logout
await logout(page);
```

## Test Structure

Each test file follows this pattern:

1. **Describe block**: Groups related tests
2. **beforeEach hook**: Setup (auth, navigation, etc.)
3. **Tests**: Individual test cases
4. **Assertions**: Use Playwright's expect API

## Best Practices

1. **Use data-testid** for stable selectors
2. **Wait for elements** before interacting
3. **Skip gracefully** if features aren't implemented
4. **Mock auth** for speed, real auth for integration
5. **Clean up** after tests (logout, clear state)

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

See `.github/workflows/e2e.yml` for workflow configuration.

## Debugging Failed Tests

1. Check screenshots in `test-results/`
2. View trace in Playwright trace viewer
3. Run with `--headed` to see browser
4. Use `--debug` to step through

## Adding New Tests

1. Create new `.spec.ts` file in `e2e/`
2. Import from `@playwright/test`
3. Write describe blocks and tests
4. Use helpers from `helpers/` as needed
5. Run locally before committing

## Known Issues

- Mock auth tokens don't actually authenticate (replace with real Supabase auth)
- Some tests skip if features aren't implemented yet
- Tests assume specific DOM structure (update selectors as UI changes)
