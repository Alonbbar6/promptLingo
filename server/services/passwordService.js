/**
 * Password Service
 * Handles password hashing, validation, and secure token generation
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required');
  }

  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }

  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password comparison error:', error.message);
    return false;
  }
}

/**
 * Validate password strength requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  if (typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password must be a string']
    };
  }

  // Minimum 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum 128 characters (prevent DoS attacks)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // At least one number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a secure random token using crypto
 * @param {number} bytes - Number of random bytes to generate (default: 32)
 * @returns {string} - Hex-encoded random token
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a cryptographically secure random password
 * Useful for temporary passwords or testing
 * @param {number} length - Length of password (default: 16)
 * @returns {string} - Random password meeting all strength requirements
 */
function generateSecurePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';

  // Ensure at least one of each required character type
  const requiredChars = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ];

  const allChars = uppercase + lowercase + numbers + special;
  const remainingLength = length - requiredChars.length;

  // Fill remaining length with random characters
  const randomChars = Array.from(
    { length: remainingLength },
    () => allChars[Math.floor(Math.random() * allChars.length)]
  );

  // Combine and shuffle
  const passwordArray = [...requiredChars, ...randomChars];
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

/**
 * Check if a password has been commonly compromised
 * Basic check against common passwords
 * @param {string} password - Password to check
 * @returns {boolean} - True if password is in common password list
 */
function isCommonPassword(password) {
  const commonPasswords = [
    'password', 'Password1', '12345678', 'password123', 'Password123',
    'qwerty', 'abc123', 'letmein', 'welcome', 'admin', 'admin123',
    'iloveyou', 'monkey', '1234567890', 'password1', 'welcome123'
  ];

  return commonPasswords.includes(password);
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateSecureToken,
  generateSecurePassword,
  isCommonPassword
};
