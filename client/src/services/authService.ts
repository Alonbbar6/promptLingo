import axios from 'axios';
import { LoginResponse, TokenRefreshResponse, User } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

export const authService = {
  /**
   * Login with Google ID token
   */
  loginWithGoogle: async (idToken: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/google/login`, {
      idToken,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken?: string): Promise<void> => {
    await axios.post(`${API_URL}/api/auth/logout`, {
      refreshToken,
    });
  },

  /**
   * Verify access token
   */
  verifyToken: async (token: string): Promise<{ valid: boolean; user: User }> => {
    const response = await axios.get(`${API_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  refreshAccessToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/api/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },
};
