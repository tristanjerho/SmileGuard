import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const analyzeDentalXray = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/predict', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `FastAPI server error ${response.status}`);
  }

  return await response.json();
};

export const saveAiPredictionAndReview = async ({
  patientId,
  xrayId,
  prediction,
  confidence,
  heatmapUrl,
  overlayUrl,
  modelVersion,
  dentistId,
  clinicalInterpretation,
  finalDecision,
  notes = '',
}) => {
  const nowIso = new Date().toISOString();

  // 1. Create aiPredictions document
  const predDocRef = await addDoc(collection(db, 'aiPredictions'), {
    patientId,
    xrayId: xrayId || 'XRAY_TEMP',
    prediction,
    confidence,
    heatmapUrl: heatmapUrl || '',
    overlayUrl: overlayUrl || '',
    modelVersion: modelVersion || '1.0.0',
    createdAt: nowIso,
  });

  // 2. Create dentistReviews document
  const reviewDocRef = await addDoc(collection(db, 'dentistReviews'), {
    patientId,
    xrayId: xrayId || 'XRAY_TEMP',
    predictionId: predDocRef.id,
    dentistId: dentistId || 'DR_ANA_SANTOS',
    reviewed: true,
    clinicalInterpretation,
    finalDecision,
    notes,
    reviewedAt: nowIso,
  });

  return { predictionId: predDocRef.id, reviewId: reviewDocRef.id };
};
