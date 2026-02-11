/**
 * Script to manually update a user's subscription status
 * Use this when Stripe webhooks fail to update the database
 * 
 * Usage: node server/scripts/update-user-subscription.js <email> <tier> <stripe_customer_id> <stripe_subscription_id>
 */

const { query } = require('../db/connection');

async function updateUserSubscription() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node server/scripts/update-user-subscription.js <email> <tier> [stripe_customer_id] [stripe_subscription_id]');
    console.log('');
    console.log('Tiers: free, essential, pro, plus, unlimited');
    console.log('');
    console.log('Example: node server/scripts/update-user-subscription.js user@example.com pro cus_xxx sub_xxx');
    process.exit(1);
  }

  const [email, tier, stripeCustomerId, stripeSubscriptionId] = args;

  try {
    console.log('🔍 Looking up user...');
    
    // First, check if user exists
    const userResult = await query(
      'SELECT id, email, subscription_tier FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.email} (current tier: ${user.subscription_tier})`);
    console.log('');

    // Update subscription
    console.log(`📝 Updating subscription to: ${tier}`);
    
    const updateFields = {
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_start_date: new Date(),
      subscription_end_date: null,
      subscription_cancel_at_period_end: false
    };

    if (stripeCustomerId) {
      updateFields.stripe_customer_id = stripeCustomerId;
    }
    if (stripeSubscriptionId) {
      updateFields.stripe_subscription_id = stripeSubscriptionId;
    }

    const updateResult = await query(`
      UPDATE users
      SET 
        subscription_tier = $1,
        subscription_status = $2,
        subscription_start_date = $3,
        subscription_end_date = $4,
        subscription_cancel_at_period_end = $5
        ${stripeCustomerId ? ', stripe_customer_id = $6' : ''}
        ${stripeSubscriptionId ? `, stripe_subscription_id = $${stripeCustomerId ? '7' : '6'}` : ''}
      WHERE email = $${stripeCustomerId && stripeSubscriptionId ? '8' : stripeCustomerId || stripeSubscriptionId ? '7' : '6'}
      RETURNING id, email, subscription_tier, subscription_status
    `, [
      updateFields.subscription_tier,
      updateFields.subscription_status,
      updateFields.subscription_start_date,
      updateFields.subscription_end_date,
      updateFields.subscription_cancel_at_period_end,
      ...(stripeCustomerId ? [stripeCustomerId] : []),
      ...(stripeSubscriptionId ? [stripeSubscriptionId] : []),
      email
    ]);

    console.log('✅ Subscription updated successfully!');
    console.log('');
    console.log('📋 Updated user details:');
    console.log(`   Email: ${updateResult.rows[0].email}`);
    console.log(`   Tier: ${updateResult.rows[0].subscription_tier}`);
    console.log(`   Status: ${updateResult.rows[0].subscription_status}`);
    if (stripeCustomerId) console.log(`   Stripe Customer: ${stripeCustomerId}`);
    if (stripeSubscriptionId) console.log(`   Stripe Subscription: ${stripeSubscriptionId}`);
    console.log('');
    console.log('🎉 Done! User should now see their updated subscription.');

  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    process.exit(1);
  }

  process.exit(0);
}

updateUserSubscription();
