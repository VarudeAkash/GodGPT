// client-next/src/utils/cloudSave.js
import firebase from '../firebase.js';

const getDb = () => firebase.firestore();

// Save premium data to cloud
export const savePremiumToCloud = async (userId, premiumData) => {
  try {
    const premiumRef = db.collection('users').doc(userId);
    await premiumRef.set({ premiumData }, { merge: true });
  } catch (error) {
    console.error('Cloud premium save failed:', error);
  }
};

// Load premium data from cloud
export const loadPremiumFromCloud = async (userId) => {
  try {
    const premiumRef = db.collection('users').doc(userId);
    const doc = await premiumRef.get();
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
    const chatRef = db.collection('chats').doc(userId).collection('deityChats').doc(deityId);
    
    await chatRef.set({
      messages: messages,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      deity: deityId,
      messageCount: messages.length
    }, { merge: true });
    
  } catch (error) {
    // Fallback to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }
};

// Load chat from cloud
export const loadChatFromCloud = async (userId, deityId) => {
  try {
    const chatRef = db.collection('chats').doc(userId).collection('deityChats').doc(deityId);
    const chatDoc = await chatRef.get();
    
    if (chatDoc.exists) {
      return chatDoc.data().messages;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Migrate localStorage to cloud
export const migrateToCloud = async (userId) => {
  try {
    const savedDeity = localStorage.getItem('selectedDeity');
    const savedMessages = localStorage.getItem('chatMessages');

    if (savedDeity && savedMessages) {
      let deity, messages;
      try { deity = JSON.parse(savedDeity); } catch { return; }
      try { messages = JSON.parse(savedMessages); } catch { return; }

      if (messages.length > 0) {
        await saveChatToCloud(userId, deity.id, messages);
      }
    }
  } catch { /* ignore */ }
};