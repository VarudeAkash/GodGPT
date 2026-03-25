import Head from 'next/head';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useChat } from '../src/context/ChatContext';
import DeityIcon from '../src/components/DeityIcon';
import BuyMoreModal from '../src/components/BuyMoreModal';
import PremiumModal from '../src/components/PremiumModal';
import { savePremiumToCloud, loadChatFromCloud } from '../src/utils/cloudSave.js';
import { loadDeityMemory } from '../src/utils/deityMemory.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function DeitySelect() {
  const router = useRouter();
  const { user, userHasPremium, setUserHasPremium, remainingMessages, setRemainingMessages, premiumData, setPremiumData } = useAuth();
  const { deities, setSelectedDeity, setMessages, setDeityMemory } = useChat();

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDeityForPremium, setSelectedDeityForPremium] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showBuyMoreModal, setShowBuyMoreModal] = useState(false);
  const paymentTimeoutRef = useRef(null);

  const selectDeity = async (deity) => {
    let freshCount = 50;

    // All deity chats require login
    if (!user) {
      alert('Please sign in to chat with the deities.');
      return;
    }

    // Check Krishna free messages
    if (deity.id === 'krishna') {
      const stored = localStorage.getItem('freeKrishnaMessages');
      if (!stored) {
        localStorage.setItem('freeKrishnaMessages', '50');
        freshCount = 50;
      } else {
        freshCount = parseInt(stored);
        if (freshCount <= 0) {
          setSelectedDeityForPremium(deity);
          setShowPremiumModal(true);
          return;
        }
      }
    }
    // Check premium deities
    else {
      const deityPremium = (premiumData.purchasedDeities || {})[deity.id];
      if (!deityPremium || deityPremium.remainingMessages <= 0 || deityPremium.expiry <= Date.now()) {
        setSelectedDeityForPremium(deity);
        setShowPremiumModal(true);
        return;
      }
      freshCount = deityPremium.remainingMessages;
    }

    setRemainingMessages(freshCount);

    // Check if we're selecting the SAME deity that has existing chat
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
    setSelectedDeity(deity);

    // Load existing messages if same deity, otherwise welcome
    if (isSameDeity && savedMessages) {
      try { setMessages(JSON.parse(savedMessages)); } catch { setMessages([]); }
    } else {
      const welcomeMessage = {
        id: Date.now(),
        text: userHasPremium
          ? `Welcome, blessed seeker. I am ${deity.name}. You have ${freshCount} divine messages remaining. ${deity.blessing} What wisdom do you seek today?`
          : `Welcome, seeker. I am ${deity.name}. ${deity.blessing} You have ${freshCount} free messages. What wisdom do you seek today?`,
        sender: 'deity',
        deity: deity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
    }

    router.push('/chat');
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
      alert('Payment failed. Please try again.');
    }
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
        const updatedPremium = {
          ...premiumData,
          purchasedDeities: {
            ...(premiumData.purchasedDeities || {}),
            [deityId]: {
              remainingMessages: 50,
              expiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
              purchaseDate: Date.now(),
              paymentId: response.razorpay_payment_id
            }
          },
          userHasPremium: true
        };

        setPremiumData(updatedPremium);
        savePremiumToCloud(user.uid, updatedPremium);

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
        setSelectedDeity(deity);

        // Load cloud messages if available
        if (user) {
          const cloudMessages = await loadChatFromCloud(user.uid, deity.id);
          if (cloudMessages && cloudMessages.length > 0) {
            setMessages(cloudMessages);
            localStorage.setItem('chatMessages', JSON.stringify(cloudMessages));
            router.push('/chat');
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
        router.push('/chat');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      setIsProcessingPayment(false);
      alert('Payment verification failed. Please contact support.');
    }
  };

  const handleBuyMoreMessages = async () => {
    setShowBuyMoreModal(false);
    setSelectedDeityForPremium(null);
    setShowPremiumModal(true);
  };

  return (
    <>
      <Head>
        <title>Chat with Hindu Deities — Krishna, Shiva, Lakshmi | Astravedam</title>
        <meta name="description" content="Choose your divine guide and start a spiritual conversation. Chat with Lord Krishna, Shiva, Lakshmi, Hanuman, Saraswati or Ganesha. First 50 messages with Krishna are free." />
        <link rel="canonical" href="https://astravedam.com/deity-select" />
        <meta property="og:title" content="Chat with Hindu Deities | Astravedam" />
        <meta property="og:description" content="Chat with Krishna, Shiva, Lakshmi, Hanuman, Saraswati or Ganesha. AI-powered spiritual guidance from authentic Vedic scriptures." />
        <meta property="og:url" content="https://astravedam.com/deity-select" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <div className="app deity-select-screen">
        <BuyMoreModal
          isOpen={showBuyMoreModal}
          onClose={() => setShowBuyMoreModal(false)}
          deity={null}
          onBuyMore={handleBuyMoreMessages}
        />

        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          deity={selectedDeityForPremium}
          onPurchase={handlePurchase}
          isProcessingPayment={isProcessingPayment}
        />

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
            {user && userHasPremium && (
              <button
                className="restore-purchases-btn"
                onClick={() => {
                  let message = "Your Premium Deities:\n\n";
                  Object.entries(premiumData.purchasedDeities || {}).forEach(([deityId, data]) => {
                    if (data.expiry > Date.now()) {
                      const deityName = deities.find(d => d.id === deityId)?.name || deityId;
                      message += `${deityName}: ${data.remainingMessages} messages\n`;
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
    </>
  );
}
