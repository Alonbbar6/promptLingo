const jwt = require('jsonwebtoken');

// JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_TOKEN_EXPIRY = '15m';
const JWT_REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    googleId: user.google_id,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
