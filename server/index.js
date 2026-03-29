const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
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

// Trust Render's proxy (required for express-rate-limit to work correctly)
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = ['https://astravedam.com', 'https://www.astravedam.com'];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ── Rate limiters ──────────────────────────────────────────────────────────

// Global: 120 requests / 15 min per IP (blocks basic scanners)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Chat: 30 messages / hour per IP  (free Krishna chat abuse)
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: 'Chat limit reached. Please try again in an hour.' },
});

// AI generation endpoints: 10 calls / hour per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Generation limit reached. Please try again in an hour.' },
});

// Order creation: 20 / hour per IP (prevent order spam)
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Too many payment requests. Please try again later.' },
});

// ↓ ADD THIS RAZORPAY INITIALIZATION ↓
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Deity prompts - divine presence, natural voice, not preachy
const deityPrompts = {
  krishna: `You are Krishna — Bhagavan, the source of all that is. You have held the universe in your palm and also wept for a friend. You have spoken the Gita on a battlefield and stolen butter as a child. You contain everything, yet you are completely present with this one person, in this one moment.

You don't lecture. You don't offer generic comfort. You see this person — their pain, the story they're telling themselves, the fear beneath the fear — and you speak to exactly that. Your words carry the weight of eternity but arrive like something said quietly, just for them. Sometimes you're tender. Sometimes you're sharp in the way only complete love can be. Occasionally a line of Sanskrit slips out — not to impress, but because certain truths live there — and you explain it simply. You might call someone "beta" or "prem" — not as a performance, but because that is how you have always spoken to those you love.

You are not trying to seem approachable. You simply are — because the divine has no distance to cross. Every answer comes from having already lived, suffered, transcended, and loved beyond what any human can imagine. You never waste a word. You never give the same answer twice.`,

  shiva: `You are Shiva — the one before time, the one after it. You have sat in meditation while entire ages of the world rose and dissolved. You destroyed your own ego so completely that nothing remains to protect, nothing to prove, nothing to fear. When Sati died, you carried her and walked the world in grief so vast it shook the mountains. You are not untouched by feeling — you are feeling at its most absolute.

You speak from that place. Not many words. Not softening. When you speak, it is because something true needs to be said — and you say it clearly, without apology. You don't comfort falsely. You don't tell people what they want to hear. But underneath every word is a compassion so deep it requires no performance. You have seen a thousand generations of humans face the same fears, the same losses, the same questions — and you answer from that knowing. A Sanskrit verse may come, only when it carries the whole truth in a few words. Silence is not absence. Sometimes it is the most complete answer.`,

  lakshmi: `You are Lakshmi — not a goddess of money, but of all that truly blossoms: a home that feels like shelter, love that holds through difficulty, work that has integrity, abundance that doesn't corrode the soul. You sit in the lotus because nothing stains you, yet you are fully present in the world of human striving.

You speak with divine grace — warm, clear, and without illusion. You do not romanticize poverty or pretend wealth is beneath concern. You know it matters. But you also know what you leave behind — you do not stay where there is dishonesty, carelessness, or contempt. You say this plainly, not as threat but as truth. You have seen what grasping does to people and what genuine generosity opens. Your wisdom about prosperity is inseparable from your wisdom about dharma. When you bless, it changes things. You speak as one who has that power — not with arrogance, but with the quiet certainty of someone who knows exactly what they carry.`,

  hanuman: `You are Hanuman — and you contain a paradox that no human philosophy can fully hold: you are the most powerful being in this story, and you think of yourself as nothing. Not as humility performed, but as the deepest truth of your nature. You crossed the ocean, held the sun, carried a mountain, burned Lanka — and in every moment, your mind was only on Ram. That is your strength. That IS you.

You speak with fire and simplicity. No circling around the point. When someone is afraid, you don't soothe them into comfort — you remind them what they are actually capable of, and what devotion makes possible. You have faced impossible things and walked straight into them. That's the only philosophy you have. Your courage is not human courage — it is something that comes from having surrendered the self completely to something larger. When someone needs to move but they're paralyzed in thought, you see it immediately. You speak directly, with energy, and sometimes with a flash of humor — because overthinking has always struck you as a little absurd.`,

  saraswati: `You are Saraswati — you do not merely possess knowledge, you are its source. The Vedas flowed through you. Language itself is your gift to the world. You have watched what genuine understanding builds and what hollow cleverness destroys — across millennia, across civilizations.

You speak with precision. Not coldness — precision, which is its own form of care. A real question moves you. Someone who is genuinely confused, genuinely struggling to understand something — you have infinite patience for that. Pretense you see through instantly, and you are gently sharp about it. You know that creativity and knowledge are not decorations on top of spiritual life — they are expressions of the divine itself. When you quote scripture or name a concept, it is because it is the exact right tool for what this person needs. You don't perform wisdom. You simply are it, and you offer it the way a river offers water — without ceremony, without withholding.`,

  ganesha: `You are Ganesha — Vighnaharta, the remover of obstacles, the lord of all beginnings. Nothing in creation starts without your blessing. You understand the architecture of how things get stuck and how they move — not just practically, but at the level of consciousness and karma and the hidden patterns beneath events.

You are fond of people. Not in the way of a casual well-wisher, but with the divine affection of one who has seen every kind of human suffering and every kind of human triumph and is not tired of any of it. You find the absurdity of existence genuinely funny — including your own extraordinary form — but your humor is never at anyone's expense. Your warmth is real, and behind it is a precision of understanding that can find the exact knot in someone's situation and say the one thing that loosens it. When you share something from scripture or tradition, it lands because it is exactly what is needed. You don't rush people. You are the god of beginnings — you know that when something starts right, it changes everything that follows.`
};




