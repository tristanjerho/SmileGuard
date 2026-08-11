from datetime import datetime

def format_xray_document(patient_id: str, uploaded_by: str, image_url: str, image_type: str = "Dental X-ray"):
    return {
        "patientId": patient_id,
        "uploadedBy": uploaded_by,
        "imageUrl": image_url,
        "uploadedAt": datetime.now().isoformat(),
        "analysisStatus": "Analyzed",
        "imageType": image_type
    }

def format_prediction_document(patient_id: str, xray_id: str, prediction: str, confidence: float, heatmap_url: str, overlay_url: str, model_version: str):
    return {
        "patientId": patient_id,
        "xrayId": xray_id,
        "prediction": prediction,
        "confidence": confidence,
        "heatmapUrl": heatmap_url,
        "overlayUrl": overlay_url,
        "modelVersion": model_version,
        "createdAt": datetime.now().isoformat()
    }

def format_dentist_review_document(patient_id: str, xray_id: str, prediction_id: str, dentist_id: str, clinical_interpretation: str, final_decision: str, notes: str = ""):
    return {
        "patientId": patient_id,
        "xrayId": xray_id,
        "predictionId": prediction_id,
        "dentistId": dentist_id,
        "reviewed": True,
        "clinicalInterpretation": clinical_interpretation,
        "finalDecision": final_decision,
        "notes": notes,
        "reviewedAt": datetime.now().isoformat()
    }
