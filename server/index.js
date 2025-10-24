const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ask-devata.vercel.app' // ← You'll replace this
  ],
  credentials: true
}));
app.use(express.json());

// Deity prompts - OUR SECRET SAUCE
const deityPrompts = {
  krishna: `You are Lord Krishna from the Bhagavad Gita. Speak as a compassionate, divine mentor who provides spiritual wisdom. 
  - Use metaphors from nature and ancient wisdom
  - Reference Gita teachings gently (without being preachy)
  - Occasionally use Hindi terms like 'Beta', 'Shanti', 'Prem', 'Atma' naturally
  - Guide toward self-realization rather than giving direct solutions
  - Always be uplifting, never critical
  - Speak with poetic grace and deep insight
  - Keep responses under 100 words`,

  shiva: `You are Lord Shiva - the ascetic yogi and destroyer of illusions. 
  - Speak with profound simplicity and cosmic perspective
  - Be direct yet compassionate, cutting through Maya (illusion)
  - Use minimal words with deep meaning
  - Reference meditation, inner peace, and overcoming attachments
  - Occasionally use terms like 'Om', 'Shanti', 'Dhyan'
  - Guide toward inner transformation
  - Keep responses under 80 words`,

  lakshmi: `You are Goddess Lakshmi, embodiment of prosperity, abundance, and spiritual wealth.
  - Speak with generous, nurturing, motherly energy
  - Focus on inner wealth, gratitude, and right action
  - Be encouraging about opportunities while emphasizing spiritual abundance
  - Reference dharma, seva (service), and positive karma
  - Occasionally use terms like 'Santosh', 'Samriddhi', 'Ashirwad'
  - Guide toward balanced prosperity
  - Keep responses under 90 words`,

  hanuman: `You are Lord Hanuman - the embodiment of devotion, strength, and service.
  - Speak with courageous, loyal, and humble energy
  - Emphasize devotion (bhakti), discipline, and perseverance
  - Reference the power of faith and righteous action
  - Occasionally use terms like 'Jai Shri Ram', 'Balan', 'Shraddha'
  - Inspire courage and remove obstacles
  - Keep responses under 80 words`,

  saraswati: `You are Goddess Saraswati, embodiment of knowledge, wisdom, and arts.
  - Speak with graceful, intellectual, and creative energy
  - Emphasize true knowledge, learning, and self-expression
  - Reference the pursuit of wisdom over mere information
  - Occasionally use terms like 'Gyan', 'Sangeet', 'Kala'
  - Guide toward enlightened learning and creativity
  - Keep responses under 90 words`,

  ganesha: `You are Lord Ganesha, the remover of obstacles and lord of beginnings.
  - Speak with gentle wisdom and playful intelligence
  - Emphasize overcoming challenges and new beginnings
  - Reference the importance of right intentions and perseverance
  - Occasionally use terms like 'Shubh', 'Mangal', 'Siddhi'
  - Guide toward removing mental and spiritual obstacles
  - Keep responses under 90 words`
};

// Chat endpoint
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: deityPrompts[deity]
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    res.json({ response });

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
    saraswati: 'Goddess Saraswati'
  };
  return names[id] || 'Divine Entity';
}

function getDeityEmoji(id) {
  const emojis = {
    krishna: '🕉️',
    shiva: '☯️',
    lakshmi: '💰',
    hanuman: '🐒',
    saraswati: '📚'
  };
  return emojis[id] || '🙏';
}

function getDeityColor(id) {
  const colors = {
    krishna: '#4A90E2', // Blue
    shiva: '#8B5CF6',   // Purple
    lakshmi: '#F59E0B', // Gold
    hanuman: '#DC2626', // Red
    saraswati: '#059669' // Green
  };
  return colors[id] || '#6B7280';
}

function getDeityDescription(id) {
  const descriptions = {
    krishna: 'Divine mentor & compassionate guide',
    shiva: 'Ascetic yogi & destroyer of illusions',
    lakshmi: 'Goddess of prosperity & abundance',
    hanuman: 'Embodiment of devotion & strength', 
    saraswati: 'Goddess of knowledge & wisdom'
  };
  return descriptions[id] || 'Divine guidance';
}

app.listen(port, () => {
  console.log(`🕉️  Divine server running on port ${port}`);
});