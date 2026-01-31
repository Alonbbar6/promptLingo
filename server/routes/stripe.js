/**
 * Stripe Routes
 * Handles Stripe checkout, webhooks, and subscription management
 */

const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateCheckoutSession } = require('../middleware/validation');
const {
  stripe,
  STRIPE_PRICES,
  createCheckoutSession,
  createBillingPortalSession,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  getSubscriptionStatus,
  cancelSubscription,
} = require('../services/stripeService');

const router = express.Router();

/**
 * Create a checkout session for subscription
 * POST /api/stripe/create-checkout-session
 */
router.post('/create-checkout-session', authenticateToken, validateCheckoutSession, async (req, res) => {
  try {
    const { priceId, planType } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name || req.user.email.split('@')[0];

    console.log(`🛒 Creating checkout session for user ${userId} - Plan: ${planType}`);

    // Determine price ID based on plan type
    let stripePriceId = priceId;
    if (!stripePriceId) {
      if (planType === 'plus') {
        stripePriceId = STRIPE_PRICES.PLUS_MONTHLY;
      } else {
        stripePriceId = STRIPE_PRICES.PRO_MONTHLY;
      }
    }

    // Create checkout session
    const session = await createCheckoutSession(
      userId,
      userEmail,
      userName,
      stripePriceId,
      `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.FRONTEND_URL}/subscription/canceled`
    );

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

/**
 * Create a billing portal session
 * POST /api/stripe/create-portal-session
 */
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`🔧 Creating billing portal session for user ${userId}`);

    const session = await createBillingPortalSession(
      userId,
      `${process.env.FRONTEND_URL}/account/subscription`
    );

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Error creating billing portal session:', error);
    res.status(500).json({
      error: 'Failed to create billing portal session',
      message: error.message,
    });
  }
});

/**
 * Get subscription status for current user
 * GET /api/stripe/subscription-status
 */
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const status = await getSubscriptionStatus(userId);

    res.json({
      success: true,
      subscription: status,
    });
  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    res.status(500).json({
      error: 'Failed to get subscription status',
      message: error.message,
    });
  }
});

/**
 * Cancel subscription
 * POST /api/stripe/cancel-subscription
 */
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await cancelSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      subscription: {
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});

/**
 * Webhook endpoint for Stripe events
 * POST /api/stripe/webhook
 *
 * IMPORTANT: This route must use raw body, not JSON parsed body
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          console.log('📥 Subscription created');
          await handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          console.log('📥 Subscription updated');
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          console.log('📥 Subscription deleted');
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          console.log('📥 Payment succeeded');
          // Update subscription on successful payment
          if (event.data.object.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              event.data.object.subscription
            );
            await handleSubscriptionUpdated(subscription);
          }
          break;

        case 'invoice.payment_failed':
          console.log('📥 Payment failed');
          // Could send email notification or update status
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error(`❌ Error handling webhook event:`, error);
      res.status(500).json({
        error: 'Webhook handler failed',
        message: error.message,
      });
    }
  }
);

/**
 * Get available pricing plans
 * GET /api/stripe/pricing
 */
router.get('/pricing', async (req, res) => {
  try {
    res.json({
      plans: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'month',
          features: [
            '15 translations per day',
            'All voice options',
            'Translation history',
            'Standard support',
          ],
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 9.99,
          interval: 'month',
          priceId: STRIPE_PRICES.PRO_MONTHLY,
          popular: true,
          features: [
            'Unlimited translations',
            'Premium AI voices (OpenAI TTS)',
            'Translation history',
            'Priority processing',
            'Email support',
          ],
        },
        {
          id: 'plus',
          name: 'Plus',
          price: 19.99,
          interval: 'month',
          priceId: STRIPE_PRICES.PLUS_MONTHLY,
          features: [
            'Everything in Pro',
            'Adult mode (relaxed content filter)',
            'Flirty & playful tones',
            'Priority support',
            'All future premium features',
          ],
        },
      ],
    });
  } catch (error) {
    console.error('❌ Error getting pricing:', error);
    res.status(500).json({
      error: 'Failed to get pricing',
      message: error.message,
    });
  }
});

module.exports = router;