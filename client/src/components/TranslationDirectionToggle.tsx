import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const TranslationDirectionToggle: React.FC = () => {
  const { state, dispatch } = useTranslation();

  const handleDirectionChange = (direction: 'to-english' | 'from-english') => {
    dispatch({ type: 'SET_TRANSLATION_DIRECTION', payload: direction });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Translation Direction
      </label>
      <div className="flex space-x-4">
        <button
          onClick={() => handleDirectionChange('to-english')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            state.translationDirection === 'to-english'
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowRight className="h-4 w-4" />
            <div className="text-left">
              <div className="font-semibold">To English</div>
              <div className="text-xs mt-1 text-gray-500">
                Haitian Creole/Spanish → English
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => handleDirectionChange('from-english')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            state.translationDirection === 'from-english'
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <div className="text-left">
              <div className="font-semibold">From English</div>
              <div className="text-xs mt-1 text-gray-500">
                English → Haitian Creole/Spanish
              </div>
            </div>
          </div>
        </button>
      </div>
      
      {/* Current direction indicator */}
      <div className="mt-3 text-sm text-gray-600 text-center">
        {state.translationDirection === 'to-english' ? (
          <span>
            Currently translating <strong>{state.sourceLanguage === 'ht' ? 'Haitian Creole' : 'Spanish'}</strong> to <strong>English</strong>
          </span>
        ) : (
          <span>
            Currently translating <strong>English</strong> to <strong>{state.targetLanguage === 'ht' ? 'Haitian Creole' : 'Spanish'}</strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default TranslationDirectionToggle;
