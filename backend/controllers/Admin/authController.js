import User from '../../models/Admin/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'your-secret-key', { expiresIn: '7d' });
};

// Register User
export const register = async (req, res) => {
  try {
    const { username, firstName, lastName, email, password, phoneNumber } = req.body;

    // Check if user already exists with username or email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Create new user
    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password,
      phoneNumber
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    res.status(201).json({
      message: 'User registered successfully',
      user: user.getProfile(),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Helper: temp token for 2FA step
const generateTempToken = (userId) => {
  return jwt.sign({ userId, twofa: true }, 'your-secret-key', { expiresIn: '10m' });
};

// Login User
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Log login attempts for debugging (avoid logging passwords in production)
    console.log(`Login attempt for username/email: ${username} from IP: ${req.ip}`);

    // Find user by username or email and include password for comparison
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    // If user has 2FA enabled, send OTP and return temp token
    if (user.twoFactorEnabled) {
      const otp = generateOtp();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      user.twoFactorOtp = otp;
      user.twoFactorOtpExpiresAt = expires;
      await user.save();

      if (!transporter) {
        console.warn('No authenticated SMTP configured; 2FA OTP:', otp);
      } else {
        try {
          await transporter.sendMail({
            from: process.env.MAIL_FROM || 'no-reply@example.com',
            to: user.email,
            subject: 'Your 2FA code',
            text: `Your 2FA code is ${otp}. It expires in 10 minutes.`,
            html: `<p>Your 2FA code is <b>${otp}</b>. It expires in 10 minutes.</p>`
          });
        } catch (mailErr) {
          console.error('Error sending 2FA email:', mailErr);
        }
      }

      const tempToken = generateTempToken(user._id);
      return res.json({
        message: '2FA code sent to your email',
        twofaRequired: true,
        tempToken
      });
    }

    // Otherwise, proceed with normal login
    const token = generateToken(user._id);
    res.json({ message: 'Login successful', user: user.getProfile(), token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
};

// Logout (client-side token removal)
export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Email transporter (only when credentials are provided)
const transporter = (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  : null;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Request password reset (send OTP)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtp +resetOtpExpiresAt');
    if (!user) {
      return res.json({ message: 'If the email exists, an OTP has been sent' });
    }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtp = otp;
    user.resetOtpExpiresAt = expires;
    await user.save();

    if (!transporter) {
      console.warn('No authenticated SMTP configured; OTP:', otp);
    } else {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@example.com',
        to: user.email,
        subject: 'Your password reset code',
        text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`
      });
    }

    res.json({ message: 'If the email exists, an OTP has been sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Error requesting password reset', error: error.message });
  }
};

// Reset password with OTP
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and newPassword are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtp +resetOtpExpiresAt +password');
    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.resetOtp !== otp || user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password with OTP error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Verify 2FA OTP and issue final JWT
export const verifyTwoFactor = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) {
      return res.status(400).json({ message: 'tempToken and otp are required' });
    }

    let payload;
    try {
      payload = jwt.verify(tempToken, 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired temp token' });
    }

    if (!payload.twofa || !payload.userId) {
      return res.status(401).json({ message: 'Invalid temp token' });
    }

    const user = await User.findById(payload.userId).select('+twoFactorOtp +twoFactorOtpExpiresAt');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled or user not found' });
    }

    if (!user.twoFactorOtp || !user.twoFactorOtpExpiresAt) {
      return res.status(400).json({ message: 'No active 2FA challenge' });
    }

    if (user.twoFactorOtp !== otp || user.twoFactorOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired 2FA code' });
    }

    // Clear OTP and issue final token
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpiresAt = undefined;
    await user.save();

    const token = generateToken(user._id);
    return res.json({ message: '2FA verified', user: user.getProfile(), token });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Error verifying 2FA', error: error.message });
  }
};

// Social login / register (Google, Facebook)
export const socialLogin = async (req, res) => {
  try {
    const { provider } = req.body;
    let profile = null;

    if (!provider) return res.status(400).json({ message: 'Provider is required' });

    if (provider === 'google') {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ message: 'idToken is required for Google' });

      // Verify Google ID token via Google tokeninfo endpoint
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '<no-body>');
        console.error('Google token verification failed', { status: resp.status, body: text });
        return res.status(401).json({ message: 'Invalid Google token', status: resp.status, details: text });
      }
      const info = await resp.json();
      // tokeninfo returns email and email_verified
      if (!info.email || info.email_verified !== 'true' && info.email_verified !== true) {
        return res.status(400).json({ message: 'Google account email not verified' });
      }
      profile = {
        email: info.email,
        firstName: info.given_name || (info.name || '').split(' ')[0] || '',
        lastName: info.family_name || (info.name || '').split(' ').slice(1).join(' ') || '',
        picture: info.picture || ''
      };

    } else if (provider === 'facebook') {
      const { accessToken } = req.body;
      if (!accessToken) return res.status(400).json({ message: 'accessToken is required for Facebook' });

      const resp = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '<no-body>');
        console.error('Facebook token verification failed', { status: resp.status, body: text });
        return res.status(401).json({ message: 'Invalid Facebook token', status: resp.status, details: text });
      }
      const info = await resp.json();
      if (!info.email) return res.status(400).json({ message: 'Facebook account email is required' });
      const nameParts = (info.name || '').split(' ');
      profile = {
        email: info.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        picture: ''
      };

    } else {
      return res.status(400).json({ message: 'Unsupported provider' });
    }

    // Find or create user
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      // generate a username from email local part
      const local = profile.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 20);
      let username = local || `user${Date.now()}`;
      // ensure uniqueness
      let suffix = 0;
      while (await User.findOne({ username })) {
        suffix += 1;
        username = `${local}${suffix}`;
      }

      // create random password (user can reset later)
      const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36).slice(-4);

      user = new User({
        username,
        firstName: profile.firstName || ' ',
        lastName: profile.lastName || ' ',
        email: profile.email,
        password: randomPassword,
        profilePicture: profile.picture || ''
      });
      await user.save();
    }

    // generate token
    const token = generateToken(user._id);
    res.json({ message: 'Social login successful', user: user.getProfile(), token });

  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Error during social login', error: error.message });
  }
};

// Enable 2FA
export const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ message: '2FA enabled', twoFactorEnabled: true });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Error enabling 2FA', error: error.message });
  }
};

// Disable 2FA
export const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+twoFactorOtp +twoFactorOtpExpiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.twoFactorEnabled = false;
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpiresAt = undefined;
    await user.save();
    res.json({ message: '2FA disabled', twoFactorEnabled: false });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Error disabling 2FA', error: error.message });
  }
};
