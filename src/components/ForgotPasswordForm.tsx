import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
        <p className="text-gray-700 mb-4">
          If an account exists with <span className="font-medium">{email}</span>, you'll receive a password reset link shortly.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          The link will expire in 1 hour for security reasons.
        </p>
        <Link
          to="/login"
          className="inline-block text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-gray-600 text-sm mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      {/* Back to Login Link */}
      <div className="text-center text-sm text-gray-600">
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
