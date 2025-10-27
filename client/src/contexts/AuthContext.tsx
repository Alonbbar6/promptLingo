import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Initializing auth...');
      
      try {
        const accessToken = tokenStorage.getAccessToken();
        const storedUser = tokenStorage.getUser();
        console.log('🔐 Stored tokens:', { hasToken: !!accessToken, hasUser: !!storedUser });

        if (accessToken && storedUser) {
          try {
            // Verify token is still valid with timeout
            const response = await Promise.race([
              authService.verifyToken(accessToken),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Token verification timeout')), 5000)
              )
            ]) as { valid: boolean; user: User };
            
            if (response.valid) {
              setUser(storedUser);
              console.log('✅ Token valid, user restored');
            } else {
              // Token invalid, clear it
              console.log('⚠️ Token invalid, clearing session');
              tokenStorage.clearTokens();
            }
          } catch (error) {
            // Token verification failed, clear it
            console.log('❌ Token verification failed:', error);
            tokenStorage.clearTokens();
          }
        } else {
          console.log('ℹ️ No stored session found');
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

  const login = async (googleResponse: any) => {
    try {
      setIsLoading(true);
      const idToken = googleResponse.credential;

      // Send token to backend
      const response = await authService.loginWithGoogle(idToken);

      // Store tokens and user data
      tokenStorage.saveTokens(response.data.accessToken, response.data.refreshToken, response.data.expiresIn);
      tokenStorage.setUser(response.data.user);

      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear local storage
      tokenStorage.clearTokens();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local storage anyway
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = tokenStorage.getRefreshToken();

      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshAccessToken(refreshTokenValue);

      // Update tokens
      tokenStorage.saveTokens(response.data.accessToken, response.data.refreshToken, response.data.expiresIn);

      // User data should remain the same (no user in refresh response)
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear everything and logout
      tokenStorage.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error: null,
    accessToken: tokenStorage.getAccessToken(),
    login: async (googleResponse: any) => login(googleResponse),
    logout,
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
