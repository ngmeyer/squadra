# Get Supabase Service Role Key

The `.env.local` file currently has a placeholder service role key that needs to be replaced.

## Steps to Get the Real Service Role Key

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/dnsrrddirtfzwdwuezpk/settings/api

2. **Find "Service Role Key" section:**
   - Scroll down to find the "service_role" key
   - It's marked as "secret" (not safe to expose)
   - Click the eye icon or copy button to reveal/copy it

3. **Update `.env.local`:**
   Replace the current `SUPABASE_SERVICE_ROLE_KEY` value with the real one

   The key should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Test the connection:**
   ```bash
   npm run db:test
   ```

## Why We Need It

The service role key:
- Has admin-level access (bypasses RLS)
- Required for applying schema changes
- Used by API routes to create orders
- **Should NEVER be exposed to the browser/frontend**

## Security Note

✅ Service role key stays in `.env.local` (git-ignored)  
✅ Only used in server-side code  
❌ NEVER send to client  
❌ NEVER commit to git

---

Once you've updated the key, the connection test should pass!
