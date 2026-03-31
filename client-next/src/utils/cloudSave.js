// client-next/src/utils/cloudSave.js
import firebase from '../firebase.js';

// ─── CHAT ────────────────────────────────────────────────────────────────────

export const saveChatToCloud = async (userId, deityId, messages) => {
  try {
    const db = firebase.firestore();
    await db.collection('chats').doc(userId).collection('deityChats').doc(deityId).set({
      messages,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      deity: deityId,
      messageCount: messages.length
    }, { merge: true });
  } catch {
    // silent — chat history is non-critical
  }
};

export const loadChatFromCloud = async (userId, deityId) => {
  try {
    const db = firebase.firestore();
    const chatDoc = await db.collection('chats').doc(userId).collection('deityChats').doc(deityId).get();
    return chatDoc.exists ? chatDoc.data().messages : null;
  } catch {
    return null;
  }
};

// ─── USER DATA ───────────────────────────────────────────────────────────────

// Load the full user Firestore document
export const loadUserData = async (userId) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return {};
    return doc.data();
  } catch { return {}; }
};

// Ensure user document exists and Krishna free messages are initialized.
// Only sets freeKrishnaMessages if the field is missing (new user).
// Returns the current Krishna count.
export const initKrishnaIfNeeded = async (userId) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists || doc.data().freeKrishnaMessages === undefined) {
      await db.collection('users').doc(userId).set({ freeKrishnaMessages: 50 }, { merge: true });
      return 50;
    }
    return doc.data().freeKrishnaMessages;
  } catch { return 50; }
};

// ─── FEATURE ENTITLEMENTS ────────────────────────────────────────────────────

const featureDateKey = () => new Date().toISOString().slice(0, 10);

export const checkFeaturePaid = async (userId, featureKey) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return false;
    const data = doc.data();
    return data?.featurePayments?.[featureKey]?.dateKey === featureDateKey();
  } catch {
    return false;
  }
};

export const saveFeaturePayment = async (userId, featureKey, paymentId) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).set({
      featurePayments: {
        [featureKey]: {
          paymentId,
          dateKey: featureDateKey(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
      },
    }, { merge: true });
  } catch (error) {
    console.error('saveFeaturePayment failed:', error);
  }
};

// ─── MESSAGE COUNT — ATOMIC OPERATIONS ───────────────────────────────────────

// Atomic decrement for Krishna free messages
export const decrementKrishnaCount = async (userId) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).set({
      freeKrishnaMessages: firebase.firestore.FieldValue.increment(-1),
    }, { merge: true });
  } catch (err) {
    console.error('decrementKrishnaCount failed:', err);
    throw err;
  }
};

// Atomic restore for Krishna (called on API error to undo decrement)
export const restoreKrishnaCount = async (userId) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).set({
      freeKrishnaMessages: firebase.firestore.FieldValue.increment(1),
    }, { merge: true });
  } catch { /* best-effort */ }
};

// Atomic decrement for premium deity
export const decrementPremiumCount = async (userId, deityId) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).set({
      [`premiumData.purchasedDeities.${deityId}.remainingMessages`]: firebase.firestore.FieldValue.increment(-1),
    }, { merge: true });
  } catch (err) {
    console.error('decrementPremiumCount failed:', err);
    throw err;
  }
};

// Atomic restore for premium deity (called on API error)
export const restorePremiumCount = async (userId, deityId) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).set({
      [`premiumData.purchasedDeities.${deityId}.remainingMessages`]: firebase.firestore.FieldValue.increment(1),
    }, { merge: true });
  } catch { /* best-effort */ }
};

// ─── PAYMENT ─────────────────────────────────────────────────────────────────

// Save a successful premium purchase to Firestore (sets count to 50 + metadata)
export const savePremiumPurchase = async (userId, deityId, { expiry, purchaseDate, paymentId }) => {
  const db = firebase.firestore();
  const updates = {
    [`premiumData.purchasedDeities.${deityId}.remainingMessages`]: 50,
    [`premiumData.purchasedDeities.${deityId}.expiry`]: expiry,
    [`premiumData.purchasedDeities.${deityId}.purchaseDate`]: purchaseDate,
    [`premiumData.purchasedDeities.${deityId}.paymentId`]: paymentId,
    'premiumData.userHasPremium': true,
  };
  try {
    // update() is atomic and preserves other fields via dot-notation
    await db.collection('users').doc(userId).update(updates);
  } catch {
    // Document might not exist yet (edge case) — create it
    await db.collection('users').doc(userId).set({
      freeKrishnaMessages: 50,
      premiumData: {
        purchasedDeities: {
          [deityId]: { remainingMessages: 50, expiry, purchaseDate, paymentId },
        },
        userHasPremium: true,
      },
    }, { merge: true });
  }
};

// ─── KUNDALI ─────────────────────────────────────────────────────────────────

export const saveKundaliReading = async (userId, { name, dob, tob, pob, language, ascendant, reading }) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).collection('kundaliReadings').add({
      name, dob, tob, pob, language, ascendant, reading,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // Consume the paid credit — next generation requires a new payment
    await db.collection('users').doc(userId).set({ kundaliPaid: false }, { merge: true });
  } catch (error) {
    console.error('Kundali save failed:', error);
  }
};

export const loadKundaliReadings = async (userId) => {
  try {
    const db = firebase.firestore();
    const snap = await db.collection('users').doc(userId).collection('kundaliReadings')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
};

export const checkKundaliPaid = async (userId) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('users').doc(userId).get();
    return !!(doc.exists && doc.data().kundaliPaid);
  } catch {
    return false;
  }
};
