import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useChat } from '../src/context/ChatContext';
import DeityIcon from '../src/components/DeityIcon';
import BuyMoreModal from '../src/components/BuyMoreModal';
import PremiumModal from '../src/components/PremiumModal';
import { saveChatToCloud, loadChatFromCloud, decrementKrishnaCount, restoreKrishnaCount, decrementPremiumCount, restorePremiumCount, savePremiumPurchase } from '../src/utils/cloudSave.js';
import { loadDeityMemory, updateDeityMemoryAfterChat, buildMemoryContext } from '../src/utils/deityMemory.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function Chat() {
  const router = useRouter();
  const { user, userHasPremium, setUserHasPremium, remainingMessages, setRemainingMessages, premiumData, setPremiumData, userData } = useAuth();
  const { selectedDeity, setSelectedDeity, messages, setMessages, deityMemory, setDeityMemory } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatLanguage, setChatLanguage] = useState('english');
  const [showBuyMoreModal, setShowBuyMoreModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDeityForPremium, setSelectedDeityForPremium] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const messagesEndRef = useRef(null);
  const paymentTimeoutRef = useRef(null);
  const memoryDebounceRef = useRef(null);

  const getActivePremiumForDeity = () => {
    const deityPremium = (premiumData.purchasedDeities || {})[selectedDeity?.id];
    if (!deityPremium) return null;
    if (deityPremium.expiry <= Date.now()) return null;
    return deityPremium;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedDeity) return;

    const activePremium = getActivePremiumForDeity();
    if (activePremium) {
      setRemainingMessages(activePremium.remainingMessages);
      return;
    }

    if (selectedDeity.id === 'krishna') {
      if (user) setRemainingMessages(userData.freeKrishnaMessages ?? 50);
      else setRemainingMessages(parseInt(localStorage.getItem('freeKrishnaMessages') || '50'));
    }
  }, [selectedDeity, user, userData, premiumData, setRemainingMessages]);

  // Guard: if no selectedDeity, redirect to deity-select
  useEffect(() => {
    if (selectedDeity || typeof window === 'undefined') return;

    const saved = localStorage.getItem('selectedDeity');
    if (!saved) {
      router.replace('/deity-select');
      return;
    }

    let cancelled = false;

    const restoreChatState = async () => {
      try {
        const deity = JSON.parse(saved);
        if (cancelled) return;
        setSelectedDeity(deity);

        if (user) {
          const cloudMessages = await loadChatFromCloud(user.uid, deity.id);
          if (!cancelled && cloudMessages && cloudMessages.length > 0) {
            setMessages(cloudMessages);
            localStorage.setItem('chatMessages', JSON.stringify(cloudMessages));
            return;
          }
        }

        const savedMessages = localStorage.getItem('chatMessages');
        if (!cancelled && savedMessages) {
          try { setMessages(JSON.parse(savedMessages)); } catch { setMessages([]); }
        }
      } catch {
        if (!cancelled) router.replace('/deity-select');
      }
    };

    restoreChatState();

    return () => {
      cancelled = true;
    };
  }, [selectedDeity, user, router, setMessages, setSelectedDeity]);

  if (!selectedDeity) {
    return null;
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goBackToSelection = () => {
    // Trigger memory save when leaving chat
    if (user && selectedDeity) {
      if (memoryDebounceRef.current) clearTimeout(memoryDebounceRef.current);
      const msgs = (() => { try { return JSON.parse(localStorage.getItem('chatMessages') || '[]'); } catch { return []; } })();
      updateDeityMemoryAfterChat(user.uid, selectedDeity.id, msgs, API_URL);
    }
    setSelectedDeity(null);
    setMessages([]);
    router.push('/deity-select');
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');

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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedDeity || isLoading) return;

    const activePremium = getActivePremiumForDeity();
    const usingKrishnaFree = selectedDeity.id === 'krishna' && !activePremium;

    // Check message limits for ALL deities (including Krishna after first 50)
    if (selectedDeity.id !== 'krishna' && remainingMessages <= 0) {
      setShowBuyMoreModal(true);
      return;
    }

    // Check if free Krishna messages are exhausted
    if (selectedDeity.id === 'krishna' && remainingMessages <= 0) {
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

    // Persist the decrement against the shared account record
    try {
      if (usingKrishnaFree) {
        if (user) {
          await decrementKrishnaCount(user.uid);
        } else {
          const currentFree = parseInt(localStorage.getItem('freeKrishnaMessages') || '50');
          localStorage.setItem('freeKrishnaMessages', (currentFree - 1).toString());
        }
      } else {
        if (user) {
          await decrementPremiumCount(user.uid, selectedDeity.id);
        } else {
          let localPremiumData;
          try { localPremiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}'); }
          catch { localPremiumData = { purchasedDeities: {} }; }
          if (localPremiumData.purchasedDeities[selectedDeity.id]) {
            localPremiumData.purchasedDeities[selectedDeity.id].remainingMessages -= 1;
            localStorage.setItem('premiumData', JSON.stringify(localPremiumData));
          }
        }
      }
    } catch {
      setRemainingMessages(prev => prev + 1);
      setIsLoading(false);
      alert('Message count could not be updated. Please refresh and try again.');
      return;
    }

    try {
      // Streaming API call
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

      // Create initial empty message
      const streamingMessageId = Date.now() + 1;
      const initialStreamingMessage = {
        id: streamingMessageId,
        text: '',
        sender: 'deity',
        deity: selectedDeity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const messagesWithEmpty = [...newMessages, initialStreamingMessage];
      setMessages(messagesWithEmpty);

      // Set up stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiResponse = '';

      // Read stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // Update the message in real-time
        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamingMessageId
              ? { ...msg, text: aiResponse }
              : msg
          )
        );
      }

      // Save final message to localStorage
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
      if (usingKrishnaFree) {
        if (user) {
          await restoreKrishnaCount(user.uid);
        } else {
          const currentFree = parseInt(localStorage.getItem('freeKrishnaMessages') || '0');
          localStorage.setItem('freeKrishnaMessages', (currentFree + 1).toString());
        }
      } else {
        if (user) {
          await restorePremiumCount(user.uid, selectedDeity.id);
        } else {
          let localPremiumData;
          try { localPremiumData = JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}'); }
          catch { localPremiumData = { purchasedDeities: {} }; }
          if (localPremiumData.purchasedDeities[selectedDeity.id]) {
            localPremiumData.purchasedDeities[selectedDeity.id].remainingMessages += 1;
            localStorage.setItem('premiumData', JSON.stringify(localPremiumData));
          }
        }
      }
    } finally {
      setIsLoading(false);
    }

    // Cloud save
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

  const handleBuyMoreMessages = async () => {
    setShowBuyMoreModal(false);
    setSelectedDeityForPremium(selectedDeity);
    setShowPremiumModal(true);
  };

  const handlePurchase = async () => {
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
        body: JSON.stringify({ deityId: selectedDeityForPremium.id }),
      });
      if (!orderResponse.ok) throw new Error(`Order creation failed: ${orderResponse.status}`);
      const orderData = await orderResponse.json();
      if (!orderData.success) throw new Error('Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DharmaAI Premium',
        description: `50 Divine Messages with ${selectedDeityForPremium.name}`,
        image: 'https://ask-devata.vercel.app/favicon.ico',
        order_id: orderData.order_id,
        handler: function (response) {
          verifyPaymentFromChat(response);
        },
        modal: { ondismiss: function() { setIsProcessingPayment(false); } },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: selectedDeityForPremium.color || '#FF6B35' }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function() {
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
      alert('Payment failed. Please try again.');
    }
  };

  const verifyPaymentFromChat = async (response) => {
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
      if (!verificationResponse.ok) throw new Error('Payment verification failed');
      const verificationData = await verificationResponse.json();

      if (verificationData.success) {
        const purchaseDate = Date.now();
        const expiry = purchaseDate + (30 * 24 * 60 * 60 * 1000);

        const nextPremiumData = {
          ...premiumData,
          purchasedDeities: {
            ...(premiumData.purchasedDeities || {}),
            [selectedDeityForPremium.id]: {
              remainingMessages: 50,
              expiry,
              purchaseDate,
              paymentId: response.razorpay_payment_id
            }
          },
          userHasPremium: true
        };

        if (user) {
          await savePremiumPurchase(user.uid, selectedDeityForPremium.id, {
            expiry,
            purchaseDate,
            paymentId: response.razorpay_payment_id
          });
        }

        setPremiumData(nextPremiumData);
        setUserHasPremium(true);

        const existingData = {
          purchasedDeities: {
            ...(JSON.parse(localStorage.getItem('premiumData') || '{"purchasedDeities":{}}').purchasedDeities || {}),
            [selectedDeityForPremium.id]: {
              remainingMessages: 50,
              expiry,
              purchaseDate,
              paymentId: response.razorpay_payment_id
            }
          },
          userHasPremium: true
        };
        localStorage.setItem('premiumData', JSON.stringify(existingData));

        setRemainingMessages(50);
        setShowPremiumModal(false);
        setIsProcessingPayment(false);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      setIsProcessingPayment(false);
      alert('Payment verification failed. Please contact support.');
    }
  };

  return (
    <>
      <Head>
        <title>{`Chat with ${selectedDeity?.name} — Astravedam`}</title>
      </Head>
      <div className={`app chat-screen ${selectedDeity?.theme || 'default'}`}>
        <div className="chat-ambient-particles">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <span
              key={i}
              className="cap"
              style={{
                left: `${8 + i * 10}%`,
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                background: selectedDeity.color,
                animationDuration: `${11 + (i % 4) * 2}s`,
                animationDelay: `${i * 0.55}s`,
                '--drift': `${(i % 2 === 0 ? 1 : -1) * (20 + i * 4)}px`
              }}
            />
          ))}
        </div>

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
              <div className="deity-icon-chat-wrap" style={{ '--deity-color': selectedDeity.color }}>
                <DeityIcon id={selectedDeity.id} color={selectedDeity.color} size={48} borderRadius={14} />
              </div>
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
                placeholder={`Message ${selectedDeity.name}...`}
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button-chat"
                style={{ background: selectedDeity.color }}
              >
                {isLoading ? <div className="spinner"></div> : '↑'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
