import axios from 'axios';
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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// SECURITY: Configure axios to send HttpOnly cookies with requests
const axiosConfig = {
  withCredentials: true, // Send cookies with cross-origin requests
};

export const authService = {
  /**
   * Register new user with email and password
   */
  register: async (email: string, password: string, name: string): Promise<RegisterResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      { email, password, name },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/verify-email`,
      { token },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Login with email and password
   * Tokens will be set as HttpOnly cookies by the server
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Logout user
   * Server will clear HttpOnly cookies
   */
  logout: async (): Promise<void> => {
    await axios.post(`${API_URL}/api/auth/logout`, {}, axiosConfig);
  },

  /**
   * Verify access token from cookie
   */
  verifyToken: async (): Promise<{ user: User }> => {
    const response = await axios.get(
      `${API_URL}/api/auth/verify`,
      axiosConfig
    );
    return response.data.data;
  },

  /**
   * Refresh access token from cookie
   * New tokens will be set as HttpOnly cookies by the server
   */
  refreshAccessToken: async (): Promise<TokenRefreshResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      {},
      axiosConfig
    );
    return response.data;
  },

  /**
   * Get current user using cookie authentication
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get(
      `${API_URL}/api/auth/user`,
      axiosConfig
    );
    return response.data.data.user;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/forgot-password`,
      { email },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<ResetPasswordResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/reset-password`,
      { token, password },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/change-password`,
      { currentPassword, newPassword },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Resend email verification
   */
  resendVerification: async (email: string): Promise<RegisterResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/resend-verification`,
      { email },
      axiosConfig
    );
    return response.data;
  },
};
