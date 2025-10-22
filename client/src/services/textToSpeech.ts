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
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange?: (state: TTSState) => void;
  private voicesLoaded = false;
  private voiceLoadPromise: Promise<void> | null = null;
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    isSupported: false,
    progress: 0
  };

  constructor(onStateChange?: (state: TTSState) => void) {
    this.synthesis = window.speechSynthesis;
    this.onStateChange = onStateChange;
    this.state.isSupported = 'speechSynthesis' in window;
    
    if (this.state.isSupported) {
      // Handle browser events
      this.synthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
      
      // Initialize voice loading
      this.initializeVoices();
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
      throw new Error('Text-to-speech is not supported in this browser');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for speech synthesis');
    }

    // Ensure voices are loaded
    console.log('🔊 Ensuring voices are loaded before speaking...');
    await this.initializeVoices();

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      
      // Set voice with better selection logic
      const voices = this.synthesis.getVoices();
      console.log('🔊 Available voices for selection:', voices.length);
      
      if (options.voice) {
        const selectedVoice = voices.find(v => v.voiceURI === options.voice || v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🔊 Using specified voice:', selectedVoice.name);
        } else {
          console.warn('⚠️ Specified voice not found:', options.voice);
        }
      } else if (options.language) {
        const bestVoice = this.getBestVoiceForLanguage(options.language);
        if (bestVoice) {
          const voice = voices.find(v => v.voiceURI === bestVoice.id || v.name === bestVoice.name);
          if (voice) {
            utterance.voice = voice;
            console.log('🔊 Using best voice for language:', voice.name, 'for', options.language);
          }
        } else {
          console.warn('⚠️ No suitable voice found for language:', options.language);
        }
      }
      
      // Fallback to default voice if none selected
      if (!utterance.voice && voices.length > 0) {
        utterance.voice = voices[0];
        console.log('🔊 Using fallback voice:', voices[0].name);
      }

      // Set speech parameters
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.language || 'en-US';

      // Set up event handlers
      utterance.onstart = () => {
        console.log('TTS started');
        this.updateState({
          isPlaying: true,
          isPaused: false,
          currentText: text,
          progress: 0
        });
      };

      utterance.onend = () => {
        console.log('TTS ended');
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentText: undefined,
          progress: 1
        });
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ TTS error:', event.error);
        console.error('❌ TTS error details:', {
          error: event.error,
          voice: utterance.voice?.name,
          language: utterance.lang,
          textLength: text.length
        });
        
        clearInterval(progressInterval);
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentText: undefined,
          progress: 0
        });
        this.currentUtterance = null;
        
        // Provide more specific error messages
        let errorMessage = 'Speech synthesis failed';
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error during speech synthesis';
            break;
          case 'synthesis-failed':
            errorMessage = 'Speech synthesis engine failed';
            break;
          case 'synthesis-unavailable':
            errorMessage = 'Speech synthesis not available';
            break;
          case 'voice-unavailable':
            errorMessage = 'Selected voice not available';
            break;
          case 'text-too-long':
            errorMessage = 'Text too long for speech synthesis';
            break;
          case 'invalid-argument':
            errorMessage = 'Invalid speech synthesis parameters';
            break;
          default:
            errorMessage = `Speech synthesis failed: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      utterance.onpause = () => {
        console.log('TTS paused');
        this.updateState({ isPaused: true });
      };

      utterance.onresume = () => {
        console.log('TTS resumed');
        this.updateState({ isPaused: false });
      };

      // Track progress (approximate)
      const words = text.split(/\s+/).length;
      const estimatedDuration = (words / 150) * 60 * 1000; // Assume 150 WPM
      let progressInterval: NodeJS.Timeout;

      utterance.onstart = () => {
        console.log('🔊 TTS started speaking');
        this.updateState({
          isPlaying: true,
          isPaused: false,
          currentText: text,
          progress: 0
        });

        // Update progress approximately
        const startTime = Date.now();
        progressInterval = setInterval(() => {
          if (!this.state.isPlaying || this.state.isPaused) return;
          
          const elapsed = Date.now() - startTime;
          const progress = Math.min(0.95, elapsed / estimatedDuration); // Cap at 95% until actual end
          this.updateState({ progress });
        }, 100);
      };

      utterance.onend = () => {
        clearInterval(progressInterval);
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentText: undefined,
          progress: 1
        });
        this.currentUtterance = null;
        resolve();
      };

      // Store current utterance and start speaking
      this.currentUtterance = utterance;
      
      console.log('🔊 Starting speech synthesis with settings:', {
        voice: utterance.voice?.name || 'default',
        language: utterance.lang,
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume,
        textLength: text.length
      });
      
      this.synthesis.speak(utterance);
    });
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
  return tts.speak(text, { language, rate });
}

/**
 * Check if TTS is supported in the current browser
 */
export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}
