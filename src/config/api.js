// Centralized API Configuration for SmileGuard AI Backend
// Dynamically resolves host IP so mobile phones & local network devices can connect to FastAPI

const getDynamicApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // On Vercel or public HTTPS domains, default to same-origin relative path unless VITE_API_URL is provided
    if (hostname.endsWith('.vercel.app') || hostname.endsWith('.now.sh')) {
      return '';
    }
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
  }

  return 'http://localhost:8000';
};


export const API_BASE_URL = getDynamicApiUrl();

export const API_ENDPOINTS = {
  predict: `${API_BASE_URL}/api/predict`,
  health: `${API_BASE_URL}/api/health`,
  modelInfo: `${API_BASE_URL}/api/model-info`,
  review: `${API_BASE_URL}/api/review`,
};
