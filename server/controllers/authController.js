const googleAuthService = require('../services/googleAuthService');
const userService = require('../services/userService');
const sessionService = require('../services/sessionService');
const tokenService = require('../services/tokenService');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/apiResponse');

/**
 * Google Login - Verify Google token and create/login user
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, 'Google ID token is required', 400);
    }

    // Verify Google token
    const googleData = await googleAuthService.verifyGoogleToken(idToken);

    // Find or create user
    let user = await userService.findUserByGoogleId(googleData.googleId);

    if (!user) {
      // Create new user
      user = await userService.createUser(googleData);
      console.log(`✅ New user created: ${user.email}`);
    } else {
      // Update last login
      await userService.updateLastLogin(user.id);
      console.log(`✅ User logged in: ${user.email}`);
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken(user.id);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session in database
    await sessionService.createSession(user.id, accessToken, refreshToken, expiresAt);

    // Send response
    return successResponse(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url,
        googleId: user.google_id,
      },
      expiresIn: 900, // 15 minutes in seconds
    }, 'Login successful', 200);
  } catch (error) {
    console.error('Google login error:', error);
    return unauthorizedResponse(res, error.message || 'Failed to authenticate with Google');
  }
};

/**
 * Logout - Invalidate refresh token
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await sessionService.invalidateSessionByToken(refreshToken);
    }

    return successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Verify token - Check if access token is valid
 */
const verifyToken = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    return successResponse(res, {
      valid: true,
      user: req.user,
    }, 'Token is valid', 200);
  } catch (error) {
    return unauthorizedResponse(res, error.message);
  }
};

/**
 * Refresh token - Get new access token using refresh token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const { valid, decoded, error } = tokenService.verifyRefreshToken(refreshToken);

    if (!valid) {
      return unauthorizedResponse(res, error || 'Invalid refresh token');
    }

    // Check if session exists in database
    const session = await sessionService.getSessionByRefreshToken(refreshToken);

    if (!session) {
      return unauthorizedResponse(res, 'Session not found or expired');
    }

    // Get user
    const user = await userService.findUserById(decoded.userId);

    if (!user || !user.is_active) {
      return unauthorizedResponse(res, 'User not found or inactive');
    }

    // Generate new access token
    const accessToken = tokenService.generateAccessToken(user.id);

    // Optionally rotate refresh token (more secure)
    const newRefreshToken = tokenService.generateRefreshToken(user.id);
    
    // Calculate new expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Delete old session and create new one
    await sessionService.invalidateSessionByToken(refreshToken);
    await sessionService.createSession(user.id, accessToken, newRefreshToken, expiresAt);

    return successResponse(res, {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes
    }, 'Token refreshed successfully', 200);
  } catch (error) {
    console.error('Refresh token error:', error);
    return unauthorizedResponse(res, error.message || 'Token refresh failed');
  }
};

/**
 * Get current user - Get authenticated user's profile
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    const user = await userService.findUserById(req.userId);

    if (!user) {
      return unauthorizedResponse(res, 'User not found');
    }

    return successResponse(res, {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      preferences: user.preferences,
      settings: user.settings
    }, 'User retrieved successfully', 200);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  googleLogin,
  logout,
  verifyToken,
  refreshAccessToken,
  getCurrentUser,
};
