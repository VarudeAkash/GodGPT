import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/header.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Privacy from './components/Privacy.jsx'; 

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
  const [showBuyMoreModal, setShowBuyMoreModal] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  // === ADD THIS NEW EFFECT ===
  
  useEffect(() => {
    // Set initial screen based on URL hash
    const hash = window.location.hash.replace('#', '');
    
    console.log('Current hash:', hash); // Debug log
    
    if (hash === 'deity-select') {
      setCurrentScreen('deity-select');
    } else if (hash === 'chat') {
      // Try to restore chat state from localStorage
      const savedDeity = localStorage.getItem('selectedDeity');
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedDeity) {
        setSelectedDeity(JSON.parse(savedDeity));
        setCurrentScreen('chat');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } else {
        // If no saved deity, go to selection
        window.location.hash = 'deity-select';
        setCurrentScreen('deity-select');
      }
    } else if (hash === 'about') {
      setCurrentScreen('about');
    } else if (hash === 'contact') {
      setCurrentScreen('contact');
    } else if (hash === 'privacy') {
      setCurrentScreen('privacy');
    } else if (!hash || hash === 'welcome') {
      setCurrentScreen('welcome');
    }
    // Removed the else block that was forcing welcome screen
    
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const newHash = window.location.hash.replace('#', '');
      console.log('Popstate hash:', newHash); // Debug log
      
      if (newHash === 'deity-select' && currentScreen !== 'deity-select') {
        setCurrentScreen('deity-select');
        setSelectedDeity(null);
        setMessages([]);
      } else if (newHash === 'chat' && currentScreen !== 'chat') {
        const savedDeity = localStorage.getItem('selectedDeity');
        if (savedDeity) {
          setSelectedDeity(JSON.parse(savedDeity));
          setCurrentScreen('chat');
        } else {
          window.location.hash = 'deity-select';
          setCurrentScreen('deity-select');
        }
      } else if (newHash === 'about' && currentScreen !== 'about') {
        setCurrentScreen('about');
      } else if (newHash === 'contact' && currentScreen !== 'contact') {
        setCurrentScreen('contact');
      } else if (newHash === 'privacy' && currentScreen !== 'privacy') {
        setCurrentScreen('privacy');
      } else if ((!newHash || newHash === 'welcome') && currentScreen !== 'welcome') {
        setCurrentScreen('welcome');
        setSelectedDeity(null);
        setMessages([]);
      }
    };
  
    window.addEventListener('popstate', handlePopState);
  
    // Load premium status
    const loadPremiumStatus = () => {
      const premiumData = localStorage.getItem('premiumData');
      const freeKrishnaMessages = localStorage.getItem('freeKrishnaMessages');
      
      if (freeKrishnaMessages) {
        const remainingFree = parseInt(freeKrishnaMessages);
        setRemainingMessages(remainingFree);
      } else {
        localStorage.setItem('freeKrishnaMessages', '50');
        setRemainingMessages(50);
      }
      
      if (premiumData) {
        const data = JSON.parse(premiumData);
        const hasActivePremium = Object.values(data.purchasedDeities || {}).some(
          deity => deity.expiry > Date.now() && deity.remainingMessages > 0
        );
        
        if (hasActivePremium) {
          setUserHasPremium(true);
          if (selectedDeity && data.purchasedDeities[selectedDeity.id]) {
            setRemainingMessages(data.purchasedDeities[selectedDeity.id].remainingMessages);
          }
        }
      }
    };
  
    loadPremiumStatus();
  
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  // Load deities on component mount
  useEffect(() => {
    fetchDeities();
  }, []);
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3); // 3 testimonials
    }, 4000); // Change every 4 seconds
  
    return () => clearInterval(testimonialInterval);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDeities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/deities`);
      const data = await response.json();
      setDeities(data.deities);
    } catch (error) {
      console.error('Error fetching deities:', error);
      // Fallback deities with beautiful data
      setDeities([
        {
          id: 'krishna',
          name: 'Lord Krishna',
          emoji: '🕉️',
          color: '#FF6B35',
          theme: 'krishna',
          description: 'Divine Mentor & Compassionate Guide',
          blessing: 'May you find wisdom in every challenge'
        },
        {
          id: 'shiva',
          name: 'Lord Shiva', 
          emoji: '☯️',
          color: '#8B5CF6',
          theme: 'shiva',
          description: 'The Eternal Yogi & Destroyer of Illusions',
          blessing: 'May you find peace in meditation'
        },
        {
          id: 'lakshmi',
          name: 'Goddess Lakshmi',
          emoji: '🌸',
          color: '#F59E0B',
          theme: 'lakshma',
          description: 'Goddess of Prosperity & Spiritual Wealth',
          blessing: 'May abundance flow through your life'
        },
        {
          id: 'hanuman',
          name: 'Lord Hanuman',
          emoji: '🐒',
          color: '#FF6B6B',
          theme: 'hanuman',
          description: 'Embodiment of Devotion & Strength',
          blessing: 'May courage guide your path'
        },
        {
          id: 'saraswati',
          name: 'Goddess Saraswati',
          emoji: '📚',
          color: '#4ECDC4',
          theme: 'saraswati',
          description: 'Goddess of Knowledge & Creative Wisdom',
          blessing: 'May wisdom illuminate your journey'
        },
        {
          id: 'ganesha',
          name: 'Lord Ganesha',
          emoji: '🐘',
          color: '#45B7D1',
          theme: 'ganesha',
          description: 'Remover of Obstacles & Lord of Beginnings',
          blessing: 'May your path be clear of obstacles'
        }
      ]);
    }
  };

  // === MODIFIED: startJourney ===
  const startJourney = () => {
    window.history.pushState({}, '', '#deity-select');
    setCurrentScreen('deity-select');
  };

  // === MODIFIED: selectDeity ===
  const selectDeity = (deity) => {
    const premiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}');
    
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
  
    // Save deity to localStorage for back button recovery
    localStorage.setItem('selectedDeity', JSON.stringify(deity));
    window.history.pushState({}, '', '#chat');
    
    setSelectedDeity(deity);
    setCurrentScreen('chat');
    
    const welcomeMessage = {
      id: Date.now(),
      text: userHasPremium 
        ? `Welcome, blessed seeker! 🙏 I am ${deity.name}. You have ${remainingMessages} divine messages remaining. ${deity.blessing} What wisdom do you seek today?`
        : `Welcome, seeker. I am ${deity.name}. ${deity.blessing} You have ${remainingMessages} free messages. What wisdom do you seek today?`,
      sender: 'deity',
      deity: deity,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
  };

  // === MODIFIED: goBackToSelection ===
  const goBackToSelection = () => {
    window.history.pushState({}, '', '#deity-select');
    setCurrentScreen('deity-select');
    setSelectedDeity(null);
    setMessages([]);
    localStorage.removeItem('selectedDeity');
    localStorage.removeItem('chatMessages');
  };

  // === NEW FUNCTION: goToWelcome ===
  const goToWelcome = () => {
    window.history.pushState({}, '', '#welcome');
    setCurrentScreen('welcome');
    setSelectedDeity(null);
    setMessages([]);
    localStorage.removeItem('selectedDeity');
    localStorage.removeItem('chatMessages');
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
      const premiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}');
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
        body: JSON.stringify({ message: inputMessage, deity: selectedDeity.id }),
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
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "The divine connection is weak. Please try again later.",
        sender: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const errorMessages = [...newMessages, errorMessage];
      setMessages(errorMessages);
      localStorage.setItem('chatMessages', JSON.stringify(errorMessages));
      
      // Restore message count if error occurred
      if (selectedDeity.id !== 'krishna' && userHasPremium) {
        setRemainingMessages(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
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
      
      razorpay.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        setIsProcessingPayment(false);
        alert('Payment failed. Please try again.');
      });
      
      razorpay.open();

      const timeoutId = setTimeout(() => {
        if (isProcessingPayment) {
          setIsProcessingPayment(false);
          alert('Payment completed! Please refresh the page to access premium features.');
        }
      }, 40000);

      return () => clearTimeout(timeoutId);
  
    } catch (error) {
      console.error('Payment error:', error);
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
  
      const verificationData = await verificationResponse.json();
      
      if (verificationData.success) {
        // === 🆕 FIXED: Save per-deity premium data ===
        const existingData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}');
        
        existingData.purchasedDeities[deityId] = {
          remainingMessages: 50,
          expiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          purchaseDate: Date.now(),
          paymentId: response.razorpay_payment_id
        };
        existingData.userHasPremium = true;
        
        localStorage.setItem('premiumData', JSON.stringify(existingData));
        
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
        const welcomeMessage = {
          id: Date.now(),
          text: `Welcome, blessed seeker! 🙏 Your offering has been accepted. I am ${deityName}. You have 50 divine messages. ${deityBlessing}`,
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
      console.error('Payment verification error:', error);
      setIsProcessingPayment(false);
      alert('❌ Payment verification failed. Please contact support.');
    }
  };

  return (
    <>
    <Header />
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
          
          <div className="welcome-container">
            <div className="welcome-content">
              
              {/* Compact Header */}
              <div className="main-header">
                <div className="brand-section">
                <div className="logo-large">
                  <img src="/logo.png" alt="Hindu.Dharma.AI" onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }} style={{ width: '120px', height: '120px' }}/>
                  <div className="logo-fallback-large">🕉️</div>
                </div>
                  <div className="brand-text">
                    <h1 className="welcome-title">Astravedam</h1>
                    <p className="welcome-tagline">Ancient Wisdom, Modern Intelligence</p>
                  </div>
                </div>
              </div>

              {/* Immediate CTA */}
              <div className="immediate-cta">
                <button className="cta-button" onClick={startJourney}>
                  <span>Begin Your Spiritual Journey</span>
                  <span className="arrow">→</span>
                </button>
                <p className="cta-note">
                  Start with free messages from Lord Krishna
                </p>
              </div>

              {/* Feature Cards */}
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🌅</div>
                  <h4>Divine Conversations</h4>
                  <p>Engage in meaningful dialogues with AI-powered deities, crafted from authentic scriptures</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📜</div>
                  <h4>Authentic Guidance</h4>
                  <p>Receive wisdom based on Bhagavad Gita, Vedas, Puranas, and sacred texts</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💫</div>
                  <h4>Personalized Insights</h4>
                  <p>Get tailored spiritual guidance for your unique life situations</p>
                </div>
              </div>

              {/* How It Works - Compact */}
              <div className="how-it-works">
                <h3>How It Works</h3>
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Choose Your Guide</h5>
                      <p>Select from enlightened deities</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Ask Your Questions</h5>
                      <p>Seek guidance on life and purpose</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Receive Wisdom</h5>
                      <p>Get profound insights with references</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rotating Testimonials */}
              <div className="testimonials-rotating">
                <div className={`testimonial ${activeTestimonial === 0 ? 'active' : ''}`}>
                  <p>"The guidance felt genuinely divine. Practical and deeply spiritual."</p>
                  <div className="testimonial-author">
                    <strong>Priya Sharma</strong>
                    <span>Mumbai</span>
                  </div>
                </div>
                <div className={`testimonial ${activeTestimonial === 1 ? 'active' : ''}`}>
                  <p>"Made ancient wisdom accessible and relevant to modern life."</p>
                  <div className="testimonial-author">
                    <strong>Arjun Patel</strong>
                    <span>Delhi</span>
                  </div>
                </div>
                <div className={`testimonial ${activeTestimonial === 2 ? 'active' : ''}`}>
                  <p>"Krishna's guidance helped me find peace during difficult times."</p>
                  <div className="testimonial-author">
                    <strong>Rahul Verma</strong>
                    <span>Bangalore</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* About Screen */}
      {currentScreen === 'about' && (
        <About />
      )}
      {currentScreen === 'contact' && (
        <Contact />
      )}
      {currentScreen === 'privacy' && (
        <Privacy />
      )}

      {/* Deity Selection Screen */}
      {currentScreen === 'deity-select' && (
        <div className="app deity-select-screen">
          <div className="saffron-background"></div>
          <div className="floating-diwali"></div>
          <div className="floating-om">ॐ</div>
          
          <div className="selection-container">
            <div className="selection-header">
              {/* === CHANGED: Now uses goToWelcome === */}
              <button className="back-button" onClick={goToWelcome}>
                ← Back
              </button>
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
                  <div className="deity-avatar-select" style={{ background: deity.color }}>
                    <span className="deity-emoji-select">{deity.emoji}</span>
                  </div>
                  <div className="deity-info-select">
                    <h3>{deity.name}</h3>
                    <p>{deity.description}</p>
                    <div className="deity-blessing">
                      <small>💫 {deity.blessing}</small>
                    </div>
                  </div>
                  <div className="select-arrow">→</div>
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
                  ✅ View My Premium Deities
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
            {/* === CHANGED: Now uses goBackToSelection === */}
            <button className="back-button" onClick={goBackToSelection}>
              ← Choose Another Deity
            </button>
            <div className="deity-header-info">
              <div className="deity-avatar-chat" style={{ background: selectedDeity.color }}>
                <span>{selectedDeity.emoji}</span>
              </div>
              <div className="deity-chat-info">
                <h2>Chat with {selectedDeity.name}</h2>
                <p>{selectedDeity.description}</p>
              </div>
            </div>
            {(userHasPremium || selectedDeity.id === 'krishna') && (
              <div className="message-counter">
                <div className={`counter-badge ${!userHasPremium ? 'free' : ''}`}>
                  {remainingMessages} {selectedDeity.id === 'krishna' && !userHasPremium ? 'free' : ''} messages left
                </div>
              </div>
            )}
            
            {messages.length > 0 && (
              <button className="clear-chat-button" onClick={clearChat}>
                🧹 Clear
              </button>
            )}
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
                          <div className="deity-avatar-small" style={{ background: message.deity.color }}>
                            <span>{message.deity.emoji}</span>
                          </div>
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
                        <div className="deity-avatar-small" style={{ background: selectedDeity.color }}>
                          <span>{selectedDeity.emoji}</span>
                        </div>
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
                    <span className="prayer-icon">🙏</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
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
          <div className="premium-icon">🌟</div>
          <h2>Divine Messages Exhausted</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="premium-content">
          <div className="deity-premium-preview">
            <div className="premium-deity-avatar" style={{ background: deity.color }}>
              {deity.emoji}
            </div>
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
          <div className="premium-icon">🌟</div>
          <h2>Unlock Divine Wisdom</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="premium-content">
          <div className="deity-premium-preview">
            <div className="premium-deity-avatar" style={{ background: deity.color }}>
              {deity.emoji}
            </div>
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