use wasm_bindgen::prelude::*;
use js_sys::Array;
use web_sys::console;
use serde::{Deserialize, Serialize};
use regex::Regex;
use unicode_segmentation::UnicodeSegmentation;
use std::collections::HashMap;

// Import the `console.log` function from the browser
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro for easier console logging
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    console_log!("🦀 WASM Text Processor initialized!");
}

// Structures for data exchange
#[derive(Serialize, Deserialize)]
pub struct TextAnalysis {
    pub word_count: usize,
    pub char_count: usize,
    pub sentence_count: usize,
    pub language_confidence: f32,
    pub detected_language: String,
    pub profanity_score: f32,
    pub sentiment_score: f32,
    pub reading_time_minutes: f32,
}

#[derive(Serialize, Deserialize)]
pub struct ProcessingResult {
    pub original_text: String,
    pub processed_text: String,
    pub analysis: TextAnalysis,
    pub processing_time_ms: f64,
}

// Main text processor struct
#[wasm_bindgen]
pub struct TextProcessor {
    profanity_patterns: Vec<Regex>,
    language_patterns: HashMap<String, Vec<Regex>>,
    performance: web_sys::Performance,
}

#[wasm_bindgen]
impl TextProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<TextProcessor, JsValue> {
        let window = web_sys::window().ok_or("No window object")?;
        let performance = window.performance().ok_or("No performance object")?;
        
        let mut processor = TextProcessor {
            profanity_patterns: Vec::new(),
            language_patterns: HashMap::new(),
            performance,
        };
        
