-- Migration: Add Email/Password Authentication Support
-- Date: 2026-01-10
-- Description: Adds columns for email/password authentication, email verification, and password reset functionality

-- ============================================
-- Add new columns to users table
-- ============================================

-- Password authentication
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'email';

-- Email verification
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;

-- Password reset
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- ============================================
-- Modify existing columns
-- ============================================

-- Make google_id nullable to support email-based users
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

-- Update existing users to have 'google' auth method
UPDATE users SET auth_method = 'google' WHERE google_id IS NOT NULL AND auth_method IS NULL;

-- ============================================
-- Create indexes for performance
-- ============================================

-- Auth method index for filtering by authentication type
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method);

-- Email verification indexes
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Password reset token index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (for email/password auth users)';
COMMENT ON COLUMN users.auth_method IS 'Authentication method: email or google';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when email was verified';
COMMENT ON COLUMN users.email_verification_token IS 'Token for email verification (expires in 24h)';
COMMENT ON COLUMN users.email_verification_expires IS 'Expiry timestamp for email verification token';
COMMENT ON COLUMN users.password_reset_token IS 'Token for password reset (expires in 1h)';
COMMENT ON COLUMN users.password_reset_expires IS 'Expiry timestamp for password reset token';

-- ============================================
-- Migration completed successfully
-- ============================================
