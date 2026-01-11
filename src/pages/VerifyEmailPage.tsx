import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid or missing verification token');
        setIsLoading(false);
        return;
      }

      try {
        await authService.verifyEmail(token);
        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to verify email. The link may have expired.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-700 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Go to Login
              </Link>
              <p className="text-sm text-gray-600">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-700 mb-6">
            {error || 'This verification link is invalid or has expired.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Login
            </Link>
            <p className="text-sm text-gray-600">
              Need a new verification email?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Log in
              </Link>{' '}
              to resend it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
