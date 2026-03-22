import { useState, useEffect } from 'react';
import { RASHI_NAMES } from '../utils/panchang.js';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const RASHI_RULERS = {
  mesh: 'Mangal (Mars)',
  vrishabh: 'Shukra (Venus)',
  mithun: 'Budh (Mercury)',
  kark: 'Chandra (Moon)',
  simha: 'Surya (Sun)',
  kanya: 'Budh (Mercury)',
  tula: 'Shukra (Venus)',
  vrishchik: 'Mangal (Mars)',
  dhanu: 'Brihaspati (Jupiter)',
  makar: 'Shani (Saturn)',
  kumbh: 'Shani (Saturn)',
  meen: 'Brihaspati (Jupiter)',
};

const RASHI_COLORS = {
  mesh: '#e05a3a', vrishabh: '#5a8a3a', mithun: '#3a6e8a',
  kark: '#7a5a8a', simha: '#c4872a', kanya: '#3a8a6e',
  tula: '#8a3a6e', vrishchik: '#6e2020', dhanu: '#4a6e3a',
  makar: '#3a4a6e', kumbh: '#2a6e8a', meen: '#4a3a8a',
};

export default function HoroscopePage({ navigateTo }) {
  const [selectedRashi, setSelectedRashi] = useState(null);
  const [horoscope, setHoroscope] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('english');
  const [cache, setCache] = useState({});

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    const saved = localStorage.getItem('userRashi');
    if (saved) setSelectedRashi(saved);
  }, []);

  const fetchHoroscope = async (rashiId, language) => {
    const key = `${rashiId}_${language}`;
    if (cache[key]) { setHoroscope(cache[key]); return; }

    setLoading(true);
    setHoroscope('');
    try {
      const rashi = RASHI_NAMES.find(r => r.id === rashiId);
      const sign = `${rashi.name} (${rashi.english})`;
      const res = await fetch(`${API_URL}/api/horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign, language }),
      });
      const data = await res.json();
      if (data.prediction) {
        setHoroscope(data.prediction);
        setCache(prev => ({ ...prev, [key]: data.prediction }));
      }
    } catch {
      setHoroscope('Could not load horoscope. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectRashi = (rashiId) => {
    setSelectedRashi(rashiId);
    localStorage.setItem('userRashi', rashiId);
    fetchHoroscope(rashiId, lang);
  };

  const switchLang = (l) => {
    setLang(l);
    if (selectedRashi) fetchHoroscope(selectedRashi, l);
  };

  const selectedData = RASHI_NAMES.find(r => r.id === selectedRashi);

  return (
    <div className="horoscope-page">
      <div className="horoscope-header">
        <h1 className="horoscope-title">Aaj Ka Rashifal</h1>
        <p className="horoscope-date">{today}</p>
        <p className="horoscope-subtitle">Select your Moon sign for today's Vedic horoscope</p>
        <div className="horoscope-lang-toggle">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => switchLang('english')}>English</button>
          <button className={lang === 'hindi' ? 'active' : ''} onClick={() => switchLang('hindi')}>हिंदी</button>
        </div>
      </div>

      <div className="rashi-grid">
        {RASHI_NAMES.map(rashi => (
          <button
            key={rashi.id}
            className={`rashi-card ${selectedRashi === rashi.id ? 'selected' : ''}`}
            style={{ '--rashi-color': RASHI_COLORS[rashi.id] }}
            onClick={() => selectRashi(rashi.id)}
          >
            <span className="rashi-symbol">{rashi.symbol}</span>
            <span className="rashi-name">{rashi.name}</span>
            <span className="rashi-english">{rashi.english}</span>
          </button>
        ))}
      </div>

      {selectedRashi && (
        <div className="horoscope-result" style={{ '--rashi-color': RASHI_COLORS[selectedRashi] }}>
          <div className="horoscope-result-header">
            <span className="horoscope-result-symbol">{selectedData?.symbol}</span>
            <div>
              <h2>{selectedData?.name} Rashifal</h2>
              <p className="horoscope-ruler">Ruler: {RASHI_RULERS[selectedRashi]}</p>
            </div>
          </div>

          {loading ? (
            <div className="horoscope-loading">
              <div className="horoscope-spinner" />
              <p>Consulting the stars...</p>
            </div>
          ) : (
            <div className="horoscope-text">
              {renderMarkdown(horoscope)}
            </div>
          )}

          {!loading && horoscope && (
            <div className="horoscope-cta">
              <p>Want a deeper, personalized reading?</p>
              <button className="horoscope-chat-btn" onClick={() => navigateTo('deity-select')}>
                Chat with the Divine
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedRashi && (
        <p className="horoscope-hint">Tap your Rashi above to see today's prediction</p>
      )}
    </div>
  );
}
