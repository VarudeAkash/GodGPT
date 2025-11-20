// client/src/components/Login.jsx - CORRECT FIREBASE COMPATIBLE SYNTAX
import { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../firebase.js';
import './Login.css';

function Login() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google Login - CORRECT syntax
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(provider);
      setUser(result.user);
      console.log("✅ User logged in:", result.user.displayName);
    } catch (error) {
      console.error("❌ Login failed:", error);
      alert("Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  // Logout - CORRECT syntax
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      setUser(null);
      console.log("✅ User logged out");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <div className="login-container">
      {!user ? (
        <button 
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner-small"></div>
          ) : (
            <>
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
              Sign in with Google
            </>
          )}
        </button>
      ) : (
        <div className="user-profile">
          <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
          <span className="user-name">Hi, {user.displayName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Login;