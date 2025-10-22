import os
import json
import requests
import streamlit as st
from dotenv import load_dotenv
import base64
from io import BytesIO
import numpy as np

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = "http://localhost:3001/api"  # Your existing Node.js server
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Set page config
st.set_page_config(
    page_title="PromptLingo - Multilingual Translator",
    page_icon="🌍",
    layout="wide"
)

# Initialize session state
if 'translation_history' not in st.session_state:
    st.session_state.translation_history = []

# Helper functions
def get_voices():
    """Fetch available voices from the API"""
    try:
        response = requests.get(f"{API_BASE_URL}/voices/en")
        return response.json() if response.status_code == 200 else []
    except Exception as e:
        st.error(f"Error fetching voices: {str(e)}")
        return []

def translate_text(text, source_lang, target_lang, tone="neutral"):
    """Send text to the translation API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/translate",
            json={
                "text": text,
                "sourceLang": source_lang,
                "targetLang": target_lang,
                "tone": tone
            }
        )
        return response.json() if response.status_code == 200 else {"error": "Translation failed"}
    except Exception as e:
        return {"error": str(e)}

def text_to_speech(text, voice_id, stability=0.5, similarity_boost=0.5):
    """Convert text to speech using the API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/synthesize",
            json={
                "text": text,
                "voiceId": voice_id,
                "stability": stability,
                "similarity_boost": similarity_boost
            },
            stream=True
        )
        
        if response.status_code == 200:
            return response.content  # Returns audio bytes
        else:
            st.error(f"TTS Error: {response.text}")
            return None
    except Exception as e:
        st.error(f"TTS Error: {str(e)}")
        return None

# UI Components
def show_translation_ui():
    """Main translation interface"""
    st.title("🌍 PromptLingo - Multilingual Translator")
    
    # Language selection
    col1, col2 = st.columns(2)
    
    with col1:
        source_lang = st.selectbox(
            "Source Language",
            ["en", "es", "ht"],
            format_func=lambda x: {"en": "English", "es": "Spanish", "ht": "Haitian Creole"}[x]
        )
    
    with col2:
        target_lang = st.selectbox(
            "Target Language",
            ["en", "es", "ht"],
            index=1 if source_lang == "en" else 0,
            format_func=lambda x: {"en": "English", "es": "Spanish", "ht": "Haitian Creole"}[x]
        )
    
    # Tone selection
    tone = st.select_slider(
        "Tone",
        options=["casual", "neutral", "professional", "formal", "medical"],
        value="neutral"
    )
    
    # Text input
    text = st.text_area("Enter text to translate", height=150)
    
    # Translate button
    if st.button("Translate", type="primary") and text.strip():
        with st.spinner("Translating..."):
            result = translate_text(text, source_lang, target_lang, tone)
            
            if "error" in result:
                st.error(f"Translation error: {result['error']}")
            else:
                # Display translation
                st.subheader("Translation")
                st.write(result.get("translatedText", "No translation available"))
                
                # Add to history
                st.session_state.translation_history.insert(0, {
                    "source_text": text,
                    "translated_text": result.get("translatedText", ""),
                    "source_lang": source_lang,
                    "target_lang": target_lang,
                    "tone": tone
                })
                
                # Limit history size
                if len(st.session_state.translation_history) > 10:
                    st.session_state.translation_history = st.session_state.translation_history[:10]
                
                # Text-to-speech section
                st.subheader("Text-to-Speech")
                voices = get_voices()
                if voices:
                    voice_options = {v['name']: v['voice_id'] for v in voices}
                    selected_voice = st.selectbox(
                        "Select Voice",
                        options=list(voice_options.keys()),
                        format_func=lambda x: x
                    )
                    
                    if st.button("Generate Speech"):
                        with st.spinner("Generating speech..."):
                            audio_data = text_to_speech(
                                result["translatedText"],
                                voice_options[selected_voice]
                            )
                            
                            if audio_data:
                                st.audio(audio_data, format="audio/mp3")
                                
                                # Download button
                                st.download_button(
                                    label="Download Audio",
                                    data=audio_data,
                                    file_name="translation.mp3",
                                    mime="audio/mp3"
                                )

def show_history():
    """Display translation history"""
    if st.session_state.translation_history:
        st.sidebar.title("History")
        for i, item in enumerate(st.session_state.translation_history):
            with st.sidebar.expander(f"{item['source_lang'].upper()} → {item['target_lang'].upper()} - {item['tone'].capitalize()}"):
                st.write(f"**Original ({item['source_lang']}):** {item['source_text']}")
                st.write(f"**Translation ({item['target_lang']}):** {item['translated_text']}")
                
                if st.button(f"Delete #{i+1}", key=f"delete_{i}"):
                    del st.session_state.translation_history[i]
                    st.rerun()

# Main app
show_translation_ui()
show_history()

# Add some styling
st.markdown("""
<style>
    .stTextArea>div>div>textarea {
        font-size: 16px !important;
    }
    .stButton>button {
        width: 100%;
    }
    .stSelectbox, .stSlider {
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Instructions
with st.expander("How to use"):
    st.markdown("""
    1. Select source and target languages
    2. Choose a tone for the translation
    3. Enter your text and click 'Translate'
    4. Use the Text-to-Speech feature to hear the translation
    
    **Note:** Make sure your backend server is running on port 3001
    """)
