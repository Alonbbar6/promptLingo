import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Square, Volume2, Settings } from 'lucide-react';
import { LiveTranscriptionService, TranscriptionChunk } from '../services/liveTranscriptionService';
import { LANGUAGES } from '../contexts/TranslationContext';

interface CaptionLine {
  id: string;
  text: string;
  translatedText?: string;
  timestamp: Date;
  opacity: number;
}

const LiveTranscriptionCaptions: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [captions, setCaptions] = useState<CaptionLine[]>([]);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [chunkDuration, setChunkDuration] = useState(3000); // 3 seconds
  const [maxCaptions, setMaxCaptions] = useState(5);

  const serviceRef = useRef<LiveTranscriptionService | null>(null);
  const captionsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest caption
  useEffect(() => {
    if (captionsEndRef.current) {
      captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [captions]);

  // Fade out old captions over time
  useEffect(() => {
    const interval = setInterval(() => {
      setCaptions((prev) => {
        const now = Date.now();
        return prev
          .map((caption) => {
            const age = now - caption.timestamp.getTime();
            const fadeStartAge = 5000; // Start fading after 5 seconds
            const fadeEndAge = 10000; // Fully faded at 10 seconds

            if (age > fadeEndAge) {
              return null; // Remove completely
            }

            if (age > fadeStartAge) {
              const fadeProgress = (age - fadeStartAge) / (fadeEndAge - fadeStartAge);
              return {
                ...caption,
                opacity: 1 - fadeProgress,
              };
            }

            return caption;
          })
          .filter((c): c is CaptionLine => c !== null)
          .slice(-maxCaptions); // Keep only last N captions
      });
    }, 100);

    return () => clearInterval(interval);
  }, [maxCaptions]);

  // Handle new transcription chunk
  const handleChunkTranscribed = useCallback((chunk: TranscriptionChunk) => {
    console.log('📝 New caption:', chunk.text);
    if (chunk.translatedText) {
      console.log('🌐 Translation:', chunk.translatedText);
    }

    const newCaption: CaptionLine = {
      id: chunk.id,
      text: chunk.text,
      translatedText: chunk.translatedText,
      timestamp: chunk.timestamp,
      opacity: 1,
    };

    setCaptions((prev) => [...prev, newCaption]);
  }, []);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error('Live transcription error:', err);
    setError(err.message);
    setStatus('error');
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((newStatus: 'idle' | 'recording' | 'processing' | 'error') => {
    setStatus(newStatus);
  }, []);

  // Start live transcription
  const startTranscription = async () => {
    try {
      setError('');
      setCaptions([]);

      // Create service
      const service = new LiveTranscriptionService({
        language: selectedLanguage,
        targetLanguage: targetLanguage || undefined,
        chunkDuration: chunkDuration,
        onChunkTranscribed: handleChunkTranscribed,
        onError: handleError,
        onStatusChange: handleStatusChange,
      });

      serviceRef.current = service;

      // Start recording
      await service.start();
      setIsRecording(true);
    } catch (err) {
      handleError(err as Error);
    }
  };

  // Stop live transcription
  const stopTranscription = async () => {
    if (serviceRef.current) {
      await serviceRef.current.stop();
      serviceRef.current = null;
    }
    setIsRecording(false);
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'Recording';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Controls Card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Live Transcription</h1>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status === 'recording' ? 'animate-pulse' : ''}`} />
            <span className="text-sm text-gray-600 font-medium">{getStatusText()}</span>
          </div>
        </div>

        {/* Language Selectors and Controls */}
        <div className="space-y-4">
          {!isRecording && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="input-field"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Translate To (Optional)</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="input-field"
                >
                  <option value="">No Translation</option>
                  {LANGUAGES.filter(lang => lang.code !== selectedLanguage).map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>

            {!isRecording ? (
              <button
                onClick={startTranscription}
                className="btn-primary flex items-center space-x-2"
              >
                <Mic className="h-5 w-5" />
                <span>Start Transcription</span>
              </button>
            ) : (
              <button
                onClick={stopTranscription}
                className="btn-danger flex items-center space-x-2"
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-gray-900 font-semibold mb-3">Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Chunk Duration: {chunkDuration / 1000}s
                  </label>
                  <input
                    type="range"
                    min="2000"
                    max="5000"
                    step="500"
                    value={chunkDuration}
                    onChange={(e) => setChunkDuration(parseInt(e.target.value))}
                    disabled={isRecording}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How often to send audio for transcription
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Max Captions: {maxCaptions}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="1"
                    value={maxCaptions}
                    onChange={(e) => setMaxCaptions(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of captions to display
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caption Display Area */}
      <div className="card min-h-[400px]">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">Recording Error</h3>
                <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions when not recording */}
        {!isRecording && captions.length === 0 && !error && (
          <div className="text-center text-gray-500 py-12">
            <Volume2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium text-gray-700">Click "Start Transcription" to begin</p>
            <p className="text-sm mt-2">
              Live captions will appear here as people speak
            </p>
          </div>
        )}

        {/* Captions */}
        <div className="space-y-3">
          {captions.map((caption, index) => {
            const isCurrent = index === captions.length - 1;
            const fontSize = isCurrent ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg';
            const fontWeight = isCurrent ? 'font-semibold' : 'font-medium';

            return (
              <div
                key={caption.id}
                className={`transition-all duration-300 ${fontSize} ${fontWeight}`}
                style={{
                  opacity: caption.opacity,
                  transform: `translateY(${isCurrent ? '0' : '-5px'})`,
                }}
              >
                <div className={`${isCurrent ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'} px-4 py-3 sm:px-6 sm:py-4 rounded-lg border-2 shadow-sm`}>
                  {/* Original Text */}
                  <p className="text-gray-900 text-center leading-relaxed">
                    {caption.text}
                  </p>

                  {/* Translated Text */}
                  {caption.translatedText && (
                    <p className="text-blue-700 text-center leading-relaxed mt-2 pt-2 border-t border-gray-300">
                      {caption.translatedText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={captionsEndRef} />
        </div>

        {/* Recording Indicator */}
        {isRecording && captions.length > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-red-50 border border-red-400 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-700 font-medium text-sm">Recording Live</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptionCaptions;
