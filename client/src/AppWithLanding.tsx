import React, { useState } from 'react';
import { TranslationProvider } from './contexts/TranslationContext';
import BrandedHeader from './components/BrandedHeader';
import LandingPage from './components/LandingPage';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import './index.css';

type AppPage = 'landing' | 'translator' | 'tts';

/**
 * AppWithLanding - Enhanced App with integrated landing page
 * Combines existing PromptLingo functionality with new brand UI
 * 
 * To use this version, update index.tsx to import AppWithLanding instead of App
 */
function AppWithLanding() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');

  const handlePageChange = (page: AppPage) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
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
  );
}

export default AppWithLanding;
