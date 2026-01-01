import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const { login, loginWithDevMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show dev mode button in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update auth context with Google response
      await login(credentialResponse);
      
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      onError?.(err);
      console.error('Google login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    const errorMessage = 'Google login was cancelled or failed';
    setError(errorMessage);
    onError?.(new Error(errorMessage));
  };

  const handleDevModeLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loginWithDevMode();
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Dev mode login failed';
      setError(errorMessage);
      onError?.(err);
      console.error('Dev mode login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>

      {/* Dev Mode Button - Only in Development */}
      {isDevelopment && (
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or for testing</span>
            </div>
          </div>

          <button
            onClick={handleDevModeLogin}
            disabled={isLoading}
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔧 Developer Mode (Testing Only)
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Bypasses Google OAuth for mobile/local testing
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-sm text-gray-600">Logging in...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
