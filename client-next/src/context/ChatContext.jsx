import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export function ChatProvider({ children }) {
  const [deities, setDeities] = useState([]);
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [deityMemory, setDeityMemory] = useState(null);

  useEffect(() => {
    fetchDeities();
    // Restore selected deity from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedDeity');
      if (saved) {
        try { setSelectedDeity(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  const fetchDeities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/deities`);
      if (!response.ok) throw new Error(`Failed to fetch deities: ${response.status}`);
      const data = await response.json();
      setDeities(data.deities);
    } catch (error) {
      // Fallback deities
      setDeities([
        { id: 'krishna', name: 'Lord Krishna', emoji: 'कृ', color: '#FF6B35', theme: 'krishna', description: 'Divine Mentor & Compassionate Guide', blessing: 'May you find wisdom in every challenge', avatarUrl: '/deities/krishna.webp' },
        { id: 'shiva', name: 'Lord Shiva', emoji: 'ॐ', color: '#8B5CF6', theme: 'shiva', description: 'The Eternal Yogi & Destroyer of Illusions', blessing: 'May you find peace in meditation', avatarUrl: '/deities/shiva.webp' },
        { id: 'lakshmi', name: 'Goddess Lakshmi', emoji: 'श्रीं', color: '#F59E0B', theme: 'lakshma', description: 'Goddess of Prosperity & Spiritual Wealth', blessing: 'May abundance flow through your life', avatarUrl: '/deities/lakshmi.webp' },
        { id: 'hanuman', name: 'Lord Hanuman', emoji: 'हं', color: '#FF6B6B', theme: 'hanuman', description: 'Embodiment of Devotion & Strength', blessing: 'May courage guide your path', avatarUrl: '/deities/hanuman.webp' },
        { id: 'saraswati', name: 'Goddess Saraswati', emoji: 'ऐं', color: '#4ECDC4', theme: 'saraswati', description: 'Goddess of Knowledge & Creative Wisdom', blessing: 'May wisdom illuminate your journey', avatarUrl: '/deities/saraswati.webp' },
        { id: 'ganesha', name: 'Lord Ganesha', emoji: 'गं', color: '#45B7D1', theme: 'ganesha', description: 'Remover of Obstacles & Lord of Beginnings', blessing: 'May your path be clear of obstacles', avatarUrl: '/deities/ganesha.webp' },
      ]);
    }
  };

  return (
    <ChatContext.Provider value={{ deities, selectedDeity, setSelectedDeity, messages, setMessages, deityMemory, setDeityMemory }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
