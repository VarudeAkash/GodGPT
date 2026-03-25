import { createContext, useContext, useState, useEffect } from 'react';
import firebase from '../firebase.js';
import { loadPremiumFromCloud } from '../utils/cloudSave.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userHasPremium, setUserHasPremium] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(50);
  const [authLoading, setAuthLoading] = useState(true);
  const [premiumData, setPremiumData] = useState({ purchasedDeities: {} });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const storedFree = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
        setRemainingMessages(storedFree);
        const cloudPremium = await loadPremiumFromCloud(firebaseUser.uid);
        if (cloudPremium) {
          setPremiumData(cloudPremium);
          const hasActive = Object.values(cloudPremium.purchasedDeities || {}).some(
            d => d.expiry > Date.now() && d.remainingMessages > 0
          );
          setUserHasPremium(hasActive);
        } else {
          setPremiumData({ purchasedDeities: {} });
          setUserHasPremium(false);
        }
      } else {
        const freeMessages = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
        setRemainingMessages(freeMessages);
        setUserHasPremium(false);
        setPremiumData({ purchasedDeities: {} });
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, userHasPremium, setUserHasPremium, remainingMessages, setRemainingMessages, authLoading, premiumData, setPremiumData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
