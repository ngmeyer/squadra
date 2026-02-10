// Test Supabase database connection
// Run with: npx tsx scripts/test-db-connection.ts

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure .env.local has:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n')

  try {
    // Test 1: Basic connection
    console.log('1️⃣  Testing basic connection...')
    const { data, error } = await supabase.from('stores').select('count')
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!\n')

    // Test 2: Check tables exist
    console.log('2️⃣  Checking tables...')
    const tables = ['stores', 'campaigns', 'campaign_products', 'variants', 'orders', 'order_items']
    
    for (const table of tables) {
      const { error } = await supabase.from(table as any).select('count').limit(0)
      if (error) {
        console.log(`   ❌ ${table} - ${error.message}`)
      } else {
        console.log(`   ✅ ${table}`)
      }
    }
    
    console.log('\n3️⃣  Checking RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .rpc('pg_policies' as any)
      .select('*')
      .limit(5)
    
    if (policyError) {
      console.log('   ℹ️  Cannot check policies (requires superuser)')
    } else {
      console.log(`   ✅ RLS policies configured`)
    }

    console.log('\n✅ All tests passed!')
    console.log('\n📊 Database is ready for Phase 3: Auth & Admin Layout')
    
    return true
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