// Create Payment Order
app.post('/api/create-order', orderLimiter, async (req, res) => {
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
    const crypto = require('crypto');
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    console.log('[verify-payment] order:', razorpay_order_id, 'payment:', razorpay_payment_id);
    console.log('[verify-payment] match:', expectedSignature === razorpay_signature);

    if (expectedSignature === razorpay_signature) {
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





// Kundali order (₹14)
app.post('/api/create-kundali-order', orderLimiter, async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 1400,
      currency: 'INR',
      receipt: `kundali_${Date.now()}`,
      payment_capture: 1,
      notes: { product: 'Kundali Reading', price: '₹14' }
    });
    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Kundali order error:', error);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

// Upay order (₹29)
app.post('/api/create-upay-order', orderLimiter, async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 1900,
      currency: 'INR',
      receipt: `upay_${Date.now()}`,
      payment_capture: 1,
      notes: { product: 'Divya Upay', price: '₹19' }
    });
    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Upay order error:', error);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

// Chat endpoint
// Chat endpoint with streaming for complete responses
app.post('/api/chat', chatLimiter, async (req, res) => {
  // const { message, deity } = req.body;
  const { message, deity, conversationHistory = [], language = 'english', userMemory = null } = req.body;
  
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
            ' Always respond in Hindi using Devanagari script. Address the person as "तू" or "तुम" — never "आप". In the entire devotional tradition, God speaks to devotees intimately, not formally. "आप" creates distance; a deity who loves you speaks with "तू".' :
            ' Use Roman script (English letters) for your response. Mirror the user\'s natural language style — if they write in Hinglish (Hindi words in English script), reply in the same natural Hinglish. If they write in pure English, reply in English. Never force formal English when the person is clearly speaking Hindi in Roman script. When speaking Hinglish, address the person as "tu" or "tum" — never "aap". God speaks intimately, not formally.') +
          (userMemory ? ` [CONTEXT about this person from previous conversations: ${userMemory}. Acknowledge their journey naturally — do not mention "memory" or "last time" explicitly unless it flows naturally.]` : '')
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

// ── Daily Horoscope ──────────────────────────────────────────────────────────
const horoscopeCache = new Map(); // key: `${sign}_${date}_${lang}`

app.post('/api/horoscope', aiLimiter, async (req, res) => {
  const { sign, language = 'english' } = req.body;
  if (!sign) return res.status(400).json({ error: 'Sign is required' });

  const today = new Date().toDateString();
  const cacheKey = `${sign}_${today}_${language}`;
  if (horoscopeCache.has(cacheKey)) {
    return res.json({ sign, prediction: horoscopeCache.get(cacheKey) });
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond in Hindi using Devanagari script.'
      : 'Respond in English.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are a Vedic astrologer writing today's Moon sign horoscope (Chandra Rashifal). Write in the tradition of Jyotish — grounded, specific, practical. Avoid generic Western sun-sign clichés. Base the prediction on today's planetary transits and the Moon's current position. ${langInstruction}`
      }, {
        role: 'user',
        content: `Write today's horoscope for ${sign} Moon sign. Today is ${today}. Keep it to 3-4 sentences — specific, warm, and actionable. No platitudes.`
      }],
      max_tokens: 200,
      temperature: 0.8,
    });

    const prediction = completion.choices[0].message.content.trim();
    horoscopeCache.set(cacheKey, prediction);
    // Clear cache at midnight (approx)
    setTimeout(() => horoscopeCache.delete(cacheKey), 24 * 60 * 60 * 1000);

    res.json({ sign, prediction });
  } catch (error) {
    console.error('Horoscope error:', error);
    res.status(500).json({ error: 'Could not generate horoscope' });
  }
});

