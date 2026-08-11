import os
import sys
import json
import argparse
from app.services.model_service import model_service_instance
from config import SUPPORTED_IMAGE_MODALITY, CLINICAL_DISCLAIMER

def run_predict_cli(image_path: str):
    """
    Executes CLI inference and authentic Grad-CAM for a single X-ray image file.
    Refuses prediction if model is not trained.
    """
    if not os.path.exists(image_path):
        print(f"Error: Input image file '{image_path}' not found.")
        sys.exit(1)

    if not model_service_instance.is_trained():
        print("\nError: Prediction refused.")
        print("The SmileGuard AI model is NOT trained yet.")
        print("To train the model on a real dataset, run:")
        print("  python backend/train.py --dataset backend/dataset/\n")
        sys.exit(1)

    with open(image_path, 'rb') as f:
        image_bytes = f.read()

    try:
        res = model_service_instance.predict_xray(image_bytes)

        print("\n================ PREDICTION RESULT ================")
        print(f"Image File:         {image_path}")
        print(f"Modality:           {res['imageType']}")
        print(f"Model Output:       {res['prediction']}")
        print(f"Confidence Score:   {res['confidence']:.2f}%")
        print(f"Model Version:      {res['modelVersion']}")
        print(f"Grad-CAM Heatmap:   Generated ({len(res['heatmap'])} bytes base64)")
        print(f"Grad-CAM Overlay:   Generated ({len(res['overlay'])} bytes base64)")
        print(f"Disclaimer:         {res['disclaimer']}")
        print("===================================================\n")
    except Exception as e:
        print(f"\nInference Failed: {str(e)}\n")
        sys.exit(1)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="CLI inference & Grad-CAM visual explainability for SmileGuard AI.")
    parser.add_argument("--image", type=str, required=True, help="Path to input dental X-ray image.")
    args = parser.parse_args()
    run_predict_cli(args.image)
