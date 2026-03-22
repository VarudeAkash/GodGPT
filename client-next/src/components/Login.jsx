// client-next/src/components/Login.jsx
import { useState } from 'react';
import firebase from '../firebase.js';

function Login({ user }) { // 🆕 RECEIVE user as prop
  const [isLoading, setIsLoading] = useState(false);

  // Google Login - UPDATED: No need to setUser here
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      // 🆕 REMOVED: setUser(result.user) - App.jsx will handle this automatically
      console.log("✅ Login process started...");
    } catch (error) {
      console.error("❌ Login failed:", error);
      alert("Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  // Logout - UPDATED: No need to setUser here
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      // 🆕 REMOVED: setUser(null) - App.jsx will handle this automatically
      console.log("✅ Logout process started...");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <div className="login-container">
      {!user ? ( // 🆕 USE the user prop instead of internal state
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