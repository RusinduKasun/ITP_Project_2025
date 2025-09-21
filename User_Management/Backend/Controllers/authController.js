const User = require('../Model/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'your-secret-key', { expiresIn: '7d' });
};

// Register User
exports.register = async (req, res) => {
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
exports.login = async (req, res) => {
  try {
    // Defensive parsing: some clients accidentally send the whole form object as `username`.
    let { username, password } = req.body;

    // If username is an object (e.g. { username, password }) extract values
    if (username && typeof username === 'object') {
      console.warn('Login payload contains nested object in `username`. Extracting fields.');
      const nested = username;
      username = nested.username || nested.email || '';
      password = nested.password || password;
    }

    // Validate required fields
    if (!username || !password) {
      console.warn('Login attempt with missing username or password. Payload:', req.body);
      return res.status(400).json({ message: 'Username (or email) and password are required' });
    }

    // Normalize for email match if applicable
    const normalized = typeof username === 'string' ? username.trim() : '';

    // Find user by username or email and include password for comparison
    const user = await User.findOne({
      $or: [{ username: normalized }, { email: normalized.toLowerCase() }]
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
exports.getCurrentUser = async (req, res) => {
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
exports.logout = (req, res) => {
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
exports.requestPasswordReset = async (req, res) => {
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
exports.resetPasswordWithOtp = async (req, res) => {
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
exports.verifyTwoFactor = async (req, res) => {
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

// Enable 2FA
exports.enableTwoFactor = async (req, res) => {
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
exports.disableTwoFactor = async (req, res) => {
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
