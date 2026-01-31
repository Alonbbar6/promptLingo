import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SECURITY: Only store user data in localStorage, NOT tokens
// Tokens are stored as HttpOnly cookies (protected from XSS)
const USER_KEY = 'promptlingo_user';

const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Initializing auth...');

      try {
        const storedUser = getStoredUser();
        console.log('🔐 Stored user:', { hasUser: !!storedUser });

        // Try to verify session with cookie
        try {
          // Verify token from cookie is still valid with timeout
          const response = await Promise.race([
            authService.verifyToken(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Token verification timeout')), 5000)
            )
          ]) as { valid: boolean; user: User };

          if (response.valid) {
            // Use user from server response (most up-to-date)
            setUser(response.user);
            setStoredUser(response.user);
            console.log('✅ Session valid, user restored');
          } else {
            // Token explicitly invalid, clear user
            console.log('⚠️ Session invalid, clearing user');
            clearStoredUser();
          }
        } catch (error: any) {
          // Token verification failed - could be network issue, cross-site navigation, etc.
          console.log('ℹ️ Token verification failed:', error?.message || error);

          // If we have a stored user, keep them logged in optimistically
          // The API client interceptor will handle actual 401s on subsequent requests
          if (storedUser) {
            console.log('🔄 Keeping stored user (optimistic), will verify on next API call');
            setUser(storedUser);
          } else {
            // No stored user, nothing to preserve
            clearStoredUser();
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initAuth();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      console.log('📝 Attempting registration...');

      await authService.register(email, password, name);

      console.log('✅ Registration successful! Please check email for verification.');
      // Don't set user yet - they need to verify email first
    } catch (error: any) {
      console.error('❌ Registration failed:', error);

      let errorMessage = 'Failed to register. Please try again.';

      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          data: error.response.data,
          errorMessage: error.response.data?.message || error.response.data?.error
        });

        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔑 Attempting login...');

      const response = await authService.login(email, password);

      console.log('✅ Login successful!');

      // Store user data only (tokens are in HttpOnly cookies)
      const userData = response.data.user;
      setUser(userData);
      setStoredUser(userData);
    } catch (error: any) {
      console.error('❌ Login failed:', error);

      // Extract the error message from the backend response
      let errorMessage = 'Failed to log in. Please try again.';

      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          data: error.response.data,
          errorMessage: error.response.data?.message || error.response.data?.error
        });

        // Use the backend's error message
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      }

      // Throw a new Error with the extracted message
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      console.log('✉️ Verifying email...');

      await authService.verifyEmail(token);

      console.log('✅ Email verified successfully!');
    } catch (error: any) {
      console.error('❌ Email verification failed:', error);

      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('🔒 Requesting password reset...');

      await authService.forgotPassword(email);

      console.log('✅ Password reset email sent!');
    } catch (error: any) {
      console.error('❌ Password reset request failed:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔑 Resetting password...');

      await authService.resetPassword(token, password);

      console.log('✅ Password reset successful!');
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);

      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Changing password...');

      await authService.changePassword(currentPassword, newPassword);

      console.log('✅ Password changed successfully!');
    } catch (error: any) {
      console.error('❌ Password change failed:', error);

      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('📧 Resending verification email...');

      await authService.resendVerification(email);

      console.log('✅ Verification email resent!');
    } catch (error: any) {
      console.error('❌ Failed to resend verification:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call logout endpoint (server will clear cookies)
      await authService.logout();

      // Clear user data
      clearStoredUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user data anyway
      clearStoredUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      // Call refresh endpoint (cookies will be updated by server)
      await authService.refreshAccessToken();

      // User data should remain the same (no user in refresh response)
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // Clear everything and logout
      clearStoredUser();
      setUser(null);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error: null,
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    resendVerification,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
