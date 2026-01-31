import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../services/stripeService';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      // Wait for auth to complete
      if (authLoading) return;

      // If not authenticated, redirect to login
      if (!user) {
        localStorage.setItem('redirect_after_login', '/subscription/success' + (sessionId ? `?session_id=${sessionId}` : ''));
        navigate('/login');
        return;
      }

      try {
        // Give Stripe webhook a moment to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fetch updated subscription status
        const status = await getSubscriptionStatus();
        setSubscriptionTier(status.subscription_tier);
      } catch (error) {
        console.error('Error verifying subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [user, authLoading, sessionId, navigate]);

  const handleContinue = () => {
    // Reload the app to get fresh user data
    window.location.href = '/';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  const tierName = subscriptionTier === 'plus' ? 'Plus' : subscriptionTier === 'pro' ? 'Pro' : 'your new';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to {tierName}!
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription is now active. Thank you for upgrading - you now have access to all {tierName} features!
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">What's included:</h3>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            {subscriptionTier === 'plus' ? (
              <>
                <li>• Unlimited translations</li>
                <li>• Premium AI voices</li>
                <li>• Adult mode (relaxed content filter)</li>
                <li>• Flirty & playful tones</li>
                <li>• Priority support</li>
              </>
            ) : (
              <>
                <li>• Unlimited translations</li>
                <li>• Premium AI voices (OpenAI TTS)</li>
                <li>• Priority processing</li>
                <li>• Email support</li>
              </>
            )}
          </ul>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
        >
          <span>Start Translating</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
