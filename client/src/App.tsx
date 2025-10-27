import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import { WasmDemo } from './components/WasmDemo';
import './index.css';

type AppPage = 'translator' | 'tts' | 'wasm';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('translator');

  // Debug: Log Google Client ID on mount
  React.useEffect(() => {
    console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('🔑 Full Client ID:', GOOGLE_CLIENT_ID);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TranslationProvider>
          <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} onPageChange={setCurrentPage} />
            <main className="container mx-auto px-4 py-8">
              {currentPage === 'translator' ? (
                <>
                  <MainContent />
                  <ConversationHistory />
                </>
              ) : currentPage === 'tts' ? (
                <TextToSpeechPage onBack={() => setCurrentPage('translator')} />
              ) : (
                <WasmDemo />
              )}
            </main>
          </div>
        </TranslationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
