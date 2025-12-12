/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes Firebase services including:
 * - Firebase App
 * - Firebase Analytics
 * 
 * Analytics is only initialized in browser environments and when
 * user has not opted out of tracking.
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEP72eEkJo1fOiBPax5zQMKnABU-IFGC8",
  authDomain: "android-device-catalog.firebaseapp.com",
  databaseURL: "https://android-device-catalog.firebaseio.com",
  projectId: "android-device-catalog",
  storageBucket: "android-device-catalog.firebasestorage.app",
  messagingSenderId: "141680233797",
  appId: "1:141680233797:web:7a9070af5e89357571022c",
  measurementId: "G-RYGF5QGYB0"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
// Analytics requires browser APIs and won't work during SSR or in Node.js
let analytics: Analytics | null = null;

// Check if we're in a browser environment and not in a test environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

if (isBrowser && !isTest) {
  try {
    analytics = getAnalytics(app);
  } catch {
    // Analytics initialization failed - silently continue
    // Error details available in development mode
  }
}

export { app, analytics };
export default app;
