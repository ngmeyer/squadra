#!/bin/bash

# Quick instructions for executing the Supabase schema
# This script provides step-by-step guidance

set -e

PROJECT_ID="dnsrrddirtfzwdwuezpk"
SCHEMA_FILE="supabase/schema.sql"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Squadra - Supabase Schema Execution Guide            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Error: Schema file not found at $SCHEMA_FILE"
  exit 1
fi

echo "✅ Schema file located: $SCHEMA_FILE"
echo "📊 Schema includes: 6 tables + RLS policies + indexes + triggers"
echo ""

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
  cat "$SCHEMA_FILE" | pbcopy
  echo "✅ Schema copied to clipboard!"
else
  echo "⚠️  Could not copy to clipboard (pbcopy not available)"
  echo "   Please manually copy supabase/schema.sql"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  STEP-BY-STEP INSTRUCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Your browser will open to Supabase SQL Editor"
echo "    (Opening in 3 seconds...)"
echo ""
sleep 3

# Open SQL editor
if command -v open &> /dev/null; then
  open "$SQL_EDITOR_URL"
else
  echo "   Open this URL: $SQL_EDITOR_URL"
fi

echo "2️⃣  In the SQL Editor:"
echo "    • Paste the schema (Cmd+V - already in clipboard!)"
echo "    • Click the 'Run' button (or press Cmd+Enter)"
echo ""
echo "3️⃣  Wait for execution (~10 seconds)"
echo "    • You should see 'Success. No rows returned'"
echo "    • If you see errors, check the PHASE2_STATUS.md troubleshooting section"
echo ""
echo "4️⃣  Verify the schema was applied:"
echo "    • Run: npm run db:test"
echo "    • Should show ✅ for all 6 tables"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 For alternative methods (psql, CLI), see: supabase/SETUP.md"
echo "📋 Full status report: PHASE2_STATUS.md"
echo ""
echo "💡 After executing, test with: npm run db:test"
echo ""
