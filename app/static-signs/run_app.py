#!/usr/bin/env python
"""
run_app.py - A unified script to run both frontend and backend for the Sign Language Recognition App

This script starts:
1. The Flask backend server on port 8000 (simple_server.py)
2. The React frontend using npm start

Usage:
    python run_app.py

Requirements:
    - Python 3.6+
    - Flask, TensorFlow and other backend dependencies (see requirements.txt)
    - Node.js and npm for the frontend
"""

import os
import sys
import subprocess
import time
import signal
import platform
import webbrowser
from threading import Thread

# Constants
BACKEND_PORT = 8000
FRONTEND_PORT = 8081
BACKEND_URL = f"http://localhost:{BACKEND_PORT}/health"
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

# Get the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

# Handle Ctrl+C gracefully
def signal_handler(sig, frame):
    print("\n🛑 Shutting down servers...")
    # Kill all Python and Node processes on Windows
    if platform.system() == "Windows":
        try:
            os.system("taskkill /f /im python.exe")
            os.system("taskkill /f /im node.exe")
        except Exception as e:
            print(f"Error shutting down processes: {e}")
    # On Unix-like systems
    else:
        try:
            os.system("pkill -f 'python.*simple_server.py'")
            os.system("pkill -f 'node.*npm start'")
        except Exception as e:
            print(f"Error shutting down processes: {e}")
    
    print("✅ Servers shut down. Goodbye!")
    sys.exit(0)

# Register the signal handler
signal.signal(signal.SIGINT, signal_handler)

def run_backend():
    """Run the Flask backend server"""
    print("🚀 Starting backend server...")
    try:
        # Get the path to simple_server.py
        backend_path = os.path.join(BASE_DIR, "simple_server.py")
        
        # Check if the file exists
        if not os.path.exists(backend_path):
            print(f"❌ ERROR: {backend_path} not found!")
            return False
        
        # Run the backend server
        if platform.system() == "Windows":
            subprocess.Popen(["python", backend_path], cwd=BASE_DIR)
        else:
            subprocess.Popen(["python3", backend_path], cwd=BASE_DIR)
        
        print(f"🔌 Backend server running on {BACKEND_URL}")
        return True
    except Exception as e:
        print(f"❌ ERROR starting backend: {str(e)}")
        return False

def run_frontend():
    """Run the React frontend using npm start"""
    print("🚀 Starting frontend server...")
    try:
        # Run npm start in the project root directory
        if platform.system() == "Windows":
            subprocess.Popen(["npm", "start"], cwd=PROJECT_DIR, shell=True)
        else:
            subprocess.Popen(["npm", "start"], cwd=PROJECT_DIR)
        
        print(f"🌐 Frontend should be running at {FRONTEND_URL}")
        return True
    except Exception as e:
        print(f"❌ ERROR starting frontend: {str(e)}")
        return False

def check_backend_health():
    """Check if the backend is healthy by pinging the health endpoint"""
    import time
    import urllib.request
    import json
    
    print("🔍 Checking backend health...")
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = urllib.request.urlopen(BACKEND_URL)
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data.get('model_loaded'):
                    print("✅ Backend is healthy and model is loaded!")
                else:
                    print("⚠️ Backend is running but model is NOT loaded.")
                return True
        except Exception:
            if attempt < max_attempts - 1:
                print(f"⏳ Waiting for backend to start (attempt {attempt+1}/{max_attempts})...")
                time.sleep(2)
            else:
                print("❌ Backend health check failed. Is the server running?")
                return False
    return False

def open_browser():
    """Open the frontend URL in the default browser"""
    print(f"🌐 Opening {FRONTEND_URL} in your browser...")
    webbrowser.open(FRONTEND_URL)

def main():
    """Main function to run both servers"""
    print("=" * 70)
    print("🖐️  Sign Language Recognition App Launcher")
    print("=" * 70)
    
    # Step 1: Start the backend
    if not run_backend():
        print("❌ Failed to start backend server.")
        return
    
    # Step 2: Wait for the backend to be ready
    time.sleep(5)  # Give backend time to start
    if not check_backend_health():
        print("⚠️ Backend health check failed, but continuing anyway...")
    
    # Step 3: Start the frontend
    if not run_frontend():
        print("❌ Failed to start frontend server.")
        return
    
    # Step 4: Wait for frontend to be ready
    time.sleep(5)  # Give frontend time to start
    
    # Step 5: Open the browser
    open_browser()
    
    print("\n" + "=" * 70)
    print("✅ App is now running! Press Ctrl+C to stop the servers.")
    print("=" * 70)
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main() 