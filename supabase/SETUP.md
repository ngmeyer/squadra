# Supabase Database Setup

## Schema Execution

The database schema is defined in `schema.sql`. To execute it in your Supabase project:

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/dnsrrddirtfzwdwuezpk)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd+Enter)

### Option 2: Using psql

If you have the database password:

```bash
# Get the connection string from: Project Settings → Database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.dnsrrddirtfzwdwuezpk.supabase.co:5432/postgres" \
  -f supabase/schema.sql
```

### Option 3: Using Supabase CLI

```bash
# First, login and link the project
supabase login
supabase link --project-ref dnsrrddirtfzwdwuezpk

# Push the migration
supabase db push
```

## Verify Schema

After executing the schema, verify it was successful:

```bash
npm run db:test
```

Or manually check in the Supabase Dashboard:
- Go to **Table Editor** and confirm these tables exist:
  - stores
  - campaigns
  - campaign_products
  - variants
  - orders
  - order_items

## Generate TypeScript Types

After the schema is executed, generate TypeScript types:

```bash
npm run db:types
```

This will create/update `types/supabase.ts` with type-safe database definitions.

## Schema Overview

### Tables

- **stores**: Multi-tenant store accounts (dhst, mvswim, etc.)
- **campaigns**: Preorder campaigns with open/close dates
- **campaign_products**: Products available in campaigns
- **variants**: Size/color/option combinations for products
- **orders**: Customer orders with payment tracking
- **order_items**: Individual line items in orders

### Security (RLS)

Row Level Security is enabled on all tables:
- Store owners can CRUD their own data
- Public can read active campaigns and products
- Customers can view their own orders
- Service role can create orders (checkout API)

### Features

- Auto-generated order numbers (SQ + YYMMDD + 4 digits)
- Automatic `updated_at` timestamps
- Multi-tenant isolation
- Proper foreign keys and cascading deletes
- Optimized indexes for common queries
