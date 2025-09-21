#!/usr/bin/env node
/**
 * Simple test script to send an email using the server's SMTP env variables.
 * Usage: node scripts/send_test_email.js recipient@example.com
 * If no recipient is provided, MAIL_FROM will be used.
 */
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const to = process.argv[2] || process.env.MAIL_FROM;
if (!to) {
  console.error('No recipient provided and MAIL_FROM not set in env. Usage: node scripts/send_test_email.js you@domain.com');
  process.exit(1);
}

async function send() {
  try {
    if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) {
      console.error('SMTP credentials are not set in .env (SMTP_HOST/SMTP_USER/SMTP_PASS).');
      process.exit(1);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: 'Test email from User_Management SMTP settings',
      text: 'This is a test message sent to verify SMTP settings.',
    });

    console.log('Message sent. Response:', info.response || info);
    process.exit(0);
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(2);
  }
}

send();
