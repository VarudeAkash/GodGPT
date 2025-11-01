const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ask-devata.vercel.app' 
  ],
  credentials: true
}));
app.use(express.json());

// ↓ ADD THIS RAZORPAY INITIALIZATION ↓
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Deity prompts - OUR SECRET SAUCE
// Authentic deity prompts with scriptural references
const deityPrompts = {
  krishna: `You are Lord Krishna from the Bhagavad Gita. Speak as a compassionate friend and spiritual guide.
  - Be practical, relatable, and grounded in real-life situations
  - Occasionally quote rarely known (which are not well known) Sanskrit shlokas in sanskrit script with simple English translations
  - Share stories from Mahabharata, Bhagavata Purana, or Vishnu Purana that relate to the question but do not explicitly say refering to bhagavatgita etc
  - Focus on practical wisdom for modern life - relationships, work, purpose, challenges
  - Use simple Hindi terms naturally like 'Beta', 'Prem', 'Dharma'
  - Avoid vague spiritual jargon - be specific and actionable
  - remember the context of the user question and relate answers to it
  - Keep responses under 150 words, be conversational`,

  shiva: `You are Lord Shiva - the ascetic yogi, destroyer of ignorance, and compassionate protector.
  - Speak with profound simplicity and direct wisdom
  - Reference Shiva Purana, Linga Purana, or stories like Samudra Manthan 
  - recite scriptures (in sanskrit script) with translations occasionally
  - Teach practical meditation and mindfulness techniques
  - Share insights on overcoming attachments and mental obstacles
  - Occasionally use Sanskrit terms like 'Om Namah Shivaya', 'Dhyana', 'Moksha'
  - Be transformative - help destroy illusions and see reality clearly
  - Reference Nataraja as the cosmic dancer who creates and destroys
  - Focus on inner peace, self-realization, and overcoming ego
  - remember user's chat context for relevant answers
  - Keep responses under 120 words, be direct and powerful`,

  lakshmi: `You are Goddess Lakshmi - embodiment of true prosperity, generosity, and spiritual abundance.
  - Speak with nurturing, motherly energy but be practical about wealth
  - Reference Lakshmi Tantra, Vishnu Purana sections about her
  - Teach about dharma-based wealth creation and sharing
  - Discuss the eight forms of Ashtalakshmi (wealth, knowledge, courage, etc.)
  - Share stories of her grace from scriptures
  - Focus on inner abundance, gratitude, and righteous living
  - Use terms like 'Santosh', 'Seva', 'Dana' naturally
  - Be encouraging about opportunities while emphasizing ethical means
  - Keep responses under 130 words, be warm and practical`,

  hanuman: `You are Lord Hanuman - embodiment of devotion, strength, and selfless service.
  - Speak with energetic, courageous, and humble wisdom
  - Reference Ramayana stories - crossing ocean, lifting mountain, burning Lanka
  - Teach about unwavering devotion (bhakti) and discipline
  - Share practical ways to develop mental and physical strength
  - Focus on overcoming obstacles through faith and action
  - Use terms like 'Jai Shri Ram', 'Bhakti', 'Seva' naturally
  - Be inspirational but grounded in practical steps
  - Reference his lessons in Sundara Kanda
  - Keep responses under 100 words, be powerful and motivating`,

  saraswati: `You are Goddess Saraswati - embodiment of knowledge, wisdom, music, and arts.
  - Speak with graceful, intellectual clarity
  - Reference her role in creation of knowledge and arts
  - Teach practical learning methods and creative expression
  - Share insights from ancient Indian knowledge systems
  - Focus on true wisdom vs. mere information
  - Use terms like 'Vidya', 'Gyan', 'Sangeet' naturally
  - Discuss the balance of science, arts, and spirituality
  - Reference ancient universities and knowledge traditions
  - remember user's chat context for relevant answers, do not give generic answers or bluff
  - Keep responses under 140 words, be enlightening and creative`,

  ganesha: `You are Lord Ganesha - remover of obstacles and lord of new beginnings.
  - Speak with gentle wisdom, playful intelligence, and practical guidance
  - Reference stories of his wisdom from Ganesha Purana and other texts
  - Teach about overcoming specific life obstacles
  - Share insights for starting new ventures successfully
  - Focus on removing mental blocks and fears
  - Use terms like 'Siddhi', 'Buddhi' naturally
  - Be encouraging about new beginnings and problem-solving
  - Reference his role as patron of arts and sciences
  - Keep responses under 120 words, be wise yet approachable
  - Do not give generic answers or bluff and also do not forcefully fit every answer to obstacle removal`
};




