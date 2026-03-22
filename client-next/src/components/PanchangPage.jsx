import { useState, useEffect } from 'react';
import { getTodayPanchang, RASHI_NAMES } from '../utils/panchang.js';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall } from './PayGate.jsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

function PanchangPage({ user }) {
  const [panchang, setPanchang]         = useState(null);
  const [selectedRashi, setSelectedRashi] = useState(null);
  const [horoscope, setHoroscope]       = useState('');
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [locationNote, setLocationNote] = useState('');
  const [lang, setLang] = useState('english');
  const [dailyLimitReached, setDailyLimitReached] = useState(false);

  useEffect(() => {
    document.title = "Today's Panchang & Horoscope | Astravedam";
    const today = new Date();

    const cached = localStorage.getItem('userLocation');
    if (cached) {
      const { lat, lng } = JSON.parse(cached);
      setPanchang(getTodayPanchang(today, lat, lng));
    } else {
      setPanchang(getTodayPanchang(today));
      setLocationNote('Showing for New Delhi. Allow location for local timings.');
      navigator.geolocation?.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        localStorage.setItem('userLocation', JSON.stringify({ lat, lng }));
        setPanchang(getTodayPanchang(today, lat, lng));
        setLocationNote('');
      });
    }

    const savedRashi = localStorage.getItem('userRashi');
    if (savedRashi) setSelectedRashi(savedRashi);
  }, []);

  const fetchHoroscope = async (rashiId) => {
    setSelectedRashi(rashiId);
    localStorage.setItem('userRashi', rashiId);

    const cacheKey = `horoscope_${rashiId}_${new Date().toDateString()}_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setHoroscope(cached); setDailyLimitReached(false); return; }

    // Require login
    if (!user) { setHoroscope(''); setDailyLimitReached(false); return; }

    // Daily limit: 1 fresh API call per day
    const limitKey = `horoscope_generated_${new Date().toDateString()}`;
    const generated = parseInt(localStorage.getItem(limitKey) || '0');
    if (generated >= 1) { setDailyLimitReached(true); setHoroscope(''); return; }

    setDailyLimitReached(false);
    setHoroscopeLoading(true);
    setHoroscope('');
    try {
      const res = await fetch(`${API_URL}/api/horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign: rashiId, language: lang }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHoroscope(data.prediction);
      localStorage.setItem(cacheKey, data.prediction);
      const limitKey2 = `horoscope_generated_${new Date().toDateString()}`;
      localStorage.setItem(limitKey2, (parseInt(localStorage.getItem(limitKey2) || '0') + 1).toString());
    } catch {
      setHoroscope('The cosmic connection is momentarily interrupted. Please try again.');
    } finally {
      setHoroscopeLoading(false);
    }
  };

  const qualityColor = (q) => q === 'auspicious' ? '#4ade80' : q === 'inauspicious' ? '#f87171' : '#fbbf24';

  if (!panchang) return (
    <div className="panchang-loading">
      <div className="panchang-spinner"></div>
      <p>Reading the cosmic alignment...</p>
    </div>
  );

  return (
    <div className="panchang-page">
      <div className="panchang-hero">
        <h1>Today's Panchang</h1>
        <p className="panchang-date">{panchang.date}</p>
        <p className="panchang-month">{panchang.hinduMonth} Masa · {panchang.vara.name}</p>
        {locationNote && <p className="location-note">{locationNote}</p>}
      </div>

      <div className="panchang-grid">
        <div className="pancha-card tithi">
          <div className="pancha-label">Tithi</div>
          <div className="pancha-value">{panchang.tithi.name}</div>
          <div className="pancha-sub">{panchang.tithi.paksha}</div>
          <div className="pancha-bar">
            <div className="pancha-bar-fill" style={{ width: `${panchang.tithi.pct}%` }}></div>
          </div>
          <div className="pancha-pct">{panchang.tithi.pct}% elapsed</div>
        </div>

        <div className="pancha-card nakshatra">
          <div className="pancha-label">Nakshatra</div>
          <div className="pancha-value">{panchang.nakshatra.name}</div>
          <div className="pancha-sub">Ruled by {panchang.nakshatra.ruler} · Deity: {panchang.nakshatra.deity}</div>
          <div className="pancha-bar">
            <div className="pancha-bar-fill" style={{ width: `${panchang.nakshatra.pct}%` }}></div>
          </div>
        </div>

        <div className="pancha-card yoga">
          <div className="pancha-label">Yoga</div>
          <div className="pancha-value">{panchang.yoga.name}</div>
          <div className="pancha-quality" style={{ color: qualityColor(panchang.yoga.quality) }}>
            {panchang.yoga.quality}
          </div>
        </div>

        <div className="pancha-card karana">
          <div className="pancha-label">Karana</div>
          <div className="pancha-value">{panchang.karana.name}</div>
        </div>

        <div className="pancha-card vara">
          <div className="pancha-label">Vara (Day)</div>
          <div className="pancha-value">{panchang.vara.name}</div>
          <div className="pancha-sub">{panchang.vara.english} · Planet: {panchang.vara.planet}</div>
        </div>

        <div className="pancha-card timings">
          <div className="pancha-label">Sun Timings</div>
          <div className="timing-row">
            <span className="timing-label">Sunrise</span>
            <span className="timing-value">{panchang.sunrise}</span>
          </div>
          <div className="timing-row">
            <span className="timing-label">Sunset</span>
            <span className="timing-value">{panchang.sunset}</span>
          </div>
          {panchang.abhijit && (
            <div className="timing-row abhijit">
              <span className="timing-label">Abhijit Muhurta</span>
              <span className="timing-value good">{panchang.abhijit.start} – {panchang.abhijit.end}</span>
            </div>
          )}
          <div className="timing-row rahukala">
            <span className="timing-label">Rahukala</span>
            <span className="timing-value bad">{panchang.rahukala.start} – {panchang.rahukala.end}</span>
          </div>
        </div>
      </div>

      {/* Horoscope Section */}
      <div className="horoscope-section">
        <div className="horoscope-header">
          <h2>Today's Rashifal</h2>
          <div className="horoscope-lang">
            <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
            <button className={lang === 'hindi' ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
          </div>
        </div>
        <p className="horoscope-sub">Select your Moon sign (Chandra Rashi) for today's prediction</p>

        {!user && (
          <LoginWall message="Sign in to view your daily Rashifal" />
        )}

        <div className="rashi-grid">
          {RASHI_NAMES.map(r => (
            <button
              key={r.id}
              className={`rashi-btn ${selectedRashi === r.id ? 'selected' : ''}`}
              onClick={() => fetchHoroscope(r.id)}
            >
              <span className="rashi-symbol">{r.symbol}</span>
              <span className="rashi-name">{r.name}</span>
              <span className="rashi-english">{r.english}</span>
            </button>
          ))}
        </div>

        {dailyLimitReached && (
          <div className="horoscope-limit-notice">
            <span>✦</span> You've received today's horoscope. Come back tomorrow for a fresh reading.
          </div>
        )}

        {(horoscopeLoading || horoscope) && (
          <div className="horoscope-result">
            {horoscopeLoading ? (
              <div className="horoscope-loading-text">
                <div className="pancha-spinner-sm"></div>
                Reading the stars for {RASHI_NAMES.find(r => r.id === selectedRashi)?.name}...
              </div>
            ) : (
              <>
                <div className="horoscope-rashi-name">
                  {RASHI_NAMES.find(r => r.id === selectedRashi)?.symbol} {RASHI_NAMES.find(r => r.id === selectedRashi)?.name} — Today
                </div>
                <div className="horoscope-text markdown-body">{renderMarkdown(horoscope)}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PanchangPage;