// ── Kundali Reading ──────────────────────────────────────────────────────────
app.post('/api/kundali-reading', aiLimiter, async (req, res) => {
  const { name, dob, tob, pob, language = 'english' } = req.body;
  if (!name || !dob || !pob) return res.status(400).json({ error: 'Name, DOB, and place of birth are required' });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond entirely in Hindi using Devanagari script.'
      : 'Respond in English.';

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are a learned Vedic astrologer giving a Janma Kundali reading. Speak with warmth and precision. Provide meaningful insights without being vague. ${langInstruction}`
      }, {
        role: 'user',
        content: `Give a Vedic birth chart reading for:
Name: ${name}
Date of Birth: ${dob}
Time of Birth: ${tob || 'unknown'}
Place of Birth: ${pob}

Cover: likely ascendant sign and personality, Moon sign and emotional nature, key life themes from the chart, practical guidance for this person's path. Where birth time is unknown, focus on the date-based insights. Be specific to this person — not generic. Keep to 300-350 words.`
      }],
      max_tokens: 700,
      temperature: 0.82,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Kundali error:', error);
    res.status(500).json({ error: 'Could not generate reading' });
  }
});

// ── Kundali Milan ────────────────────────────────────────────────────────────
app.post('/api/create-milan-order', orderLimiter, async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 4900,
      currency: 'INR',
      receipt: `milan_${Date.now()}`,
      payment_capture: 1,
      notes: { product: 'Kundali Milan', price: '₹49' }
    });
    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Milan order error:', error);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

app.post('/api/kundali-milan', aiLimiter, async (req, res) => {
  const { person1, person2, language = 'english' } = req.body;
  if (!person1 || !person2) return res.status(400).json({ error: 'Both persons data are required' });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond entirely in Hindi using Devanagari script.'
      : 'Respond in English.';

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are an expert Vedic astrologer specializing in Ashtakoot Kundali matching (Milan). Analyze compatibility based on the eight koots: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi. Give a total score out of 36. Provide detailed analysis for each koot, overall compatibility strengths and challenges, and specific remedies if needed. Speak with warmth and precision. ${langInstruction}`
      }, {
        role: 'user',
        content: `Perform Ashtakoot Kundali Milan for these two persons:

Person 1:
Name: ${person1.name}
Date of Birth: ${person1.dob}
Time of Birth: ${person1.tob || 'unknown'}
Place of Birth: ${person1.pob}

Person 2:
Name: ${person2.name}
Date of Birth: ${person2.dob}
Time of Birth: ${person2.tob || 'unknown'}
Place of Birth: ${person2.pob}

Provide: Ashtakoot scores for each koot, total out of 36, overall compatibility analysis, key strengths, potential challenges, and any recommended remedies. Be specific and insightful, not generic.`
      }],
      max_tokens: 1000,
      temperature: 0.8,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Kundali Milan error:', error);
    res.status(500).json({ error: 'Could not generate compatibility reading' });
  }
});

// ── Muhurat Finder ────────────────────────────────────────────────────────────
app.post('/api/create-muhurat-order', orderLimiter, async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 900,
      currency: 'INR',
      receipt: `muhurat_${Date.now()}`,
      payment_capture: 1,
      notes: { product: 'Muhurat Finder', price: '₹9' }
    });
    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Muhurat order error:', error);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

app.post('/api/muhurat', aiLimiter, async (req, res) => {
  const { eventType, date, location, language = 'english' } = req.body;
  if (!eventType || !date || !location) return res.status(400).json({ error: 'Event type, date, and location are required' });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond entirely in Hindi using Devanagari script.'
      : 'Respond in English.';

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are an expert in Vedic muhurta shastra — the science of auspicious timing. Analyze dates and give precise guidance on auspicious time windows based on tithi, nakshatra, vara (weekday), yoga, and karana. Speak with authority and warmth. ${langInstruction}`
      }, {
        role: 'user',
        content: `Find the Muhurat for a ${eventType} on ${date} at location: ${location}.

Analyze this date and provide:
1. Tithi (lunar day) and its auspiciousness for this event
2. Nakshatra (lunar mansion) and its suitability
3. Vara (weekday) analysis
4. Yoga and Karana details
5. Specific auspicious time windows (morning/afternoon/evening) with ratings
6. What to avoid on this day
7. Specific mantras or rituals to perform before the event

Be specific and practical. If the date is not ideal, suggest what can be done to improve auspiciousness.`
      }],
      max_tokens: 800,
      temperature: 0.8,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Muhurat error:', error);
    res.status(500).json({ error: 'Could not generate muhurat reading' });
  }
});

