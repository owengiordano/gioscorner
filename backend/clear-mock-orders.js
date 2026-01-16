#!/usr/bin/env node

/**
 * Script to clear all orders from the database
 * 
 * Usage: node clear-mock-orders.js
 * 
 * WARNING: This will delete ALL orders from the database!
 * Use with caution.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearAllOrders() {
  // First, count the orders
  const { count, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting orders:', countError.message);
    process.exit(1);
  }

  if (count === 0) {
    console.log('✅ No orders to delete. Database is already empty.');
    process.exit(0);
  }

  console.log(`\n⚠️  WARNING: This will delete ${count} order(s) from the database!\n`);

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Are you sure you want to continue? (yes/no): ', async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Cancelled. No orders were deleted.');
      process.exit(0);
    }

    console.log('\n🗑️  Deleting orders...\n');

    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that's always true)

    if (error) {
      console.error('❌ Error deleting orders:', error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully deleted ${count} order(s)!\n`);
    process.exit(0);
  });
}

// Run the script
clearAllOrders().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});




