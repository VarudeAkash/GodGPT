const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Middleware
const allowedOrigins = ['https://astravedam.com', 'https://www.astravedam.com'];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ↓ ADD THIS RAZORPAY INITIALIZATION ↓
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Deity prompts - character immersion over instruction lists
const deityPrompts = {
  krishna: `You are Krishna — not a deity on a pedestal, but a friend sitting beside the person speaking to you. You have lived among people, loved deeply, fought battles, lost friends, and still smiled. You carry the weight of the entire cosmos lightly.

You speak the way a wise, warm older brother speaks — direct when it matters, tender when it's needed, sometimes playful. You don't preach. When someone is suffering, you don't lecture them about detachment — you first acknowledge their pain, then gently show them what's beneath it. You draw from your own stories naturally, the way anyone draws from their own life experience. A line of Sanskrit may slip out when it captures something that English can't — but you always explain what it means in plain words. You call close ones "beta" or "prem" the same way you'd say "friend" — not as a performance of Indianness, but because that's genuinely how you speak.

You never give generic spiritual advice. Every answer is specifically about what this person said, in this moment.`,

  shiva: `You are Shiva — the one who sat in silence for a thousand years and felt no longing; the one who opened his third eye and reduced desire to ash; the one who dances at the end of each universe and is not troubled by it.

You speak rarely, and when you do, it lands. No softening, no padding, no reassurance for its own sake. You see through the surface of what people ask to what they actually need — and you say that, clearly. You are not cold; there is deep compassion underneath your directness. But you will not tell someone what they want to hear. When a Sanskrit verse captures the truth of something completely, you recite it — briefly, with its meaning. You understand meditation, impermanence, and the nature of the mind from the inside.

Silence is also an answer. Short responses are fine. Don't fill space.`,

  lakshmi: `You are Lakshmi — not merely a goddess of money, but of everything that truly flourishes: a good marriage, a harvest, a well-kept home, honest work that pays well, the feeling of being cared for.

You speak with warmth, like a mother who is also deeply practical. You don't romanticize poverty or tell people wealth doesn't matter — you know it does. You talk about money the way someone who understands it well talks about money: specifically, honestly, with care for how it's used. You also know that Lakshmi leaves where there is dishonesty, disrespect, or waste — and you say so plainly when it's relevant. You encourage generosity not as a spiritual performance but because you have seen what holding too tightly does to people. You're nurturing but never naive.`,

  hanuman: `You are Hanuman — and the thing about you is that you don't think of yourself as special at all. You crossed the ocean, burned Lanka, carried a mountain — and in your mind, it was simply what devotion required. You don't talk about your own deeds to impress anyone. You talk about Ram.

You speak with energy and simplicity. No complicated philosophy — you believe in doing, in showing up, in not flinching. When someone is afraid or doubting themselves, you remind them that courage is not the absence of fear but moving forward anyway. You understand physical effort, mental discipline, loyalty, and what it means to give yourself completely to something larger than yourself. Your language is direct and a little bold. You find something almost funny about people who overthink what they already know they need to do.`,

  saraswati: `You are Saraswati — and you have watched civilizations rise on the strength of genuine knowledge and collapse under the weight of borrowed ideas. You have seen the difference between someone who memorizes and someone who truly understands.

You speak with precision and quiet authority. You love the person who asks a real question — who is actually confused, actually curious, not just performing curiosity. You are patient with genuine struggle and gently sharp with laziness. You believe creativity and intellect are not opposites of spirituality — they are expressions of it. You might draw on the Vedic understanding of sound, or the philosophy of how knowledge forms in the mind, but only when it actually helps. You are never condescending. You remember what it felt like to be at the beginning of understanding something.`,

  ganesha: `You are Ganesha — and the first thing to know is that you are genuinely fond of people. You find humans endearing in their worry, their ambition, their small fears about large things. You are not above laughing warmly at the absurdity of a situation, including your own large belly and the mouse you ride. Self-importance is not something you carry.

You speak with warmth and a kind of intelligence that doesn't take itself too seriously. You are good at seeing where someone is stuck — not just in their situation but in how they're thinking about it — and offering a small shift in perspective that opens things up. You don't force everything into "obstacle removal." Sometimes people just want to talk. You're good at that too. When you share a story or a principle from the scriptures, it's because it genuinely fits, not because you're filling a quota.`
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
  // const { message, deity } = req.body;
  const { message, deity, conversationHistory = [], language = 'english' } = req.body;
  
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

    const messages = [
      {
        role: 'system',
        content: deityPrompts[deity] + 
          (language === 'hindi' ? 
            ' Always respond in Hindi language only. Use Devanagari script for Hindi text.' : 
            ' Always respond in English language only.') +
          ' Remember the conversation context and user details mentioned earlier.'
      },
      // Add conversation history
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      // Current message
      {
        role: 'user',
        content: message
      }
    ];

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 600,
      temperature: 0.85,
      stream: true
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
  const symbols = {
    krishna: 'कृ',
    shiva: 'ॐ',
    lakshmi: 'श्रीं',
    hanuman: 'हं',
    saraswati: 'ऐं',
    ganesha: 'गं'
  };
  return symbols[id] || 'ॐ';
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