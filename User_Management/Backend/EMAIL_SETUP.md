Gmail App Password setup for OTP delivery

If you want OTP emails to be delivered to Gmail, follow these steps:

1. Enable 2-Step Verification for your Google account
   - Go to https://myaccount.google.com/security
   - Under "Signing in to Google" enable 2-Step Verification.

2. Create an App Password
   - After enabling 2-Step Verification, go to "App passwords" (same Security page).
   - Select "Mail" as the app and "Other" or your device, then click "Generate".
   - Copy the generated 16-character app password (no spaces).

3. Configure the backend .env
   - Set the following variables in `Backend/.env` (do NOT commit this file):
     EMAIL_USER=your.email@gmail.com
     EMAIL_PASS=<the_app_password_you_generated>
     MAIL_FROM=your.email@gmail.com

4. Restart the backend
   - From the project backend folder run:
     npm install (if you added new deps like @sendgrid/mail)
     npm run dev

5. Test
   - Use the Forgot Password page in the frontend to send an OTP to a verified user email.
   - Check your Gmail inbox (or spam folder) for the OTP email. If it doesn't arrive, check the server logs for errors.

Notes
- Gmail may rate-limit or block messages if the account is used heavily in production — SendGrid or another transactional email provider is recommended for production.
- If using SendGrid, set `SENDGRID_API_KEY` and `SENDGRID_FROM` in your `.env` and remove/ignore Gmail settings.
