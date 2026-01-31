/**
 * Usage Tracking Middleware
 * Tracks API usage and enforces free tier limits
 */

const db = require('../config/database');
const { hasActivePromotion, deactivateExpiredPromotions } = require('../services/promotionService');

// Use centralized database pool with proper SSL configuration
const pool = db.pool;

// Tier limits
const FREE_TIER_DAILY_LIMIT = 15;  // Free tier: 15 per day
const ESSENTIAL_TIER_LIMIT = 200;  // Essential tier: 200 per month

/**
 * Check and track API usage for authenticated users
 * Enforces free tier limits
 * Developer mode users get unlimited usage
 */
const trackUsage = async (req, res, next) => {
  try {
    // Only track for authenticated users
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;

    // Skip tracking for "enhancement" calls (same source and target language)
    // Enhancement is preprocessing, not actual translation
    const { sourceLang, targetLang } = req.body;
    if (sourceLang && targetLang && sourceLang === targetLang) {
      console.log('⏭️ Skipping usage tracking for enhancement call (same source/target language)');
      return next();
    }

    // Developer mode has been removed - all users follow tier limits

    // Check if user has an active promotion (unlimited usage)
    await deactivateExpiredPromotions(userId);
    const activePromotion = await hasActivePromotion(userId);

    if (activePromotion) {
      console.log(`🎁 Active promotion: ${activePromotion.code} - Bypassing usage limits`);
      req.usage = {
        tier: 'promotion',
        used: 0,
        limit: 'unlimited',
        promotion: {
          code: activePromotion.code,
          expiresAt: activePromotion.expires_at
        }
      };
      return next();
    }

    // Get user's current usage
    const userQuery = `
      SELECT
        subscription_tier,
        api_calls_this_month,
        monthly_reset_date
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];
    const today = new Date();
    const resetDate = new Date(user.monthly_reset_date);

    // Different reset logic based on tier
    if (user.subscription_tier === 'free') {
      // Free tier: daily reset
      const todayStr = today.toISOString().split('T')[0];
      const resetDateStr = resetDate.toISOString().split('T')[0];

      if (todayStr !== resetDateStr) {
        // Reset counter for new day
        await pool.query(
          `UPDATE users
           SET api_calls_this_month = 0,
               monthly_reset_date = CURRENT_DATE
           WHERE id = $1`,
          [userId]
        );
        user.api_calls_this_month = 0;
        console.log(`📅 Reset daily usage for free user ${userId}`);
      }
    } else {
      // Paid tiers: monthly reset
      if (today.getMonth() !== resetDate.getMonth() || today.getFullYear() !== resetDate.getFullYear()) {
        await pool.query(
          `UPDATE users
           SET api_calls_this_month = 0,
               monthly_reset_date = CURRENT_DATE
           WHERE id = $1`,
          [userId]
        );
        user.api_calls_this_month = 0;
        console.log(`📅 Reset monthly usage for user ${userId}`);
      }
    }

    // Check subscription tier limits
    let limit = null;
    let tierName = '';
    let limitPeriod = 'month';

    if (user.subscription_tier === 'free') {
      limit = FREE_TIER_DAILY_LIMIT;
      tierName = 'Free';
      limitPeriod = 'day';
    } else if (user.subscription_tier === 'essential') {
      limit = ESSENTIAL_TIER_LIMIT;
      tierName = 'Essential';
    }
    // Pro, Plus, and Enterprise tiers have no limit (unlimited)

    // Check if user has exceeded their tier limit
    if (limit !== null && user.api_calls_this_month >= limit) {
      const upgradeMessage = user.subscription_tier === 'free'
        ? 'Upgrade to Student ($9.99/month) for 200 translations/month, or Pro ($19.99/month) for unlimited.'
        : 'Upgrade to Pro ($19.99/month) for unlimited translations.';

      return res.status(429).json({
        success: false,
        error: limitPeriod === 'day' ? 'Daily limit exceeded' : 'Monthly limit exceeded',
        message: `You've reached your ${tierName} tier limit of ${limit} translations per ${limitPeriod}. ${upgradeMessage}`,
        usage: {
          used: user.api_calls_this_month,
          limit: limit,
          resetDate: user.monthly_reset_date,
          period: limitPeriod
        }
      });
    }

    // Increment usage counter
    await pool.query(
      `UPDATE users
       SET api_calls_this_month = api_calls_this_month + 1
       WHERE id = $1`,
      [userId]
    );

    // Attach usage info to request for logging
    let usageLimit = 'unlimited';
    if (user.subscription_tier === 'free') {
      usageLimit = FREE_TIER_LIMIT;
    } else if (user.subscription_tier === 'essential') {
      usageLimit = ESSENTIAL_TIER_LIMIT;
    }

    req.usage = {
      tier: user.subscription_tier,
      used: user.api_calls_this_month + 1,
      limit: usageLimit
    };

    console.log(`📊 Usage tracked: User ${userId} - ${req.usage.used}/${req.usage.limit}`);

    next();
  } catch (error) {
    console.error('❌ Usage tracking error:', error);
    // Don't block the request on tracking errors
    next();
  }
};

/**
 * Get current usage for a user
 */
const getUsage = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const userId = req.user.id;

    // Check if user has an active promotion
    await deactivateExpiredPromotions(userId);
    const activePromotion = await hasActivePromotion(userId);

    if (activePromotion) {
      return res.json({
        success: true,
        data: {
          tier: 'promotion',
          used: 0,
          limit: null,
          unlimited: true,
          resetDate: null,
          remaining: null,
          promotion: {
            code: activePromotion.code,
            description: activePromotion.description,
            expiresAt: activePromotion.expires_at
          }
        }
      });
    }

    const query = `
      SELECT
        subscription_tier,
        api_calls_this_month,
        monthly_reset_date
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    let limit = null;
    let unlimited = false;
    let period = 'month';

    if (user.subscription_tier === 'free') {
      limit = FREE_TIER_DAILY_LIMIT;
      period = 'day';
    } else if (user.subscription_tier === 'essential') {
      limit = ESSENTIAL_TIER_LIMIT;
    } else if (user.subscription_tier === 'pro' || user.subscription_tier === 'plus' || user.subscription_tier === 'enterprise') {
      unlimited = true;
    }

    return res.json({
      success: true,
      data: {
        tier: user.subscription_tier,
        used: user.api_calls_this_month,
        limit: limit,
        unlimited: unlimited,
        resetDate: user.monthly_reset_date,
        remaining: limit !== null
          ? Math.max(0, limit - user.api_calls_this_month)
          : null,
        period: period
      }
    });
  } catch (error) {
    console.error('❌ Get usage error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get usage data'
    });
  }
};

module.exports = {
  trackUsage,
  getUsage,
  FREE_TIER_DAILY_LIMIT,
  ESSENTIAL_TIER_LIMIT
};