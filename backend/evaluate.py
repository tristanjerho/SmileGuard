import os
import sys
import json
# pyrefly: ignore [missing-import]
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from config import (
    MODEL_PATH,
    CLASS_NAMES_PATH,
    METADATA_PATH,
    CLASSIFICATION_REPORT_PATH,
    EVALUATION_METRICS_PATH,
    INPUT_SHAPE
)

def evaluate_model(test_dataset_dir: str):
    """
    Evaluates the trained SmileGuard AI EfficientNetB0 model on a real test dataset.
    Generates authentic performance metrics including Accuracy, Precision, Recall, F1, Confusion Matrix,
    Classification Report, and Sensitivity/Specificity for binary classification.
    """
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file not found at '{MODEL_PATH}'. Please train the model using train.py first.")
        sys.exit(1)

    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"Error: Class mapping not found at '{CLASS_NAMES_PATH}'.")
        sys.exit(1)

    if not os.path.exists(METADATA_PATH):
        print(f"Error: Model metadata file not found at '{METADATA_PATH}'.")
        sys.exit(1)

    with open(METADATA_PATH, 'r') as f:
        meta = json.load(f)
        if meta.get("trainingStatus") != "trained":
            print(f"Error: Model metadata indicates model is not trained ({meta.get('trainingStatus')}).")
            sys.exit(1)

    if not os.path.exists(test_dataset_dir):
        print(f"Error: Test dataset directory '{test_dataset_dir}' does not exist.")
        sys.exit(1)

    print(f"Loading trained Keras model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)

    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = json.load(f)

    num_classes = len(class_names)
    print(f"Loaded class mapping ({num_classes} classes): {class_names}")

    print(f"Loading test set images from '{test_dataset_dir}'...")
    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dataset_dir,
        image_size=(INPUT_SHAPE[0], INPUT_SHAPE[1]),
        batch_size=32,
        shuffle=False
    )

    y_true = []
    y_pred = []

    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        if num_classes == 2 and preds.shape[-1] == 1:
            # Binary classification
            preds_binary = (preds > 0.5).astype(int).flatten()
            y_pred.extend(preds_binary)
        else:
            # Multiclass classification
            y_pred.extend(np.argmax(preds, axis=1))
        y_true.extend(labels.numpy().flatten())

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    acc = accuracy_score(y_true, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_true, y_pred)

    print("\n================ AUTHENTIC MODEL EVALUATION ================")
    print(f"Test Set Directory:  {os.path.abspath(test_dataset_dir)}")
    print(f"Evaluated Samples:   {len(y_true)}")
    print(f"Accuracy:            {acc * 100:.2f}%")
    print(f"Precision (Weighted):{prec:.4f}")
    print(f"Recall (Weighted):   {rec:.4f}")
    print(f"F1-Score (Weighted): {f1:.4f}")
    print("\nConfusion Matrix:")
    print(cm)

    # Additional Binary Metrics
    binary_metrics = {}
    if num_classes == 2 and cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        binary_metrics = {
            "sensitivity": round(float(sensitivity), 4),
            "specificity": round(float(specificity), 4)
        }
        print(f"\nBinary Classification Specific Metrics:")
        print(f"Sensitivity (TPR):   {sensitivity:.4f}")
        print(f"Specificity (TNR):   {specificity:.4f}")

    unique_labels = np.unique(y_true)
    target_names = [class_names[i] for i in unique_labels if i < len(class_names)]

    report_str = classification_report(y_true, y_pred, target_names=target_names, zero_division=0)
    print("\nClassification Report:")
    print(report_str)
    print("============================================================\n")

    # Save outputs
    with open(CLASSIFICATION_REPORT_PATH, 'w') as f:
        f.write(f"SmileGuard AI Model Classification Report\n\n{report_str}")

    results = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1Score": round(float(f1), 4),
        "confusionMatrix": cm.tolist(),
        "binaryMetrics": binary_metrics
    }

    with open(EVALUATION_METRICS_PATH, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"Classification report saved to: {CLASSIFICATION_REPORT_PATH}")
    print(f"Evaluation metrics JSON saved to: {EVALUATION_METRICS_PATH}")

if __name__ == '__main__':
    import argparse
    from config import BASE_DIR
    default_test_dir = os.path.join(BASE_DIR, "dataset_clean", "test")
    parser = argparse.ArgumentParser(description="Evaluate SmileGuard AI EfficientNetB0 model performance.")
    parser.add_argument("--test_dir", type=str, default=default_test_dir, help="Path to real test dataset directory.")
    args = parser.parse_args()
    evaluate_model(args.test_dir)
