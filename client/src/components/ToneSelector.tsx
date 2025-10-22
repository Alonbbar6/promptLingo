import React from 'react';
import { useTranslation, TONES } from '../contexts/TranslationContext';

const ToneSelector: React.FC = () => {
  const { state, dispatch } = useTranslation();

  const handleToneChange = (tone: string) => {
    dispatch({ type: 'SET_TONE', payload: tone });
  };

  const selectedTone = TONES.find(tone => tone.id === state.selectedTone);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Translation Tone
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => handleToneChange(tone.id)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
              state.selectedTone === tone.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">{tone.name}</div>
            <div className="text-xs text-gray-600 mt-1">{tone.description}</div>
          </button>
        ))}
      </div>

      {selectedTone && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Selected:</span> {selectedTone.name}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {selectedTone.prompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToneSelector;
