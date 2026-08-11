import sys
from pathlib import Path

# Ensure backend root directory is in sys.path for module resolution using pathlib
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.prediction import router as prediction_router
from config import CLINICAL_DISCLAIMER, CORS_ORIGINS

app = FastAPI(
    title="SmileGuard AI - Clinical Decision Support Backend",
    description=f"AI-assisted dental image analysis API. {CLINICAL_DISCLAIMER}",
    version="1.0.0"
)

# Enable CORS for Vite / React frontend with configurable origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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
