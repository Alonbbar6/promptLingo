import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import BrandedHeader from './components/BrandedHeader';
import LandingPage from './components/LandingPage';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import './index.css';

type AppPage = 'landing' | 'translator' | 'tts';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

/**
 * AppWithLanding - Enhanced App with integrated landing page
 * Combines existing PromptLingo functionality with new brand UI
 * 
 * To use this version, update index.tsx to import AppWithLanding instead of App
 */
function AppWithLanding() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');

  // Debug: Log Google Client ID on mount
  React.useEffect(() => {
    console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
  }, []);

  const handlePageChange = (page: AppPage) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TranslationProvider>
          <div className="min-h-screen bg-neutral-backgroundLight">
            {/* Branded Header */}
            <BrandedHeader 
              currentPage={currentPage} 
              onPageChange={handlePageChange}
              showNavigation={currentPage !== 'landing'}
            />
        
        {/* Page Content */}
        {currentPage === 'landing' && (
          <LandingPage onGetStarted={() => handlePageChange('translator')} />
        )}
        
        {currentPage === 'translator' && (
          <main className="container mx-auto px-4 py-8">
            <MainContent />
            <ConversationHistory />
          </main>
        )}
        
        {currentPage === 'tts' && (
          <main className="container mx-auto px-4 py-8">
            <TextToSpeechPage onBack={() => handlePageChange('translator')} />
          </main>
        )}
      </div>
        </TranslationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default AppWithLanding;
