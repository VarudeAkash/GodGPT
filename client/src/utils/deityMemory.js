import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../firebase.js';

// Firestore path: deityMemory/{userId}/deities/{deityId}

export const loadDeityMemory = async (userId, deityId) => {
  try {
    const doc = await db
      .collection('deityMemory').doc(userId)
      .collection('deities').doc(deityId)
      .get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
};

export const saveDeityMemory = async (userId, deityId, memoryData) => {
  try {
    await db
      .collection('deityMemory').doc(userId)
      .collection('deities').doc(deityId)
      .set({
        ...memoryData,
        deityId,
        userId,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
  } catch {
    // fail silently — memory is non-critical
  }
};

export const updateDeityMemoryAfterChat = async (userId, deityId, messages, API_URL) => {
  if (!userId || !deityId || messages.length < 2) return;
  try {
    const recentMessages = messages.slice(-10);
    const existing = (await loadDeityMemory(userId, deityId)) || {};

    const response = await fetch(`${API_URL}/api/extract-memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: recentMessages,
        existingThemes: existing.themes || [],
        deity: deityId,
      }),
    });

    if (!response.ok) return;
    const extracted = await response.json();

    const allThemes = [...new Set([...(existing.themes || []), ...(extracted.newThemes || [])])].slice(0, 10);
    const allFacts  = [...(existing.significantMoments || []), ...(extracted.significantFacts || [])].slice(-20);

    await saveDeityMemory(userId, deityId, {
      ...existing,
      themes:              allThemes,
      significantMoments:  allFacts,
      lastSessionSummary:  extracted.sessionSummary || existing.lastSessionSummary || '',
      sessionCount:        (existing.sessionCount || 0) + 1,
    });
  } catch {
    // fail silently
  }
};

// Build a short memory injection string for the chat system prompt
export const buildMemoryContext = (memory) => {
  if (!memory) return '';
  const parts = [];
  if (memory.lastSessionSummary) parts.push(`Last time: ${memory.lastSessionSummary}`);
  if (memory.themes?.length)     parts.push(`Recurring themes: ${memory.themes.slice(0, 5).join(', ')}`);
  if (memory.significantMoments?.length)
    parts.push(memory.significantMoments.slice(-2).join('. '));
  if (!parts.length) return '';
  return `[CONTEXT about this person from previous conversations: ${parts.join('. ')}. Acknowledge their journey naturally — do not mention "memory" or "last time" explicitly unless it flows naturally.]`;
};
