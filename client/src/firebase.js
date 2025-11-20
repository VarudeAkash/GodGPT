// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


console.log("🚀 Firebase config loaded:", {
    domain: window.location.hostname,
    isProduction: import.meta.env.PROD
  });

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBT823C3tClsGt2nnLWnZhn7dObS79P0VQ",
  authDomain: "astravedam-ai.firebaseapp.com",
  projectId: "astravedam-ai",
  storageBucket: "astravedam-ai.firebasestorage.app",
  messagingSenderId: "585834582344",
  appId: "1:585834582344:web:241bccc8c161f19803e37d",
  measurementId: "G-3LYD3K2BY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

console.log("🔥 Firebase connected successfully!");