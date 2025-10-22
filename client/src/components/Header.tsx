import React from 'react';
import { Mic, Languages, Volume2 } from 'lucide-react';

type AppPage = 'translator' | 'tts';

interface HeaderProps {
  currentPage?: AppPage;
  onPageChange?: (page: AppPage) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage = 'translator', onPageChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Mic className="h-8 w-8 text-primary-500" />
              <Volume2 className="h-6 w-6 text-secondary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PromptLingo
              </h1>
              <p className="text-sm text-gray-600">
                Speech-to-Speech Translation & Text-to-Speech
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            {onPageChange && (
              <nav className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onPageChange('translator')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'translator'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  <span>Translator</span>
                </button>
                <button
                  onClick={() => onPageChange('tts')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'tts'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Text-to-Speech</span>
                </button>
              </nav>
            )}
            
            <div className="flex items-center space-x-2">
              <Languages className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Multi-language Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