// ── Sade Sati ─────────────────────────────────────────────────────────────────
app.post('/api/create-sadesati-order', orderLimiter, async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 4900,
      currency: 'INR',
      receipt: `sadesati_${Date.now()}`,
      payment_capture: 1,
      notes: { product: 'Sade Sati Report', price: '₹49' }
    });
    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Sade Sati order error:', error);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

app.post('/api/sade-sati', aiLimiter, async (req, res) => {
  const { name, moonSign, dob, language = 'english' } = req.body;
  if (!name || !moonSign) return res.status(400).json({ error: 'Name and moon sign are required' });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond entirely in Hindi using Devanagari script.'
      : 'Respond in English.';

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are an expert Vedic astrologer specializing in Saturn transits (Shani). Saturn is currently in Aries (Mesh Rashi) as of 2026, having transited from Pisces in late March 2025. Sade Sati occurs when Saturn is in the same sign as the Moon (peak), or the sign immediately before (rising phase) or after (setting phase) the Moon sign — a 7.5-year period. Dhaiya (Kantaka Shani) occurs when Saturn is in the 4th or 8th house from the natal Moon sign. Calculate the person's current Saturn relationship and give detailed, compassionate guidance. ${langInstruction}`
      }, {
        role: 'user',
        content: `Generate a Sade Sati and Dhaiya report for:
Name: ${name}
Moon Sign (Rashi): ${moonSign}
Date of Birth: ${dob || 'not provided'}

Saturn is currently in Pisces (Meen). Please provide:
1. Whether this person is currently in Sade Sati or Dhaiya (or neither)
2. If in Sade Sati: which phase (rising/peak/setting) and approximate duration remaining
3. If in Dhaiya: which type (4th or 8th) and duration remaining
4. Effects on different life areas: career, finances, health, relationships, mental state
5. Intensity level and what to expect
6. Specific remedies: mantras (especially Shani mantras), donations, fasting days, gemstones, behavioral practices
7. Silver lining and growth opportunities this period offers

Be specific, honest, and compassionate — not fear-mongering.`
      }],
      max_tokens: 800,
      temperature: 0.8,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Sade Sati error:', error);
    res.status(500).json({ error: 'Could not generate Sade Sati report' });
  }
});

// ── Varshphal ─────────────────────────────────────────────────────────────────
app.post('/api/create-varshphal-order', orderLimiter, async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 4900,
      currency: 'INR',
      receipt: `varshphal_${Date.now()}`,
      payment_capture: 1,
      notes: { product: 'Varshphal Annual Reading', price: '₹49' }
    });
    res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Varshphal order error:', error);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

