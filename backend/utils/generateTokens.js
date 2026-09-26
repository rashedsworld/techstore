const jwt = require('jsonwebtoken');

const generateTokensAndSetCookies = (res, userId, role) => {
  // Generate Access Token (15 mins duration)
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  // Generate Refresh Token (7 days duration)
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  // Set HTTP-Only Cookie for Access Token
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set HTTP-Only Cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokensAndSetCookies;