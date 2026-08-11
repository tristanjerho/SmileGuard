# SmileGuard AI — Production Deployment Guide

This guide details the steps to deploy the **SmileGuard AI** system using a production-ready decoupled architecture:

- **Frontend**: Vercel (React + Vite SPA + Firebase Client SDK)
- **Backend**: Render (FastAPI + Python 3.11 + TensorFlow EfficientNetB0 CNN + OpenCV Grad-CAM)
- **Database & Auth**: Firebase (Authentication, Firestore, Storage)

---

## 1. Production Architecture Overview

```
Browser (Dentist / Clinician)
       │
       ▼
Vercel React Frontend (https://smile-guard-ai.vercel.app)
       │
       ▼ HTTPS REST API Requests (/api/predict, /api/health)
       │
Render FastAPI Backend (https://smileguard-backend.onrender.com)
       │
       ├── EfficientNetB0 CNN Model (smileguard_model.keras)
       ├── Softmax Probability Computation
       └── Grad-CAM Visual Explainability (top_conv)
       │
       ▼ Clinical Finding JSON + Grad-CAM Heatmap Overlay
       │
React UI Presentation
       │
       ▼ Dentist Review & Final Decision
       │
Firebase Firestore Synchronization (dentalXrays, aiPredictions, dentistReviews)
```

---

## 2. Backend Deployment on Render

### Step A: Connect Repository to Render
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository (`tristanjerho/SmileGuard`).
4. Select the repository. Render will automatically detect `render.yaml`.

### Step B: Manual Web Service Configuration (If not using Blueprint)
- **Name**: `smileguard-backend`
- **Root Directory**: `backend`
- **Environment**: `Python`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step C: Required Render Environment Variables
Add the following in Render Dashboard under **Environment**:
| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Ensures Python 3.11 environment compatibility |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app,http://localhost:5173` | Configurable CORS allowed origins |

---

## 3. Frontend Deployment on Vercel

### Step A: Connect Repository to Vercel
1. Sign in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`tristanjerho/SmileGuard`).

### Step B: Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step C: Required Vercel Environment Variables
Add the following under **Environment Variables** in Vercel:
| Key | Value / Example |
| :--- | :--- |
| `VITE_API_URL` | `https://smileguard-backend.onrender.com` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyDnocqTUSuBEpJdv-3tGT-WxLKc4kcy62c` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `smile-guard-ai.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `smile-guard-ai` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `smile-guard-ai.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `677119405590` |
| `VITE_FIREBASE_APP_ID` | `1:677119405590:web:bdd3cf174b4f470e128f37` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-2S1V6Q50BM` |

---

## 4. API Endpoints Testing & Verification

### A. Health Endpoint Check (`GET /api/health`)
```bash
curl -X GET https://smileguard-backend.onrender.com/api/health
```
**Expected Response**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "classes": [
    "Dental Caries",
    "Impacted Teeth",
    "Infection"
  ],
  "service": "SmileGuard AI Clinical Backend"
}
```

### B. Model Info Check (`GET /api/model-info`)
```bash
curl -X GET https://smileguard-backend.onrender.com/api/model-info
```
**Expected Response**:
```json
{
  "trainingStatus": "trained",
  "architecture": "EfficientNetB0 Transfer Learning",
  "modelVersion": "1.0.0",
  "classes": [
    "Dental Caries",
    "Impacted Teeth",
    "Infection"
  ]
}
```

### C. X-Ray Prediction Check (`POST /api/predict`)
```bash
curl -X POST https://smileguard-backend.onrender.com/api/predict \
  -F "file=@backend/dataset_clean/test/Dental Caries/11.jpg"
```
**Expected Response**:
```json
{
  "prediction": "Dental Caries",
  "confidence": 64.37,
  "rawVector": [0.643674, 0.323583, 0.032743],
  "probabilities": {
    "Dental Caries": 0.643674,
    "Impacted Teeth": 0.323583,
    "Infection": 0.032743
  },
  "heatmap": "data:image/png;base64,...",
  "overlay": "data:image/png;base64,..."
}
```

---

## 5. Firebase & Security Architecture

1. **Client Security**: No Firebase private service account keys are stored in client code.
2. **Firestore Collections**:
   - `dentalXrays`: Stores uploaded image references and analysis metadata.
   - `aiPredictions`: Stores model predictions, confidence scores, and Grad-CAM overlay links.
   - `dentistReviews`: Stores verified clinician interpretations and decisions.
3. **CORS Security**: Backend rejects unauthorized origins outside of `ALLOWED_ORIGINS`.

---

## 6. Capstone Disclaimer Notice

> **Clinical Decision Support (CDS) Notice**: SmileGuard AI strictly serves as an AI-assisted decision support system. The final diagnosis and treatment plan remain the sole clinical responsibility of the licensed dentist.
