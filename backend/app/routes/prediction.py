from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.preprocessing import validate_image_format
from app.services.model_service import model_service_instance
from app.services.firebase_service import format_dentist_review_document
from config import CLINICAL_DISCLAIMER

router = APIRouter()

class ReviewRequest(BaseModel):
    patientId: str
    xrayId: Optional[str] = "XRAY_TEMP"
    predictionId: Optional[str] = "PRED_TEMP"
    dentistId: Optional[str] = "DR_ANA_SANTOS"
    clinicalInterpretation: str
    finalDecision: str
    notes: Optional[str] = ""

@router.get("/health")
def get_health():
    is_loaded = model_service_instance.is_trained() and model_service_instance.model is not None
    classes = model_service_instance.class_names if is_loaded and model_service_instance.class_names else [
        "Dental Caries",
        "Impacted Teeth",
        "Infection"
    ]
    return {
        "status": "ok",
        "model_loaded": is_loaded,
        "classes": classes,
        "service": "SmileGuard AI Clinical Backend",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/model-info")
def get_model_info():
    """
    Returns authentic model metadata and training status.
    """
    return model_service_instance.get_model_info()

@router.post("/predict")
async def predict_dental_xray(file: UploadFile = File(...)):
    """
    Processes uploaded dental X-ray using trained EfficientNetB0 and generates Grad-CAM overlay.
    1. Validates file format, size, dimensions, and radiological X-ray modality (rejects color photos).
    2. Enforces model-not-trained protection if the CNN is un-trained.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided.")

    image_bytes = await file.read()

    # Step 1: Image Validation (Format, Size, Resolution, Modality)
    validate_image_format(file.filename or "xray.png", image_bytes)

    # Step 2: Model Training Status Verification
    if not model_service_instance.is_trained():
        raise HTTPException(
            status_code=400,
            detail="Prediction refused: Model is not trained. Model weights, class mapping, or metadata are missing. Please run backend/train.py with a valid dataset first."
        )

    try:
        result = model_service_instance.predict_xray(image_bytes)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@router.post("/review")
def record_dentist_review(review: ReviewRequest):
    if not review.clinicalInterpretation.strip() or not review.finalDecision.strip():
        raise HTTPException(status_code=400, detail="Clinical interpretation and final decision are required.")

    review_doc = format_dentist_review_document(
        patient_id=review.patientId,
        xray_id=review.xrayId or "XRAY_TEMP",
        prediction_id=review.predictionId or "PRED_TEMP",
        dentist_id=review.dentistId or "DR_ANA_SANTOS",
        clinical_interpretation=review.clinicalInterpretation,
        final_decision=review.finalDecision,
        notes=review.notes or ""
    )

    return {
        "status": "success",
        "message": "Dentist review formatted and ready for Firestore synchronization.",
        "reviewDocument": review_doc
    }
