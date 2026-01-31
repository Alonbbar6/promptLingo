/**
 * Migration Script: Clear Test Stripe Data for Live Mode
 *
 * This script:
 * 1. Backs up current Stripe data to a JSON file
 * 2. Clears test mode Stripe customer and subscription IDs
 * 3. Preserves user accounts and subscription tiers
 * 4. Allows app to create new live Stripe customers on next checkout
 *
 * Run with: node server/scripts/migrate-test-to-live-stripe.js
 */

const { query } = require('../db/connection');
const fs = require('fs');
const path = require('path');

async function migrateToLiveStripe() {
  console.log('🚀 Starting migration from test to live Stripe mode...\n');

  try {
    // Step 1: Backup current Stripe data
    console.log('📦 Step 1: Backing up current Stripe data...');
    const backupResult = await query(`
      SELECT
        id,
        email,
        stripe_customer_id,
        stripe_subscription_id,
        subscription_tier,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        subscription_cancel_at_period_end,
        stripe_price_id
      FROM users
      WHERE stripe_customer_id IS NOT NULL
         OR stripe_subscription_id IS NOT NULL
    `);

    const backupFile = path.join(__dirname, `stripe-backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupResult.rows, null, 2));
    console.log(`✅ Backed up ${backupResult.rows.length} users with Stripe data to: ${backupFile}\n`);

    // Step 2: Get all users with test Stripe data
    console.log('📊 Step 2: Analyzing users with test Stripe data...');
    const testCustomers = backupResult.rows.filter(user =>
      user.stripe_customer_id?.startsWith('cus_') ||
      user.stripe_subscription_id?.startsWith('sub_')
    );

    console.log(`Found ${testCustomers.length} users with test Stripe data:`);
    testCustomers.forEach(user => {
      console.log(`  - ${user.email} (${user.subscription_tier})`);
    });
    console.log('');

    // Step 3: Clear test Stripe IDs while preserving subscription tiers
    console.log('🧹 Step 3: Clearing test Stripe IDs...');
    console.log('Note: Subscription tiers will be preserved in the database.');
    console.log('Users will need to set up payment again to continue their subscription.\n');

    const updateResult = await query(`
      UPDATE users
      SET
        stripe_customer_id = NULL,
        stripe_subscription_id = NULL,
        stripe_price_id = NULL
      WHERE
        stripe_customer_id IS NOT NULL
        OR stripe_subscription_id IS NOT NULL
      RETURNING id, email, subscription_tier
    `);

    console.log(`✅ Updated ${updateResult.rows.length} users:`);
    updateResult.rows.forEach(user => {
      console.log(`  - ${user.email} (keeping tier: ${user.subscription_tier})`);
    });
    console.log('');

    // Step 4: Summary
    console.log('📋 Migration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Backed up: ${backupResult.rows.length} users`);
    console.log(`✅ Cleared: ${updateResult.rows.length} test Stripe IDs`);
    console.log(`✅ Preserved: All user accounts and subscription tiers`);
    console.log(`📁 Backup file: ${backupFile}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 Migration complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Users with paid tiers will retain their access temporarily');
    console.log('2. They will need to re-subscribe using the live Stripe checkout');
    console.log('3. New live Stripe customers will be created automatically');
    console.log('4. Free users can continue using the app normally');
    console.log('');
    console.log('⚠️  Important: Make sure your .env file has live Stripe keys!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('');
    console.error('The database has not been modified.');
    console.error('Please check your database connection and try again.');
    process.exit(1);
  }
}

// Run migration
migrateToLiveStripe()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
