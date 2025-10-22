import React from 'react';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { enhancedLanguageDetection, getLanguageName } from '../services/languageDetection';

interface LanguageDetectionIndicatorProps {
  text: string;
  expectedLanguage: string;
  onLanguageSwitch?: (newLanguage: string) => void;
  className?: string;
}

const LanguageDetectionIndicator: React.FC<LanguageDetectionIndicatorProps> = ({
  text,
  expectedLanguage,
  onLanguageSwitch,
  className = ''
}) => {
  // Don't show anything for very short text
  if (!text || text.trim().length < 10) {
    return null;
  }

  const detection = enhancedLanguageDetection(text, expectedLanguage);

  // Don't show anything if validation passed
  if (detection.isValid) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 text-sm ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <span>Language confirmed: {getLanguageName(expectedLanguage)}</span>
        {detection.confidence && (
          <span className="text-gray-500">
            ({(detection.confidence * 100).toFixed(0)}% confidence)
          </span>
        )}
      </div>
    );
  }

  // Show error or suggestion
  if (detection.error && !detection.detectedLanguage) {
    return (
      <div className={`flex items-center space-x-2 text-amber-600 text-sm ${className}`}>
        <Info className="h-4 w-4" />
        <span>{detection.error}</span>
      </div>
    );
  }

  // Show language mismatch with suggestion
  if (detection.detectedLanguage && detection.suggestion) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-red-800 mb-1">
              Language Mismatch Detected
            </div>
            <div className="text-red-700 text-sm mb-3">
              Expected <strong>{getLanguageName(expectedLanguage)}</strong> but detected{' '}
              <strong>{getLanguageName(detection.detectedLanguage)}</strong>
              {detection.confidence && (
                <span className="text-red-600">
                  {' '}({(detection.confidence * 100).toFixed(0)}% confidence)
                </span>
              )}
            </div>
            <div className="text-red-700 text-sm mb-3">
              Please enter text in {getLanguageName(expectedLanguage)} or switch to the correct language setting.
            </div>
            {onLanguageSwitch && (
              <button
                onClick={() => onLanguageSwitch(detection.detectedLanguage!)}
                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-md transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Switch to {getLanguageName(detection.detectedLanguage!)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LanguageDetectionIndicator;
