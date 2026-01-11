/**
 * Validation Middleware
 * Input validation using express-validator for email/password authentication
 */

const { body, validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/apiResponse');

/**
 * Password strength validation rules
 */
const passwordValidationRules = () => [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character'),
];

/**
 * Validate registration request
 */
const validateRegister = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  ...passwordValidationRules(),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
];

/**
 * Validate login request
 */
const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string'),
];

/**
 * Validate email verification request
 */
const validateVerifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isString()
    .withMessage('Token must be a string')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid token format'),
];

/**
 * Validate forgot password request
 */
const validateForgotPassword = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
];

/**
 * Validate reset password request
 */
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isString()
    .withMessage('Token must be a string')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid token format'),

  ...passwordValidationRules(),
];

/**
 * Validate change password request
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isString()
    .withMessage('Current password must be a string'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isString()
    .withMessage('New password must be a string')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('New password must contain at least one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

/**
 * Validate resend verification email request
 */
const validateResendVerification = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
];

/**
 * Validate user update request
 */
const validateUserUpdate = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

/**
 * Validate preferences update
 */
const validatePreferences = [
  body('preferences')
    .notEmpty()
    .withMessage('Preferences are required')
    .isObject()
    .withMessage('Preferences must be an object'),
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateResendVerification,
  validateUserUpdate,
  validatePreferences,
  handleValidationErrors,
};
