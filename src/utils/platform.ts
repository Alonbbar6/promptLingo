/**
 * Platform Detection Utility
 *
 * Used to detect if the app is running in a native mobile container (iOS/Android)
 * vs in a web browser. This enables the "Netflix model" where subscriptions
 * only happen on the web, and the native app is just for using the service.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Check if running in a native app (iOS or Android)
 */
export const isNativeApp = (): boolean => {
  // Use Capacitor's platform detection as the source of truth
  // getPlatform() returns 'web', 'ios', or 'android'
  const platform = Capacitor.getPlatform();
  const isNative = platform === 'ios' || platform === 'android';
  
  console.log('[Platform] isNativeApp check:', {
    isNative,
    platform,
    capacitorAvailable: typeof Capacitor !== 'undefined',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  });
  
  // Platform is 'web' when running in a browser
  // Platform is 'ios' or 'android' when running in native app
  return isNative;
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Check if running in web browser
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * Get the current platform name
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Should show subscription/pricing UI?
 * Returns false for native apps (Netflix model - subscriptions only on web)
 */
export const shouldShowSubscriptionUI = (): boolean => {
  return !isNativeApp();
};
