import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { synthesizeSpeech } from '../services/api';
import { synthesizeSpeechBrowser } from '../services/browserTTS';
import { Play, Pause, Volume2, Download, Settings } from 'lucide-react';
import { formatTime, downloadAudio } from '../services/audioUtils';
import { audioManager } from '../services/audioManager';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import VoiceSelector from './VoiceSelector';

const AudioPlayer: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [synthesisTime, setSynthesisTime] = useState(0);
  const [usedBrowserTTS, setUsedBrowserTTS] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const requestIdCounterRef = useRef(0);

  // Voice selection is now handled by VoiceSelector component

  // Manual synthesis - triggered by Play button only (no auto-TTS to save ElevenLabs costs)
  const synthesizeAndPlay = async () => {
    if (!state.currentTranslation || !selectedVoice) return;

    // If audio already generated, just play it
    if (state.currentTranslation.audioUrl) {
      playAudio(state.currentTranslation.audioUrl);
      return;
    }

    if (isProcessingRef.current) return;

    const requestId = ++requestIdCounterRef.current;
    console.log(`🎵 Starting audio generation request #${requestId}`);

    try {
      isProcessingRef.current = true;
      setIsLoading(true);
      setError(null);
      setUsedBrowserTTS(false);

      const t1 = performance.now();

      try {
        console.log('🔊 Attempting ElevenLabs synthesis...');
        const result = await synthesizeSpeech(
          state.currentTranslation.translatedText,
          selectedVoice,
          state.targetLanguage
        );
        const synthTime = performance.now() - t1;
        setSynthesisTime(synthTime);
        console.log(`✅ ElevenLabs synthesis successful in ${(synthTime/1000).toFixed(2)}s`);

        const updatedTranslation = {
          ...state.currentTranslation,
          audioUrl: result.audioUrl
        };
        dispatch({ type: 'SET_TRANSLATION', payload: updatedTranslation });

        // Clean up old audio URL
        if (currentAudioUrlRef.current && currentAudioUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
        }
        currentAudioUrlRef.current = result.audioUrl;

        // Play the newly generated audio
        playAudio(result.audioUrl);

      } catch (elevenLabsError) {
        console.warn('⚠️ ElevenLabs failed, falling back to browser TTS:', elevenLabsError);
        const synthTime = performance.now() - t1;
        setSynthesisTime(synthTime);

        await synthesizeSpeechBrowser(
          state.currentTranslation.translatedText,
          state.targetLanguage
        );
        setUsedBrowserTTS(true);
        console.log('✅ Browser TTS synthesis successful');
      }

    } catch (error) {
      console.error(`❌ Audio generation request #${requestId} failed:`, error);
      setError(error instanceof Error ? error.message : 'Failed to generate audio. Please check your configuration.');
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };

  // Audio playback functions
  const playAudio = (audioUrl?: string) => {
    const url = audioUrl || state.currentTranslation?.audioUrl;
    if (!url) return;

    // Clean up old audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Create new audio instance
    const audio = new Audio(url);
    audioRef.current = audio;

    // Use audioManager to ensure only one audio plays at a time
    audioManager.play(audio, 'manual-play-translation').catch(console.error);
  };

  const pauseAudio = () => {
    // Pause via audioManager to keep global state in sync
    audioManager.pauseCurrent();
  };

  const handlePlayPause = () => {
    if (state.audioPlayer.isPlaying) {
      pauseAudio();
    } else if (state.currentTranslation?.audioUrl) {
      playAudio();
    } else {
      synthesizeAndPlay();
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      dispatch({
        type: 'SET_AUDIO_PLAYER_STATE',
        payload: { volume }
      });
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      dispatch({
        type: 'SET_AUDIO_PLAYER_STATE',
        payload: { playbackRate: rate }
      });
    }
  };

  const handleDownload = () => {
    if (state.currentTranslation?.audioUrl) {
      downloadAudio(
        state.currentTranslation.audioUrl,
        `translation-${Date.now()}.mp3`
      );
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      dispatch({
        type: 'SET_AUDIO_PLAYER_STATE',
        payload: { isPlaying: true }
      });
    };

    const handlePause = () => {
      dispatch({
        type: 'SET_AUDIO_PLAYER_STATE',
        payload: { isPlaying: false }
      });
    };

    const handleTimeUpdate = () => {
      dispatch({
        type: 'SET_AUDIO_PLAYER_STATE',
        payload: {
          currentTime: audio.currentTime,
          duration: audio.duration || 0
        }
      });
    };

    const handleEnded = () => {
      dispatch({
        type: 'SET_AUDIO_PLAYER_STATE',
        payload: { isPlaying: false, currentTime: 0 }
      });
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      // Clean up blob URLs to prevent memory leaks
      if (currentAudioUrlRef.current && currentAudioUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
    };
  }, []);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="space-y-4">
      {/* Audio Element */}
      <audio ref={audioRef} preload="none" />

      {/* Playback Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePlayPause}
          disabled={!state.currentTranslation?.audioUrl || isLoading}
          className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.audioPlayer.isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          <span>
            {state.audioPlayer.isPlaying ? 'Pause' : state.currentTranslation?.audioUrl ? 'Play' : 'Listen'}
          </span>
        </button>

        <button
          onClick={handleDownload}
          disabled={!state.currentTranslation?.audioUrl}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5" />
          <span>Download</span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Progress Bar */}
      {state.currentTranslation?.audioUrl && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(state.audioPlayer.currentTime)}</span>
            <span>{formatTime(state.audioPlayer.duration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-200"
              style={{
                width: state.audioPlayer.duration > 0
                  ? `${(state.audioPlayer.currentTime / state.audioPlayer.duration) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Voice Selection */}
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            language={state.targetLanguage}
          />

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {Math.round(state.audioPlayer.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.audioPlayer.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Playback Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback Speed
            </label>
            <div className="flex space-x-2">
              {playbackRates.map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`px-3 py-1 text-sm rounded ${
                    state.audioPlayer.playbackRate === rate
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Generating audio...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorDisplay 
          error={error}
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Browser TTS Indicator */}
      {usedBrowserTTS && !isLoading && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg text-center">
          ✅ Audio played using free browser text-to-speech
        </div>
      )}
      
      {/* Performance Metrics */}
      {synthesisTime > 0 && !isLoading && !usedBrowserTTS && (
        <div className="text-xs text-gray-500 text-center">
          Audio generated in {(synthesisTime/1000).toFixed(2)}s
        </div>
      )}

      {/* No Audio State */}
      {!state.currentTranslation && (
        <div className="text-center py-8 text-gray-500">
          <Volume2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Audio will appear here after translation</p>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
