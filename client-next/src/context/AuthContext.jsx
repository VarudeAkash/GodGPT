import { createContext, useContext, useState, useEffect } from 'react';
import firebase from '../firebase.js';
import { initKrishnaIfNeeded } from '../utils/cloudSave.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userHasPremium, setUserHasPremium] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(50);
  const [authLoading, setAuthLoading] = useState(true);
  const [premiumData, setPremiumData] = useState({ purchasedDeities: {} });
  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let userDocUnsubscribe = null;

    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = firebase.firestore().collection('users').doc(firebaseUser.uid);

        userDocUnsubscribe = userRef.onSnapshot(async (doc) => {
          const data = doc.exists ? doc.data() : {};

          if (data.freeKrishnaMessages === undefined) {
            await initKrishnaIfNeeded(firebaseUser.uid);
            return;
          }

          setUserData(data);

          const nextPremiumData = data.premiumData || { purchasedDeities: {} };
          setPremiumData(nextPremiumData);

          const hasActive = Object.values(nextPremiumData.purchasedDeities || {}).some(
            d => d.expiry > Date.now() && d.remainingMessages > 0
          );
          setUserHasPremium(hasActive);
          setAuthLoading(false);
        }, () => {
          setUserData({});
          setPremiumData({ purchasedDeities: {} });
          setUserHasPremium(false);
          setAuthLoading(false);
        });
      } else {
        const freeMessages = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
        setUserData({});
        setRemainingMessages(freeMessages);
        setUserHasPremium(false);
        setPremiumData({ purchasedDeities: {} });
        setAuthLoading(false);
      }
    });

    return () => {
      if (userDocUnsubscribe) userDocUnsubscribe();
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, userHasPremium, setUserHasPremium, remainingMessages, setRemainingMessages, authLoading, premiumData, setPremiumData, userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
