import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

MODEL_PATH = os.path.join(MODELS_DIR, "smileguard_model.keras")
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, "class_names.json")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")
CLASSIFICATION_REPORT_PATH = os.path.join(MODELS_DIR, "classification_report.txt")
EVALUATION_METRICS_PATH = os.path.join(MODELS_DIR, "evaluation_results.json")
TRAINING_HISTORY_PLOT_PATH = os.path.join(MODELS_DIR, "training_history.png")
CONFUSION_MATRIX_PLOT_PATH = os.path.join(MODELS_DIR, "confusion_matrix.png")


IMAGE_SIZE = (224, 224)
INPUT_SHAPE = (224, 224, 3)

SUPPORTED_IMAGE_MODALITY = "Dental X-ray"
MODEL_VERSION = "1.0.0"
MODEL_ARCHITECTURE = "EfficientNetB0 Transfer Learning"

CLINICAL_DISCLAIMER = (
    "AI-assisted analysis only. Final interpretation and clinical decisions remain with the dentist."
)
