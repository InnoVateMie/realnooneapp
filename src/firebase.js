// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC4EbDl212cmqfMoy5R_-QgweKxrGCrd4k",
  authDomain: "realnooneapp-40cc1.firebaseapp.com",
  projectId: "realnooneapp-40cc1",
  storageBucket: "realnooneapp-40cc1.appspot.com",
  messagingSenderId: "650917261700",
  appId: "1:650917261700:web:6176267c18800f5390add1",
  measurementId: "G-3KWYJ49Q82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);
export { serverTimestamp };

// Analytics - export as function to avoid SSR/async issues
export const getAnalyticsInstance = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};
