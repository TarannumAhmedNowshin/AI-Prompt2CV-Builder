#!/usr/bin/env python3
"""
Startup script for CV Builder backend
"""
import subprocess
import sys
import os

def print_header(text):
    print("\n" + "="*50)
    print(f"  {text}")
    print("="*50 + "\n")

def check_python_version():
    """Check if Python version is 3.8+"""
    print_header("Checking Python Version")
    version = sys.version_info
    print(f"Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ ERROR: Python 3.8+ is required")
        sys.exit(1)
    print("✅ Python version is compatible")

def install_dependencies():
    """Install required dependencies"""
    print_header("Installing Dependencies")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ ERROR: Failed to install dependencies")
        sys.exit(1)

def start_server():
    """Start the FastAPI server"""
    print_header("Starting CV Builder Backend")
    print("Server will be available at:")
    print("  - API: http://localhost:8000")
    print("  - Docs: http://localhost:8000/docs")
    print("  - ReDoc: http://localhost:8000/redoc")
    print("\nPress Ctrl+C to stop the server")
    print("="*50 + "\n")
    
    try:
        subprocess.run([sys.executable, "-m", "backend.main"])
    except KeyboardInterrupt:
        print("\n\n✅ Server stopped successfully")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("\n" + "🚀 "*15)
    print("      CV BUILDER - Backend Startup")
    print("🚀 "*15)
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run startup sequence
    check_python_version()
    
    # Ask user if they want to install dependencies
    install = input("\nInstall/Update dependencies? (y/n): ").lower().strip()
    if install in ['y', 'yes', '']:
        install_dependencies()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
