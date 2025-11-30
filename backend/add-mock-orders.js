#!/usr/bin/env node

/**
 * Script to add mock orders to the database
 * 
 * Usage: node add-mock-orders.js
 * 
 * This will create several mock orders with different statuses and dates
 * so you can view them in the admin portal.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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

// Helper function to get a date N days from now
function getDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Mock orders with various scenarios
const mockOrders = [
  {
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.johnson@example.com',
    address: '123 Main Street, Springfield, IL 62701',
    food_selection: [
      { menu_item_id: 'family-dinner-meal', quantity: 2, notes: 'No nuts please' },
      { menu_item_id: 'dessert-platter', quantity: 1 }
    ],
    date_needed: getDaysFromNow(7),
    notes: 'Birthday party for my daughter. Please arrive by 5 PM.',
    status: 'pending'
  },
  {
    customer_name: 'Michael Chen',
    customer_email: 'michael.chen@example.com',
    address: '456 Oak Avenue, Chicago, IL 60614',
    food_selection: [
      { menu_item_id: 'pasta-bar', quantity: 1 },
      { menu_item_id: 'party-platter', quantity: 2 }
    ],
    date_needed: getDaysFromNow(14),
    notes: 'Corporate event. Need setup assistance.',
    status: 'accepted',
    total_price_cents: 30000,
    stripe_invoice_id: 'in_mock_' + Math.random().toString(36).substring(7),
    stripe_invoice_url: 'https://invoice.stripe.com/i/acct_mock/test_mock_invoice_1'
  },
  {
    customer_name: 'Emily Rodriguez',
    customer_email: 'emily.rodriguez@example.com',
    address: '789 Elm Street, Naperville, IL 60540',
    food_selection: [
      { menu_item_id: 'sandwich-box', quantity: 3 }
    ],
    date_needed: getDaysFromNow(3),
    notes: 'Office lunch meeting for 30 people.',
    status: 'pending'
  },
  {
    customer_name: 'David Thompson',
    customer_email: 'david.thompson@example.com',
    address: '321 Pine Road, Evanston, IL 60201',
    food_selection: [
      { menu_item_id: 'taco-bar', quantity: 2 },
      { menu_item_id: 'dessert-platter', quantity: 2 }
    ],
    date_needed: getDaysFromNow(10),
    notes: 'Graduation party. Vegetarian options needed.',
    status: 'accepted',
    total_price_cents: 35000,
    stripe_invoice_id: 'in_mock_' + Math.random().toString(36).substring(7),
    stripe_invoice_url: 'https://invoice.stripe.com/i/acct_mock/test_mock_invoice_2'
  },
  {
    customer_name: 'Jessica Martinez',
    customer_email: 'jessica.martinez@example.com',
    address: '555 Maple Drive, Aurora, IL 60505',
    food_selection: [
      { menu_item_id: 'party-platter', quantity: 1 }
    ],
    date_needed: getDaysFromNow(2),
    notes: 'Small gathering, about 10 people.',
    status: 'denied',
    admin_reason: 'Unfortunately, we are fully booked for that date. Please try a different date.'
  },
  {
    customer_name: 'Robert Williams',
    customer_email: 'robert.williams@example.com',
    address: '888 Cedar Lane, Joliet, IL 60435',
    food_selection: [
      { menu_item_id: 'family-dinner-meal', quantity: 3 },
      { menu_item_id: 'party-platter', quantity: 1 },
      { menu_item_id: 'dessert-platter', quantity: 1 }
    ],
    date_needed: getDaysFromNow(21),
    notes: 'Family reunion. Need delivery by noon.',
    status: 'pending'
  },
  {
    customer_name: 'Amanda Lee',
    customer_email: 'amanda.lee@example.com',
    address: '999 Birch Court, Schaumburg, IL 60173',
    food_selection: [
      { menu_item_id: 'sandwich-box', quantity: 1 },
      { menu_item_id: 'dessert-platter', quantity: 1 }
    ],
    date_needed: getDaysFromNow(5),
    notes: 'Baby shower. Gluten-free options if possible.',
    status: 'accepted',
    total_price_cents: 16000,
    stripe_invoice_id: 'in_mock_' + Math.random().toString(36).substring(7),
    stripe_invoice_url: 'https://invoice.stripe.com/i/acct_mock/test_mock_invoice_3'
  },
  {
    customer_name: 'Christopher Brown',
    customer_email: 'chris.brown@example.com',
    address: '111 Walnut Street, Rockford, IL 61101',
    food_selection: [
      { menu_item_id: 'taco-bar', quantity: 1 }
    ],
    date_needed: getDaysFromNow(1),
    notes: 'Last minute order for tomorrow. Is this possible?',
    status: 'denied',
    admin_reason: 'We require at least 48 hours notice for all catering orders. Please order earlier next time.'
  },
  {
    customer_name: 'Lisa Anderson',
    customer_email: 'lisa.anderson@example.com',
    address: '222 Spruce Avenue, Peoria, IL 61602',
    food_selection: [
      { menu_item_id: 'pasta-bar', quantity: 2 },
      { menu_item_id: 'dessert-platter', quantity: 3 }
    ],
    date_needed: getDaysFromNow(30),
    notes: 'Wedding reception. Very important event!',
    status: 'pending'
  },
  {
    customer_name: 'James Wilson',
    customer_email: 'james.wilson@example.com',
    address: '333 Ash Boulevard, Champaign, IL 61820',
    food_selection: [
      { menu_item_id: 'party-platter', quantity: 3 },
      { menu_item_id: 'sandwich-box', quantity: 1 }
    ],
    date_needed: getDaysFromNow(15),
    notes: 'Company picnic. Outdoor event.',
    status: 'accepted',
    total_price_cents: 34500,
    stripe_invoice_id: 'in_mock_' + Math.random().toString(36).substring(7),
    stripe_invoice_url: 'https://invoice.stripe.com/i/acct_mock/test_mock_invoice_4'
  }
];

async function addMockOrders() {
  console.log('🚀 Starting to add mock orders...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const order of mockOrders) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to add order for ${order.customer_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Added ${order.status} order for ${order.customer_name} (${order.date_needed})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error adding order for ${order.customer_name}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully added: ${successCount} orders`);
  console.log(`   ❌ Failed: ${errorCount} orders`);
  console.log('\n🎉 Done! You can now view these orders in your admin portal.');
}

// Run the script
addMockOrders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });

