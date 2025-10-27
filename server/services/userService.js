const db = require('../db/connection');

/**
 * Find user by Google ID
 */
const findUserByGoogleId = async (googleId) => {
  const result = await db.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0];
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

/**
 * Find user by ID
 */
const findUserById = async (id) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

/**
 * Create new user from Google data
 */
const createUser = async (googleData) => {
  const result = await db.query(
    `INSERT INTO users (google_id, email, name, avatar_url, last_login, preferences, settings)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, '{}', '{}')
     RETURNING *`,
    [googleData.googleId, googleData.email, googleData.name, googleData.picture]
  );

  return result.rows[0];
};

/**
 * Update user's last login time
 */
const updateLastLogin = async (userId) => {
  await db.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
};

/**
 * Create user session
 */
const createSession = async (userId, accessToken, refreshToken) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const result = await db.query(
    `INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, accessToken, refreshToken, expiresAt]
  );

  return result.rows[0];
};

/**
 * Find session by refresh token
 */
const findSessionByRefreshToken = async (refreshToken) => {
  const result = await db.query(
    'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > CURRENT_TIMESTAMP AND is_valid = true',
    [refreshToken]
  );
  return result.rows[0];
};

/**
 * Delete session (logout)
 */
const deleteSession = async (refreshToken) => {
  await db.query(
    'UPDATE sessions SET is_valid = false WHERE refresh_token = $1',
    [refreshToken]
  );
};

/**
 * Delete all user sessions
 */
const deleteAllUserSessions = async (userId) => {
  await db.query(
    'UPDATE sessions SET is_valid = false WHERE user_id = $1',
    [userId]
  );
};

/**
 * Get user preferences
 */
const getUserPreferences = async (userId) => {
  const result = await db.query(
    'SELECT preferences FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.preferences || {};
};

/**
 * Update user preferences
 */
const updateUserPreferences = async (userId, preferences) => {
  const result = await db.query(
    `UPDATE users
     SET preferences = $1
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(preferences), userId]
  );
  return result.rows[0];
};

/**
 * Get user settings
 */
const getUserSettings = async (userId) => {
  const result = await db.query(
    'SELECT settings FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.settings || {};
};

/**
 * Update user settings
 */
const updateUserSettings = async (userId, settings) => {
  const result = await db.query(
    `UPDATE users
     SET settings = $1
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(settings), userId]
  );
  return result.rows[0];
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (limit = 100, offset = 0) => {
  const result = await db.query(
    'SELECT id, google_id, email, name, avatar_url, created_at, last_login, is_active FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
};

/**
 * Update user profile
 */
const updateUser = async (userId, updates) => {
  const allowedFields = ['name', 'avatar_url'];
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(userId);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Deactivate user account
 */
const deactivateUser = async (userId) => {
  await db.query(
    'UPDATE users SET is_active = false WHERE id = $1',
    [userId]
  );
};

/**
 * Reactivate user account
 */
const reactivateUser = async (userId) => {
  await db.query(
    'UPDATE users SET is_active = true WHERE id = $1',
    [userId]
  );
};

module.exports = {
  findUserByGoogleId,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateLastLogin,
  createSession,
  findSessionByRefreshToken,
  deleteSession,
  deleteAllUserSessions,
  getUserPreferences,
  updateUserPreferences,
  getUserSettings,
  updateUserSettings,
  getAllUsers,
  deactivateUser,
  reactivateUser,
};
