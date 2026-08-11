import os
import sys
import json
import argparse
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from PIL import Image
from datetime import datetime
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, Input, RandomFlip, RandomRotation, RandomZoom, RandomTranslation, RandomContrast
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score

from config import (
    BASE_DIR,
    MODELS_DIR,
    MODEL_PATH,
    CLASS_NAMES_PATH,
    METADATA_PATH,
    CLASSIFICATION_REPORT_PATH,
    EVALUATION_METRICS_PATH,
    TRAINING_HISTORY_PLOT_PATH,
    CONFUSION_MATRIX_PLOT_PATH,
    INPUT_SHAPE,
    MODEL_VERSION,
    MODEL_ARCHITECTURE,
    CLINICAL_DISCLAIMER
)

SUPPORTED_EXTS = {'.png', '.jpg', '.jpeg', '.bmp', '.webp', '.tif', '.tiff'}

def save_training_history_plot(history, output_path):
    """
    Plots and saves training & validation loss and accuracy curves.
    """
    try:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        if 'accuracy' in history.history:
            ax1.plot(history.history['accuracy'], label='Train Accuracy')
        if 'val_accuracy' in history.history:
            ax1.plot(history.history['val_accuracy'], label='Val Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        
        if 'loss' in history.history:
            ax2.plot(history.history['loss'], label='Train Loss')
        if 'val_loss' in history.history:
            ax2.plot(history.history['val_loss'], label='Val Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300)
        plt.close()
        print(f"Saved training history plot to: {output_path}")
    except Exception as e:
        print(f"Warning: Failed to save training history plot: {e}")

def save_confusion_matrix_plot(cm, class_names, output_path):
    """
    Generates and saves visual confusion matrix plot.
    """
    try:
        fig, ax = plt.subplots(figsize=(8, 6))
        im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
        ax.figure.colorbar(im, ax=ax)
        
        display_names = class_names[:cm.shape[0]]
        ax.set(
            xticks=np.arange(cm.shape[1]),
            yticks=np.arange(cm.shape[0]),
            xticklabels=display_names,
            yticklabels=display_names,
            title='Confusion Matrix',
            ylabel='True Label',
            xlabel='Predicted Label'
        )
        
        plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")
        
        fmt = 'd'
        thresh = cm.max() / 2. if cm.max() > 0 else 1.
        for i in range(cm.shape[0]):
            for j in range(cm.shape[1]):
                ax.text(j, i, format(cm[i, j], fmt),
                        ha="center", va="center",
                        color="white" if cm[i, j] > thresh else "black")
                        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300)
        plt.close()
        print(f"Saved confusion matrix plot to: {output_path}")
    except Exception as e:
        print(f"Warning: Failed to save confusion matrix plot: {e}")

def validate_and_scan_dataset(dataset_dir: str):
    """
    Validates dataset integrity, checks for missing/empty folders, corrupt images,
    unsupported extensions, and severe class imbalance. Discovers class names dynamically.
    """
    if not os.path.exists(dataset_dir):
        raise ValueError(f"Dataset directory '{dataset_dir}' does not exist.")

    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")
    if not os.path.exists(val_dir):
        val_dir = os.path.join(dataset_dir, "validation")
    test_dir = os.path.join(dataset_dir, "test")

    is_presplit = os.path.exists(train_dir) and os.path.isdir(train_dir)
    scan_base = train_dir if is_presplit else dataset_dir

    classes = [
        d for d in sorted(os.listdir(scan_base))
        if os.path.isdir(os.path.join(scan_base, d)) and not d.startswith('.')
    ]

    if len(classes) < 2:
        raise ValueError(
            f"Invalid dataset: Discovered {len(classes)} class folder(s) in '{scan_base}'. "
            "At least 2 legitimate class subdirectories are required."
        )

    corrupt_files = []
    unsupported_files = []

    def scan_folder(folder_path):
        valid_files = []
        if not os.path.exists(folder_path):
            return valid_files
        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.startswith('.'):
                    continue
                ext = os.path.splitext(file)[1].lower()
                filepath = os.path.join(root, file)
                if ext not in SUPPORTED_EXTS:
                    unsupported_files.append(filepath)
                    continue
                try:
                    with Image.open(filepath) as img:
                        img.verify()
                    valid_files.append(filepath)
                except Exception:
                    corrupt_files.append(filepath)
        return valid_files

    class_counts = {}
    if is_presplit:
        train_count, val_count, test_count = 0, 0, 0
        for c in classes:
            c_tr = scan_folder(os.path.join(train_dir, c))
            c_va = scan_folder(os.path.join(val_dir, c)) if os.path.exists(val_dir) else []
            c_te = scan_folder(os.path.join(test_dir, c)) if os.path.exists(test_dir) else []
            train_count += len(c_tr)
            val_count += len(c_va)
            test_count += len(c_te)
            class_counts[c] = len(c_tr) + len(c_va) + len(c_te)
    else:
        for c in classes:
            c_files = scan_folder(os.path.join(dataset_dir, c))
            class_counts[c] = len(c_files)
        total = sum(class_counts.values())
        train_count = int(total * 0.70)
        val_count = int(total * 0.15)
        test_count = total - train_count - val_count

    print("\n================ DATASET VALIDATION REPORT ================")
    print(f"Dataset Path:             {os.path.abspath(dataset_dir)}")
    print(f"Pre-split Directory:      {is_presplit}")
    print(f"Number of Discovered Classes: {len(classes)}")
    print(f"Class Names:              {classes}")
    print(f"Training Image Count:     {train_count}")
    print(f"Validation Image Count:   {val_count}")
    print(f"Test Image Count:         {test_count}")
    print(f"Total Valid Images:       {sum(class_counts.values())}")
    print("Images per Class Breakdown:")
    for c, count in class_counts.items():
        print(f"  - {c}: {count} image(s)")

    if corrupt_files:
        print(f"WARNING: Found {len(corrupt_files)} corrupt/unreadable image file(s).")
    if unsupported_files:
        print(f"WARNING: Found {len(unsupported_files)} unsupported image file format(s).")

    empty_classes = [c for c, count in class_counts.items() if count == 0]
    if empty_classes:
        raise ValueError(f"Invalid dataset: Class folders have 0 images: {empty_classes}")

    counts = list(class_counts.values())
    if min(counts) > 0 and (max(counts) / min(counts)) > 5.0:
        print(f"WARNING: Severe class imbalance detected (ratio: {max(counts)/min(counts):.2f}).")

    if sum(class_counts.values()) < 10:
        raise ValueError("Invalid dataset: Fewer than 10 total valid images. Cannot proceed with training.")

    print("===========================================================\n")

    return {
        "classes": classes,
        "is_presplit": is_presplit,
        "train_dir": train_dir if is_presplit else dataset_dir,
        "val_dir": val_dir if (is_presplit and os.path.exists(val_dir)) else None,
        "test_dir": test_dir if (is_presplit and os.path.exists(test_dir)) else None,
        "class_counts": class_counts,
        "num_train": train_count,
        "num_val": val_count,
        "num_test": test_count
    }

def get_data_augmentation():
    """
    Returns data augmentation pipeline for dental X-ray images.
    """
    return tf.keras.Sequential([
        RandomFlip("horizontal"),
        RandomRotation(0.08),
        RandomZoom(0.08),
        RandomTranslation(0.05, 0.05),
        RandomContrast(0.1)
    ], name="data_augmentation")

def build_model(num_classes: int):
    """
    Builds EfficientNetB0 Transfer Learning Model with dynamic classification head.
    """
    inputs = Input(shape=INPUT_SHAPE, name="xray_input")
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)

    base_model = EfficientNetB0(
        weights="imagenet",
        include_top=False,
        input_tensor=x
    )
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = Dense(256, activation="relu", name="fc1")(x)
    x = Dropout(0.4, name="dropout")(x)

    if num_classes == 2:
        outputs = Dense(1, activation="sigmoid", name="predictions")(x)
        loss = "binary_crossentropy"
        metrics = ["accuracy"]
    else:
        outputs = Dense(num_classes, activation="softmax", name="predictions")(x)
        loss = "sparse_categorical_crossentropy"
        metrics = ["accuracy"]

    model = Model(inputs=inputs, outputs=outputs, name="SmileGuard_EfficientNetB0")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=loss,
        metrics=metrics
    )
    return model, base_model

