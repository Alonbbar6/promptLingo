import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { Mic, Square, Eye, EyeOff } from 'lucide-react';
// Audio utils imported but not directly used in this component
import { 
  RecordingTimer, 
  RecordingState
} from '../services/chunkedAudioRecorder';
import { AudioRecorderFixed, DiagnosticInfo, RecordingResult } from '../services/audioRecorderFixed';
import { AudioLevelMonitor } from '../services/audioLevelMonitor';
import { checkMicrophoneSupport } from '../services/microphonePermissions';
import RecordingIndicator from './RecordingIndicator';
import AudioLevelIndicator from './AudioLevelIndicator';
import DiagnosticPanel from './DiagnosticPanel';

const AudioRecorder: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    volume: 0,
    speechRate: 'normal',
    chunksProcessed: 0,
    warning: null,
    wordsPerMinute: 0,
  });
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [browserSupport, setBrowserSupport] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the enhanced recorder instead of chunked recorder
  const enhancedRecorderRef = useRef<AudioRecorderFixed | null>(null);
  const audioLevelMonitorRef = useRef<AudioLevelMonitor | null>(null);
  const recordingTimerRef = useRef<RecordingTimer>(new RecordingTimer());
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support on mount
  useEffect(() => {
    checkMicrophoneSupport().then(setBrowserSupport);
  }, []);

  // Initialize enhanced recorder
  useEffect(() => {
    enhancedRecorderRef.current = new AudioRecorderFixed((diagnosticsInfo) => {
      setDiagnostics(prev => ({
        ...diagnosticsInfo,
        currentAudioLevel: prev?.currentAudioLevel || 0
      }));
    });

    return () => {
      if (enhancedRecorderRef.current) {
        enhancedRecorderRef.current.destroy();
      }
      if (audioLevelMonitorRef.current) {
        audioLevelMonitorRef.current.cleanup();
      }
    };
  }, []);

  // Clean up resources
  const cleanup = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (audioLevelMonitorRef.current) {
      audioLevelMonitorRef.current.cleanup();
      audioLevelMonitorRef.current = null;
    }
    recordingTimerRef.current.stop();
    setAudioLevel(0);
  };

  // Start recording with enhanced system
  const startRecording = useCallback(async () => {
    if (!enhancedRecorderRef.current) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      console.log('🎙️ Starting enhanced audio recording...');
      
      const success = await enhancedRecorderRef.current.startRecording();
      
      if (!success) {
        setError('Failed to start recording. Please check your microphone permissions and try again.');
        setIsProcessing(false);
        return;
      }

      // Start audio level monitoring
      const stream = enhancedRecorderRef.current.getStream();
      if (stream) {
        audioLevelMonitorRef.current = new AudioLevelMonitor();
        const monitorSuccess = audioLevelMonitorRef.current.initialize(stream, (level) => {
          setAudioLevel(level);
          setRecordingState(prev => ({ ...prev, volume: level }));
          
          // Update diagnostics with current audio level
          setDiagnostics(prev => prev ? {
            ...prev,
            currentAudioLevel: level
          } : null);
        });

        if (!monitorSuccess) {
          console.warn('⚠️ Audio level monitoring failed to start');
        }
      }
      
      // Start recording timer with warnings
      recordingTimerRef.current.start(
        // Warning callback
        (timeLeft) => {
          setRecordingState(prev => ({
            ...prev,
            warning: `Recording will auto-stop in ${Math.ceil(timeLeft / 1000)}s`,
          }));
        },
        // Max reached callback
        () => {
          stopRecording();
          setError('Maximum recording duration reached (2 minutes). Processing your audio...');
        }
      );

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        const duration = recordingTimerRef.current.getElapsedSeconds();
        setRecordingState(prev => ({ ...prev, duration }));
        dispatch({
          type: 'UPDATE_RECORDING_DURATION',
          payload: duration
        });
      }, 1000);

      // Update state
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        warning: null,
      }));
      
      dispatch({ type: 'START_RECORDING' });
      setIsProcessing(false);
      console.log('✅ Recording started successfully');

    } catch (error: any) {
      console.error('❌ Failed to start recording:', error);
      setError(`Failed to start recording: ${error.message}`);
      setIsProcessing(false);
      cleanup();
    }
  }, [dispatch]);

  // Stop recording with enhanced error handling
  const stopRecording = useCallback(async () => {
    if (!enhancedRecorderRef.current || !recordingState.isRecording) return;

    setIsProcessing(true);
    console.log('⏹️ Stopping enhanced audio recording...');

    try {
      // Stop audio level monitoring
      if (audioLevelMonitorRef.current) {
        audioLevelMonitorRef.current.cleanup();
        audioLevelMonitorRef.current = null;
      }

      // Stop recording timer
      recordingTimerRef.current.stop();
      
      // Clean up duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop recording and get result
      const result: RecordingResult = await enhancedRecorderRef.current.stopRecording();
      
      // Update recording state
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        chunksProcessed: result.diagnostics.chunksCollected,
      }));
      
      setAudioLevel(0);
      setIsProcessing(false);

      // Update final diagnostics
      setDiagnostics(result.diagnostics);

      if (!result.success || !result.audioBlob) {
        const errorMessage = result.error || 'Unknown recording error occurred';
        console.error('❌ Recording failed:', errorMessage);
        setError(errorMessage);
        cleanup();
        return;
      }

      console.log('✅ Recording completed successfully:', result.audioBlob.size, 'bytes');
      setError(''); // Clear any previous errors
      
      const audioUrl = URL.createObjectURL(result.audioBlob);
      
      dispatch({
        type: 'STOP_RECORDING',
        payload: { audioBlob: result.audioBlob, audioUrl }
      });
      
      cleanup();

    } catch (error: any) {
      console.error('❌ Error stopping recording:', error);
      setError(`Error stopping recording: ${error.message}`);
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      setIsProcessing(false);
      cleanup();
    }
  }, [recordingState.isRecording, dispatch]);

  // Note: Pause/Resume functionality is not supported with chunked recording
  // The chunked system processes audio in real-time segments

  // The duration is now handled by the chunked recorder system
  // No need for the old duration update effect

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Space bar to start/stop recording
      if (e.code === 'Space') {
        e.preventDefault();
        if (recordingState.isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
      
      // Escape to cancel recording
      if (e.code === 'Escape' && recordingState.isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [recordingState.isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Show browser compatibility warning if needed
  if (browserSupport && !browserSupport.supported) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Browser Not Supported
            </h3>
            <p className="text-red-700 mb-4">
              Your browser doesn't support audio recording. Please use a modern browser.
            </p>
            <div className="text-sm text-red-600 space-y-1">
              <div>getUserMedia: {browserSupport.features.getUserMedia ? '✅' : '❌'}</div>
              <div>MediaRecorder: {browserSupport.features.mediaRecorder ? '✅' : '❌'}</div>
              <div>Web Audio API: {browserSupport.features.webAudio ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with diagnostics toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Audio Recording</h3>
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showDiagnostics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{showDiagnostics ? 'Hide' : 'Show'} Diagnostics</span>
        </button>
      </div>

      {/* Enhanced Recording Indicator */}
      <RecordingIndicator state={recordingState} />
      
      {/* Audio Level Indicator */}
      {(recordingState.isRecording || audioLevel > 0) && (
        <AudioLevelIndicator level={audioLevel} isRecording={recordingState.isRecording} />
      )}

      {/* Recording Controls */}
      <div className="flex justify-center space-x-4">
        {!recordingState.isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing || !!error}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isProcessing || error
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                <span>Start Recording</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'btn-danger animate-pulse'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Square className="h-5 w-5" />
                <span>Stop Recording</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-red-600 text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-2">Recording Error</h4>
              <div className="text-red-700 whitespace-pre-line text-sm leading-relaxed">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!error && !recordingState.isRecording && diagnostics && diagnostics.totalBytesRecorded > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-green-600 text-2xl">✅</span>
            <div>
              <h4 className="font-semibold text-green-800">Recording Successful!</h4>
              <p className="text-green-700 text-sm">
                Recorded {(diagnostics.totalBytesRecorded / 1024).toFixed(2)} KB 
                in {diagnostics.recordingDuration.toFixed(1)} seconds
                ({diagnostics.chunksCollected} chunks)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Panel */}
      {diagnostics && (
        <DiagnosticPanel info={diagnostics} isVisible={showDiagnostics} />
      )}

      {/* Enhanced Recording Tips */}
      {!recordingState.isRecording && (
        <div className="text-xs text-gray-500">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-xl flex-shrink-0">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Recording Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Position:</strong> Hold microphone 6-12 inches from your mouth</li>
                  <li>• <strong>Environment:</strong> Record in a quiet room to reduce background noise</li>
                  <li>• <strong>Speech:</strong> Speak clearly at normal pace (150-180 words/minute)</li>
                  <li>• <strong>Volume:</strong> Watch the audio level bars - they should move when you speak</li>
                  <li>• <strong>Duration:</strong> Keep recordings under 2 minutes for best results</li>
                  <li>• <strong>Troubleshooting:</strong> If bars don't move, check microphone permissions</li>
                </ul>
                <p className="mt-2 font-medium text-blue-900">⌨️ Keyboard: <kbd className="px-1 py-0.5 bg-blue-200 rounded">Space</kbd> to record, <kbd className="px-1 py-0.5 bg-blue-200 rounded">Esc</kbd> to cancel</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
