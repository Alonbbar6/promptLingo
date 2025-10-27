/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const tokenService = require('../services/tokenService');
const userService = require('../services/userService');
const { unauthorizedResponse } = require('../utils/apiResponse');

/**
 * Authenticate JWT token from request header
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return unauthorizedResponse(res, 'Access token required');
    }

    // Verify token
    const { valid, decoded, error } = tokenService.verifyAccessToken(token);

    if (!valid) {
      return unauthorizedResponse(res, error || 'Invalid or expired token');
    }

    // Get user from database
    const user = await userService.findUserById(decoded.userId);

    if (!user) {
      return unauthorizedResponse(res, 'User not found');
    }

    if (!user.is_active) {
      return unauthorizedResponse(res, 'User account is deactivated');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url
    };

    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const { valid, decoded } = tokenService.verifyAccessToken(token);

    if (valid) {
      const user = await userService.findUserById(decoded.userId);
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          googleId: user.google_id,
          email: user.email,
          name: user.name,
          avatar: user.avatar_url
        };
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    req.userId = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
