#!/usr/bin/env node

/**
 * Execute Supabase schema migration
 * This script runs the schema.sql file against the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSchema() {
  try {
    console.log('📖 Reading schema.sql...');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔗 Connecting to Supabase...');
    console.log(`   URL: ${supabaseUrl}`);

    // Split the schema into individual statements
    // Note: This is a simple split and may not handle all SQL cases perfectly
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.trim().length < 3) continue;
      
      const preview = statement.substring(0, 80).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        // Execute SQL using the Supabase REST API
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        });

        if (error) {
          // If exec_sql doesn't exist, we need to use a different approach
          if (error.message && error.message.includes('exec_sql')) {
            console.log('⚠️  exec_sql RPC not available - switching to direct PostgreSQL connection');
            console.log('\n⚠️  Please execute the schema manually using one of these methods:');
            console.log('   1. Supabase Dashboard → SQL Editor → Paste schema.sql');
            console.log('   2. psql -h db.dnsrrddirtfzwdwuezpk.supabase.co -U postgres -d postgres -f supabase/schema.sql');
            process.exit(1);
          }
          throw error;
        }
        
        successCount++;
      } catch (err) {
        errorCount++;
        console.error(`   ❌ Error: ${err.message}`);
      }
    }

    console.log(`\n✅ Schema execution complete!`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Alternative: Provide manual instructions
function showManualInstructions() {
  console.log('\n📋 Manual Schema Execution Instructions:');
  console.log('\n1. Using Supabase Dashboard (Recommended):');
  console.log('   • Go to: https://supabase.com/dashboard/project/dnsrrddirtfzwdwuezpk');
  console.log('   • Navigate to: SQL Editor');
  console.log('   • Copy the contents of: supabase/schema.sql');
  console.log('   • Paste and click "Run"');
  
  console.log('\n2. Using psql (requires database password):');
  console.log('   • Get DB password from: Project Settings → Database → Connection String');
  console.log('   • Run: psql "postgresql://postgres:[PASSWORD]@db.dnsrrddirtfzwdwuezpk.supabase.co:5432/postgres" -f supabase/schema.sql');
  
  console.log('\n3. Using Supabase CLI:');
  console.log('   • Run: supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.dnsrrddirtfzwdwuezpk.supabase.co:5432/postgres"');
  console.log('');
}

// Run the script
console.log('🚀 Supabase Schema Migration\n');
executeSchema().catch(err => {
  console.error('\n❌ Schema execution failed');
  showManualInstructions();
  process.exit(1);
});
