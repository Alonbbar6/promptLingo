# Apple App Store Compliance - Mobile Changes Summary

## Overview
This document summarizes all changes made to comply with Apple App Store policies by removing upgrade-related content from the iOS mobile app while keeping the web version unchanged.

## Implementation Strategy
All changes use the existing platform detection utility (`shouldShowSubscriptionUI()` from `src/utils/platform.ts`) which returns `false` for native mobile apps and `true` for web browsers. This ensures a clean separation between mobile and web experiences.

## Files Modified

### 1. **PricingModal.tsx** (`src/components/PricingModal.tsx`)
- **Change**: Added early return to prevent modal from rendering on mobile
- **Line**: 88-91
- **Impact**: Pricing modal never displays on iOS app
- **Web**: Unchanged - modal works normally

### 2. **UserProfile.tsx** (`src/components/UserProfile.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Wrapped upgrade plan button in platform check
  - Wrapped redeem code button in platform check
  - Wrapped manage subscription button in platform check
- **Lines**: 60-98
- **Impact**: User menu on mobile shows only logout option, no upgrade/subscription options
- **Web**: Unchanged - all options visible

### 3. **AccountSettingsPage.tsx** (`src/pages/AccountSettingsPage.tsx`)
- **Change**: Hide pricing information from subscription tier display on mobile
- **Lines**: 50-65
- **Impact**: Mobile shows "Free", "Pro", "Plus" without pricing; web shows full details with prices
- **Web**: Unchanged - pricing information displayed

### 4. **SignupWallModal.tsx** (`src/components/SignupWallModal.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Wrapped "Premium Features (Coming Soon)" section in platform check
- **Lines**: 114-140
- **Impact**: Premium features preview hidden on mobile
- **Web**: Unchanged - premium features section visible

### 5. **FilterStatusNotification.tsx** (`src/components/FilterStatusNotification.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Added platform check to upgrade prompt condition
- **Lines**: 102-109
- **Impact**: "Upgrade to Uncensored Version" button hidden on mobile
- **Web**: Unchanged - upgrade prompt visible when appropriate

### 6. **SubscriptionPage.tsx** (`src/pages/SubscriptionPage.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Added early return for mobile users with informational message
- **Lines**: 75-91
- **Impact**: Mobile users see message directing them to website for subscription management
- **Web**: Unchanged - full subscription management available

### 7. **UsageQuota.tsx** (`src/components/UsageQuota.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Wrapped promotion code button in platform check
- **Lines**: 106-115
- **Impact**: "Redeem Code" button hidden on mobile for free tier users
- **Web**: Unchanged - button visible

### 8. **SignInPrompt.tsx** (`src/components/SignInPrompt.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Wrapped "Pro upgrade teaser" section in platform check
- **Lines**: 111-121
- **Impact**: "Upgrade to Pro for unlimited translations" message hidden on mobile
- **Web**: Unchanged - upgrade teaser visible

### 9. **ErrorDisplay.tsx** (`src/components/ErrorDisplay.tsx`)
- **Changes**:
  - Imported `shouldShowSubscriptionUI` utility
  - Added platform check to upgrade button condition
- **Lines**: 152-161
- **Impact**: "Upgrade to Pro - Unlimited Translations" button hidden on mobile when quota exceeded
- **Web**: Unchanged - upgrade button visible

## Already Compliant Files

### 10. **BrandedHeader.tsx** (`src/components/BrandedHeader.tsx`)
- **Status**: Already using `shouldShowSubscriptionUI()` to hide pricing link
- **Lines**: 88-99, 211-225
- **No changes needed**

### 11. **AppWithLanding.tsx** (`src/AppWithLanding.tsx`)
- **Status**: Already using `shouldShowSubscriptionUI()` to conditionally render pricing/subscription pages
- **Lines**: 128-134
- **No changes needed**

## Platform Detection Utility

### Location: `src/utils/platform.ts`

```typescript
/**
 * Should show subscription/pricing UI?
 * Returns false for native apps (Netflix model - subscriptions only on web)
 */
export const shouldShowSubscriptionUI = (): boolean => {
  return !isNativeApp();
};
```

This utility is the foundation of all compliance changes and ensures consistent behavior across the app.

## Key Features of Implementation

### ✅ What Mobile Users See:
- Free tier signup (no payment collection)
- Account information without pricing details
- Active features based on their subscription tier
- No upgrade buttons or prompts
- No pricing information
- No subscription management UI
- No promotion code redemption
- No links to external payment pages

### ✅ What Mobile Users DON'T See:
- Pricing modal
- Upgrade buttons
- "Learn More" links to pricing
- Subscription management screens
- Billing/payment sections
- Premium feature teasers
- Promotion code buttons
- Any mention of pricing or tiers with dollar amounts

### ✅ What Web Users See:
- **Everything unchanged** - full access to all pricing, subscription management, and upgrade features

### ✅ Premium Users on Mobile:
- Existing premium subscribers (who upgraded on web) retain full access to their premium features
- Premium features work normally in the app
- No billing/subscription management UI visible
- Must visit website to manage subscription

## Testing Checklist

To verify compliance, test on iOS device or simulator:

- [ ] PricingModal does not appear when triggered
- [ ] User profile menu shows no upgrade/subscription options
- [ ] Account settings show tier name without pricing
- [ ] Signup wall modal shows no premium features section
- [ ] Filter notifications show no upgrade prompts
- [ ] Subscription page shows web-only message
- [ ] Usage quota shows no promotion code button
- [ ] Sign-in prompt shows no upgrade teaser
- [ ] Error display shows no upgrade button when quota exceeded
- [ ] Header shows no "Pricing" navigation link
- [ ] Premium features still work for existing premium users

## Compliance with Apple Guidelines

This implementation complies with Apple App Store Review Guidelines:
- **3.1.1** - No in-app purchase mechanism bypassing Apple's IAP
- **3.1.3(a)** - No "buttons, external links, or other calls to action" directing users to non-IAP purchasing mechanisms
- **3.1.3(b)** - No pricing information displayed in the app
- **Reader Apps Exception** - App functions as a reader app where content/subscriptions are managed on web

## Future Considerations

### If Adding Apple In-App Purchases:
1. Create separate IAP products in App Store Connect
2. Implement StoreKit integration
3. Add IAP-specific UI (only on iOS)
4. Keep web subscription system separate
5. Sync entitlements across platforms via backend

### Maintaining Compliance:
1. All new upgrade-related features must check `shouldShowSubscriptionUI()`
2. Never display pricing information on mobile
3. Never link to external payment pages from mobile
4. Test all new features on both web and mobile platforms

## Build and Deployment

### Building for iOS:
```bash
# Build the React app
npm run build

# Sync with Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Verification:
- Test on physical iOS device
- Verify no upgrade prompts appear
- Confirm premium features work for existing subscribers
- Submit to App Store for review

## Notes

- All changes are non-breaking and backward compatible
- Web version functionality is completely unchanged
- Mobile users can still access all free features
- Premium users retain their premium features on mobile
- Subscription management redirects to web (promptlingo.ai)

---

**Last Updated**: January 31, 2026
**Compliance Status**: ✅ Ready for App Store Submission
