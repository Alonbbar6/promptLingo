const { OAuth2Client } = require('google-auth-library');
const authConfig = require('../config/auth.config');

const client = new OAuth2Client(authConfig.google.clientId);

/**
 * Verify Google ID token
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: authConfig.google.clientId,
    });

    const payload = ticket.getPayload();
    
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
};

module.exports = {
  verifyGoogleToken,
};
