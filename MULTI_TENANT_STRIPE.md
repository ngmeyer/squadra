# Multi-Tenant Stripe Setup for Squadra

**Date:** February 10, 2026  
**Status:** ✅ IMPLEMENTED  
**Breaking Change:** YES (Stripe keys moved from .env to per-store database)

---

## Overview

Squadra now supports **multi-tenant Stripe** — each store brings its own Stripe account. This allows:

- ✅ Multiple stores in one Squadra instance
- ✅ Each store owns their Stripe account completely
- ✅ No shared Stripe keys across tenants
- ✅ Proper payment isolation

---

## What Changed

### Before (Single-Tenant)
```
.env.local:
  STRIPE_SECRET_KEY=sk_test_...      (shared across all stores)
  STRIPE_WEBHOOK_SECRET=whsec_...    (shared)

Problem: All stores used the same Stripe account
```

### After (Multi-Tenant)
```
Database (stores table):
  stripe_secret_key        (encrypted, per-store)
  stripe_publishable_key   (public, per-store)
  stripe_webhook_secret    (encrypted, per-store)
  stripe_connected         (boolean, status)
  stripe_account_email     (reference)

.env.local: (no Stripe keys)

Admin UI: /stores/[id]/settings/stripe
  - Input form for each store's keys
  - Validation (pk_*, sk_*, whsec_* prefixes)
  - Status indicator
```

---

## Setup Steps

### Step 1: Run Database Migration

**Location:** `migrations/add-stripe-per-store.sql`

Go to Supabase → SQL Editor and run:

```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_account_email TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

CREATE INDEX IF NOT EXISTS idx_stores_stripe_account_id ON stores(stripe_account_id);
```

✅ This adds the new columns to existing stores.

---

### Step 2: Update .env.local

**Delete these lines:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

**Your .env.local should now only have:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=...
```

---

### Step 3: Configure Per-Store Stripe Keys

1. Go to your app: http://localhost:3000/stores
2. Click a store → **Settings** → **Stripe**
3. Enter the store's Stripe keys:
   - Publishable key (pk_test_... or pk_live_...)
   - Secret key (sk_test_... or sk_live_...)
   - Webhook secret (whsec_...)
   - Account email (reference)
4. Click **Save Stripe Configuration**

---

## How It Works

### Payment Flow (Multi-Tenant)

1. **Customer initiates checkout** on store's public page
   - Store ID is captured in URL/form data

2. **Frontend calls payment endpoint** with store ID
   ```
   POST /api/stripe/create-payment-intent
   { storeId, campaignId, amount, items }
   ```

3. **Backend fetches store's Stripe keys** from database
   ```sql
   SELECT stripe_secret_key, stripe_publishable_key 
   FROM stores WHERE id = ?
   ```

4. **Initialize Stripe with that store's keys**
   ```typescript
   const stripe = new Stripe(store.stripe_secret_key);
   ```

5. **Create payment intent** for that store
   ```typescript
   const paymentIntent = stripe.paymentIntents.create({
     amount,
     metadata: { storeId, campaignId }
   })
   ```

6. **Return publicKey + clientSecret** to frontend
   - Frontend uses **store's publishable key** for Stripe.js
   - Not the global key from .env

### Webhook Flow (Multi-Tenant)

1. **Stripe sends webhook event** to `/api/stripe/webhook`
   - Event contains `metadata.storeId`

2. **Extract storeId from event metadata**
   ```typescript
   const storeId = event.data.object.metadata.storeId;
   ```

3. **Fetch store's webhook secret** from database
   ```sql
   SELECT stripe_webhook_secret FROM stores WHERE id = ?
   ```

4. **Verify event signature** using that store's secret
   ```typescript
   const verifiedEvent = stripe.webhooks.constructEvent(
     body,
     signature,
     store.stripe_webhook_secret  // Per-store secret
   );
   ```

5. **Process webhook** (update order, send email, etc.)

---

## File Changes

| File | Change | Reason |
|------|--------|--------|
| `app/(admin)/stores/[id]/settings/stripe/page.tsx` | **NEW** | Admin UI to configure per-store Stripe keys |
| `app/api/stripe/create-payment-intent/route.ts` | **UPDATED** | Fetch store's Stripe keys before creating intent |
| `app/api/stripe/webhook/route.ts` | **UPDATED** | Verify signature with store's webhook secret |
| `.env.local` | **REMOVED** | Stripe keys now per-store |
| `.env.local.example` | **UPDATED** | Reflects new architecture |
| `migrations/add-stripe-per-store.sql` | **NEW** | Database schema updates |

---

## Testing

### Local Testing

1. Create a test store in admin panel
2. Go to its Stripe settings
3. Enter your test Stripe keys (pk_test_..., sk_test_...)
4. Try checkout on that store's public page
5. Verify payment processes correctly

### Test Stripe Keys

Get these from https://dashboard.stripe.com/test/apikeys:

- **Publishable Key:** Starts with `pk_test_`
- **Secret Key:** Starts with `sk_test_`
- **Webhook Secret:** Starts with `whsec_` (from Developers → Webhooks)

---

## Troubleshooting

### "Stripe Account Not Connected" Error

**Fix:** Store's Stripe keys aren't configured yet
- Go to Store → Settings → Stripe
- Enter all three keys (publishable, secret, webhook)

### Webhook signature verification failed

**Cause:** Wrong webhook secret for the store  
**Fix:** 
- Check the webhook secret matches exactly
- It's in Stripe Dashboard → Developers → Webhooks → Endpoint Details

### Payment succeeds but order doesn't update

**Cause:** Webhook event is being received but not processed  
**Check:**
- Look at server logs for webhook handling
- Verify store's webhook URL is configured in Stripe Dashboard
- Should be: `https://your-domain.com/api/stripe/webhook`

---

## Security Notes

⚠️ **IMPORTANT:**

1. **Secret Keys Never Leave Backend**
   - Always fetch from database on server
   - Never send to frontend
   - Stripe.js only gets the **public** key

2. **Webhook Secrets Are Private**
   - Encrypt them at rest if possible
   - Use HTTPS only
   - Rotate regularly

3. **RLS Should Prevent Cross-Store Access**
   - Users can only see their own store
   - Stripe keys are only accessible to that store's admins

---

## Next Steps

- [ ] Configure each store's Stripe credentials
- [ ] Test payment flow for each store
- [ ] Set up webhook URLs in Stripe Dashboard per store
- [ ] Implement payment failure notifications
- [ ] Add refund support per store
- [ ] Consider Stripe Connect for enhanced security

---

## Migration Rollback

If needed, you can revert to single-tenant by:

1. Remove the new Stripe columns from stores table
2. Restore Stripe keys to .env.local
3. Revert changes to payment endpoint + webhook

But **don't do this!** Multi-tenant is cleaner 🚀

