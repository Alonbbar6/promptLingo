import React, { useState } from 'react';
import { TranslationProvider } from './contexts/TranslationContext';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import './index.css';

type AppPage = 'translator' | 'tts';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('translator');

  return (
    <TranslationProvider>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="container mx-auto px-4 py-8">
          {currentPage === 'translator' ? (
            <>
              <MainContent />
              <ConversationHistory />
            </>
          ) : (
            <TextToSpeechPage onBack={() => setCurrentPage('translator')} />
          )}
        </main>
      </div>
    </TranslationProvider>
  );
}

export default App;
