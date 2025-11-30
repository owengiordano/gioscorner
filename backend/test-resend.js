/**
 * Test Resend Email Configuration
 * 
 * This script tests if Resend is properly configured and can send emails.
 * Run with: node test-resend.js
 */

require('dotenv').config();
const { Resend } = require('resend');

async function testResend() {
  console.log('🔍 Testing Resend Configuration...\n');

  // Check environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  console.log('Environment Variables:');
  console.log(`  RESEND_API_KEY: ${resendApiKey ? '✅ Set (starts with: ' + resendApiKey.substring(0, 8) + '...)' : '❌ NOT SET'}`);
  console.log(`  OWNER_EMAIL: ${ownerEmail || '❌ NOT SET'}`);
  console.log(`  FROM_EMAIL: ${fromEmail} ${process.env.FROM_EMAIL ? '(from .env)' : '(using default test domain)'}\n`);

  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is not set in .env file');
    process.exit(1);
  }

  if (!ownerEmail) {
    console.error('❌ OWNER_EMAIL is not set in .env file');
    process.exit(1);
  }

  // Initialize Resend
  const resend = new Resend(resendApiKey);

  // First, try to list available domains
  console.log('📋 Checking your Resend domains...\n');
  try {
    const domains = await resend.domains.list();
    if (domains.data && domains.data.data && domains.data.data.length > 0) {
      console.log('✅ Available verified domains:');
      domains.data.data.forEach(domain => {
        console.log(`   - ${domain.name} (${domain.status})`);
      });
      console.log('');
    } else {
      console.log('⚠️  No verified domains found.');
      console.log('   You can use Resend\'s test domain: onboarding@resend.dev\n');
    }
  } catch (err) {
    console.log('ℹ️  Could not fetch domains (this is okay for testing)\n');
  }

  // Test sending an email
  console.log('📧 Attempting to send test email...\n');

  try {
    const result = await resend.emails.send({
      from: `Gio's Corner <${fromEmail}>`,
      to: ownerEmail,
      subject: 'Test Email from Gio\'s Corner',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Resend Test Successful!</h2>
          <p>This is a test email to verify your Resend configuration is working correctly.</p>
          <p><strong>If you received this email, your setup is working! 🎉</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            Sent from: Gio's Corner Backend<br>
            Timestamp: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!\n');
    console.log('Response from Resend:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📬 Check your inbox at:', ownerEmail);
    console.log('\n💡 If you don\'t see the email:');
    console.log('   1. Check your spam/junk folder');
    console.log('   2. Verify your domain is configured in Resend dashboard');
    console.log('   3. Check Resend logs at: https://resend.com/emails');

  } catch (error) {
    console.error('❌ Failed to send email\n');
    console.error('Error details:');
    console.error(error);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify your RESEND_API_KEY is correct');
    console.log('   2. Check if your domain is verified in Resend');
    console.log('   3. Make sure you have the correct "from" email configured');
    console.log('   4. Visit Resend dashboard: https://resend.com/');
    
    process.exit(1);
  }
}

testResend();