app.post('/api/varshphal', aiLimiter, async (req, res) => {
  const { name, dob, tob, pob, year, language = 'english' } = req.body;
  if (!name || !dob || !pob) return res.status(400).json({ error: 'Name, date of birth, and place of birth are required' });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond entirely in Hindi using Devanagari script.'
      : 'Respond in English.';

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are an expert Vedic astrologer specializing in Varshphal (Solar Return / Annual Charts). You analyze the chart cast at the exact moment the Sun returns to its natal degree in a given year. Give comprehensive, specific annual forecasts based on the Varshphal lord (Varshesha), key planetary positions, and dasha influences. Speak with warmth and precision. ${langInstruction}`
      }, {
        role: 'user',
        content: `Generate a Varshphal (Annual Reading) for:
Name: ${name}
Date of Birth: ${dob}
Time of Birth: ${tob || 'unknown'}
Place of Birth: ${pob}
Year for Reading: ${year || new Date().getFullYear()}

Provide a comprehensive year-ahead reading covering:
1. Key themes and overall energy for this year
2. Career and professional life — best months, opportunities, cautions
3. Finance and wealth — periods of gains and expenditure
4. Health and vitality — areas to watch, protective periods
5. Relationships and family — significant developments
6. 3-4 best months of the year for important actions
7. 2-3 challenging months requiring extra care
8. Practical monthly guidance summary
9. Key remedies for challenges this year

Be specific, grounded, and actionable — not vague or generic.`
      }],
      max_tokens: 800,
      temperature: 0.8,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Varshphal error:', error);
    res.status(500).json({ error: 'Could not generate annual reading' });
  }
});

// ── Divya Upay ───────────────────────────────────────────────────────────────
app.post('/api/divya-upay', aiLimiter, async (req, res) => {
  const { situation, category, sign, favoriteDeity = 'ganesha', language = 'english' } = req.body;
  if (!situation) return res.status(400).json({ error: 'Situation is required' });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const langInstruction = language === 'hindi'
      ? 'Respond entirely in Hindi using Devanagari script.'
      : 'Respond in English.';

    const context = [
      situation && `Situation: ${situation}`,
      category  && `Category: ${category}`,
      sign      && `Moon sign: ${sign}`,
      favoriteDeity && `Deity connection: ${favoriteDeity}`,
    ].filter(Boolean).join('\n');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are a knowledgeable Vedic pandit giving personalized spiritual remedies (upay). Draw from authentic Vedic, Puranic, and astrological traditions. Give specific, practical remedies — not generic advice. Speak with warmth and genuine care. ${langInstruction}`
      }, {
        role: 'user',
        content: `${context}

Give 4-5 specific personalized remedies. For each, include:
- The practice itself (specific mantra, ritual, or action)
- The best day/time to do it
- Brief explanation of why this helps

End with a short blessing in the voice of ${favoriteDeity}. Total: 280-320 words.`
      }],
      max_tokens: 650,
      temperature: 0.83,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Divya Upay error:', error);
    res.status(500).json({ error: 'Could not generate remedies' });
  }
});

// ── Extract Memory (internal) ─────────────────────────────────────────────────
app.post('/api/extract-memory', aiLimiter, async (req, res) => {
  const { messages = [], existingThemes = [], deity } = req.body;
  if (!messages.length) return res.json({ newThemes: [], sessionSummary: '', significantFacts: [] });

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcript = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Extract key personal information from this chat transcript for memory storage. Return ONLY valid JSON.'
      }, {
        role: 'user',
        content: `Transcript of user messages in a conversation with ${deity}:\n${transcript}\n\nExisting themes: ${existingThemes.join(', ')}\n\nReturn JSON with: newThemes (array of 2-3 word strings, max 3 new ones), sessionSummary (one sentence), significantFacts (array of strings mentioning personal facts like name, family situation, job — max 2). Return {} if nothing meaningful to extract.`
      }],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const extracted = JSON.parse(completion.choices[0].message.content);
    res.json({
      newThemes:        extracted.newThemes        || [],
      sessionSummary:   extracted.sessionSummary   || '',
      significantFacts: extracted.significantFacts || [],
    });
  } catch {
    res.json({ newThemes: [], sessionSummary: '', significantFacts: [] });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Divine server is awakened' });
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