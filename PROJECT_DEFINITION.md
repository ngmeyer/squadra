# Squadra - Multi-Tenant Storefront
## Project Definition & Plan

**Date Created:** February 9, 2026  
**Status:** Phase 2 Complete - Database Ready  
**Last Updated:** February 9, 2026 (16:30 PST)

---

## Build Progress

### ✅ Phase 1: Project Setup (COMPLETE)
**Completed:** February 9, 2026

**What was built:**
- ✅ Next.js 14 project initialized with TypeScript & Tailwind CSS
- ✅ shadcn/ui component library integrated (Neutral theme)
- ✅ Components installed: button, card, table, form, input, dialog, dropdown-menu, tabs, label
- ✅ Dependencies installed: @supabase/supabase-js, @supabase/ssr, stripe, @stripe/stripe-js, zustand, date-fns
- ✅ Folder structure created:
  - `app/(admin)` - admin dashboard routes
  - `app/(storefront)` - public storefront routes
  - `lib/supabase/` - Supabase client configs (browser + server)
  - `lib/stripe/` - Stripe client configs (browser + server)
  - `types/` - TypeScript type definitions
- ✅ Environment variables template created (.env.local.example)

**Tech Stack Finalized:**
- Frontend: Next.js 14 App Router with TypeScript
- UI: shadcn/ui components (Tailwind CSS v4)
- Database: Supabase (PostgreSQL + Auth + Storage)
- Payments: Stripe
- State: Zustand
- Hosting: Vercel

### ✅ Phase 2: Supabase Setup (COMPLETE)
**Completed:** February 9, 2026

**What was built:**
- ✅ Database schema created (`supabase/schema.sql` - 500 lines)
  - 6 tables: stores, campaigns, campaign_products, variants, orders, order_items
  - 4 enums: campaign_status, product_status, order_status, customization_type
  - Complete RLS policies for multi-tenancy
  - Auto-updating timestamps, auto-generated order numbers
  - Indexes on all lookup fields
- ✅ TypeScript types generated (`types/supabase.ts` - 400 lines)
  - Full Database interface with all tables
  - Row, Insert, Update types for each table
  - Helper types: StoreThemeColors, ProductCustomizationConfig, VariantGroup, etc.
  - Joined types: CampaignWithStore, OrderWithItems, etc.
- ✅ Environment configured (`.env.local` with Supabase credentials)
- ✅ Helper scripts created:
  - `npm run db:schema` - Apply schema helper
  - `npm run db:test` - Test database connection
- ✅ Documentation: `supabase/README.md` with setup guide

**Database Architecture:**
- Multi-tenancy via `stores.created_by` → `auth.users`
- RLS policies for owner access, public read, customer orders
- JSONB fields for flexible variant groups and theme colors
- Prices stored in cents (INTEGER) for precision

**Next Phase:** Phase 3 - Auth & Admin Layout

---

## Executive Summary

Squadra is a multi-tenant e-commerce platform built for a custom gear business that produces apparel (t-shirts, sweatshirts, swim caps) for local schools, clubs, and swim teams. Unlike Shopify, Squadra is designed specifically for preorder campaigns where products are bulk-ordered and shipped to a central location (coach/organizer) rather than individual homes.

### Business Model
- **Primary Use:** Internal tool for managing team/club gear orders
- **Tenancy:** Multi-tenant architecture (prepared for future productization)
- **Order Model:** Campaign-based preorders with defined open/close dates
- **Fulfillment:** Bulk ship to organizer, not direct-to-consumer

---

## Core Features

### 1. Multi-Tenant Store Management
- Create/manage multiple branded stores (e.g., `dhst.squadra.app`)
- Per-store configuration:
  - Logo upload
  - Custom color themes (2-3 colors)
  - Contact email
  - Shipping policy text
  - Tax rate override
- Store duplication for quick campaign creation

### 2. Campaign-Based Ordering
**Campaign Lifecycle:**
1. **Create Campaign:**
   - Select store (or create new)
   - Campaign name (e.g., "DHST Spring 2026")
   - Dates:
     - Opens: [date]
     - Closes: [date] ← preorder deadline
     - Ships: [date] ← estimated delivery to coach
   - Ship To:
     - Coach/organizer name
     - Address
     - Phone
   - Custom message for storefront

2. **Campaign Status:**
   - Draft → Active → Closed → Archived
   - Public storefront link for sharing

### 3. Product Catalog

#### Product Types
- Apparel: T-shirts, sweatshirts, hoodies
- Accessories: Swim caps, bags, etc.

