import { createContext, useContext, useState, useEffect } from 'react';
import firebase from '../firebase.js';
import { migrateToCloud, savePremiumToCloud, loadPremiumFromCloud } from '../utils/cloudSave.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userHasPremium, setUserHasPremium] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(50);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Initialize free Krishna messages
    if (typeof window !== 'undefined') {
      const freeKrishnaMessages = localStorage.getItem('freeKrishnaMessages');
      if (!freeKrishnaMessages) {
        localStorage.setItem('freeKrishnaMessages', '50');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        migrateToCloud(firebaseUser.uid);
        const storedFree = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
        setRemainingMessages(storedFree);
        const cloudPremium = await loadPremiumFromCloud(firebaseUser.uid);
        if (cloudPremium) {
          localStorage.setItem('premiumData', JSON.stringify(cloudPremium));
          const hasActive = Object.values(cloudPremium.purchasedDeities || {}).some(
            d => d.expiry > Date.now() && d.remainingMessages > 0
          );
          if (hasActive) setUserHasPremium(true);
        } else {
          const localPremium = localStorage.getItem('premiumData');
          if (localPremium) {
            try {
              const data = JSON.parse(localPremium);
              const hasActive = Object.values(data.purchasedDeities || {}).some(
                d => d.expiry > Date.now() && d.remainingMessages > 0
              );
              if (hasActive) {
                setUserHasPremium(true);
                savePremiumToCloud(firebaseUser.uid, data);
              }
            } catch { /* ignore */ }
          }
        }
      } else {
        const freeMessages = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
        setRemainingMessages(freeMessages);
        setUserHasPremium(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, userHasPremium, setUserHasPremium, remainingMessages, setRemainingMessages, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