        processor.initialize_patterns();
        Ok(processor)
    }

    // Initialize regex patterns for content filtering and language detection
    fn initialize_patterns(&mut self) {
        // Profanity detection patterns (content-policy safe examples)
        let profanity_words = vec![
            r"\b(damn|hell|crap)\b",
            r"\b\w*f\*+\w*\b", // Matches censored words like f***
            r"\b\w*\*{2,}\w*\b", // Matches multiple asterisks
        ];
        
        for pattern in profanity_words {
            if let Ok(regex) = Regex::new(&format!("(?i){}", pattern)) {
                self.profanity_patterns.push(regex);
            }
        }

        // Language detection patterns
        let mut english_patterns = Vec::new();
        let mut creole_patterns = Vec::new();
        let mut spanish_patterns = Vec::new();

        // English patterns
        if let Ok(regex) = Regex::new(r"\b(the|and|or|but|in|on|at|to|for|of|with|by)\b") {
            english_patterns.push(regex);
        }
        if let Ok(regex) = Regex::new(r"\b(I|you|he|she|it|we|they|am|is|are|was|were)\b") {
            english_patterns.push(regex);
        }

        // Haitian Creole patterns
        if let Ok(regex) = Regex::new(r"\b(ak|nan|pou|yo|li|nou|mwen|ou)\b") {
            creole_patterns.push(regex);
        }
        if let Ok(regex) = Regex::new(r"\b(se|pa|gen|te|ap|va|ki)\b") {
            creole_patterns.push(regex);
        }

        // Spanish patterns
        if let Ok(regex) = Regex::new(r"\b(el|la|los|las|un|una|y|o|pero|en|de|a|para|con|por)\b") {
            spanish_patterns.push(regex);
        }
        if let Ok(regex) = Regex::new(r"\b(yo|tú|él|ella|nosotros|vosotros|ellos|soy|eres|es|somos|son)\b") {
            spanish_patterns.push(regex);
        }

        self.language_patterns.insert("english".to_string(), english_patterns);
        self.language_patterns.insert("creole".to_string(), creole_patterns);
        self.language_patterns.insert("spanish".to_string(), spanish_patterns);
    }

    // Fast text analysis function
    #[wasm_bindgen]
    pub fn analyze_text(&self, text: &str) -> Result<JsValue, JsValue> {
        let start_time = self.performance.now();
        
        // Basic text metrics
        let word_count = text.split_whitespace().count();
        let char_count = text.chars().count();
        let sentence_count = text.matches(&['.', '!', '?'][..]).count().max(1);
        
        // Language detection
        let (detected_language, language_confidence) = self.detect_language(text);
        
        // Profanity scoring
        let profanity_score = self.calculate_profanity_score(text);
        
        // Simple sentiment analysis (basic implementation)
        let sentiment_score = self.calculate_sentiment_score(text);
        
        // Reading time estimation (average 200 words per minute)
        let reading_time_minutes = word_count as f32 / 200.0;
        
        let analysis = TextAnalysis {
            word_count,
            char_count,
            sentence_count,
            language_confidence,
            detected_language,
            profanity_score,
            sentiment_score,
            reading_time_minutes,
        };

        let processing_time = self.performance.now() - start_time;
        console_log!("📊 Text analysis completed in {:.2}ms", processing_time);

        serde_wasm_bindgen::to_value(&analysis).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    // Content filtering and text cleaning
    #[wasm_bindgen]
    pub fn process_text(&self, text: &str, filter_profanity: bool, normalize_whitespace: bool) -> Result<JsValue, JsValue> {
        let start_time = self.performance.now();
        let original_text = text.to_string();
        let mut processed_text = text.to_string();

        // Normalize whitespace
        if normalize_whitespace {
            processed_text = Regex::new(r"\s+").unwrap()
                .replace_all(&processed_text, " ")
                .trim()
                .to_string();
        }

        // Filter profanity
        if filter_profanity {
            for pattern in &self.profanity_patterns {
                processed_text = pattern.replace_all(&processed_text, "[FILTERED]").to_string();
            }
        }

        // Analyze the processed text
        let analysis_result = self.analyze_text(&processed_text)?;
        let analysis: TextAnalysis = serde_wasm_bindgen::from_value(analysis_result)?;

        let processing_time = self.performance.now() - start_time;

        let result = ProcessingResult {
            original_text,
            processed_text,
            analysis,
            processing_time_ms: processing_time,
        };

        console_log!("🔄 Text processing completed in {:.2}ms", processing_time);
        serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    // Batch process multiple texts (demonstrates performance benefits)
    #[wasm_bindgen]
    pub fn batch_process(&self, texts: &Array) -> Result<JsValue, JsValue> {
        let start_time = self.performance.now();
        let mut results = Vec::new();

        for i in 0..texts.length() {
            if let Some(text_val) = texts.get(i).as_string() {
                match self.process_text(&text_val, true, true) {
                    Ok(result) => results.push(result),
                    Err(_) => continue,
                }
            }
        }

        let processing_time = self.performance.now() - start_time;
        console_log!("📦 Batch processed {} texts in {:.2}ms", results.len(), processing_time);

        let js_array = Array::new();
        for result in results {
            js_array.push(&result);
        }

        Ok(js_array.into())
    }

    // Language detection helper
    fn detect_language(&self, text: &str) -> (String, f32) {
        let text_lower = text.to_lowercase();
        let mut scores = HashMap::new();

        for (language, patterns) in &self.language_patterns {
            let mut matches = 0;
            for pattern in patterns {
                matches += pattern.find_iter(&text_lower).count();
            }
            scores.insert(language.clone(), matches);
        }

        let total_words = text.split_whitespace().count().max(1);
        let (best_lang, best_score) = scores.iter()
            .max_by_key(|(_, &score)| score)
            .unwrap_or((&"unknown".to_string(), &0));

        let confidence = (*best_score as f32 / total_words as f32).min(1.0);
        
        (best_lang.clone(), confidence)
    }

    // Profanity scoring helper
    fn calculate_profanity_score(&self, text: &str) -> f32 {
        let mut total_matches = 0;
        for pattern in &self.profanity_patterns {
            total_matches += pattern.find_iter(text).count();
        }
        
        let word_count = text.split_whitespace().count().max(1);
        (total_matches as f32 / word_count as f32).min(1.0)
    }

    // Basic sentiment analysis
    fn calculate_sentiment_score(&self, text: &str) -> f32 {
        let positive_words = ["good", "great", "excellent", "amazing", "wonderful", "fantastic", "love", "like", "happy", "joy"];
        let negative_words = ["bad", "terrible", "awful", "horrible", "hate", "dislike", "sad", "angry", "frustrated", "disappointed"];
        
        let text_lower = text.to_lowercase();
        let words: Vec<&str> = text_lower.split_whitespace().collect();
        
        let positive_count = words.iter()
            .filter(|word| positive_words.contains(word))
            .count() as f32;
            
        let negative_count = words.iter()
            .filter(|word| negative_words.contains(word))
            .count() as f32;
        
        let total_sentiment_words = positive_count + negative_count;
        if total_sentiment_words == 0.0 {
            return 0.0; // Neutral
        }
        
        (positive_count - negative_count) / total_sentiment_words
    }

    // Performance benchmark function
    #[wasm_bindgen]
    pub fn benchmark(&self, text: &str, iterations: u32) -> Result<JsValue, JsValue> {
        console_log!("🏃 Starting benchmark with {} iterations", iterations);
        let start_time = self.performance.now();
        
        for _ in 0..iterations {
            let _ = self.analyze_text(text)?;
        }
        
        let total_time = self.performance.now() - start_time;
        let avg_time = total_time / iterations as f64;
        
        let benchmark_result = serde_wasm_bindgen::to_value(&serde_json::json!({
            "iterations": iterations,
            "total_time_ms": total_time,
            "average_time_ms": avg_time,
            "operations_per_second": 1000.0 / avg_time
        }))?;
        
        console_log!("📈 Benchmark completed: {:.2}ms total, {:.4}ms avg", total_time, avg_time);
        Ok(benchmark_result)
    }
}

// Utility functions that can be called directly
#[wasm_bindgen]
pub fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

#[wasm_bindgen]
pub fn char_count(text: &str) -> usize {
    text.chars().count()
}

#[wasm_bindgen]
pub fn is_wasm_supported() -> bool {
    true
}

// Memory management utilities
#[wasm_bindgen]
pub fn get_memory_usage() -> JsValue {
    let memory = wasm_bindgen::memory();
    serde_wasm_bindgen::to_value(&serde_json::json!({
        "buffer_size": memory.buffer().byte_length(),
        "pages": memory.buffer().byte_length() / 65536
    })).unwrap_or(JsValue::NULL)
}
