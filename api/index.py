import sys
import os

# Add backend directory to sys.path for Vercel Serverless Function module resolution
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(os.path.dirname(current_dir), "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Vercel entrypoint handler
app = app
