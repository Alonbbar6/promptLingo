import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

const SubscriptionCanceledPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    // Navigate to pricing page
    window.location.href = '/?page=pricing';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-gray-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Checkout Canceled
        </h1>

        <p className="text-gray-600 mb-6">
          No worries - your checkout was canceled and you haven't been charged.
          Your free account is still active with 15 translations per day.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Try Again
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue with Free Plan</span>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm">Having issues? Contact support@promptlingo.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCanceledPage;
