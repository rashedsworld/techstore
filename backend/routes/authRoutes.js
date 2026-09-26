const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
	registerUser,
	loginUser,
	requestPasswordReset,
	resetPassword,
	refreshToken,
	logoutUser,
} = require('../controllers/authController');

const passwordResetLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many password reset attempts. Please try again later.' },
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

module.exports = router;