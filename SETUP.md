# Squadra Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Stripe account (test mode for development)

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy the example file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

**Supabase:**
- Get from: https://app.supabase.com → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret!)

**Stripe:**
- Get from: https://dashboard.stripe.com/test/apikeys
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key (pk_test_...)
- `STRIPE_SECRET_KEY`: Secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (whsec_...) - get after setting up webhook

**App:**
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local dev

### 3. Supabase Database Setup
(Instructions will be added in Phase 2)

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
squadra/
├── app/
│   ├── (admin)/          # Admin dashboard routes (protected)
│   ├── (storefront)/     # Public storefront routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Browser Supabase client
│   │   └── server.ts     # Server Supabase client
│   ├── stripe/
│   │   ├── client.ts     # Browser Stripe client
│   │   └── server.ts     # Server Stripe instance
│   └── utils.ts          # Utility functions (cn helper)
├── types/
│   └── index.ts          # TypeScript type definitions
├── supabase/             # (Phase 2) Database schema & migrations
└── public/               # Static assets
```

## Development Workflow

### Adding shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```

### Database Changes
1. Update `supabase/schema.sql`
2. Apply via Supabase Dashboard or CLI
3. Regenerate types (instructions in Phase 2)

### Stripe Webhook Testing
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Phase Checklist

- [x] **Phase 1:** Project Setup
- [ ] **Phase 2:** Supabase Setup (schema, RLS, types)
- [ ] **Phase 3:** Auth & Admin Layout
- [ ] **Phase 4:** Admin Dashboard - Stores
- [ ] **Phase 5:** Admin Dashboard - Campaigns  
- [ ] **Phase 6:** Storefront
- [ ] **Phase 7:** Checkout
- [ ] **Phase 8:** Order Management

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check (custom script if added)

# Supabase (requires Supabase CLI)
supabase start           # Start local Supabase
supabase db reset        # Reset local database
supabase db push         # Push schema to remote
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Project Definition](./PROJECT_DEFINITION.md)

## Need Help?

Refer to PROJECT_DEFINITION.md for the full project specification and architecture decisions.
