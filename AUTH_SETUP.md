# Authentication Setup Guide

This guide covers the steps needed to configure authentication in Supabase for Squadra.

## Supabase Dashboard Configuration

### 1. Enable Email Authentication

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `dnsrrddirtfzwdwuezpk`
3. Navigate to **Authentication** → **Providers**
4. Find the **Email** provider and enable it

### 2. Email Settings

Configure the following email settings:

- ✅ **Enable Email provider** - Turn on email/password authentication
- ✅ **Confirm email** (recommended) - Users must verify their email before logging in
- ✅ **Secure email change** - Require confirmation when changing email addresses
- ❌ **Double confirm email changes** - Optional additional security

### 3. URL Configuration

Set the following URLs in **Authentication** → **URL Configuration**:

#### Development
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/admin`

#### Production
When deploying to production, update these to your production domain:
- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:**
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/admin`

### 4. Email Templates (Optional)

You can customize the email templates in **Authentication** → **Email Templates**:

- **Confirm signup** - Email sent to verify new accounts
- **Magic link** - Email sent for passwordless login
- **Change email address** - Email sent when user changes their email
- **Reset password** - Email sent for password recovery

## Application Configuration

The application is already configured with the following:

### Environment Variables

Located in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dnsrrddirtfzwdwuezpk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Auth Utilities

- **`lib/supabase/auth.ts`** - Server actions for authentication (signIn, signUp, signOut, etc.)
- **`lib/supabase/server.ts`** - Server-side Supabase client with auth helpers
- **`lib/supabase/client.ts`** - Client-side Supabase client
- **`lib/supabase/middleware.ts`** - Session management for Next.js middleware
- **`middleware.ts`** - Route protection and session refresh

### Protected Routes

The following routes are automatically protected and require authentication:

- `/admin/*` - All admin routes
- Redirects to `/login` if not authenticated
- Redirects from `/login` to `/admin` if already authenticated

## Testing Authentication

### Sign Up

1. Navigate to `/login`
2. Click the "Sign Up" tab
3. Enter email and password (minimum 6 characters)
4. If "Confirm email" is enabled in Supabase, check your email for confirmation
5. Click the confirmation link
6. Sign in with your credentials

### Sign In (Email + Password)

1. Navigate to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to `/admin`

### Magic Link (Passwordless)

1. Navigate to `/login`
2. Scroll to the "Magic Link" section
3. Enter your email
4. Click "Send Magic Link"
5. Check your email
6. Click the magic link
7. You'll be redirected to `/admin`

### Sign Out

1. Click on your avatar in the sidebar
2. Click "Sign out" from the dropdown menu
3. You'll be redirected to `/login`

## Troubleshooting

### "Email not confirmed" error

If you're getting this error:
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user
3. Click the three dots → "Confirm email"
4. Try logging in again

### Magic link not working

1. Check your spam folder
2. Ensure the redirect URL is correctly configured in Supabase
3. Check that `NEXT_PUBLIC_APP_URL` in `.env.local` matches your current domain
4. Verify the email template in Supabase includes the correct confirmation URL

### Session not persisting

1. Clear your browser cookies
2. Ensure middleware is running (check `middleware.ts`)
3. Check browser console for errors
4. Verify Supabase cookies are being set

## Security Best Practices

1. **Enable "Confirm email"** - Prevents fake email signups
2. **Use environment variables** - Never commit credentials to git
3. **HTTPS in production** - Always use HTTPS for authentication
4. **Strong password policy** - Consider adding password strength requirements
5. **Rate limiting** - Supabase automatically rate limits authentication attempts
6. **Email verification** - Verify email addresses before allowing critical actions

## Next Steps

- [ ] Configure email templates with your branding
- [ ] Set up password recovery flow
- [ ] Add social authentication providers (Google, GitHub, etc.)
- [ ] Implement user profile management
- [ ] Add role-based access control (RBAC)
- [ ] Set up audit logging for security events

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side)
