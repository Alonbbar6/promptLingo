/**
 * Email Service
 * Uses Resend for sending transactional emails
 */

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'PromptLingo <onboarding@resend.dev>';

/**
 * Send an email using Resend
 * @param {Object} emailContent - Email content object
 */
async function sendEmail(emailContent) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent successfully to ${emailContent.to} (ID: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('❌ Email service error:', err);
    return { success: false, error: err.message };
  }
}

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

  return await sendEmail(emailContent);
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

  return await sendEmail(emailContent);
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

  return await sendEmail(emailContent);
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
        <h2 style="color: #2563eb;">Welcome to PromptLingo! </h2>
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
    `,
    text: `
Welcome to PromptLingo!

Hi ${user.name || 'there'},

Your email has been verified! You're now ready to start using PromptLingo.

What you can do with PromptLingo:
- Translate text between English, Spanish, and Haitian Creole
- Use voice input for hands-free translation
- Listen to translations with text-to-speech
- Save your translation history

Visit ${FRONTEND_URL} to start translating!

---
PromptLingo - AI-Powered Translation
© 2026 PromptLingo. All rights reserved.
    `
  };

  return await sendEmail(emailContent);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail
};
