import axios, { AxiosRequestConfig } from 'axios';
import {
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  TokenRefreshResponse,
  User,
} from '../types/auth.types';
import { tokenStorage } from './tokenStorage';
import { isNativeApp } from '../utils/platform';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Get axios config with mobile-specific headers
 */
const getAxiosConfig = async (): Promise<AxiosRequestConfig> => {
  const config: AxiosRequestConfig = {
    withCredentials: true, // Send cookies with cross-origin requests (for web)
    headers: {} as Record<string, string>,
  };

  // Add mobile app header for backend detection
  if (isNativeApp()) {
    (config.headers as Record<string, string>)['X-Mobile-App'] = 'true';

    // Add Authorization header with stored token
    const accessToken = await tokenStorage.getAccessToken();
    if (accessToken) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return config;
};

export const authService = {
  /**
   * Register new user with email and password
   */
  register: async (email: string, password: string, name: string): Promise<RegisterResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      { email, password, name },
      config
    );
    return response.data;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/verify-email`,
      { token },
      config
    );
    return response.data;
  },

  /**
   * Login with email and password
   * Web: Tokens set as HttpOnly cookies
   * Mobile: Tokens returned in response body and stored locally
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      config
    );

    // On mobile, store tokens from response body
    if (isNativeApp() && response.data?.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      await tokenStorage.setTokens(accessToken, refreshToken);
      console.log('📱 Tokens stored locally for mobile app');
    }

    return response.data;
  },

  /**
   * Logout user
   * Web: Server clears HttpOnly cookies
   * Mobile: Clear locally stored tokens
   */
  logout: async (): Promise<void> => {
    const config = await getAxiosConfig();

    // On mobile, include refresh token in request body for server-side invalidation
    let requestBody = {};
    if (isNativeApp()) {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        requestBody = { refreshToken };
      }
    }

    await axios.post(`${API_URL}/api/auth/logout`, requestBody, config);

    // Clear locally stored tokens on mobile
    if (isNativeApp()) {
      await tokenStorage.clearTokens();
      console.log('📱 Tokens cleared from local storage');
    }
  },

  /**
   * Verify access token
   * Web: Token from cookie
   * Mobile: Token from Authorization header
   */
  verifyToken: async (): Promise<{ user: User }> => {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_URL}/api/auth/verify`,
      config
    );
    return response.data.data;
  },

  /**
   * Refresh access token
   * Web: Refresh token from cookie, new tokens set as cookies
   * Mobile: Refresh token in body, new tokens returned and stored
   */
  refreshAccessToken: async (): Promise<TokenRefreshResponse> => {
    const config = await getAxiosConfig();

    // On mobile, send refresh token in request body
    let requestBody = {};
    if (isNativeApp()) {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        requestBody = { refreshToken };
      }
    }

    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      requestBody,
      config
    );

    // On mobile, store new tokens from response body
    if (isNativeApp() && response.data?.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      await tokenStorage.setTokens(accessToken, refreshToken);
      console.log('📱 Tokens refreshed and stored locally');
    }

    return response.data;
  },

  /**
   * Get current user using authentication
   */
  getCurrentUser: async (): Promise<User> => {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_URL}/api/auth/user`,
      config
    );
    return response.data.data.user;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/forgot-password`,
      { email },
      config
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<ResetPasswordResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/reset-password`,
      { token, password },
      config
    );
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/change-password`,
      { currentPassword, newPassword },
      config
    );
    return response.data;
  },

  /**
   * Resend email verification
   */
  resendVerification: async (email: string): Promise<RegisterResponse> => {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/api/auth/resend-verification`,
      { email },
      config
    );
    return response.data;
  },
};
