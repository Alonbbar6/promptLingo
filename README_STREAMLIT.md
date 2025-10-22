# PromptLingo - Streamlit Interface

This is the Streamlit interface for PromptLingo, providing a user-friendly web interface for the translation and text-to-speech functionality.

## 🚀 Quick Start

### Prerequisites

1. Python 3.8+
2. Node.js (for the backend server)
3. Required Python packages (install using `requirements.txt`)

### Installation

1. **Set up the backend server**:
   ```bash
   # Navigate to the server directory
   cd server
   
   # Install dependencies
   npm install
   
   # Start the server (in a separate terminal)
   npm start
   ```

2. **Set up the Python environment**:
   ```bash
   # Create a virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the project root with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

### Running the Application

1. Start the Streamlit app:
   ```bash
   streamlit run streamlit_app.py
   ```

2. Open your browser to `http://localhost:8501`

## 🌟 Features

- **Multi-language Translation**: Translate between English, Spanish, and Haitian Creole
- **Tone Control**: Adjust the tone of translations (casual, neutral, professional, formal, medical)
- **Text-to-Speech**: Convert translated text to natural-sounding speech
- **Translation History**: View and manage your recent translations
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Project Structure

- `streamlit_app.py`: Main Streamlit application
- `requirements.txt`: Python dependencies
- `server/`: Node.js backend server (handles translation and TTS)
- `client/`: React frontend (alternative to Streamlit)

## 🔧 Troubleshooting

- **Backend not running**: Make sure the Node.js server is running on port 3001
- **Missing API keys**: Verify your `.env` file contains all required API keys
- **Audio not playing**: Check browser console for errors and ensure your browser supports Web Audio API

## 📚 Documentation

For more information, refer to the main [README.md](README.md) file.