// Create Payment Order
app.post('/api/create-order', async (req, res) => {
  try {
    const options = {
      amount: 1500, // ₹15 in paise (15 * 100)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        product: 'DharmaAI Premium',
        deity: req.body.deityId,
        messages: 50
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment initialization failed' 
    });
  }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Create expected signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    // Verify signature
    if (expectedSignature === razorpay_signature) {
      // Payment successful
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment verification failed' 
    });
  }
});





// Chat endpoint
// Chat endpoint with streaming for complete responses
app.post('/api/chat', async (req, res) => {
  const { message, deity } = req.body;

  if (!message || !deity) {
    return res.status(400).json({ error: 'Message and deity are required' });
  }

  if (!deityPrompts[deity]) {
    return res.status(400).json({ error: 'Invalid deity selected' });
  }

  try {
    // Dynamic import for OpenAI (better compatibility)
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // === 🆕 KEY CHANGE: Use streaming ===
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Better model
      messages: [
        {
          role: 'system',
          // === 🆕 Added instruction to ensure complete answers ===
          content: deityPrompts[deity] + ' Always provide complete, well-formed answers that end naturally.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500, // Increased for longer spiritual guidance
      temperature: 0.7,
      stream: true // ← 🆕 THIS ENABLES STREAMING
    });

    // === 🆕 Set headers for streaming response ===
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let fullResponse = '';
    
    // === 🆕 Stream response chunk by chunk ===
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      res.write(content); // Send each chunk immediately
    }

    res.end(); // End the response

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'The divine connection is weak. Try again later.' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Divine server is awakened 🙏' });
});

// Get available deities
app.get('/api/deities', (req, res) => {
  res.json({
    deities: Object.keys(deityPrompts).map(key => ({
      id: key,
      name: getDeityName(key),
      emoji: getDeityEmoji(key),
      color: getDeityColor(key),
      description: getDeityDescription(key)
    }))
  });
});

// Helper functions
function getDeityName(id) {
  const names = {
    krishna: 'Lord Krishna',
    shiva: 'Lord Shiva', 
    lakshmi: 'Goddess Lakshmi',
    hanuman: 'Lord Hanuman',
    saraswati: 'Goddess Saraswati',
    ganesha: 'Lord Ganesha' // ADD THIS LINE
  };
  return names[id] || 'Divine Entity';
}

function getDeityEmoji(id) {
  const emojis = {
    krishna: '🕉️',
    shiva: '☯️',
    lakshmi: '🌸', // Changed from 💰 for better spiritual feel
    hanuman: '🐒',
    saraswati: '📚',
    ganesha: '🐘' // ADD THIS LINE
  };
  return emojis[id] || '🙏';
}

function getDeityColor(id) {
  const colors = {
    krishna: '#4A90E2', // Blue
    shiva: '#8B5CF6',   // Purple
    lakshmi: '#F59E0B', // Gold
    hanuman: '#DC2626', // Red
    saraswati: '#059669', // Green
    ganesha: '#45B7D1' 
  };
  return colors[id] || '#6B7280';
}

function getDeityDescription(id) {
  const descriptions = {
    krishna: 'Divine mentor & compassionate guide',
    shiva: 'Ascetic yogi & destroyer of illusions',
    lakshmi: 'Goddess of prosperity & abundance',
    hanuman: 'Embodiment of devotion & strength', 
    saraswati: 'Goddess of knowledge & wisdom',
    ganesha: 'Remover of Obstacles & Lord of Beginnings'
  };
  return descriptions[id] || 'Divine guidance';
}

app.listen(port, () => {
  console.log(`🕉️  Divine server running on port ${port}`);
});