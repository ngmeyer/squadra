# Squadra - Quick Start Guide

## Phase 2: Database Setup - READY TO EXECUTE 🚀

Everything is prepared. You just need to execute the schema in Supabase (takes 2 minutes).

### One Command Setup

```bash
npm run db:setup
```

This will:
1. ✅ Copy the schema to your clipboard
2. ✅ Open Supabase SQL Editor in your browser
3. ✅ Show you step-by-step instructions

Then in the SQL Editor:
- Paste (Cmd+V)
- Click "Run" (or Cmd+Enter)
- Done! 🎉

### Verify It Worked

```bash
npm run db:test
```

You should see:
```
✅ stores
✅ campaigns
✅ campaign_products
✅ variants
✅ orders
✅ order_items
✅ All tests passed!
```

## What's Already Done

✅ Supabase project created  
✅ Environment variables configured (`.env.local`)  
✅ Database schema designed (`supabase/schema.sql`)  
✅ TypeScript types generated (`types/supabase.ts`)  
✅ Test scripts created  
✅ Supabase CLI installed  
✅ Documentation written  

## What's In The Database

Once executed, you'll have:

- **6 tables:** stores, campaigns, campaign_products, variants, orders, order_items
- **Row-Level Security:** Multi-tenant isolation, public storefronts
- **Auto-features:** Order numbers, timestamps, cascading deletes
- **Indexes:** Optimized for common queries
- **Type safety:** Full TypeScript definitions

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:setup` | **Execute the schema** (interactive guide) |
| `npm run db:test` | Test database connection & verify tables |
| `npm run db:types` | Regenerate TypeScript types from database |
| `npm run dev` | Start Next.js dev server |

## Project Structure

```
squadra/
├── .env.local                  # ✅ Supabase credentials
├── supabase/
│   ├── schema.sql              # ✅ Complete database schema
│   ├── SETUP.md                # ✅ Detailed setup docs
│   └── README.md               # ✅ Schema overview
├── types/
│   └── supabase.ts             # ✅ TypeScript definitions
├── scripts/
│   ├── execute-schema-instructions.sh  # ✅ Setup helper
│   ├── test-db-connection.ts           # ✅ Connection test
│   └── apply-schema.sh                 # ✅ Alternative helper
└── PHASE2_STATUS.md            # ✅ Full status report
```

## Troubleshooting

**"npm: command not found"**  
→ Run: `npm install` first

**"Invalid API key"**  
→ Check `.env.local` has no extra spaces  
→ Restart terminal/dev server

**"Table does not exist"**  
→ Schema not executed yet  
→ Run: `npm run db:setup`

## Next Steps (After Schema Execution)

1. Verify: `npm run db:test` shows all ✅
2. Start dev server: `npm run dev`
3. Begin Phase 3: Authentication & Admin Layout
4. Build the first store! 🏪

## Support

- **Detailed Status:** See `PHASE2_STATUS.md`
- **Setup Options:** See `supabase/SETUP.md`
- **Schema Details:** See `supabase/schema.sql` (heavily commented)

---

**Current Status:** ⚠️ Schema ready, execution pending (2 min manual step)  
**Time Investment:** ~5 minutes total for Phase 2  
**Blocking Issues:** None
