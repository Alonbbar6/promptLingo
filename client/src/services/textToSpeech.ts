// Text-to-Speech Service using Web Speech API

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female';
  isDefault?: boolean;
  isLocal?: boolean;
}

export interface TTSOptions {
  voice?: string;
  rate?: number;    // 0.1 to 10 (default: 1)
  pitch?: number;   // 0 to 2 (default: 1)
  volume?: number;  // 0 to 1 (default: 1)
  language?: string;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentText?: string;
  progress: number; // 0 to 1
}

export class TextToSpeechService {
  private onStateChange?: (state: TTSState) => void;
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    isSupported: false, // Will be set based on ElevenLabs availability
    progress: 0
  };

  constructor(onStateChange?: (state: TTSState) => void) {
    this.onStateChange = onStateChange;
    
    // Check if ElevenLabs is properly configured
    try {
      // This will throw if not configured
      this.state.isSupported = isElevenLabsConfigured();
    } catch (error) {
      console.error('❌ Text-to-speech initialization failed:', error);
      this.state.isSupported = false;
    }
    
    this.updateState();
  }

  private handleVoicesChanged = () => {
    // Voices are now available
    this.voicesLoaded = true;
    const voices = this.getAvailableVoices();
    console.log('🔊 TTS voices loaded:', voices.length);
    const uniqueLanguages = Array.from(new Set(voices.map(v => v.language)));
    console.log('🔊 Available languages:', uniqueLanguages);
  };

  /**
   * Initialize voices with proper loading handling
   */
  private async initializeVoices(): Promise<void> {
    if (this.voiceLoadPromise) {
      return this.voiceLoadPromise;
    }

    this.voiceLoadPromise = new Promise((resolve) => {
      // Check if voices are already loaded
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        console.log('🔊 TTS voices already loaded:', voices.length);
        resolve();
        return;
      }

      // Wait for voices to load
      const handleVoicesLoaded = () => {
        const loadedVoices = this.synthesis.getVoices();
        if (loadedVoices.length > 0) {
          this.voicesLoaded = true;
          console.log('🔊 TTS voices loaded asynchronously:', loadedVoices.length);
          this.synthesis.removeEventListener('voiceschanged', handleVoicesLoaded);
          resolve();
        }
      };

      this.synthesis.addEventListener('voiceschanged', handleVoicesLoaded);
      
      // Fallback timeout
      setTimeout(() => {
        const fallbackVoices = this.synthesis.getVoices();
        if (fallbackVoices.length > 0) {
          this.voicesLoaded = true;
          console.log('🔊 TTS voices loaded via timeout:', fallbackVoices.length);
        } else {
          console.warn('⚠️ No TTS voices available after timeout');
        }
        this.synthesis.removeEventListener('voiceschanged', handleVoicesLoaded);
        resolve();
      }, 3000);
    });

    return this.voiceLoadPromise;
  }

  private updateState(updates?: Partial<TTSState>) {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  /**
   * Get all available voices
   */
  getAvailableVoices(): TTSVoice[] {
    if (!this.state.isSupported) return [];

    const voices = this.synthesis.getVoices();
    return voices.map(voice => ({
      id: voice.voiceURI || voice.name,
      name: voice.name,
      language: voice.lang,
      gender: this.inferGender(voice.name),
      isDefault: voice.default,
      isLocal: voice.localService
    }));
  }

  /**
   * Get voices for a specific language
   */
  getVoicesForLanguage(languageCode: string): TTSVoice[] {
    const voices = this.getAvailableVoices();
    return voices.filter(voice => 
      voice.language.startsWith(languageCode) || 
      voice.language.startsWith(this.mapLanguageCode(languageCode))
    );
  }

  /**
   * Get the best voice for a language
   */
  getBestVoiceForLanguage(languageCode: string): TTSVoice | null {
    const voices = this.getVoicesForLanguage(languageCode);
    
    if (voices.length === 0) return null;

    // Prefer local voices, then default voices
    const localVoices = voices.filter(v => v.isLocal);
    const defaultVoices = voices.filter(v => v.isDefault);
    
    if (localVoices.length > 0) return localVoices[0];
    if (defaultVoices.length > 0) return defaultVoices[0];
    return voices[0];
  }

  /**
   * Speak the given text with enhanced voice loading
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.state.isSupported) {
      throw new Error('ElevenLabs API key not configured — cannot proceed with TTS.');
    }

    if (!text || typeof text !== 'string') {
      throw new Error('No text provided for speech synthesis');
    }
    
    // Ensure ElevenLabs is still configured (in case the key was removed after initialization)
    if (!isElevenLabsConfigured()) {
      throw new Error('ElevenLabs API key not configured — cannot proceed with TTS.');
    }

    // Ensure voices are loaded
    console.log('🔊 Ensuring voices are loaded before speaking...');
    await this.initializeVoices();

    // Convert language to ElevenLabs format if needed
    const elevenLabsLanguage = options.language ? getElevenLabsLanguage(options.language) : 'english';
    
    // Rate is not directly supported by ElevenLabs, but we can adjust the speed if needed
    const elevenLabsOptions: ElevenLabsOptions = {
      text,
      language: elevenLabsLanguage,
      voiceGender: 'male', // Default to male voice
      stability: 0.5, // Default stability
      similarityBoost: 0.75 // Default similarity boost
    };
    
    const result = await generateAndPlaySpeech(elevenLabsOptions);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate speech');
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.state.isSupported && this.state.isPlaying && !this.state.isPaused) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.state.isSupported && this.state.isPlaying && this.state.isPaused) {
      this.synthesis.resume();
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.state.isSupported) {
      this.synthesis.cancel();
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentText: undefined,
        progress: 0
      });
      this.currentUtterance = null;
    }
  }

  /**
   * Get current state
   */
  getState(): TTSState {
    return { ...this.state };
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return this.state.isSupported;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    if (this.state.isSupported) {
      this.synthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
    }
  }

  // Helper methods

  private inferGender(voiceName: string): 'male' | 'female' | undefined {
    const name = voiceName.toLowerCase();
    if (name.includes('female') || name.includes('woman') || name.includes('girl')) {
      return 'female';
    }
    if (name.includes('male') || name.includes('man') || name.includes('boy')) {
      return 'male';
    }
    // Common female names
    if (name.includes('anna') || name.includes('maria') || name.includes('sara') || 
        name.includes('emma') || name.includes('sophia') || name.includes('elena')) {
      return 'female';
    }
    // Common male names
    if (name.includes('david') || name.includes('john') || name.includes('carlos') || 
        name.includes('miguel') || name.includes('alex') || name.includes('daniel')) {
      return 'male';
    }
    return undefined;
  }

  private mapLanguageCode(code: string): string {
    const mapping: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'ht': 'fr-FR', // Use French for Haitian Creole
      'fr': 'fr-FR'
    };
    return mapping[code] || code;
  }
}

// Singleton instance
let ttsInstance: TextToSpeechService | null = null;

/**
 * Get the singleton TTS service instance
 */
export function getTTSService(onStateChange?: (state: TTSState) => void): TextToSpeechService {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeechService(onStateChange);
  }
  return ttsInstance;
}

/**
 * Quick speak function for simple use cases
 */
export async function quickSpeak(text: string, language?: string, rate?: number): Promise<void> {
  const tts = getTTSService();
  
  // Convert language to ElevenLabs format if needed
  const elevenLabsLanguage = language ? getElevenLabsLanguage(language) : 'english';
  
  // Rate is not directly supported by ElevenLabs, but we can adjust the speed if needed
  const options: ElevenLabsOptions = {
    text,
    language: elevenLabsLanguage,
    voiceGender: 'male', // Default to male voice
    stability: 0.5, // Default stability
    similarityBoost: 0.75 // Default similarity boost
  };
  
  const result = await generateAndPlaySpeech(options);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate speech');
  }
}

/**
 * Check if TTS is supported in the current browser
 * Now this only returns true if ElevenLabs is properly configured
 */
export function isTTSSupported(): boolean {
  try {
    return isElevenLabsConfigured();
  } catch (error) {
    return false;
  }
}
