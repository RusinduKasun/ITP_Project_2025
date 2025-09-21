#!/usr/bin/env node
/**
 * Dev helper: print a user's stored twoFactorOtp and expiry.
 * Usage: node scripts/print_user_otp.js user@example.com
 * NOTE: Dev-only. Do NOT commit this to production environments with open access.
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('../Model/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/print_user_otp.js user@example.com');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+twoFactorOtp +twoFactorOtpExpiresAt');
    if (!user) {
      console.log('User not found:', email);
      process.exit(0);
    }
    console.log('User:', user.email);
    console.log('twoFactorEnabled:', user.twoFactorEnabled);
    console.log('twoFactorOtp:', user.twoFactorOtp || '(none)');
    console.log('twoFactorOtpExpiresAt:', user.twoFactorOtpExpiresAt || '(none)');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  }
}

run();
