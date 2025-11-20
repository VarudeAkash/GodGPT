// client/src/firebase.js - COMPATIBLE VERSION
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

console.log("🚀 Firebase config loaded:", {
  domain: window.location.hostname,
  isProduction: import.meta.env.PROD
});

// Your web app's Firebase configuration
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
const app = firebase.initializeApp(firebaseConfig);

// Initialize services (compatible version)
export const auth = firebase.auth();
export const db = firebase.firestore();
const analytics = firebase.analytics();

console.log("🔥 Firebase connected successfully!");