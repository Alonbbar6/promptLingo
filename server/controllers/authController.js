/**
 * Authentication Controller
 * Handles user registration, login, email verification, and password management
 */

const userService = require('../services/userService');
const sessionService = require('../services/sessionService');
const tokenService = require('../services/tokenService');
const { validatePasswordStrength, generateSecureToken, comparePassword } = require('../services/passwordService');
const emailService = require('../services/emailService');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/apiResponse');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Set authentication cookies
 */
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.promptlingo.ai' : undefined,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.promptlingo.ai' : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear authentication cookies
 */
function clearAuthCookies(res) {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.promptlingo.ai' : undefined,
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
}

/**
 * Register new user with email and password
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Invalid email address', 400);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return errorResponse(res, passwordValidation.errors.join(', '), 400);
    }

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    // Create user
    const user = await userService.createUserWithPassword(email, password, name);

    // Generate email verification token (24 hour expiry)
    const verificationToken = generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await userService.setEmailVerificationToken(user.id, verificationToken, expiresAt);

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    console.log(`✅ User registered: ${email} (verification required)`);

    return successResponse(res, {
      message: 'Registration successful! Please check your email to verify your account.',
      email: user.email,
    }, 'Registration successful', 201);

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, error.message || 'Failed to register user', 500);
  }
};

/**
 * Verify email with token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 'Verification token is required', 400);
    }

    // Verify email with token
    const user = await userService.verifyEmailWithToken(token);

    if (!user) {
      return errorResponse(res, 'Invalid or expired verification token', 400);
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    console.log(`✅ Email verified: ${user.email}`);

    return successResponse(res, {
      message: 'Email verified successfully! You can now log in.',
      email: user.email,
    }, 'Email verified', 200);

  } catch (error) {
    console.error('Email verification error:', error);
    return errorResponse(res, error.message || 'Failed to verify email', 500);
  }
};

/**
 * Login with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 [LOGIN] Login attempt for:', email);
    console.log('🔍 [LOGIN] Password received:', password ? `${password.substring(0, 5)}...` : 'NO PASSWORD');

    if (!email || !password) {
      console.log('❌ [LOGIN] Missing credentials');
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user by email
    const user = await userService.findUserByEmail(email);
    console.log('🔍 [LOGIN] User found:', !!user);

    // Timing attack prevention - always hash even if user doesn't exist
    if (!user) {
      console.log('❌ [LOGIN] User not found in database');
      await comparePassword(password, '$2a$10$invalidhashtopreventtimingattack');
      return unauthorizedResponse(res, 'Wrong email or password. Please try again or reset your password.');
    }

    console.log('🔍 [LOGIN] User details:', {
      id: user.id,
      email: user.email,
      auth_method: user.auth_method,
      email_verified: user.email_verified,
      is_active: user.is_active,
      has_password_hash: !!user.password_hash,
      password_hash_length: user.password_hash?.length
    });

    // Check auth method
    if (user.auth_method !== 'email') {
      console.log('❌ [LOGIN] Wrong auth method:', user.auth_method);
      return errorResponse(res, 'Please use Google Sign-In for this account', 400);
    }

    // Check if email is verified
    if (!user.email_verified) {
      console.log('❌ [LOGIN] Email not verified');
      return errorResponse(res, 'Please verify your email address before logging in. Check your inbox for the verification link.', 403);
    }

    // Check if account is active
    if (!user.is_active) {
      console.log('❌ [LOGIN] Account not active');
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Verify password
    console.log('🔍 [LOGIN] Comparing password with hash...');
    const isValidPassword = await comparePassword(password, user.password_hash);
    console.log('🔍 [LOGIN] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ [LOGIN] Invalid password');
      return unauthorizedResponse(res, 'Wrong email or password. Please try again or reset your password.');
    }

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken(user.id);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await sessionService.createSession(user.id, accessToken, refreshToken, expiresAt);

    // Set HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    console.log(`✅ User logged in: ${user.email}`);

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
      expiresIn: 900, // 15 minutes
    }, 'Login successful', 200);

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error.message || 'Failed to login', 500);
  }
};

/**
 * Logout - Clear session and cookies
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Invalidate session
      await sessionService.invalidateSessionByToken(refreshToken);
    }

    // Clear cookies
    clearAuthCookies(res);

    console.log('✅ User logged out');

    return successResponse(res, null, 'Logout successful', 200);

  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if database operation fails
    clearAuthCookies(res);
    return successResponse(res, null, 'Logout successful', 200);
  }
};

/**
 * Verify access token (middleware uses this)
 */
