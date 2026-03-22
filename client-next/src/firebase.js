// client-next/src/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBT823C3tClsGt2nnLWnZhn7dObS79P0VQ",
  authDomain: "astravedam-ai.firebaseapp.com",
  projectId: "astravedam-ai",
  storageBucket: "astravedam-ai.firebasestorage.app",
  messagingSenderId: "585834582344",
  appId: "1:585834582344:web:241bccc8c161f19803e37d",
  measurementId: "G-3LYD3K2BY8"
};

if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);

  // Enable persistence for login to survive refresh
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
      console.error("Auth persistence error:", error);
    });
} else if (typeof window !== 'undefined') {
  firebase.app();
}

export default firebase;