import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import { WasmDemo } from './components/WasmDemo';
import LiveTranscriptionCaptions from './components/LiveTranscriptionCaptions';
import SignInPrompt from './components/SignInPrompt';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCanceledPage from './pages/SubscriptionCanceledPage';
import './index.css';

type AppPage = 'translator' | 'tts' | 'wasm' | 'live';

// Inner component that has access to AuthContext
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('translator');
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  // Check for auth flags on mount
  useEffect(() => {
    const authRequired = localStorage.getItem('auth_required');
    const sessionExpired = localStorage.getItem('session_expired');

    if (authRequired === 'true') {
      showToast('Please sign in to use this feature. Sign up for free to get 15 translations per day!', 'warning', 7000);
      localStorage.removeItem('auth_required');
    } else if (sessionExpired === 'true') {
      showToast('Your session has expired. Please sign in again to continue.', 'warning', 7000);
      localStorage.removeItem('session_expired');
    }
  }, [showToast]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'translator' ? (
          // Translator page - available to everyone (free NLLB model)
          <>
            <MainContent />
            {isAuthenticated && <ConversationHistory />}
          </>
        ) : !isAuthenticated ? (
          // Other pages require authentication
          <SignInPrompt />
        ) : (
          // Show authenticated-only pages
          <>
            {currentPage === 'tts' ? (
              <TextToSpeechPage onBack={() => setCurrentPage('translator')} />
            ) : currentPage === 'live' ? (
              <LiveTranscriptionCaptions />
            ) : (
              <WasmDemo />
            )}
          </>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <TranslationProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Subscription Routes */}
                <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                <Route path="/subscription/canceled" element={<SubscriptionCanceledPage />} />

                {/* Main App Routes */}
                <Route path="/*" element={<AppContent />} />
              </Routes>
            </TranslationProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
