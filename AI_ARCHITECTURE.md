# SmileGuard AI: AI/ML System Architecture & Clinical Decision Support Specification

## 1. System Philosophy & Clinical Decision Support Framing
The CNN Image Assistant is strictly a **Clinical Decision Support (CDS) Tool**.
- **No Autonomous Diagnosis**: The system NEVER claims autonomous diagnosis or definitive disease detection.
- **Terminology**: All UI elements strictly use assistive language:
  - `"AI-assisted analysis"`
  - `"Model output"`
  - `"Potential area requiring review"`
  - `"AI attention visualization"`
  - `"Confidence score"`
- **Medical Disclaimer**:
  > *"This AI-assisted analysis is intended to support professional review and does not constitute a definitive diagnosis. Final interpretation and treatment decisions remain with the dentist."*

---

## 2. Model Architecture & Transfer Learning

```
Input Dental X-Ray (224x224x3)
         │
         ▼
Image Preprocessing & Validation
         │
         ▼
EfficientNetB0 Backbone (ImageNet Pre-trained)
         │
         ▼
GlobalAveragePooling2D Layer
         │
         ▼
Dense FC Layer (256 units, ReLU)
         │
         ▼
Dropout (0.4)
         │
         ▼
Softmax Layer (Disease Classes) ──► Model Prediction & Confidence Score
         │
         ▼
Grad-CAM Gradient Tape (top_conv) ──► Heatmap & Color Overlay
```

---

## 3. Supported Image Modality
- **Modality**: **Dental X-ray images ONLY** (Panoramic, Bitewing, Periapical).
- **Unsupported**: Intraoral photographs, facial photos, general medical images.

---

## 4. Grad-CAM Visual Explainability
- Extracts feature maps from the final convolutional layer (`top_conv` / `conv_head`).
- Computes gradients of top predicted class score with respect to feature maps using `tf.GradientTape()`.
- Multiplies weights with feature map activations and applies ReLU.
- Generates a JET colormap overlay on the original X-ray image.

---

## 5. Dataset Requirements & Training Pipeline
- **Dataset Structure**:
  ```
  dataset_clean/
      train/
          Dental Caries/
          Impacted Teeth/
          Infection/
      val/
          Dental Caries/
          Impacted Teeth/
          Infection/
      test/
          Dental Caries/
          Impacted Teeth/
          Infection/
  ```
- **Privacy Directive**: Private clinic patient records must NOT automatically become training data. Training data and clinical inference data remain strictly separated.

### Training & Evaluation Commands
```bash
# Model Training
py backend/train.py --dataset backend/dataset/

# Model Evaluation
py backend/evaluate.py --test_dir backend/dataset/test/
```

---

## 6. FastAPI Service Endpoints

| Endpoint | Method | Input | Output | Description |
|---|---|---|---|---|
| `/api/health` | GET | None | JSON | System health & status |
| `/api/model-info` | GET | None | JSON | Architecture, version, modality |
| `/api/predict` | POST | Image File | Prediction, Confidence, Heatmap, Overlay | Executes CNN inference & Grad-CAM |
| `/api/review` | POST | Review Payload | Firestore JSON | Formats dentist review record |
