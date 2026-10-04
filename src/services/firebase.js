import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs
} from 'firebase/firestore';

/**
 * Firebase Configuration loader with support for Vite environment variables
 * Replace or set these in your .env file:
 * VITE_FIREBASE_API_KEY
 * VITE_FIREBASE_AUTH_DOMAIN
 * VITE_FIREBASE_PROJECT_ID
 * VITE_FIREBASE_STORAGE_BUCKET
 * VITE_FIREBASE_MESSAGING_SENDER_ID
 * VITE_FIREBASE_APP_ID
 * VITE_FIREBASE_MEASUREMENT_ID
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBUVRNFYvD8ba1sCqIzb5NoMl1cxwQa9cI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ideahub-b44ef.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ideahub-b44ef',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ideahub-b44ef.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '5983388062',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:5983388062:web:83f1539a7f22fa98f1568f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Check if valid Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  !firebaseConfig.projectId.includes('YOUR_')
);

let app = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.info('[Firebase] Firestore initialized successfully for visitor tracking.');
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase app:', error);
  }
} else {
  console.warn(
    '[Firebase] Configuration missing or incomplete. Please set VITE_FIREBASE_* variables in your .env file to enable live Firestore visitor logging.'
  );
}

export {
  app,
  db,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs
};
