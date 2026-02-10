# Phase 2: Action Items (Manual Steps Required)

Phase 2 setup is **95% complete** — just 2 quick manual steps remain:

---

## ✅ Already Done (Automated)

- ✅ Database schema file created (`supabase/schema.sql`)
- ✅ TypeScript types generated (`types/supabase.ts`)
- ✅ Environment file configured (`.env.local`)
- ✅ Helper scripts created (`npm run db:schema`, `npm run db:test`)
- ✅ Documentation written (`supabase/README.md`, `PHASE_2_SUMMARY.md`)
- ✅ Schema copied to clipboard
- ✅ Supabase SQL Editor opened in browser

---

## 🔧 Manual Steps (5 minutes)

### Step 1: Apply Database Schema

**The Supabase SQL Editor should already be open in your browser.**

If not, open it here: https://supabase.com/dashboard/project/dnsrrddirtfzwdwuezpk/sql

1. Click **"New Query"**
2. **Paste** the schema (should already be in clipboard from earlier)
   - If not: `cat supabase/schema.sql | pbcopy`
3. Click **"Run"** (or press `Cmd+Enter`)
4. Wait ~5 seconds for execution
5. You should see: **"Success. No rows returned"**

That's it! The entire database is now set up.

---

### Step 2: Get Real Service Role Key

The `.env.local` file has a placeholder service role key that needs updating.

**Where to find it:**

1. Go to: https://supabase.com/dashboard/project/dnsrrddirtfzwdwuezpk/settings/api
2. Scroll to **"service_role"** section (marked as "secret")
3. Click the **eye icon** or **copy button** to reveal the key
4. Copy the full key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**Update `.env.local`:**

Replace this line:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3JyZGRpcnRmendkd3VlenBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3Nzk2OSwiZXhwIjoyMDg2MjUzOTY5fQ.VdYwlCEPZ0HCLKg5Kk2Qg4mZW7W-u8Z0bLQFjPfI8Uw
```

With the real key from Supabase dashboard.

---

## ✅ Verify Setup

After completing both steps, test everything:

```bash
npm run db:test
```

**Expected output:**

```
🔌 Testing Supabase connection...

1️⃣  Testing basic connection...
✅ Connection successful!

2️⃣  Checking tables...
   ✅ stores
   ✅ campaigns
   ✅ campaign_products
   ✅ variants
   ✅ orders
   ✅ order_items

3️⃣  Checking RLS policies...
   ✅ RLS policies configured

✅ All tests passed!

📊 Database is ready for Phase 3: Auth & Admin Layout
```

---

## ❓ Troubleshooting

### "Invalid API key" error
- **Cause:** Service role key is incorrect or placeholder
- **Fix:** Complete Step 2 above

### "relation does not exist" error
- **Cause:** Schema not applied yet
- **Fix:** Complete Step 1 above

### "permission denied" error
- **Cause:** Using anon key instead of service role key
- **Fix:** Make sure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` not `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📊 What You'll Have After This

- ✅ **6 database tables** with full schema
- ✅ **4 enum types** for status fields
- ✅ **15+ RLS policies** for multi-tenant security
- ✅ **Auto-generated** order numbers
- ✅ **TypeScript types** matching database exactly
- ✅ **Tested connection** to Supabase

---

## 🚀 Next Phase

Once tests pass, you're ready for **Phase 3: Auth & Admin Layout**!

Phase 3 will include:
- Supabase Auth setup (email/password + magic links)
- `/login` page
- Admin dashboard layout with sidebar
- Protected routes with middleware
- User authentication context

---

**Time to complete:** ~5 minutes  
**Then:** Phase 2 is DONE! ✅