def load_datasets(dataset_info: dict, batch_size: int = 32):
    """
    Loads training, validation, and test datasets.
    """
    if dataset_info["is_presplit"]:
        train_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_info["train_dir"],
            image_size=(INPUT_SHAPE[0], INPUT_SHAPE[1]),
            batch_size=batch_size,
            shuffle=True
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_info["val_dir"],
            image_size=(INPUT_SHAPE[0], INPUT_SHAPE[1]),
            batch_size=batch_size,
            shuffle=False
        ) if dataset_info["val_dir"] else None

        test_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_info["test_dir"],
            image_size=(INPUT_SHAPE[0], INPUT_SHAPE[1]),
            batch_size=batch_size,
            shuffle=False
        ) if dataset_info["test_dir"] else None
    else:
        dataset_dir = dataset_info["train_dir"]
        train_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_dir,
            validation_split=0.3,
            subset="training",
            seed=42,
            image_size=(INPUT_SHAPE[0], INPUT_SHAPE[1]),
            batch_size=batch_size
        )
        val_test_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_dir,
            validation_split=0.3,
            subset="validation",
            seed=42,
            image_size=(INPUT_SHAPE[0], INPUT_SHAPE[1]),
            batch_size=batch_size
        )
        val_batches = tf.data.experimental.cardinality(val_test_ds)
        val_ds = val_test_ds.take(val_batches // 2)
        test_ds = val_test_ds.skip(val_batches // 2)

    return train_ds, val_ds, test_ds

def train_model(dataset_dir: str, epochs: int = 15, fine_tune: bool = False, fine_tune_epochs: int = 10):
    """
    Executes training pipeline on real clean dataset with training-only class weighting.
    """
    os.makedirs(MODELS_DIR, exist_ok=True)
    info = validate_and_scan_dataset(dataset_dir)
    classes = info["classes"]
    num_classes = len(classes)

    # 1. Count samples per class in training, validation, and test splits
    train_dir = info["train_dir"]
    val_dir = info["val_dir"]
    test_dir = info["test_dir"]

    train_class_counts = {}
    val_class_counts = {}
    test_class_counts = {}

    for c in classes:
        tr_c_dir = os.path.join(train_dir, c)
        train_class_counts[c] = len([f for f in os.listdir(tr_c_dir) if os.path.splitext(f)[1].lower() in SUPPORTED_EXTS]) if os.path.exists(tr_c_dir) else 0

        if val_dir:
            va_c_dir = os.path.join(val_dir, c)
            val_class_counts[c] = len([f for f in os.listdir(va_c_dir) if os.path.splitext(f)[1].lower() in SUPPORTED_EXTS]) if os.path.exists(va_c_dir) else 0

        if test_dir:
            te_c_dir = os.path.join(test_dir, c)
            test_class_counts[c] = len([f for f in os.listdir(te_c_dir) if os.path.splitext(f)[1].lower() in SUPPORTED_EXTS]) if os.path.exists(te_c_dir) else 0

    total_train_samples = sum(train_class_counts.values())

    # 2. Calculate class weights STRICTLY from the training set ONLY
    class_weight_dict = {}
    for idx, c in enumerate(classes):
        n_samples = train_class_counts[c]
        if n_samples > 0:
            weight = total_train_samples / (num_classes * n_samples)
        else:
            weight = 1.0
        class_weight_dict[idx] = round(float(weight), 4)

    # Print Pre-Training Statistics as mandated
    print("\n==================================================")
    print("         PRE-TRAINING DATASET & WEIGHTS          ")
    print("==================================================")
    print("Training samples per class:")
    for c, cnt in train_class_counts.items():
        print(f"  - {c}: {cnt}")
    print("\nCalculated Class Weights (Training Set Only):")
    for idx, c in enumerate(classes):
        print(f"  - Class {idx} ({c}): {class_weight_dict[idx]:.4f}")
    print("\nValidation samples per class:")
    for c, cnt in val_class_counts.items():
        print(f"  - {c}: {cnt}")
    print("\nTest samples per class:")
    for c, cnt in test_class_counts.items():
        print(f"  - {c}: {cnt}")
    print("==================================================\n")

    print(f"Initializing EfficientNetB0 for {num_classes} discovered classes...")
    model, base_model = build_model(num_classes)
    train_ds, val_ds, test_ds = load_datasets(info)

    aug = get_data_augmentation()
    train_ds = train_ds.map(lambda x, y: (aug(x, training=True), y))

    callbacks = [
        EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-6),
        ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor='val_loss')
    ]

    print("\n--- Phase 1: Training Classification Head (Backbone Frozen) ---")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
        class_weight=class_weight_dict
    )

    if fine_tune:
        print("\n--- Phase 2: Fine-Tuning Top Backbone Layers ---")
        base_model.trainable = True
        for layer in base_model.layers[:-30]:
            layer.trainable = False

        loss = "binary_crossentropy" if num_classes == 2 else "sparse_categorical_crossentropy"
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
            loss=loss,
            metrics=["accuracy"]
        )
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=fine_tune_epochs,
            callbacks=callbacks,
            class_weight=class_weight_dict
        )

    # Save training history plot
    save_training_history_plot(history, TRAINING_HISTORY_PLOT_PATH)

    # Save final model and class mapping
    model.save(MODEL_PATH)
    with open(CLASS_NAMES_PATH, 'w') as f:
        json.dump(classes, f, indent=2)

    # Perform evaluation on held-out test set ONLY
    metrics_res = {}
    if test_ds:
        print("\n--- Running Post-Training Held-Out Test Set Evaluation ---")
        y_true, y_pred = [], []
        for imgs, lbls in test_ds:
            preds = model.predict(imgs, verbose=0)
            if num_classes == 2:
                preds_binary = (preds > 0.5).astype(int).flatten()
                y_pred.extend(preds_binary)
            else:
                y_pred.extend(np.argmax(preds, axis=1))
            y_true.extend(lbls.numpy().flatten())

        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        acc = accuracy_score(y_true, y_pred)
        prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_true, y_pred, labels=list(range(num_classes)))

        # Per-class metrics calculation
        prec_per_class, rec_per_class, f1_per_class, support_per_class = precision_recall_fscore_support(
            y_true, y_pred, labels=list(range(num_classes)), average=None, zero_division=0
        )

        per_class_metrics = {}
        for idx, cname in enumerate(classes):
            per_class_metrics[cname] = {
                "precision": round(float(prec_per_class[idx]), 4),
                "recall": round(float(rec_per_class[idx]), 4),
                "f1Score": round(float(f1_per_class[idx]), 4),
                "testSupport": int(support_per_class[idx])
            }

        # Save confusion matrix plot
        save_confusion_matrix_plot(cm, classes, CONFUSION_MATRIX_PLOT_PATH)

        dataset_limitation_notice = (
            "DATASET LIMITATION: The 'Infection' class has only 4 training images and 1 test image. "
            "Model predictions serve strictly as Clinical Decision Support (CDS) for dentist review. "
            "No clinical-grade diagnostic performance is claimed."
        )

        metrics_res = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1Score": round(float(f1), 4),
            "perClassMetrics": per_class_metrics,
            "confusionMatrix": cm.tolist(),
            "datasetLimitation": dataset_limitation_notice
        }

        report_text = classification_report(y_true, y_pred, target_names=classes, labels=list(range(num_classes)), zero_division=0)
        with open(CLASSIFICATION_REPORT_PATH, 'w') as f:
            f.write(f"SmileGuard AI Model Classification Report\nDate: {datetime.now().isoformat()}\n\n")
            f.write(f"Dataset Limitation Notice:\n{dataset_limitation_notice}\n\n")
            f.write("Classification Report:\n")
            f.write(report_text)

        with open(EVALUATION_METRICS_PATH, 'w') as f:
            json.dump(metrics_res, f, indent=2)

        print("\n================ AUTHENTIC EVALUATION RESULTS ================")
        print(f"Test Accuracy:         {acc * 100:.2f}%")
        print(f"Weighted Precision:    {prec:.4f}")
        print(f"Weighted Recall:       {rec:.4f}")
        print(f"Weighted F1-Score:     {f1:.4f}")
        print("\nPer-Class Metrics:")
        for cname, pmetrics in per_class_metrics.items():
            print(f"  - {cname}: Precision={pmetrics['precision']:.4f}, Recall={pmetrics['recall']:.4f}, F1={pmetrics['f1Score']:.4f} (Support={pmetrics['testSupport']})")
        print("\nConfusion Matrix:")
        print(cm)
        print("\nClassification Report:")
        print(report_text)
        print(f"Notice: {dataset_limitation_notice}")
        print("==============================================================\n")

    # Write model metadata
    metadata = {
        "modelVersion": MODEL_VERSION,
        "architecture": MODEL_ARCHITECTURE,
        "inputSize": list(INPUT_SHAPE),
        "classes": classes,
        "numClasses": num_classes,
        "trainingStatus": "trained",
        "trainingDate": datetime.now().isoformat(),
        "datasetName": os.path.basename(os.path.abspath(dataset_dir)),
        "datasetVersion": "1.0",
        "numTrainingImages": info["num_train"],
        "numValidationImages": info["num_val"],
        "numTestImages": info["num_test"],
        "metrics": metrics_res,
        "limitation": dataset_limitation_notice if test_ds else "",
        "disclaimer": CLINICAL_DISCLAIMER
    }

    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"Training Complete!")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Class names saved to: {CLASS_NAMES_PATH}")
    print(f"Model metadata saved to: {METADATA_PATH}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train SmileGuard AI EfficientNetB0 model on real dental X-ray dataset.")
    parser.add_argument("--dataset", type=str, required=True, help="Path to real image dataset directory.")
    parser.add_argument("--epochs", type=int, default=15, help="Number of Phase 1 epochs.")
    parser.add_argument("--fine-tune", action="store_true", help="Enable Phase 2 fine-tuning.")
    parser.add_argument("--fine-tune-epochs", type=int, default=10, help="Number of Phase 2 fine-tuning epochs.")
    args = parser.parse_args()

    train_model(args.dataset, epochs=args.epochs, fine_tune=args.fine_tune, fine_tune_epochs=args.fine_tune_epochs)
