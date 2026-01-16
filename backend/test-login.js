#!/usr/bin/env node

/**
 * Debug script to test admin login credentials
 * 
 * Usage:
 *   node test-login.js your-password-here
 */

require('dotenv').config();
const bcrypt = require('bcrypt');

const testPassword = process.argv[2];

console.log('\n🔍 Admin Login Debug Tool\n');
console.log('═══════════════════════════════════════════════════\n');

// Check environment variables
console.log('Environment Variables:');
console.log('─────────────────────────────────────────────────');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ NOT SET');
console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? '✅ SET (' + process.env.ADMIN_PASSWORD_HASH.substring(0, 20) + '...)' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('');

// Check if test password provided
if (!testPassword) {
  console.log('⚠️  No password provided to test\n');
  console.log('Usage:');
  console.log('  node test-login.js YourPasswordHere\n');
  console.log('Example:');
  console.log('  node test-login.js MySecurePassword123!\n');
  process.exit(0);
}

// Test password
if (!process.env.ADMIN_PASSWORD_HASH) {
  console.log('❌ ERROR: ADMIN_PASSWORD_HASH is not set in .env file\n');
  console.log('Please run:');
  console.log('  node generate-password-hash.js YourPasswordHere\n');
  console.log('Then copy the hash to your .env file.\n');
  process.exit(1);
}

console.log('Testing Password:');
console.log('─────────────────────────────────────────────────');
console.log('Password to test:', testPassword);
console.log('');

bcrypt.compare(testPassword, process.env.ADMIN_PASSWORD_HASH, (err, result) => {
  if (err) {
    console.log('❌ Error comparing password:', err.message);
    console.log('');
    console.log('This might mean your ADMIN_PASSWORD_HASH is invalid.');
    console.log('Try regenerating it with:');
    console.log('  node generate-password-hash.js YourPasswordHere\n');
    process.exit(1);
  }

  console.log('Result:');
  console.log('─────────────────────────────────────────────────');
  if (result) {
    console.log('✅ PASSWORD MATCHES! Login should work.\n');
    console.log('Login with:');
    console.log('  Email:', process.env.ADMIN_EMAIL);
    console.log('  Password:', testPassword);
    console.log('');
  } else {
    console.log('❌ PASSWORD DOES NOT MATCH\n');
    console.log('The password you entered does not match the hash in .env\n');
    console.log('Options:');
    console.log('  1. Make sure you\'re typing the correct password');
    console.log('  2. Regenerate the hash with the correct password:');
    console.log('     node generate-password-hash.js YourCorrectPassword');
    console.log('');
  }
});




