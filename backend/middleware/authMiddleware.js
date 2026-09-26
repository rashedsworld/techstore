const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - validates access token from cookies
const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: 'Not authorized, access token missing' });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Admin protection middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin permissions required' });
  }
};

module.exports = { protectRoute, adminOnly };