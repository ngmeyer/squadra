# Supabase Database Setup

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/dnsrrddirtfzwdwuezpk/sql
2. Click "New Query"
3. Copy the contents of `schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd+Enter)
6. Verify all tables were created

### Option 2: Using psql (Command Line)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:IOk6XliGA7Ms1m07@db.dnsrrddirtfzwdwuezpk.supabase.co:5432/postgres"

# Run the schema
\i supabase/schema.sql

# Verify tables
\dt

# Exit
\q
```

### Option 3: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# Link to remote project
supabase link --project-ref dnsrrddirtfzwdwuezpk

# Push the migration
supabase db push

# Or reset and apply
supabase db reset
```

## Database Schema Overview

### Tables Created

1. **stores** - Multi-tenant store records
   - slug, name, logo_url, theme_colors
   - contact_email, shipping_policy, tax_rate
   - created_by (auth.users FK)

2. **campaigns** - Preorder campaigns
   - store_id, name, slug
   - opens_at, closes_at, ships_at
   - ship_to_name, ship_to_address, ship_to_phone
   - custom_message, status

3. **campaign_products** - Products in campaigns
   - campaign_id, title, description
   - base_price_cents, category
   - images (JSONB), variant_groups (JSONB)
   - customization_config (JSONB)
   - status, sort_order, total_ordered

4. **variants** - Product variant matrix
   - campaign_product_id, sku
   - option_combo (JSONB)
   - price_cents, image_url
   - total_ordered

5. **orders** - Customer orders
   - order_number (auto-generated)
   - campaign_id, customer details
   - subtotal_cents, tax_cents, total_cents
   - stripe_payment_intent_id
   - status

6. **order_items** - Order line items
   - order_id, variant_id
   - customization_value
   - quantity, unit_price_cents, total_price_cents

### Enums

- `campaign_status`: draft, active, closed, archived
- `product_status`: draft, active, hidden
- `order_status`: pending, paid, shipped, cancelled
- `customization_type`: none, optional, required

### Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Multi-tenancy** via store ownership
✅ **Public read access** for active campaigns/products
✅ **Auto-generated** order numbers (SQ + YYMMDD + 4 digits)
✅ **Timestamps** with auto-update triggers
✅ **Foreign key constraints** with CASCADE/RESTRICT
✅ **Indexes** on lookup fields

## Verifying the Setup

After running the schema, verify everything is working:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check enums
SELECT n.nspname as schema, t.typname as type
FROM pg_type t 
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid)) 
AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
AND n.nspname = 'public';
```

## Next Steps

After the schema is applied:

1. Generate TypeScript types: `npm run types:generate` (see below)
2. Test database connection in app
3. Create first store via SQL or admin UI
4. Proceed to Phase 3: Auth & Admin Layout

## Generating TypeScript Types

After schema is applied, generate types:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id dnsrrddirtfzwdwuezpk > types/supabase.ts
```

Or manually update `types/supabase.ts` based on the schema.

## Troubleshooting

### "Extension uuid-ossp already exists"
- Safe to ignore or comment out the CREATE EXTENSION line

### "Permission denied"
- Make sure you're using the service role key for schema changes
- Or use the Supabase Dashboard SQL editor (runs as superuser)

### "Relation already exists"
- Drop existing tables first: `DROP TABLE IF EXISTS [table_name] CASCADE;`
- Or use `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` to reset completely

### RLS Policy Errors
- Make sure auth.uid() is available (requires authenticated user)
- Service role key bypasses RLS (for API routes)
