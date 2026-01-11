import React from 'react';
import ResetPasswordForm from '../components/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
            <p className="text-gray-600">
              Choose a strong password for your account
            </p>
          </div>

          {/* Reset Password Form */}
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
