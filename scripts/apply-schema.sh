#!/bin/bash

# Script to help apply the Supabase schema
# This will open the Supabase SQL Editor and copy the schema to clipboard

PROJECT_ID="dnsrrddirtfzwdwuezpk"
SCHEMA_FILE="supabase/schema.sql"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/$PROJECT_ID/sql"

echo "📋 Applying Supabase Schema"
echo "============================"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Schema file not found: $SCHEMA_FILE"
  exit 1
fi

echo "✅ Schema file found"
echo ""

# Copy schema to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
  cat "$SCHEMA_FILE" | pbcopy
  echo "📋 Schema copied to clipboard!"
  echo ""
fi

echo "📝 Instructions:"
echo ""
echo "1. Opening Supabase SQL Editor in your browser..."
echo "2. Click 'New Query'"
echo "3. Paste the schema (Cmd+V)"
echo "4. Click 'Run' (or press Cmd+Enter)"
echo "5. Wait for execution to complete"
echo "6. Come back here and run: npm run test:db"
echo ""

# Open SQL editor in browser
open "$SQL_EDITOR_URL" 2>/dev/null || echo "Open this URL manually: $SQL_EDITOR_URL"

echo ""
echo "⏳ After applying schema, test connection with:"
echo "   npm run test:db"
echo ""
