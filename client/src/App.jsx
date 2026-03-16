import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/header.jsx';
import Footer from './components/Footer.jsx';
import DeityIcon from './components/DeityIcon.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Privacy from './components/Privacy.jsx';
import PanchangPage from './components/PanchangPage.jsx';
import KundaliPage from './components/KundaliPage.jsx';
import DivyaUpayPage from './components/DivyaUpayPage.jsx';
import BlogPage from './components/BlogPage.jsx';
import KundaliMilanPage from './components/KundaliMilanPage.jsx';
import MuhuratPage from './components/MuhuratPage.jsx';
import SadeSatiPage from './components/SadeSatiPage.jsx';
import VarshphalPage from './components/VarshphalPage.jsx';
import FestivalPage from './components/FestivalPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import './firebase.js';
import firebase from 'firebase/compat/app';
import { saveChatToCloud, loadChatFromCloud, migrateToCloud, savePremiumToCloud, loadPremiumFromCloud } from './utils/cloudSave.js';
import { loadDeityMemory, updateDeityMemoryAfterChat, buildMemoryContext } from './utils/deityMemory.js';




const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [deities, setDeities] = useState([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDeityForPremium, setSelectedDeityForPremium] = useState(null);
  const [userHasPremium, setUserHasPremium] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(50);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const paymentTimeoutRef = useRef(null);
  const [showBuyMoreModal, setShowBuyMoreModal] = useState(false);
  const [chatLanguage, setChatLanguage] = useState('english');
  const [user, setUser] = useState(null);
  const [deityMemory, setDeityMemory] = useState(null);
  const memoryDebounceRef = useRef(null);

  const navigateTo = (screen, hash) => {
    window.history.pushState({}, '', `#${hash || screen}`);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Set initial screen based on URL hash
    const hash = window.location.hash.replace('#', '');

    if (hash === 'deity-select') {
      setCurrentScreen('deity-select');
    } else if (hash === 'chat') {
      const savedDeity = localStorage.getItem('selectedDeity');
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedDeity) {
        try {
          const deity = JSON.parse(savedDeity);
          setSelectedDeity(deity);
          setCurrentScreen('chat');
          if (savedMessages) {
            try { setMessages(JSON.parse(savedMessages)); } catch { setMessages([]); }
          }
        } catch {
          window.location.hash = 'deity-select';
          setCurrentScreen('deity-select');
        }
      } else {
        window.location.hash = 'deity-select';
        setCurrentScreen('deity-select');
      }
    } else if (hash === 'about')      { setCurrentScreen('about'); }
    else if (hash === 'contact')      { setCurrentScreen('contact'); }
    else if (hash === 'privacy')      { setCurrentScreen('privacy'); }
    else if (hash === 'panchang')     { setCurrentScreen('panchang'); }
    else if (hash === 'kundali')      { setCurrentScreen('kundali'); }
    else if (hash === 'divya-upay')    { setCurrentScreen('divya-upay'); }
    else if (hash === 'blog')          { setCurrentScreen('blog'); }
    else if (hash === 'kundali-milan') { setCurrentScreen('kundali-milan'); }
    else if (hash === 'muhurat')       { setCurrentScreen('muhurat'); }
    else if (hash === 'sade-sati')     { setCurrentScreen('sade-sati'); }
    else if (hash === 'varshphal')     { setCurrentScreen('varshphal'); }
    else if (hash === 'festivals')     { setCurrentScreen('festivals'); }
    else if (hash === 'profile')       { setCurrentScreen('profile'); }
    else if (!hash || hash === 'welcome') { setCurrentScreen('welcome'); }

    // Handle browser back/forward
    const handlePopState = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash === 'deity-select') {
        setCurrentScreen('deity-select'); setSelectedDeity(null); setMessages([]);
      } else if (newHash === 'chat') {
        const savedDeity = localStorage.getItem('selectedDeity');
        if (savedDeity) {
          try { setSelectedDeity(JSON.parse(savedDeity)); } catch { /* ignore */ }
          setCurrentScreen('chat');
        } else {
          window.location.hash = 'deity-select'; setCurrentScreen('deity-select');
        }
      } else if (newHash === 'about')    { setCurrentScreen('about'); }
      else if (newHash === 'contact')    { setCurrentScreen('contact'); }
      else if (newHash === 'privacy')    { setCurrentScreen('privacy'); }
      else if (newHash === 'panchang')   { setCurrentScreen('panchang'); }
      else if (newHash === 'kundali')    { setCurrentScreen('kundali'); }
      else if (newHash === 'divya-upay')    { setCurrentScreen('divya-upay'); }
      else if (newHash === 'blog')          { setCurrentScreen('blog'); }
      else if (newHash === 'kundali-milan') { setCurrentScreen('kundali-milan'); }
      else if (newHash === 'muhurat')       { setCurrentScreen('muhurat'); }
      else if (newHash === 'sade-sati')     { setCurrentScreen('sade-sati'); }
      else if (newHash === 'varshphal')     { setCurrentScreen('varshphal'); }
      else if (newHash === 'festivals')     { setCurrentScreen('festivals'); }
      else if (newHash === 'profile')       { setCurrentScreen('profile'); }
      else if ((!newHash || newHash === 'welcome') && currentScreen !== 'welcome') {
        setCurrentScreen('welcome');
        setSelectedDeity(null);
        setMessages([]);
      }
    };
  
    window.addEventListener('popstate', handlePopState);
  
    // Load free message count (always)
    const freeKrishnaMessages = localStorage.getItem('freeKrishnaMessages');
    if (freeKrishnaMessages) {
      setRemainingMessages(parseInt(freeKrishnaMessages));
    } else {
      localStorage.setItem('freeKrishnaMessages', '50');
      setRemainingMessages(50);
    }
    // Premium state is managed by onAuthStateChanged — not here
  
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  // Load deities on component mount
  useEffect(() => {
    fetchDeities();
  }, []);

  // === 🆕 ADD: Initialize free Krishna messages on app start ===
  useEffect(() => {
    const freeKrishnaMessages = localStorage.getItem('freeKrishnaMessages');
    if (!freeKrishnaMessages) {
      localStorage.setItem('freeKrishnaMessages', '50');
      setRemainingMessages(50);
    }
  }, []);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


