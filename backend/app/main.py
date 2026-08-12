import sys
import os

# Ensure backend root directory is in sys.path for module resolution
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.prediction import router as prediction_router
from config import CLINICAL_DISCLAIMER

app = FastAPI(
    title="SmileGuard AI - Clinical Decision Support Backend",
    description=f"AI-assisted dental image analysis API. {CLINICAL_DISCLAIMER}",
    version="1.0.0"
)

# Enable CORS for Vite / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(prediction_router, prefix="/api", tags=["Clinical Decision Support"])

@app.get("/")
def read_root():
    return {
        "system": "SmileGuard AI",
        "role": "Clinical Decision Support System API",
        "disclaimer": CLINICAL_DISCLAIMER,
        "docs": "/docs"
    }
