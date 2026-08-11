// Centralized API Configuration for SmileGuard AI Backend
// Environment Variable: VITE_API_URL
// Local Dev Default: http://localhost:8000
// Production Default: /api (relative routing) or custom VITE_API_URL

const rawApiUrl = import.meta.env.VITE_API_URL;

const getApiBaseUrl = () => {
  if (rawApiUrl !== undefined && rawApiUrl !== null && rawApiUrl !== "") {
    const clean = rawApiUrl.trim().replace(/\/+$/, "");
    if (clean === "/api") {
      return "";
    }
    return clean;
  }
  return import.meta.env.DEV ? "http://localhost:8000" : "";
};

export const API_BASE_URL = getApiBaseUrl();

export const DISPLAY_API_HOST = API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "configured API endpoint");

export const API_ENDPOINTS = {
  predict: `${API_BASE_URL}/api/predict`,
  health: `${API_BASE_URL}/api/health`,
  modelInfo: `${API_BASE_URL}/api/model-info`,
  review: `${API_BASE_URL}/api/review`,
};
