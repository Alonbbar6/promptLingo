/**
 * Authentication Routes
 * Handles email/password authentication, email verification, and password management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateResendVerification,
  handleValidationErrors
} = require('../middleware/validationMiddleware');

// ============================================
// Registration & Email Verification
// ============================================

// Register new user
router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  authController.register
);

// Verify email with token
router.post(
  '/verify-email',
  validateVerifyEmail,
  handleValidationErrors,
  authController.verifyEmail
);

// Resend email verification
router.post(
  '/resend-verification',
  validateResendVerification,
  handleValidationErrors,
  authController.resendVerification
);

// ============================================
// Login & Logout
// ============================================

// Login with email and password
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  authController.login
);

// Logout
router.post('/logout', authController.logout);

// ============================================
// Token Management
// ============================================

// Verify access token
router.get('/verify', authenticateToken, authController.verifyToken);

// Refresh access token
router.post('/refresh', authController.refreshAccessToken);

// Get current user
router.get('/user', authenticateToken, authController.getCurrentUser);

// ============================================
// Password Management
// ============================================

// Request password reset
router.post(
  '/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);

// Reset password with token
router.post(
  '/reset-password',
  validateResetPassword,
  handleValidationErrors,
  authController.resetPassword
);

// Change password (authenticated)
router.post(
  '/change-password',
  authenticateToken,
  validateChangePassword,
  handleValidationErrors,
  authController.changePassword
);

// ============================================
// Auth Status
// ============================================

// Auth status check
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      authMethod: 'email/password',
      emailVerificationRequired: true,
      passwordResetEnabled: true,
      databaseConnected: true,
      jwtConfigured: !!process.env.JWT_SECRET,
    },
    message: 'Auth status retrieved'
  });
});

module.exports = router;
