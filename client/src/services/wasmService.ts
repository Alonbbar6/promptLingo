/**
 * WebAssembly Text Processor Service
 * Handles loading and interaction with the WASM text processing module
 */

export interface TextAnalysis {
  word_count: number;
  char_count: number;
  sentence_count: number;
  language_confidence: number;
  detected_language: string;
  profanity_score: number;
  sentiment_score: number;
  reading_time_minutes: number;
}

export interface ProcessingResult {
  original_text: string;
  processed_text: string;
  analysis: TextAnalysis;
  processing_time_ms: number;
}

export interface BenchmarkResult {
  iterations: number;
  total_time_ms: number;
  average_time_ms: number;
  operations_per_second: number;
}

export interface WasmModule {
  TextProcessor: new () => TextProcessor;
  word_count: (text: string) => number;
  char_count: (text: string) => number;
  is_wasm_supported: () => boolean;
  get_memory_usage: () => any;
}

export interface TextProcessor {
  analyze_text(text: string): TextAnalysis;
  process_text(text: string, filter_profanity: boolean, normalize_whitespace: boolean): ProcessingResult;
  batch_process(texts: string[]): ProcessingResult[];
  benchmark(text: string, iterations: number): BenchmarkResult;
  free(): void;
}

class WasmTextService {
  private wasmModule: WasmModule | null = null;
  private textProcessor: TextProcessor | null = null;
  private isInitialized = false;
  private isLoading = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the WASM module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.isLoading && this.initPromise) return this.initPromise;

    this.isLoading = true;
    this.initPromise = this._doInitialize();
    
    try {
      await this.initPromise;
    } finally {
      this.isLoading = false;
    }
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('🔄 Loading WASM Text Processor...');
      
      // Check if WASM is supported
      if (!this.isWasmSupported()) {
        throw new Error('WebAssembly is not supported in this browser');
      }

      // Dynamic import of the WASM module
      const wasmModule = await this.loadWasmModule();
      
      if (!wasmModule) {
        throw new Error('Failed to load WASM module');
      }

      this.wasmModule = wasmModule;
      this.textProcessor = new wasmModule.TextProcessor();
      this.isInitialized = true;

      console.log('✅ WASM Text Processor initialized successfully');
      console.log('📊 Memory usage:', this.getMemoryUsage());
      
    } catch (error) {
      console.error('❌ Failed to initialize WASM:', error);
      throw error;
    }
  }

  /**
   * Load the WASM module with fallback strategies
   */
  private async loadWasmModule(): Promise<WasmModule | null> {
    const loadStrategies = [
      // Strategy 1: Load from public/wasm directory
      () => this.loadFromPublic(),
      // Strategy 2: Load from CDN (if configured)
      () => this.loadFromCDN(),
      // Strategy 3: Load inline (if bundled)
      () => this.loadInline()
    ];

    for (const strategy of loadStrategies) {
      try {
        const module = await strategy();
        if (module) return module;
      } catch (error) {
        console.warn('WASM load strategy failed:', error);
      }
    }

    return null;
  }

  /**
   * Load WASM from public directory
   */
  private async loadFromPublic(): Promise<WasmModule | null> {
    try {
      // First, load the JS glue code
      const script = document.createElement('script');
      script.src = '/wasm/wasm_text_processor.js';
      
      return new Promise((resolve, reject) => {
        script.onload = async () => {
          try {
            // @ts-ignore - Dynamic import of WASM module
            const init = window.wasm_bindgen || window.init;
            if (!init) {
              throw new Error('WASM init function not found');
            }

            // Initialize with WASM file
            await init('/wasm/wasm_text_processor_bg.wasm');
            
            // @ts-ignore - Access the WASM exports
            const wasmModule = window.wasm_bindgen as WasmModule;
            resolve(wasmModule);
          } catch (error) {
            reject(error);
          }
        };
        
        script.onerror = () => reject(new Error('Failed to load WASM JS file'));
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Failed to load from public:', error);
      return null;
    }
  }

  /**
   * Load WASM from CDN (placeholder for future implementation)
   */
  private async loadFromCDN(): Promise<WasmModule | null> {
    // TODO: Implement CDN loading if needed
    return null;
  }

  /**
   * Load inline WASM (placeholder for bundled version)
   */
  private async loadInline(): Promise<WasmModule | null> {
    // TODO: Implement inline loading if WASM is bundled
    return null;
  }

  /**
   * Check if WebAssembly is supported
   */
  isWasmSupported(): boolean {
    return typeof WebAssembly === 'object' && 
           typeof WebAssembly.instantiate === 'function';
  }

  /**
   * Analyze text using WASM
   */
  async analyzeText(text: string): Promise<TextAnalysis> {
    await this.initialize();
    
    if (!this.textProcessor) {
      throw new Error('WASM module not initialized');
    }

    try {
      return this.textProcessor.analyze_text(text);
    } catch (error) {
      console.error('WASM text analysis failed:', error);
      throw new Error(`Text analysis failed: ${error}`);
    }
  }

  /**
   * Process text with filtering options
   */
  async processText(
    text: string, 
    options: {
      filterProfanity?: boolean;
      normalizeWhitespace?: boolean;
    } = {}
  ): Promise<ProcessingResult> {
    await this.initialize();
    
    if (!this.textProcessor) {
      throw new Error('WASM module not initialized');
    }

    const { filterProfanity = false, normalizeWhitespace = true } = options;

    try {
      return this.textProcessor.process_text(text, filterProfanity, normalizeWhitespace);
    } catch (error) {
      console.error('WASM text processing failed:', error);
      throw new Error(`Text processing failed: ${error}`);
    }
  }

  /**
   * Batch process multiple texts
   */
  async batchProcess(texts: string[]): Promise<ProcessingResult[]> {
    await this.initialize();
    
    if (!this.textProcessor) {
      throw new Error('WASM module not initialized');
    }

    try {
      return this.textProcessor.batch_process(texts);
    } catch (error) {
      console.error('WASM batch processing failed:', error);
      throw new Error(`Batch processing failed: ${error}`);
    }
  }

  /**
   * Run performance benchmark
   */
  async benchmark(text: string, iterations: number = 1000): Promise<BenchmarkResult> {
    await this.initialize();
    
    if (!this.textProcessor) {
      throw new Error('WASM module not initialized');
    }

    try {
      return this.textProcessor.benchmark(text, iterations);
    } catch (error) {
      console.error('WASM benchmark failed:', error);
      throw new Error(`Benchmark failed: ${error}`);
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): any {
    if (!this.wasmModule) return null;
    
    try {
      return this.wasmModule.get_memory_usage();
    } catch (error) {
      console.error('Failed to get memory usage:', error);
      return null;
    }
  }

  /**
   * Utility functions that don't require TextProcessor instance
   */
  async getWordCount(text: string): Promise<number> {
    await this.initialize();
    
    if (!this.wasmModule) {
      // Fallback to JavaScript implementation
      return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    return this.wasmModule.word_count(text);
  }

  async getCharCount(text: string): Promise<number> {
    await this.initialize();
    
    if (!this.wasmModule) {
      // Fallback to JavaScript implementation
      return text.length;
    }

    return this.wasmModule.char_count(text);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.textProcessor) {
      try {
        this.textProcessor.free();
      } catch (error) {
        console.warn('Error freeing WASM resources:', error);
      }
      this.textProcessor = null;
    }
    
    this.wasmModule = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      isSupported: this.isWasmSupported(),
      hasModule: !!this.wasmModule,
      hasProcessor: !!this.textProcessor
    };
  }
}

// Export singleton instance
export const wasmTextService = new WasmTextService();
