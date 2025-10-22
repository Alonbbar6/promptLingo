# Python Development Files

This directory contains Python-related files that are used for local development and testing only.

## Files

- **`requirements.txt`** - Python dependencies for the Streamlit app
- **`streamlit_app.py`** - Streamlit-based testing interface

## Why are these files here?

These files have been moved from the root directory to prevent Netlify from detecting them during deployment. Netlify automatically attempts to install Python dependencies when it finds a `requirements.txt` file in the root, which causes build failures since this is primarily a React/Node.js application.

## Usage

If you need to run the Streamlit app locally:

1. Copy `requirements.txt` back to the root (temporarily):
   ```bash
   cp python-dev/requirements.txt .
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Streamlit app:
   ```bash
   streamlit run python-dev/streamlit_app.py
   ```

4. When done, remove the requirements.txt from root:
   ```bash
   rm requirements.txt
   ```

## Note

The main application (React frontend + Node.js backend) does not require these Python files for deployment.