// Add this useEffect in App.jsx
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        migrateToCloud(user.uid);

        // Try Firestore first (cross-device), fall back to localStorage (same device)
        const cloudPremium = await loadPremiumFromCloud(user.uid);
        if (cloudPremium) {
          localStorage.setItem('premiumData', JSON.stringify(cloudPremium));
          const hasActive = Object.values(cloudPremium.purchasedDeities || {}).some(
            d => d.expiry > Date.now() && d.remainingMessages > 0
          );
          if (hasActive) setUserHasPremium(true);
        } else {
          // No Firestore record — check localStorage (e.g. purchased before cloud sync was added)
          const localPremium = localStorage.getItem('premiumData');
          if (localPremium) {
            try {
              const data = JSON.parse(localPremium);
              const hasActive = Object.values(data.purchasedDeities || {}).some(
                d => d.expiry > Date.now() && d.remainingMessages > 0
              );
              if (hasActive) {
                setUserHasPremium(true);
                // Migrate this old purchase up to Firestore
                savePremiumToCloud(user.uid, data);
              }
            } catch { /* ignore */ }
          }
        }
      } else {
        // Sign-out: reset state only — keep localStorage so re-login on same device works
        const freeMessages = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
        setRemainingMessages(freeMessages);
        setUserHasPremium(false);
        setSelectedDeity(null);
        setMessages([]);
        setDeityMemory(null);
        setCurrentScreen('welcome');
        window.history.pushState({}, '', '#welcome');
      }
    });

    return () => unsubscribe();
  }, []);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDeities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/deities`);
      if (!response.ok) throw new Error(`Failed to fetch deities: ${response.status}`);
      const data = await response.json();
      setDeities(data.deities);
    } catch (error) {
      // Fallback deities with beautiful data
      setDeities([
        {
          id: 'krishna',
          name: 'Lord Krishna',
          emoji: 'कृ',
          color: '#FF6B35',
          theme: 'krishna',
          description: 'Divine Mentor & Compassionate Guide',
          blessing: 'May you find wisdom in every challenge'
        },
        {
          id: 'shiva',
          name: 'Lord Shiva',
          emoji: 'ॐ',
          color: '#8B5CF6',
          theme: 'shiva',
          description: 'The Eternal Yogi & Destroyer of Illusions',
          blessing: 'May you find peace in meditation'
        },
        {
          id: 'lakshmi',
          name: 'Goddess Lakshmi',
          emoji: 'श्रीं',
          color: '#F59E0B',
          theme: 'lakshma',
          description: 'Goddess of Prosperity & Spiritual Wealth',
          blessing: 'May abundance flow through your life'
        },
        {
          id: 'hanuman',
          name: 'Lord Hanuman',
          emoji: 'हं',
          color: '#FF6B6B',
          theme: 'hanuman',
          description: 'Embodiment of Devotion & Strength',
          blessing: 'May courage guide your path'
        },
        {
          id: 'saraswati',
          name: 'Goddess Saraswati',
          emoji: 'ऐं',
          color: '#4ECDC4',
          theme: 'saraswati',
          description: 'Goddess of Knowledge & Creative Wisdom',
          blessing: 'May wisdom illuminate your journey'
        },
        {
          id: 'ganesha',
          name: 'Lord Ganesha',
          emoji: 'गं',
          color: '#45B7D1',
          theme: 'ganesha',
          description: 'Remover of Obstacles & Lord of Beginnings',
          blessing: 'May your path be clear of obstacles'
        }
      ]);
    }
  };



  // === MODIFIED: selectDeity ===
  const selectDeity = async (deity) => {
    let premiumData;
    try { premiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}'); }
    catch { premiumData = { purchasedDeities: {} }; }

    // Check Krishna free messages (Bug 1 fix)
    if (deity.id === 'krishna') {
      const freeMessages = localStorage.getItem('freeKrishnaMessages');
      if (!freeMessages) {
        // First time - set 50 free messages
        localStorage.setItem('freeKrishnaMessages', '50');
        setRemainingMessages(50);
      } else {
        const remaining = parseInt(freeMessages);
        if (remaining <= 0) {
          setSelectedDeityForPremium(deity);
          setShowPremiumModal(true);
          return;
        }
        setRemainingMessages(remaining);
      }
    } 
    // Check premium deities (Bug 2 fix)
    else {
      const deityPremium = premiumData.purchasedDeities[deity.id];
      if (!deityPremium || deityPremium.remainingMessages <= 0 || deityPremium.expiry <= Date.now()) {
        setSelectedDeityForPremium(deity);
        setShowPremiumModal(true);
        return;
      }
      setRemainingMessages(deityPremium.remainingMessages);
    }
  
    // 🆕 CHECK if we're selecting the SAME deity that has existing chat
    const savedDeity = localStorage.getItem('selectedDeity');
    const savedMessages = localStorage.getItem('chatMessages');
    let isSameDeity = false;
    try { isSameDeity = savedDeity && JSON.parse(savedDeity).id === deity.id; } catch { /* ignore */ }
    
    // Load deity memory for logged-in users
    if (user) {
      loadDeityMemory(user.uid, deity.id).then(mem => setDeityMemory(mem));
    } else {
      setDeityMemory(null);
    }

    localStorage.setItem('selectedDeity', JSON.stringify(deity));
    window.history.pushState({}, '', '#chat');

    setSelectedDeity(deity);
    setCurrentScreen('chat');
    
    // 🆕 FIX: Load existing messages if same deity, otherwise welcome
    if (isSameDeity && savedMessages) {
      // Load existing conversation
      try { setMessages(JSON.parse(savedMessages)); } catch { setMessages([]); }
    } else {
      // Start new conversation
      const welcomeMessage = {
        id: Date.now(),
        text: userHasPremium 
          ? `Welcome, blessed seeker. I am ${deity.name}. You have ${remainingMessages} divine messages remaining. ${deity.blessing} What wisdom do you seek today?`
          : `Welcome, seeker. I am ${deity.name}. ${deity.blessing} You have ${remainingMessages} free messages. What wisdom do you seek today?`,
        sender: 'deity',
        deity: deity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
    }
  };
  
  // === MODIFIED: goBackToSelection ===
  const goBackToSelection = () => {
    navigateTo('deity-select');
    setSelectedDeity(null);
    setMessages([]);
    // Trigger memory save when leaving chat
    if (user && selectedDeity) {
      if (memoryDebounceRef.current) clearTimeout(memoryDebounceRef.current);
      const msgs = (() => { try { return JSON.parse(localStorage.getItem('chatMessages') || '[]'); } catch { return []; } })();
      updateDeityMemoryAfterChat(user.uid, selectedDeity.id, msgs, API_URL);
    }
  };


  // === MODIFIED: sendMessage ===
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedDeity || isLoading) return;

    // Check message limits for ALL deities (including Krishna after first 50)
    if (userHasPremium && remainingMessages <= 0) {
      setShowBuyMoreModal(true);
      return;
    }

    // Check if free Krishna messages are exhausted
    if (selectedDeity.id === 'krishna' && !userHasPremium && remainingMessages <= 0) {
      setShowBuyMoreModal(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    // Save to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(newMessages));
    
    // Decrement message count for ALL users (including free Krishna)
    setRemainingMessages(prev => prev - 1);

    // === 🆕 FIXED: Update per-deity message count in localStorage ===
    if (selectedDeity.id === 'krishna' && !userHasPremium) {
      // Update free Krishna messages
      const currentFree = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
      localStorage.setItem('freeKrishnaMessages', (currentFree - 1).toString());
    } else {
      // Update premium deity messages
      let premiumData;
      try { premiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}'); }
      catch { premiumData = { purchasedDeities: {} }; }
      if (premiumData.purchasedDeities[selectedDeity.id]) {
        premiumData.purchasedDeities[selectedDeity.id].remainingMessages -= 1;
        localStorage.setItem('premiumData', JSON.stringify(premiumData));
      }
    }
    
    try {
      // === 🆕 STREAMING API CALL ===
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          deity: selectedDeity.id,
          conversationHistory: messages,
          language: chatLanguage,
          userMemory: buildMemoryContext(deityMemory) || undefined,
        }),
      });
    
      if (!response.ok) throw new Error('Network response was not ok');
    
      // === 🆕 CREATE INITIAL EMPTY MESSAGE ===
      const streamingMessageId = Date.now() + 1;
      const initialStreamingMessage = {
        id: streamingMessageId,
        text: '', // Start empty - will fill gradually
        sender: 'deity',
        deity: selectedDeity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    
      // Add the empty message that will be filled gradually
      const messagesWithEmpty = [...newMessages, initialStreamingMessage];
      setMessages(messagesWithEmpty);
    
      // === 🆕 SET UP STREAM READER ===
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiResponse = '';
    
      // === 🆕 READ STREAM CHUNK BY CHUNK ===
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to response
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
        
        // === 🆕 UPDATE THE MESSAGE IN REAL-TIME ===
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...msg, text: aiResponse }
              : msg
          )
        );
      }
    
      // === 🆕 SAVE FINAL MESSAGE TO LOCALSTORAGE ===
      const finalMessages = [...newMessages, {
        id: streamingMessageId,
        text: aiResponse,
        sender: 'deity',
        deity: selectedDeity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "The divine connection is weak. Please try again later.",
        sender: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const errorMessages = [...newMessages, errorMessage];
      setMessages(errorMessages);
      localStorage.setItem('chatMessages', JSON.stringify(errorMessages));
      
      // Restore message count on error for all users
      setRemainingMessages(prev => prev + 1);
      if (selectedDeity.id === 'krishna' && !userHasPremium) {
        const currentFree = parseInt(localStorage.getItem('freeKrishnaMessages') || '0');
        localStorage.setItem('freeKrishnaMessages', (currentFree + 1).toString());
      } else {
        let premiumData;
        try { premiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}'); }
        catch { premiumData = { purchasedDeities: {} }; }
        if (premiumData.purchasedDeities[selectedDeity.id]) {
          premiumData.purchasedDeities[selectedDeity.id].remainingMessages += 1;
          localStorage.setItem('premiumData', JSON.stringify(premiumData));
        }
      }
    } finally {
      setIsLoading(false);
    }
  // 🆕 CLOUD SAVE - ADD AT THE END OF sendMessage FUNCTION
  if (user && selectedDeity) {
    setTimeout(() => {
      let currentMessages;
      try { currentMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]'); }
      catch { currentMessages = []; }
      if (currentMessages.length > 0) {
        saveChatToCloud(user.uid, selectedDeity.id, currentMessages);
      }
    }, 6000);

    // Debounced memory update — runs 15s after last message
    if (memoryDebounceRef.current) clearTimeout(memoryDebounceRef.current);
    memoryDebounceRef.current = setTimeout(() => {
      let currentMessages;
      try { currentMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]'); }
      catch { currentMessages = []; }
      updateDeityMemoryAfterChat(user.uid, selectedDeity.id, currentMessages, API_URL)
        .then(() => loadDeityMemory(user.uid, selectedDeity.id))
        .then(mem => setDeityMemory(mem));
    }, 15000);
  }
  };

  // === MODIFIED: clearChat ===
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    
    // Add new welcome message after clearing
    if (selectedDeity) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Welcome back! I am ${selectedDeity.name}. What wisdom do you seek today?`,
        sender: 'deity',
        deity: selectedDeity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ... (Keep ALL your existing handlePurchase, verifyPayment, handleBuyMoreMessages functions EXACTLY as they are)

  const handlePurchase = async () => {
    // KEEP THIS FUNCTION EXACTLY AS IS - no changes
    if (!window.Razorpay) {
      alert('Payment system loading... Please refresh the page.');
      return;
    }
    
    if (isProcessingPayment) return;
    
    setIsProcessingPayment(true);
    
    try {
      const orderResponse = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deityId: selectedDeityForPremium.id
        }),
      });
      if (!orderResponse.ok) throw new Error(`Order creation failed: ${orderResponse.status}`);

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      const deityName = selectedDeityForPremium.name;
      const deityColor = selectedDeityForPremium.color;
      const deityEmoji = selectedDeityForPremium.emoji;
      const deityBlessing = selectedDeityForPremium.blessing;
      const deityId = selectedDeityForPremium.id;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DharmaAI Premium',
        description: `50 Divine Messages with ${deityName}`,
        image: 'https://ask-devata.vercel.app/favicon.ico',
        order_id: orderData.order_id,
        handler: function (response) {
          verifyPayment(response, deityName, deityColor, deityEmoji, deityBlessing, deityId);
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: deityColor || '#FF6B35'
        }
      };
  
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function(_response) {
          setIsProcessingPayment(false);
        alert('Payment failed. Please try again.');
      });
      
      razorpay.open();

      if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
      paymentTimeoutRef.current = setTimeout(() => {
        setIsProcessingPayment(false);
        paymentTimeoutRef.current = null;
        alert('Payment completed! Please refresh the page to access premium features.');
      }, 40000);
  
    } catch (error) {
      setIsProcessingPayment(false);
      alert('❌ Payment failed. Please try again.');
    }
  };

  const handleBuyMoreMessages = async () => {
    setShowBuyMoreModal(false);
    setSelectedDeityForPremium(selectedDeity);
    setShowPremiumModal(true);
  };
  
  const verifyPayment = async (response, deityName, deityColor, deityEmoji, deityBlessing, deityId) => {
    try {
      const verificationResponse = await fetch(`${API_URL}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        }),
      });
      if (!verificationResponse.ok) throw new Error(`Payment verification failed: ${verificationResponse.status}`);

      const verificationData = await verificationResponse.json();
      
      if (verificationData.success) {
        // === 🆕 FIXED: Save per-deity premium data ===
        let existingData;
        try { existingData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}'); }
        catch { existingData = { purchasedDeities: {} }; }
        
        existingData.purchasedDeities[deityId] = {
          remainingMessages: 50,
          expiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          purchaseDate: Date.now(),
          paymentId: response.razorpay_payment_id
        };
        existingData.userHasPremium = true;
        
        localStorage.setItem('premiumData', JSON.stringify(existingData));

        // Sync premium to Firestore for cross-device access
        if (user) {
          savePremiumToCloud(user.uid, existingData);
        }

        setUserHasPremium(true);
        setRemainingMessages(50);
        setShowPremiumModal(false);
        setIsProcessingPayment(false);
        
        const deity = {
          id: deityId,
          name: deityName,
          color: deityColor,
          emoji: deityEmoji,
          blessing: deityBlessing
        };
        
        // Save deity to localStorage
        localStorage.setItem('selectedDeity', JSON.stringify(deity));
        window.history.pushState({}, '', '#chat');
        
        setSelectedDeity(deity);
        setCurrentScreen('chat');
        // 🆕 ADD CLOUD LOADING HERE
        if (user) {
          const cloudMessages = await loadChatFromCloud(user.uid, deity.id);
          if (cloudMessages && cloudMessages.length > 0) {
            setMessages(cloudMessages);
            localStorage.setItem('chatMessages', JSON.stringify(cloudMessages));
            return;
          }
        }
        const welcomeMessage = {
          id: Date.now(),
          text: `Welcome, blessed seeker. Your offering has been accepted. I am ${deityName}. You have 50 divine messages. ${deityBlessing}`,
          sender: 'deity',
          deity: deity,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages([welcomeMessage]);
        localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      setIsProcessingPayment(false);
      alert('❌ Payment verification failed. Please contact support.');
    }
  };

  return (
    <>
    <Header user={user} navigateTo={navigateTo} currentScreen={currentScreen} />
    <div className="main-content">
      <BuyMoreModal
        isOpen={showBuyMoreModal}
        onClose={() => setShowBuyMoreModal(false)}
        deity={selectedDeity}
        onBuyMore={handleBuyMoreMessages}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        deity={selectedDeityForPremium}
        onPurchase={handlePurchase}
        isProcessingPayment={isProcessingPayment}
      />

      {/* Welcome Screen */}
      {/* Fixed Welcome Screen */}
      {currentScreen === 'welcome' && ( 
        <div className="app welcome-screen">
          <div className="temple-background"></div>
          <div className="floating-diwali"></div>
          <div className="floating-om">ॐ</div>
          <div className="floating-lotus">🌸</div>
          
          {/* Hero — logo + tagline, no box */}
          <div className="welcome-hero">
            <div className="brand-section">
              <div className="logo-large">
                <img src="/logo.png" alt="Astravedam" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }} style={{ width: '80px', height: '80px' }}/>
                <div className="logo-fallback-large">A</div>
              </div>
              <div className="brand-text">
                <h1 className="welcome-title">Astravedam</h1>
                <p className="welcome-tagline">Ancient Wisdom, Modern Intelligence</p>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="features-section">

            {/* Featured: Chat — large prominent card */}
            <div className="feature-card feature-card--chat feature-card--featured" onClick={() => navigateTo('deity-select')}>
              <div className="feature-card-glow"></div>
              <div className="featured-inner">
                <div className="featured-text">
                  <span className="featured-badge">Free · 50 messages to start</span>
                  <div className="feature-icon">✦</div>
                  <h2>Chat with the Divine</h2>
                  <p>Seek wisdom from Krishna, Shiva, Lakshmi, Hanuman, Saraswati and Ganesha — responses drawn from authentic Vedic scriptures, personalized to your life and questions.</p>
                  <span className="feature-card-cta">Begin Your Journey →</span>
                </div>
                <div className="featured-deity-grid">
                  {[
                    { id: 'krishna',   color: '#FF6B35' },
                    { id: 'shiva',     color: '#8B5CF6' },
                    { id: 'lakshmi',   color: '#F59E0B' },
                    { id: 'hanuman',   color: '#FF6B6B' },
                    { id: 'saraswati', color: '#4ECDC4' },
                    { id: 'ganesha',   color: '#45B7D1' },
                  ].map(d => (
                    <div key={d.id} className="featured-deity-chip">
                      <DeityIcon id={d.id} color={d.color} size={52} borderRadius={12} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary 2×2 grid */}
            <div className="features-grid-secondary">
              <div className="feature-card feature-card--panchang" onClick={() => navigateTo('panchang')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">◉</div>
                <h4>Today's Panchang</h4>
                <p>Tithi, Nakshatra, Yoga, Rahukala and Muhurat — calculated for your location</p>
                <span className="feature-card-cta">View Today →</span>
              </div>
              <div className="feature-card feature-card--kundali" onClick={() => navigateTo('kundali')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">✧</div>
                <h4>Kundali Reading</h4>
                <p>Personalized Vedic birth chart reading from your name, date, time and place of birth</p>
                <span className="feature-card-cta">Get Reading →</span>
              </div>
              <div className="feature-card feature-card--upay" onClick={() => navigateTo('divya-upay')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">◈</div>
                <h4>Divya Upay</h4>
                <p>Sacred remedies — mantras, rituals and practices for your specific situation</p>
                <span className="feature-card-cta">Find Remedies →</span>
              </div>
              <div className="feature-card feature-card--blog" onClick={() => navigateTo('blog')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">◇</div>
                <h4>Vedic Wisdom Blog</h4>
                <p>Deep dives into Panchang, Navagraha, Sade Sati, Vastu and more</p>
                <span className="feature-card-cta">Read Articles →</span>
              </div>
            </div>

            {/* Third row — 5 more features */}
            <div className="features-grid-more">
              <div className="feature-card feature-card--milan" onClick={() => navigateTo('kundali-milan')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">💑</div>
                <h4>Kundali Milan</h4>
                <p>Ashtakoot compatibility analysis for marriage matching</p>
                <span className="feature-card-cta">Match Now →</span>
              </div>
              <div className="feature-card feature-card--muhurat" onClick={() => navigateTo('muhurat')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">🕐</div>
                <h4>Muhurat Finder</h4>
                <p>Auspicious timing for marriage, business, travel and more</p>
                <span className="feature-card-cta">Find Muhurat →</span>
              </div>
              <div className="feature-card feature-card--sadesati" onClick={() => navigateTo('sade-sati')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">🪐</div>
                <h4>Sade Sati Report</h4>
                <p>Saturn's 7.5-year transit and its impact on your moon sign</p>
                <span className="feature-card-cta">Check Report →</span>
              </div>
              <div className="feature-card feature-card--varshphal" onClick={() => navigateTo('varshphal')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">📅</div>
                <h4>Varshphal</h4>
                <p>Annual solar return reading — your year ahead, month by month</p>
                <span className="feature-card-cta">View Reading →</span>
              </div>
              <div className="feature-card feature-card--festivals" onClick={() => navigateTo('festivals')}>
                <div className="feature-card-glow"></div>
                <div className="feature-icon">🪔</div>
                <h4>Festival Calendar</h4>
                <p>Hindu festivals, fasting days and ekadashis for 2025–2026</p>
                <span className="feature-card-cta">View Calendar →</span>
              </div>
            </div>
          </div>

          {/* Testimonials — static strip */}
          <div className="testimonials-strip">
            <div className="testimonial-card">
              <p>"The guidance felt genuinely divine. Practical and deeply spiritual."</p>
              <div className="testimonial-author"><strong>Priya Sharma</strong><span>Mumbai</span></div>
            </div>
            <div className="testimonial-card">
              <p>"Made ancient wisdom accessible and relevant to modern life."</p>
              <div className="testimonial-author"><strong>Arjun Patel</strong><span>Delhi</span></div>
            </div>
            <div className="testimonial-card">
              <p>"Krishna's guidance helped me find peace during difficult times."</p>
              <div className="testimonial-author"><strong>Rahul Verma</strong><span>Bangalore</span></div>
            </div>
          </div>
        </div>
      )}

      {currentScreen === 'about'      && <About />}
      {currentScreen === 'contact'    && <Contact />}
      {currentScreen === 'privacy'    && <Privacy />}
      {currentScreen === 'panchang'   && <PanchangPage user={user} />}
      {currentScreen === 'kundali'    && <KundaliPage user={user} API_URL={API_URL} />}
      {currentScreen === 'divya-upay'    && <DivyaUpayPage user={user} />}
      {currentScreen === 'blog'          && <BlogPage navigateTo={navigateTo} />}
      {currentScreen === 'kundali-milan' && <KundaliMilanPage user={user} />}
      {currentScreen === 'muhurat'       && <MuhuratPage user={user} />}
      {currentScreen === 'sade-sati'     && <SadeSatiPage user={user} />}
      {currentScreen === 'varshphal'     && <VarshphalPage user={user} />}
      {currentScreen === 'festivals'     && <FestivalPage navigateTo={navigateTo} />}
      {currentScreen === 'profile'      && <ProfilePage user={user} navigateTo={navigateTo} />}

      {/* Deity Selection Screen */}
      {currentScreen === 'deity-select' && (
        <div className="app deity-select-screen">
          <div className="saffron-background"></div>
          <div className="floating-diwali"></div>
          <div className="floating-om">ॐ</div>
          
          <div className="selection-container">
            <div className="selection-header">
              <h1>Choose Your Divine Guide</h1>
              <p>Select a deity to begin your spiritual conversation</p>
            </div>

            <div className="deities-grid">
              {deities.map(deity => (
                <div
                  key={deity.id}
                  className="deity-card-select"
                  onClick={() => selectDeity(deity)}
                >
                  <div className="deity-glow" style={{ background: deity.color }}></div>
                  <DeityIcon id={deity.id} color={deity.color} size={80} borderRadius={20} />
                  <div className="deity-info-select">
                    <h3>{deity.name}</h3>
                    <p>{deity.description}</p>
                    <div className="deity-blessing">
                      <small>{deity.blessing}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-footer">
              <p>Each deity offers unique wisdom and perspective for your spiritual journey</p>
              {/* === 🆕 FIXED: Show premium status per deity === */}
              {userHasPremium && (
                <button 
                  className="restore-purchases-btn"
                  onClick={() => {
                    const premiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}');
                    let message = "✅ Your Premium Deities:\n\n";
                    
                    Object.entries(premiumData.purchasedDeities).forEach(([deityId, data]) => {
                      if (data.expiry > Date.now()) {
                        const deityName = deities.find(d => d.id === deityId)?.name || deityId;
                        message += `🙏 ${deityName}: ${data.remainingMessages} messages\n`;
                      }
                    });
                    
                    alert(message);
                  }}
                  style={{
                    background: '#10B981', 
                    marginTop: '15px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  View My Premium Deities
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Screen */}
      {currentScreen === 'chat' && (
      <div className={`app chat-screen ${selectedDeity?.theme || 'default'}`}>
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          deity={selectedDeityForPremium}
          onPurchase={handlePurchase}
          isProcessingPayment={isProcessingPayment}
        />

        <div className="chat-background"></div>
        <div className="floating-om">ॐ</div>
        
        <div className="chat-layout">
          <div className="chat-header">
            {/* Left: back */}
            <button className="back-button" onClick={goBackToSelection}>
              Back
            </button>

            {/* Center: deity identity */}
            <div className="deity-header-info">
              <DeityIcon id={selectedDeity.id} color={selectedDeity.color} size={48} borderRadius={14} />
              <div className="deity-chat-info">
                <h2>{selectedDeity.name}</h2>
                <p>{selectedDeity.description}</p>
              </div>
            </div>

            {/* Right: controls */}
            <div className="chat-header-controls">
              <div className="language-selector">
                <button
                  className={`lang-btn ${chatLanguage === 'english' ? 'active' : ''}`}
                  onClick={() => setChatLanguage('english')}
                >EN</button>
                <button
                  className={`lang-btn ${chatLanguage === 'hindi' ? 'active' : ''}`}
                  onClick={() => setChatLanguage('hindi')}
                >हिं</button>
              </div>

              {(userHasPremium || selectedDeity.id === 'krishna') && (
                <div className={`counter-badge ${!userHasPremium ? 'free' : ''}`}>
                  {remainingMessages} left
                </div>
              )}

              {messages.length > 0 && (
                <button className="clear-chat-button" onClick={clearChat}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="messages-area-chat">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">{selectedDeity.emoji}</div>
                <h3>Welcome to {selectedDeity.name}'s Sanctuary</h3>
                <p>{selectedDeity.blessing}</p>
                <div className="suggested-questions-chat">
                  <div className="suggestion" onClick={() => setInputMessage("How can I find inner peace?")}>
                    "How can I find inner peace?"
                  </div>
                  <div className="suggestion" onClick={() => setInputMessage("What is my life's purpose?")}>
                    "What is my life's purpose?"
                  </div>
                  <div className="suggestion" onClick={() => setInputMessage("Guide me through my current challenges...")}>
                    "Guide me through my current challenges..."
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-list-chat">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`message-chat ${message.sender}`}
                  >
                    <div className="message-bubble-chat">
                      {message.sender === 'deity' && (
                        <div className="message-header">
                          <DeityIcon id={message.deity?.id} color={message.deity?.color} size={28} borderRadius={8} />
                          <span className="deity-name-chat">{message.deity.name}</span>
                        </div>
                      )}
                      <div className="message-text-chat">{message.text}</div>
                      <div className="message-time-chat">{message.timestamp}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.sender !== 'deity' && (
                  <div className="message-chat deity">
                    <div className="message-bubble-chat">
                      <div className="message-header">
                          <DeityIcon id={selectedDeity.id} color={selectedDeity.color} size={28} borderRadius={8} />
                        <span className="deity-name-chat">{selectedDeity.name}</span>
                      </div>
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="input-area-chat">
            <div className="input-container-chat">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${selectedDeity.name} for guidance...`}
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button-chat"
                style={{ background: selectedDeity.color }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Prayer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
    {currentScreen !== 'chat' && <Footer navigateTo={navigateTo} />}
    </>
  );
}

// KEEP THESE COMPONENTS EXACTLY AS THEY ARE - no changes
function BuyMoreModal({ isOpen, onClose, deity, onBuyMore }) {
  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <div className="premium-header">
          <h2>Divine Messages Exhausted</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="premium-content">
          <div className="deity-premium-preview">
            <DeityIcon id={deity.id} color={deity.color} size={64} borderRadius={16} />
            <h3>Continue with {deity.name}</h3>
            <p>You've used all your divine messages. Purchase 50 more to continue your spiritual journey.</p>
          </div>

          <div className="pricing-card">
            <div className="price">₹15</div>
            <div className="package-details">
              <h4>50 More Divine Messages</h4>
              <ul>
                <li>✓ Continue deep conversations</li>
                <li>✓ Additional 50 messages</li>
                <li>✓ Unlimited wisdom access</li>
                <li>✓ One-time payment</li>
              </ul>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="purchase-button"
              onClick={onBuyMore}
              style={{ background: deity.color }}
            >
              <span>Buy 50 More Messages - ₹15</span>
              <span className="lock-icon">🔓</span>
            </button>
            
            <button 
              className="secondary-button"
              onClick={onClose}
            >
              Switch to Free Deity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({ isOpen, onClose, deity, onPurchase, isProcessingPayment }) {
  if (!isOpen) return null;

  return (

    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <div className="premium-header">
          {/* <div className="premium-icon">🌟</div> */}
          {/* <h2>Unlock Divine Wisdom</h2> */}
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="premium-content">
          <div className="deity-premium-preview">
            <DeityIcon id={deity.id} color={deity.color} size={64} borderRadius={16} />
            <h3>Chat with {deity.name}</h3>
            <p>{deity.description}</p>
          </div>

          <div className="pricing-card">
            <div className="price">₹15</div>
            <div className="package-details">
              <h4>50 Divine Messages</h4>
              <ul>
                <li>✓ Deep conversations with {deity.name}</li>
                <li>✓ Personalized spiritual guidance</li>
                <li>✓ Unlimited wisdom for 50 messages</li>
                <li>✓ One-time payment</li>
              </ul>
            </div>
          </div>

          <button 
          className={`purchase-button ${isProcessingPayment ? 'processing' : ''}`}
          onClick={onPurchase}
          disabled={isProcessingPayment}
          style={{ background: deity.color }}
        >
          {isProcessingPayment ? (
            <>
              <div className="spinner-small"></div>
              Processing UPI Payment...
            </>
          ) : (
            <>
              <span>Unlock with UPI - ₹15</span>
              <span className="lock-icon">🔓</span>
            </>
          )}
        </button>

          <div className="free-option">
            <p>Not ready? <button onClick={onClose}>Use remaining free messages</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;