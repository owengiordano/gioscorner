#!/usr/bin/env node

/**
 * Simple script to generate bcrypt password hash for admin credentials
 * 
 * Usage:
 *   node generate-password-hash.js YourPasswordHere
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('\nUsage:');
  console.log('  node generate-password-hash.js YourPasswordHere');
  console.log('\nExample:');
  console.log('  node generate-password-hash.js MySecurePassword123!');
  process.exit(1);
}

console.log('🔐 Generating password hash...\n');

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }

  console.log('✅ Password hash generated successfully!\n');
  console.log('Copy this line to your backend/.env file:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('─────────────────────────────────────────────────────\n');
  console.log('Your complete admin setup should look like:');
  console.log('');
  console.log('ADMIN_EMAIL=your-email@example.com');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('JWT_SECRET=your-random-jwt-secret-key');
  console.log('');
});




