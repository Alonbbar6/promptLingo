export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  tone: string;
}

export interface TranslationResponse {
  translation: string;
  model: string;
  tokensUsed: number;
  // Content filtering information
  wasFiltered?: boolean;
  detectedIssues?: string[];
  severityLevel?: 'none' | 'mild' | 'moderate' | 'severe';
  originalText?: string;
  filteredText?: string;
}

export interface TranscriptionRequest {
  audioFile: File;
  language?: string;
}

export interface TranscriptionResponse {
  transcription: string;
  language: string;
  confidence: number;
}

export interface SynthesisRequest {
  text: string;
  voiceId: string;
  language: string;
}

export interface SynthesisResponse {
  audioUrl: string;
  characterCount: number;
}

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  description?: string;
}

export interface TranslationHistoryItem {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  rtl?: boolean;
}

export interface Tone {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
  audioUrl?: string;
}

export interface EnhancedRecordingState {
  isRecording: boolean;
  duration: number;
  volume: number;
  speechRate: 'slow' | 'normal' | 'fast' | 'too-fast';
  chunksProcessed: number;
  warning: string | null;
  wordsPerMinute: number;
}

export interface ChunkConfig {
  maxDurationMs: number;
  overlapMs: number;
}

export interface RecordingLimits {
  maxDurationMs: number;
  warningDurationMs: number;
}

export interface ProcessingResult {
  transcription: string;
  translation: string;
  audioBlob?: Blob;
  chunks: string[];
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

export interface AppState {
  // Language selection
  sourceLanguage: string;
  targetLanguage: string;
  translationDirection: 'to-english' | 'from-english';
  
  // Tone selection
  selectedTone: string;
  
  // Audio recording
  audioRecorder: AudioRecorderState;
  
  // Audio playback
  audioPlayer: AudioPlayerState;
  
  // Translation
  currentTranslation?: TranslationHistoryItem;
  isTranslating: boolean;
  translationError?: string;
  
  // History
  translationHistory: TranslationHistoryItem[];
  
  // UI state
  autoPlay: boolean;
  showHistory: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Language Detection Types
export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isReliable: boolean;
}

export interface LanguageDetectionError {
  message: string;
  code: 'TEXT_TOO_SHORT' | 'UNCERTAIN_DETECTION' | 'UNSUPPORTED_LANGUAGE';
}

// Text-to-Speech Types
export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female';
  isDefault?: boolean;
}

export interface TTSOptions {
  voiceId?: string;
  language?: string;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentText?: string;
  progress: number; // 0 to 1
}

// App Navigation Types
export type AppPage = 'translator' | 'tts';
