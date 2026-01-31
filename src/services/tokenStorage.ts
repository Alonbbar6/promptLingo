/**
 * Token Storage Service
 *
 * Handles secure token storage for mobile apps using Capacitor Preferences.
 * On web, tokens are stored in HttpOnly cookies (handled by server).
 * On mobile (Capacitor), tokens are stored securely and sent via Authorization header.
 */

import { Preferences } from '@capacitor/preferences';
import { isNativeApp } from '../utils/platform';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export const tokenStorage = {
  /**
   * Check if we should use token-based auth (mobile) vs cookie-based (web)
   */
  shouldUseTokenAuth: (): boolean => {
    return isNativeApp();
  },

  /**
   * Store access token
   */
  setAccessToken: async (token: string): Promise<void> => {
    if (!isNativeApp()) return; // Web uses cookies
    await Preferences.set({ key: ACCESS_TOKEN_KEY, value: token });
  },

  /**
   * Get access token
   */
  getAccessToken: async (): Promise<string | null> => {
    if (!isNativeApp()) return null; // Web uses cookies
    const { value } = await Preferences.get({ key: ACCESS_TOKEN_KEY });
    return value;
  },

  /**
   * Store refresh token
   */
  setRefreshToken: async (token: string): Promise<void> => {
    if (!isNativeApp()) return; // Web uses cookies
    await Preferences.set({ key: REFRESH_TOKEN_KEY, value: token });
  },

  /**
   * Get refresh token
   */
  getRefreshToken: async (): Promise<string | null> => {
    if (!isNativeApp()) return null; // Web uses cookies
    const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    return value;
  },

  /**
   * Store both tokens at once
   */
  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    if (!isNativeApp()) return; // Web uses cookies
    await Promise.all([
      Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken }),
      Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken }),
    ]);
  },

  /**
   * Clear all tokens (logout)
   */
  clearTokens: async (): Promise<void> => {
    if (!isNativeApp()) return; // Web uses cookies
    await Promise.all([
      Preferences.remove({ key: ACCESS_TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY }),
    ]);
  },

  /**
   * Check if tokens exist
   */
  hasTokens: async (): Promise<boolean> => {
    if (!isNativeApp()) return false; // Web uses cookies
    const accessToken = await tokenStorage.getAccessToken();
    return !!accessToken;
  },
};
