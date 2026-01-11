/**
 * Email Service
 * Currently logs emails to console for development
 * Can be upgraded to use SendGrid, AWS SES, or other email providers
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send email verification email
 * @param {Object} user - User object with email and name
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(user, token) {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const emailContent = {
    to: user.email,
    subject: 'Verify your email address - PromptLingo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to PromptLingo!</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all;">${verificationUrl}</p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">
          PromptLingo - AI-Powered Translation<br>
          © 2026 PromptLingo. All rights reserved.
        </p>
      </div>
    `,
    text: `
Welcome to PromptLingo!

Hi ${user.name || 'there'},

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.

---
PromptLingo - AI-Powered Translation
© 2026 PromptLingo. All rights reserved.
    `
  };

  // Log to console for development
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL: Verification Email');
  console.log('='.repeat(80));
  console.log(`To: ${emailContent.to}`);
  console.log(`Subject: ${emailContent.subject}`);
  console.log('-'.repeat(80));
  console.log(`\n🔗 VERIFICATION LINK:\n${verificationUrl}\n`);
  console.log('='.repeat(80) + '\n');

  // TODO: Replace with actual email service
  // await sendGridEmail(emailContent);
  // or await sesEmail(emailContent);

  return { success: true, message: 'Verification email logged to console' };
}

/**
 * Send password reset email
 * @param {Object} user - User object with email and name
 * @param {string} token - Password reset token
 */
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const emailContent = {
    to: user.email,
    subject: 'Reset your password - PromptLingo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">
          PromptLingo - AI-Powered Translation<br>
          © 2026 PromptLingo. All rights reserved.
        </p>
      </div>
    `,
    text: `
Password Reset Request

Hi ${user.name || 'there'},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

---
PromptLingo - AI-Powered Translation
© 2026 PromptLingo. All rights reserved.
    `
  };

  // Log to console for development
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL: Password Reset');
  console.log('='.repeat(80));
  console.log(`To: ${emailContent.to}`);
  console.log(`Subject: ${emailContent.subject}`);
  console.log('-'.repeat(80));
  console.log(`\n🔗 RESET LINK:\n${resetUrl}\n`);
  console.log('⏰ Expires in: 1 hour');
  console.log('='.repeat(80) + '\n');

  return { success: true, message: 'Password reset email logged to console' };
}

/**
 * Send password changed confirmation email
 * @param {Object} user - User object with email and name
 */
async function sendPasswordChangedEmail(user) {
  const emailContent = {
    to: user.email,
    subject: 'Your password has been changed - PromptLingo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Changed Successfully</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Your password has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <div style="margin: 30px 0;">
          <a href="${FRONTEND_URL}/login"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Log In
          </a>
        </div>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          For security reasons, you may need to log in again on all your devices.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">
          PromptLingo - AI-Powered Translation<br>
          © 2026 PromptLingo. All rights reserved.
        </p>
      </div>
    `,
    text: `
Password Changed Successfully

Hi ${user.name || 'there'},

Your password has been successfully changed.

If you did not make this change, please contact our support team immediately.

For security reasons, you may need to log in again on all your devices.

---
PromptLingo - AI-Powered Translation
© 2026 PromptLingo. All rights reserved.
    `
  };

  // Log to console for development
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL: Password Changed Confirmation');
  console.log('='.repeat(80));
  console.log(`To: ${emailContent.to}`);
  console.log(`Subject: ${emailContent.subject}`);
  console.log('-'.repeat(80));
  console.log('Password changed successfully');
  console.log('='.repeat(80) + '\n');

  return { success: true, message: 'Password changed email logged to console' };
}

/**
 * Send welcome email after email verification
 * @param {Object} user - User object with email and name
 */
async function sendWelcomeEmail(user) {
  const emailContent = {
    to: user.email,
    subject: 'Welcome to PromptLingo!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to PromptLingo! 🎉</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Your email has been verified! You're now ready to start using PromptLingo.</p>
        <h3>What you can do with PromptLingo:</h3>
        <ul style="color: #4b5563;">
          <li>Translate text between English, Spanish, and Haitian Creole</li>
          <li>Use voice input for hands-free translation</li>
          <li>Listen to translations with text-to-speech</li>
          <li>Save your translation history</li>
        </ul>
        <div style="margin: 30px 0;">
          <a href="${FRONTEND_URL}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Translating
          </a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">
          PromptLingo - AI-Powered Translation<br>
          © 2026 PromptLingo. All rights reserved.
        </p>
      </div>
    `
  };

  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL: Welcome Email');
  console.log('='.repeat(80));
  console.log(`To: ${emailContent.to}`);
  console.log(`Subject: ${emailContent.subject}`);
  console.log('='.repeat(80) + '\n');

  return { success: true, message: 'Welcome email logged to console' };
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail
};
