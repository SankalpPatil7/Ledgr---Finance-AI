import subprocess
import sys
import os
import webbrowser
import time

def main():
    print("=" * 60)
    print("      LEDGR — AI-POWERED FINANCE CONTROLLER & AUDITOR")
    print("=" * 60)
    print("Starting FastAPI Backend + Integrated FinTech Dashboard...")
    
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    
    # Run uvicorn server
    cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    
    print(f"Backend Server launching at: http://127.0.0.1:8000")
    print(f"API Docs available at:      http://127.0.0.1:8000/docs")
    print(f"Interactive UI at:          http://127.0.0.1:8000")
    print("=" * 60)
    
    try:
        subprocess.run(cmd, cwd=backend_dir)
    except KeyboardInterrupt:
        print("\nStopping LEDGR server. Goodbye!")

if __name__ == "__main__":
    main()
