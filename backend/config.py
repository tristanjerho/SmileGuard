from pathlib import Path
import os

# Base directory using pathlib (independent of execution CWD)
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATASET_DIR = BASE_DIR / "dataset"

MODEL_PATH = MODELS_DIR / "smileguard_model.keras"
CLASS_NAMES_PATH = MODELS_DIR / "class_names.json"
METADATA_PATH = MODELS_DIR / "model_metadata.json"
CLASSIFICATION_REPORT_PATH = MODELS_DIR / "classification_report.txt"
EVALUATION_METRICS_PATH = MODELS_DIR / "evaluation_results.json"
TRAINING_HISTORY_PLOT_PATH = MODELS_DIR / "training_history.png"
CONFUSION_MATRIX_PLOT_PATH = MODELS_DIR / "confusion_matrix.png"

IMAGE_SIZE = (224, 224)
INPUT_SHAPE = (224, 224, 3)

SUPPORTED_IMAGE_MODALITY = "Dental X-ray"
MODEL_VERSION = "1.0.0"
MODEL_ARCHITECTURE = "EfficientNetB0 Transfer Learning"

# Configurable CORS origins (defaults to local dev ports & wildcards if not set)
raw_cors = os.getenv("ALLOWED_ORIGINS", "")
if not raw_cors.strip() or raw_cors.strip() == "*":
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
    if "http://localhost:5173" not in CORS_ORIGINS:
        CORS_ORIGINS.append("http://localhost:5173")
    if "http://localhost:8000" not in CORS_ORIGINS:
        CORS_ORIGINS.append("http://localhost:8000")

CLINICAL_DISCLAIMER = (
    "AI-assisted analysis only. Final interpretation and clinical decisions remain with the dentist."
)
