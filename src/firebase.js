// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration read from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDnocqTUSuBEpJdv-3tGT-WxLKc4kcy62c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smile-guard-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smile-guard-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smile-guard-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "677119405590",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:677119405590:web:bdd3cf174b4f470e128f37",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2S1V6Q50BM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Safely initialize Analytics if supported in environment
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics is not supported in current environment:", err);
  });
}

export { app, auth, db, googleProvider, analytics };
export default app;
