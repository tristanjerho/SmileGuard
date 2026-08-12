// Centralized API Configuration for SmileGuard AI Backend
// Uses VITE_API_URL if defined, otherwise defaults to http://localhost:8000 for local dev or relative /api for production

export const API_BASE_URL = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== null)
  ? import.meta.env.VITE_API_URL
  : "http://localhost:8000";

export const API_ENDPOINTS = {
  predict: `${API_BASE_URL}/api/predict`,
  health: `${API_BASE_URL}/api/health`,
  modelInfo: `${API_BASE_URL}/api/model-info`,
  review: `${API_BASE_URL}/api/review`,
};
