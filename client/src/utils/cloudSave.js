// client/src/utils/cloudSave.js - COMPATIBLE VERSION
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../firebase.js';

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
    
    console.log("💾 Chat saved to cloud for", deityId);
  } catch (error) {
    console.error("❌ Cloud save failed:", error);
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
      console.log("☁️ Loaded chat from cloud for", deityId);
      return chatDoc.data().messages;
    }
    return null;
  } catch (error) {
    console.error("❌ Cloud load failed:", error);
    return null;
  }
};

// Migrate localStorage to cloud
export const migrateToCloud = async (userId) => {
  try {
    const savedDeity = localStorage.getItem('selectedDeity');
    const savedMessages = localStorage.getItem('chatMessages');
    
    if (savedDeity && savedMessages) {
      const deity = JSON.parse(savedDeity);
      const messages = JSON.parse(savedMessages);
      
      if (messages.length > 0) {
        await saveChatToCloud(userId, deity.id, messages);
        console.log("🔄 Migrated localStorage data to cloud");
      }
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
};