const verifyToken = async (req, res) => {
  try {
    // User is already attached by authMiddleware
    if (!req.user) {
      return unauthorizedResponse(res, 'Not authenticated');
    }

    return successResponse(res, {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar_url,
        subscriptionTier: req.user.subscription_tier,
      },
    }, 'Token is valid', 200);

  } catch (error) {
    console.error('Token verification error:', error);
    return unauthorizedResponse(res, 'Invalid token');
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return unauthorizedResponse(res, 'Refresh token not found');
    }

    // Verify refresh token
    const decoded = tokenService.verifyRefreshToken(refreshToken);
    if (!decoded.valid) {
      clearAuthCookies(res);
      return unauthorizedResponse(res, 'Invalid refresh token');
    }

    // Get session from database
    const session = await sessionService.getSessionByRefreshToken(refreshToken);
    if (!session) {
      clearAuthCookies(res);
      return unauthorizedResponse(res, 'Session not found or expired');
    }

    // Get user from database
    const user = await userService.findUserById(session.user_id);
    if (!user || !user.is_active) {
      clearAuthCookies(res);
      return unauthorizedResponse(res, 'User not found or inactive');
    }

    // Generate new tokens (refresh token rotation)
    const newAccessToken = tokenService.generateAccessToken(user.id);
    const newRefreshToken = tokenService.generateRefreshToken(user.id);

    // Invalidate old session
    await sessionService.invalidateSessionByToken(refreshToken);

    // Create new session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await sessionService.createSession(user.id, newAccessToken, newRefreshToken, expiresAt);

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    console.log(`✅ Token refreshed for user: ${user.email}`);

    return successResponse(res, {
      expiresIn: 900, // 15 minutes
    }, 'Token refreshed', 200);

  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthCookies(res);
    return unauthorizedResponse(res, 'Failed to refresh token');
  }
};

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return unauthorizedResponse(res, 'Not authenticated');
    }

    const user = await userService.findUserById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url,
        subscriptionTier: user.subscription_tier,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        emailVerified: user.email_verified,
      },
    }, 'User retrieved', 200);

  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, error.message || 'Failed to get user', 500);
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    // Find user (but don't reveal if user exists)
    const user = await userService.findUserByEmail(email);

    if (user && user.auth_method === 'email') {
      // Generate reset token (1 hour expiry)
      const resetToken = generateSecureToken(32);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await userService.setPasswordResetToken(user.id, resetToken, expiresAt);

      // Send password reset email
      await emailService.sendPasswordResetEmail(user, resetToken);

      console.log(`✅ Password reset requested for: ${email}`);
    }

    // Always return success (security best practice - don't reveal if email exists)
    return successResponse(res, {
      message: 'If an account exists with that email, a password reset link has been sent.',
    }, 'Password reset email sent', 200);

  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, error.message || 'Failed to process password reset request', 500);
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return errorResponse(res, 'Token and new password are required', 400);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return errorResponse(res, passwordValidation.errors.join(', '), 400);
    }

    // Reset password
    const user = await userService.resetPasswordWithToken(token, password);

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Invalidate all existing sessions for security
    await sessionService.invalidateAllUserSessions(user.id);

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user);

    console.log(`✅ Password reset successful for: ${user.email}`);

    return successResponse(res, {
      message: 'Password reset successful. Please log in with your new password.',
    }, 'Password reset', 200);

  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, error.message || 'Failed to reset password', 500);
  }
};

/**
 * Change password (when logged in)
 */
const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return unauthorizedResponse(res, 'Not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return errorResponse(res, passwordValidation.errors.join(', '), 400);
    }

    // Check that new password is different
    if (currentPassword === newPassword) {
      return errorResponse(res, 'New password must be different from current password', 400);
    }

    // Change password
    try {
      await userService.changeUserPassword(req.user.id, currentPassword, newPassword);
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return errorResponse(res, 'Current password is incorrect', 400);
      }
      throw error;
    }

    // Invalidate all other sessions (keep current session)
    const currentRefreshToken = req.cookies?.refreshToken;
    if (currentRefreshToken) {
      await sessionService.invalidateAllUserSessionsExcept(req.user.id, currentRefreshToken);
    }

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(req.user);

    console.log(`✅ Password changed for: ${req.user.email}`);

    return successResponse(res, {
      message: 'Password changed successfully.',
    }, 'Password changed', 200);

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, error.message || 'Failed to change password', 500);
  }
};

/**
 * Resend email verification
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    // Find user
    const user = await userService.findUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return successResponse(res, {
        message: 'If an unverified account exists with that email, a verification link has been sent.',
      }, 'Verification email sent', 200);
    }

    if (user.email_verified) {
      return errorResponse(res, 'Email is already verified. You can log in now.', 400);
    }

    // Generate new verification token
    const verificationToken = generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await userService.resendEmailVerification(email, verificationToken, expiresAt);

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    console.log(`✅ Verification email resent to: ${email}`);

    return successResponse(res, {
      message: 'If an unverified account exists with that email, a verification link has been sent.',
    }, 'Verification email sent', 200);

  } catch (error) {
    console.error('Resend verification error:', error);
    return errorResponse(res, error.message || 'Failed to resend verification email', 500);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  verifyToken,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification,
};
