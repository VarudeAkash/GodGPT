// client-next/src/utils/cloudSave.js
import firebase from '../firebase.js';

// Save premium data to cloud
export const savePremiumToCloud = async (userId, premiumData) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).set({ premiumData }, { merge: true });
  } catch (error) {
    console.error('Cloud premium save failed:', error);
  }
};

// Load premium data from cloud
export const loadPremiumFromCloud = async (userId) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists && doc.data().premiumData) {
      return doc.data().premiumData;
    }
    return null;
  } catch (error) {
    console.error('Cloud premium load failed:', error);
    return null;
  }
};

// Save chat to cloud
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
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }
};

// Load chat from cloud
export const loadChatFromCloud = async (userId, deityId) => {
  try {
    const db = firebase.firestore();
    const chatDoc = await db.collection('chats').doc(userId).collection('deityChats').doc(deityId).get();
    return chatDoc.exists ? chatDoc.data().messages : null;
  } catch {
    return null;
  }
};

// Save a Kundali reading to cloud
export const saveKundaliReading = async (userId, { name, dob, tob, pob, language, ascendant, reading }) => {
  try {
    const db = firebase.firestore();
    await db.collection('users').doc(userId).collection('kundaliReadings').add({
      name, dob, tob, pob, language, ascendant, reading,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // Mark user as having paid for Kundali (permanent)
    await db.collection('users').doc(userId).set({ kundaliPaid: true }, { merge: true });
  } catch (error) {
    console.error('Kundali save failed:', error);
  }
};

// Load all Kundali readings for a user
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

// Check if user has paid for Kundali
export const checkKundaliPaid = async (userId) => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('users').doc(userId).get();
    return !!(doc.exists && doc.data().kundaliPaid);
  } catch {
    return false;
  }
};