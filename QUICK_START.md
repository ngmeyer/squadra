# Squadra - Quick Start

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Stripe credentials
```

### 3. Run Dev Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## Project Status

✅ **Phase 1: Project Setup** - COMPLETE
- Next.js 14 + TypeScript
- shadcn/ui components
- Supabase + Stripe configured
- Folder structure ready

🚧 **Phase 2: Supabase Setup** - NEXT
- Create database schema
- Set up RLS policies
- Generate TypeScript types

---

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run lint         # Run ESLint
```

## Documentation

- **Full Setup:** See `SETUP.md`
- **Project Spec:** See `PROJECT_DEFINITION.md`
- **Phase 1 Summary:** See `PHASE_1_SUMMARY.md`

---

## What's Included

### Components (shadcn/ui)
- Button, Card, Input, Label
- Dialog, Dropdown Menu, Tabs
- Table, Form

### Libraries
- @supabase/supabase-js, @supabase/ssr
- stripe, @stripe/stripe-js
- zustand (state management)
- date-fns (date utilities)

### Structure
```
app/(admin)/      → Admin dashboard routes
app/(storefront)/ → Public storefront routes
lib/supabase/     → Database clients
lib/stripe/       → Payment clients
components/ui/    → UI components
types/            → TypeScript types
```

---

Ready to build! 🚀
