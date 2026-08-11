import os
import json
import numpy as np
import tensorflow as tf
from datetime import datetime
from config import (
    MODEL_PATH,
    CLASS_NAMES_PATH,
    METADATA_PATH,
    MODEL_VERSION,
    MODEL_ARCHITECTURE,
    SUPPORTED_IMAGE_MODALITY,
    CLINICAL_DISCLAIMER
)
from app.services.preprocessing import preprocess_image
from app.services.gradcam import generate_gradcam

class ModelService:
    def __init__(self):
        self.model = None
        self.class_names = []
        self.metadata = None
        self.load_model()

    def is_trained(self) -> bool:
        """
        Validates whether a trained model, class mapping, and metadata genuinely exist.
        """
        if not os.path.exists(MODEL_PATH):
            return False
        if not os.path.exists(CLASS_NAMES_PATH):
            return False
        if not os.path.exists(METADATA_PATH):
            return False

        try:
            with open(METADATA_PATH, 'r') as f:
                meta = json.load(f)
                if meta.get("trainingStatus") != "trained":
                    return False
        except Exception:
            return False

        return True

    def load_model(self):
        """
        Loads the trained Keras model, class mapping, and metadata if training has occurred.
        """
        if self.is_trained():
            try:
                print(f"Loading trained EfficientNetB0 model from {MODEL_PATH}...")
                self.model = tf.keras.models.load_model(MODEL_PATH)

                with open(CLASS_NAMES_PATH, 'r') as f:
                    self.class_names = json.load(f)

                with open(METADATA_PATH, 'r') as f:
                    self.metadata = json.load(f)

                print(f"Model successfully loaded. Discovered classes ({len(self.class_names)}): {self.class_names}")
            except Exception as e:
                print(f"Error loading trained model: {e}")
                self.model = None
                self.class_names = []
                self.metadata = None
        else:
            print("Notice: Model is not trained yet. API will refuse predictions until training completes.")
            self.model = None
            self.class_names = []
            self.metadata = None

    def get_model_info(self):
        """
        Returns authentic model status and metadata.
        """
        if self.is_trained() and self.metadata:
            return {
                "trainingStatus": "trained",
                "architecture": self.metadata.get("architecture", MODEL_ARCHITECTURE),
                "modelVersion": self.metadata.get("modelVersion", MODEL_VERSION),
                "supportedModality": SUPPORTED_IMAGE_MODALITY,
                "inputSize": self.metadata.get("inputSize", [224, 224, 3]),
                "classes": self.class_names,
                "numClasses": len(self.class_names),
                "trainingDate": self.metadata.get("trainingDate"),
                "datasetName": self.metadata.get("datasetName"),
                "numTrainingImages": self.metadata.get("numTrainingImages", 0),
                "numValidationImages": self.metadata.get("numValidationImages", 0),
                "numTestImages": self.metadata.get("numTestImages", 0),
                "metrics": self.metadata.get("metrics"),
                "disclaimer": CLINICAL_DISCLAIMER
            }
        else:
            return {
                "trainingStatus": "not_trained",
                "architecture": MODEL_ARCHITECTURE,
                "modelVersion": MODEL_VERSION,
                "supportedModality": SUPPORTED_IMAGE_MODALITY,
                "classes": [],
                "numClasses": 0,
                "message": "Model is not trained. Please upload dataset to backend/dataset/ and execute python backend/train.py.",
                "disclaimer": CLINICAL_DISCLAIMER
            }

    def predict_xray(self, image_bytes: bytes):
        """
        Executes CNN inference & Grad-CAM visual explainability.
        Refuses prediction if model is not trained.
        No synthetic fallbacks or fake confidences are used.
        """
        if not self.is_trained() or self.model is None:
            raise ValueError(
                "Prediction refused: Model is not trained. Please upload a legitimate dataset "
                "to backend/dataset/ and execute python backend/train.py first."
            )

        input_tensor, orig_bgr = preprocess_image(image_bytes)

        preds = self.model.predict(input_tensor, verbose=0)

        # Check binary vs multiclass prediction head output
        if preds.shape[-1] == 1:
            # Binary classification with Sigmoid output
            prob = float(preds[0][0])
            top_idx = 1 if prob >= 0.5 else 0
            confidence = prob * 100.0 if top_idx == 1 else (1.0 - prob) * 100.0
        else:
            # Multiclass classification with Softmax output
            top_idx = int(np.argmax(preds[0]))
            confidence = float(preds[0][top_idx]) * 100.0

        if top_idx < len(self.class_names):
            predicted_class = self.class_names[top_idx]
        else:
            predicted_class = f"Class #{top_idx}"

        # Generate authentic Grad-CAM (raises error if gradient computation fails)
        heatmap_b64, overlay_b64 = generate_gradcam(self.model, input_tensor, orig_bgr, top_idx)

        timestamp = datetime.now().isoformat()

        raw_vector = [round(float(p), 6) for p in preds[0]]
        prob_dict = {
            self.class_names[i] if i < len(self.class_names) else f"Class_{i}": round(float(preds[0][i]), 6)
            for i in range(len(preds[0]))
        }

        return {
            "prediction": predicted_class,
            "confidence": round(confidence, 2),
            "rawVector": raw_vector,
            "probabilities": prob_dict,
            "heatmap": heatmap_b64,
            "overlay": overlay_b64,
            "modelVersion": MODEL_VERSION,
            "architecture": MODEL_ARCHITECTURE,
            "imageType": SUPPORTED_IMAGE_MODALITY,
            "timestamp": timestamp,
            "disclaimer": CLINICAL_DISCLAIMER
        }

model_service_instance = ModelService()
