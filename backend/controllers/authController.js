const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generateTokensAndSetCookies = require('../utils/generateTokens');
const {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} = require('../utils/passwordResetMailer');

const passwordResetResponse = 'If an account exists for that email, a reset link will be sent.';

const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });
    generateTokensAndSetCookies(res, user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateTokensAndSetCookies(res, user._id, user.role);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Email a one-time password-reset link without revealing whether an account exists
// @route   POST /api/auth/forgot-password
exports.requestPasswordReset = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (!isPasswordResetEmailConfigured() || !process.env.CLIENT_URL) {
    return res.status(503).json({ message: 'Password reset email is not configured yet.' });
  }

  let resetUrl;
  try {
    resetUrl = new URL('/reset-password', process.env.CLIENT_URL.split(',')[0].trim());
  } catch {
    return res.status(503).json({ message: 'Password reset email is not configured yet.' });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      resetUrl.searchParams.set('token', token);
      try {
        await sendPasswordResetEmail(user.email, resetUrl.toString());
      } catch (error) {
        console.error('Password reset email delivery failed.');
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
      }
    }

    return res.status(200).json({ message: passwordResetResponse });
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    return res.status(500).json({ message: 'Unable to process the request right now.' });
  }
};

// @desc    Reset password with a single-use email token
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const token = String(req.body.token || '').trim();
  const password = String(req.body.password || '');
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ message: 'This reset link is invalid or expired.' });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Password must be 8 to 72 bytes long.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or expired.' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    clearAuthCookies(res);

    return res.status(200).json({ message: 'Password reset. Sign in with your new password.' });
  } catch (error) {
    console.error('Password reset failed:', error.message);
    return res.status(500).json({ message: 'Unable to reset your password right now.' });
  }
};

// @desc    Refresh access token using refreshToken cookie
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    generateTokensAndSetCookies(res, user._id, user.role);
    res.status(200).json({ message: 'Access token refreshed successfully' });
  } catch (error) {
    res.status(401).json({ message: 'Expired or invalid refresh token' });
  }
};

// @desc    Logout user / Clear HTTP-Only cookies
// @route   POST /api/auth/logout
exports.logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};

