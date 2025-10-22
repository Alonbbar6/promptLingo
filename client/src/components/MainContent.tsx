import React from 'react';
import LanguageSelector from './LanguageSelector';
import ToneSelector from './ToneSelector';
import AudioRecorder from './AudioRecorder';
import TranslationPanel from './TranslationPanel';
import AudioPlayer from './AudioPlayer';

const MainContent: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Language & Tone Settings
            </h2>
            <div className="space-y-4">
              <LanguageSelector />
              <ToneSelector />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Audio Recording
            </h2>
            <AudioRecorder />
          </div>
        </div>

        {/* Right Column - Translation */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Translation Results
            </h2>
            <TranslationPanel />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Audio Playback
            </h2>
            <AudioPlayer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
