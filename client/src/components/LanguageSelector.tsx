import React from 'react';
import { useTranslation, LANGUAGES } from '../contexts/TranslationContext';
import { ArrowLeftRight } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { state, dispatch } = useTranslation();

  const handleSourceLanguageChange = (language: string) => {
    dispatch({ type: 'SET_SOURCE_LANGUAGE', payload: language });
  };

  const handleTargetLanguageChange = (language: string) => {
    dispatch({ type: 'SET_TARGET_LANGUAGE', payload: language });
  };

  const handleSwapLanguages = () => {
    dispatch({ type: 'SWAP_LANGUAGES' });
  };

  const handleDirectionChange = (direction: 'to-english' | 'from-english') => {
    dispatch({ type: 'SET_TRANSLATION_DIRECTION', payload: direction });
  };

  const sourceLanguage = LANGUAGES.find(lang => lang.code === state.sourceLanguage);
  const targetLanguage = LANGUAGES.find(lang => lang.code === state.targetLanguage);

  return (
    <div className="space-y-4">
      {/* Translation Direction Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Translation Direction
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => handleDirectionChange('to-english')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
              state.translationDirection === 'to-english'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">To English</div>
            <div className="text-xs mt-1">Haitian Creole/Spanish → English</div>
          </button>
          
          <button
            onClick={() => handleDirectionChange('from-english')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
              state.translationDirection === 'from-english'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">From English</div>
            <div className="text-xs mt-1">English → Haitian Creole/Spanish</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Language
          </label>
          <select
            value={state.sourceLanguage}
            onChange={(e) => handleSourceLanguageChange(e.target.value)}
            className="input-field"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeName} ({language.name})
              </option>
            ))}
          </select>
        </div>

        {/* Target Language - Only show if translating FROM English */}
        {state.translationDirection === 'from-english' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={state.targetLanguage}
              onChange={(e) => handleTargetLanguageChange(e.target.value)}
              className="input-field"
            >
              <option value="ht">Kreyòl Ayisyen (Haitian Creole)</option>
              <option value="es">Español (Spanish)</option>
            </select>
          </div>
        )}

        {/* Target Language - Show for TO English direction */}
        {state.translationDirection === 'to-english' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={state.targetLanguage}
              onChange={(e) => handleTargetLanguageChange(e.target.value)}
              className="input-field"
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.nativeName} ({language.name})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwapLanguages}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          title="Swap languages"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="text-sm font-medium">Swap Languages</span>
        </button>
      </div>

      {/* Language Display */}
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <span className="font-medium">{sourceLanguage?.nativeName}</span>
        <ArrowLeftRight className="h-4 w-4" />
        <span className="font-medium">{targetLanguage?.nativeName}</span>
      </div>

      {/* Language-specific Information */}
      {state.targetLanguage === 'ht' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2 text-sm">ℹ️</span>
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> Haitian Creole audio uses French voice models 
              for best pronunciation quality, as the languages share similar phonetics.
            </div>
          </div>
        </div>
      )}
      
      {state.sourceLanguage === 'es' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-start">
            <span className="text-green-600 mr-2 text-sm">🎯</span>
            <div className="text-sm text-green-800">
              <strong>Spanish Support:</strong> The AI translator supports various Spanish dialects. 
              Speak clearly for best transcription accuracy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
