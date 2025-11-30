import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error('Missing RESEND_API_KEY in .env');
}

// Initialize Resend client
export const resend = new Resend(resendApiKey);

export const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@gioscorner.com';
// Use Resend's test domain by default - gmail.com addresses won't work
export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export default resend;