#### Product Structure
```
Product:
├── Basic: title, description, base price, category
├── Images: primary + gallery
├── Variant Groups (dynamic):
│   ├── Size: [S, M, L, XL, 2XL] +$0/$2/$2/$4/$4
│   ├── Color: [Navy, Black, White]
│   ├── Material: [Cotton, Polyester]
│   └── Custom: [Long Hair, Standard] (for swim caps)
├── Variant Matrix:
│   ├── Each combo = unique SKU
│   ├── Each variant = unique image (click swatch → image swaps)
│   ├── Each variant = unique price (or inherits base)
│   └── Preorder tracking (no inventory, just count)
└── Customization:
    ├── Type: none | optional | required
    ├── Label: "Swimmer name"
    ├── Placeholder: "e.g., NEAL"
    ├── Max length: 12
    └── Price: $0 (required) or +$5 (optional)
```

### 4. Order Management

#### Customer Flow
1. Visit campaign storefront
2. Select products + variants
3. Enter customization (if required/optional)
4. Add to cart
5. Checkout (Stripe)
6. Confirmation email with order details

#### Admin Dashboard
```
┌────────────────────────────────────────────┐
│  Squadra Admin                               │
│  [Stores] [Campaigns] [Orders] [Analytics] │
├────────────────────────────────────────────┤
│  Campaign: DHST Spring 2026                │
│  Status: ACTIVE (closes in 3 days)         │
│                                            │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Orders: 47   │  │ Revenue: $2k │       │
│  └──────────────┘  └──────────────┘       │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ Recent Orders                       │   │
│  │ • #1042 - $45 - Sarah J. [paid]    │   │
│  │ • #1041 - $32 - Mike R. [paid]     │   │
│  │ • #1040 - $28 - Lisa T. [paid]     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [Packing List] [Mark Shipped] [Export]    │
└────────────────────────────────────────────┘
```

#### Packing List View
- Grouped by product/variant
- Customization fields displayed
- Checkbox interface for fulfillment

---

## Technical Architecture

### Tech Stack (TBD)
- **Frontend:** TBD (Next.js, SvelteKit, or similar)
- **Backend:** TBD (Node.js, Go, or similar)
- **Database:** PostgreSQL
- **Payments:** Stripe
- **File Storage:** TBD (S3, Cloudflare R2, etc.)
- **Hosting:** TBD (Vercel, Fly.io, etc.)

### Database Schema (High-Level)

```sql
-- Tenancy
stores (id, slug, name, logo_url, theme_colors, contact_email, ...)

-- Campaigns
campaigns (id, store_id, name, opens_at, closes_at, ships_at, 
           ship_to_name, ship_to_address, ship_to_phone, 
           custom_message, status)

-- Products (within campaign)
campaign_products (id, campaign_id, title, description, base_price_cents,
                   category, images JSONB, variant_groups JSONB,
                   customization_config JSONB, status)

-- Variants (matrix)
variants (id, campaign_product_id, sku, option_combo JSONB,
          price_cents, image_url, total_ordered)

-- Orders
orders (id, campaign_id, customer_email, customer_name,
        total_cents, stripe_payment_intent_id, status,
        created_at)

-- Order Items
order_items (id, order_id, variant_id, customization_value,
             quantity, price_cents)
```

---

## Design Requirements

### Storefront UI
- Clean, mobile-first design
- Variant selection with visual swatches
- Image swapping on variant click
- Clear campaign deadline messaging
- Trust indicators (secure checkout, etc.)

### Admin UI
- Dashboard with key metrics
- Campaign management interface
- Product builder with variant preview
- Order list with filtering/sorting
- Packing list print view

---

## MVP Scope

### Phase 1: Core Ordering
- [ ] Store creation & basic theming
- [ ] Campaign creation with dates
- [ ] Product builder (variants, images)
- [ ] Customization (required/optional)
- [ ] Customer storefront & checkout
- [ ] Order management dashboard
- [ ] Packing list generation

### Phase 2: Enhancements
- [ ] Store duplication
- [ ] Analytics/reports
- [ ] Email notifications
- [ ] Bulk operations
- [ ] Export to CSV

### Phase 3: Future (Post-MVP)
- [ ] Self-service store signup
- [ ] Multiple users per store
- [ ] Inventory tracking (non-preorder)
- [ ] Shipping label integration
- [ ] Mobile app

---

## Open Questions

1. **Tech Stack:** Preferred framework? (Next.js, SvelteKit, etc.)
2. **File Storage:** S3, Cloudflare R2, or other?
3. **Email:** SendGrid, Resend, or other?
4. **Domain:** `squadra.app` or other?
5. **Timeline:** Target launch date?

---

## Next Steps

1. Finalize tech stack decisions
2. Create detailed technical specification
3. Set up project repository
4. Begin development (Phase 1)
