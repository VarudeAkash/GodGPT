import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, deity-select, chat
  const [deities, setDeities] = useState([]);

  // ADD THESE NEW STATES:
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDeityForPremium, setSelectedDeityForPremium] = useState(null);
  const [userHasPremium, setUserHasPremium] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load deities on component mount
  useEffect(() => {
    fetchDeities();
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
          theme: 'lakshmi',
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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedDeity || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage, deity: selectedDeity.id }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      const divineMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'deity',
        deity: selectedDeity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, divineMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "The divine connection is weak. Please try again later.",
        sender: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const startJourney = () => {
    setCurrentScreen('deity-select');
  };

  const selectDeity = (deity) => {

    // Check if deity is not Krishna and user is not premium
    if (deity.id !== 'krishna' && !userHasPremium) {
      setSelectedDeityForPremium(deity); // Store which deity they wanted
      setShowPremiumModal(true);         // Show payment modal
      return; // Stop here, don't proceed to chat
    }

    // If Krishna or premium user, proceed normally
    setSelectedDeity(deity);
    setCurrentScreen('chat');
    // Add welcome message from the deity
    const welcomeMessage = {
      id: Date.now(),
      text: `Welcome, seeker. I am ${deity.name}. ${deity.blessing} What wisdom do you seek today?`,
      sender: 'deity',
      deity: deity,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  };

  const goBackToSelection = () => {
    setCurrentScreen('deity-select');
    setSelectedDeity(null);
    setMessages([]);
  };


  const handlePurchase = async () => {
    console.log('Purchase button clicked'); // Debug log
    
    // Set processing to true immediately
    setIsProcessingPayment(true);
    
    // Simulate 3 second payment processing
    setTimeout(() => {
      console.log('Payment simulation completed'); // Debug log
      
      // 90% success rate
      if (Math.random() > 0.1) {
        // SUCCESS
        setUserHasPremium(true);
        setRemainingMessages(50);
        setShowPremiumModal(false);
        setIsProcessingPayment(false);
        alert('🎉 Payment Successful! 50 divine messages unlocked.');
        
        // Go to chat with selected deity
        if (selectedDeityForPremium) {
          setSelectedDeity(selectedDeityForPremium);
          setCurrentScreen('chat');
          const welcomeMessage = {
            id: Date.now(),
            text: `Welcome, blessed seeker! 🙏 Your offering has been accepted. I am ${selectedDeityForPremium.name}. You have 50 divine messages. ${selectedDeityForPremium.blessing}`,
            sender: 'deity',
            deity: selectedDeityForPremium,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages([welcomeMessage]);
        }
      } else {
        // FAILED
        setIsProcessingPayment(false);
        alert('❌ Payment failed. Please try again.');
      }
    }, 3000);
  };



  return (
    <>
      {/* Premium Modal - OUTSIDE all screens, always available */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        deity={selectedDeityForPremium}
        onPurchase={handlePurchase}
        isProcessingPayment={isProcessingPayment}
      />

      {/* Welcome Screen */}
    {currentScreen === 'welcome' && ( 
      <div className="app welcome-screen">
        <div className="temple-background"></div>
        <div className="floating-diwali"></div>
        <div className="floating-om">ॐ</div>
        <div className="floating-lotus">🌸</div>
        
        <div className="welcome-container">
          <div className="welcome-content">
            <div className="main-icon">🙏</div>
            <h1 className="welcome-title">
              Divine <span className="highlight">Dialogue</span>
            </h1>
            <p className="welcome-subtitle">
              Seek Guidance from the Divine Realm
            </p>
            <p className="welcome-description">
              Connect with celestial beings, receive spiritual wisdom, and find peace through 
              meaningful conversations with Hindu deities. Your personal sanctuary for divine guidance.
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💫</div>
                <h4>Divine Wisdom</h4>
                <p>Receive guidance from enlightened beings</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌙</div>
                <h4>Spiritual Comfort</h4>
                <p>Find peace and clarity in challenging times</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📿</div>
                <h4>Personalized Guidance</h4>
                <p>Tailored advice for your unique journey</p>
              </div>
            </div>

            <button className="cta-button" onClick={startJourney}>
              <span>Begin Your Spiritual Journey</span>
              <span className="arrow">→</span>
            </button>

            <div className="testimonial">
              <p>"This app brought me peace during difficult times. Krishna's guidance felt truly divine."</p>
              <small>- Priya, Mumbai</small>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Deity Selection Screen */}
  {currentScreen === 'deity-select' && (
      <div className="app deity-select-screen">
        <div className="saffron-background"></div>
        <div className="floating-diwali"></div>
        <div className="floating-om">ॐ</div>
        
        <div className="selection-container">
          <div className="selection-header">
            <button className="back-button" onClick={() => setCurrentScreen('welcome')}>
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
          </div>
        </div>
      </div>
    )}

    
    {/* Chat Screen */}
    {currentScreen === 'chat' && (
    <div className={`app chat-screen ${selectedDeity?.theme || 'default'}`}>

      {/* ADD THIS MODAL */}
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
        {/* Header */}
        <div className="chat-header">
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
          {messages.length > 0 && (
            <button className="clear-chat-button" onClick={clearChat}>
              🧹 Clear
            </button>
          )}
        </div>

        {/* Messages Area */}
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
              
              {isLoading && (
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

        {/* Input Area */}
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
    </>
  );
}

// Premium Modal Component - ADD THIS BEFORE export default App
function PremiumModal({ isOpen, onClose, deity, onPurchase,isProcessingPayment }) {
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
            <p>Want to try first? <button onClick={onClose}>Chat with Lord Krishna for FREE</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;