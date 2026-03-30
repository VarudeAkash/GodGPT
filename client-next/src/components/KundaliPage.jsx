import { useState, useEffect, useRef } from 'react';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall, PaymentGate } from './PayGate.jsx';
import { saveKundaliReading, loadKundaliReadings, checkKundaliPaid } from '../utils/cloudSave.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const RASHI_LIST = [
  'Mesh (Aries)','Vrishabh (Taurus)','Mithun (Gemini)','Kark (Cancer)',
  'Simha (Leo)','Kanya (Virgo)','Tula (Libra)','Vrishchik (Scorpio)',
  'Dhanu (Sagittarius)','Makar (Capricorn)','Kumbh (Aquarius)','Meen (Pisces)',
];

const HOUSE_LABELS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function KundaliChart({ ascendant }) {
  const ascIdx = ascendant || 0;
  const houses = Array.from({ length: 12 }, (_, i) => ({
    label: HOUSE_LABELS[i],
    rashi: RASHI_LIST[(ascIdx + i) % 12].split(' ')[0],
  }));

  const positions = [
    [0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],
  ];

  const cells = Array(4).fill(null).map(() => Array(4).fill(null));
  houses.forEach((h, i) => {
    const [r, c] = positions[i];
    cells[r][c] = { ...h, num: i + 1 };
  });
  cells[1][1] = 'center';

  return (
    <div className="kundali-chart">
      <div className="kundali-grid">
        {cells.map((row, r) =>
          row.map((cell, c) => {
            if (cell === 'center') {
              return (
                <div key={`${r}-${c}`} className="kundali-cell center-cell" style={{ gridColumn: '2/4', gridRow: '2/4' }}>
                  <span className="kundali-om">ॐ</span>
                </div>
              );
            }
            if (cell === null && ((r === 1 && c === 2) || (r === 2 && c === 1) || (r === 2 && c === 2))) return null;
            if (!cell) return <div key={`${r}-${c}`} className="kundali-cell empty"></div>;
            return (
              <div key={`${r}-${c}`} className="kundali-cell house-cell">
                <span className="house-num">{cell.num}</span>
                <span className="house-rashi">{cell.rashi}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function KundaliPage({ user }) {
  const [form, setForm]           = useState({ name: '', dob: '', tob: '', pob: '' });
  const [reading, setReading]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [ascendant, setAscendant] = useState(0);
  const [lang, setLang]           = useState('english');
  const [error, setError]         = useState('');

  const [showPayGate, setShowPayGate]   = useState(false);
  const [paid, setPaid]                 = useState(false);
  const [pendingForm, setPendingForm]   = useState(null);

  // Saved readings
  const [savedReadings, setSavedReadings]       = useState([]);
  const [loadingHistory, setLoadingHistory]     = useState(false);
  const [activeReading, setActiveReading]       = useState(null);
  const [showHistory, setShowHistory]           = useState(false);

  // Place autocomplete
  const [pobSuggestions, setPobSuggestions]     = useState([]);
  const [pobLoading, setPobLoading]             = useState(false);
  const pobDebounceRef                          = useRef(null);
  const pobWrapperRef                           = useRef(null);

  // On mount: restore form, check paid status and load history
  useEffect(() => {
    const saved = localStorage.getItem('kundaliForm');
    if (saved) { try { setForm(JSON.parse(saved)); } catch { /* ignore */ } }

    if (user) {
      setLoadingHistory(true);
      Promise.all([
        checkKundaliPaid(user.uid),
        loadKundaliReadings(user.uid),
      ]).then(([isPaid, readings]) => {
        setPaid(isPaid);
        setSavedReadings(readings);
        setLoadingHistory(false);
      });
    }
  }, [user]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (pobWrapperRef.current && !pobWrapperRef.current.contains(e.target)) {
        setPobSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    localStorage.setItem('kundaliForm', JSON.stringify(updated));

    if (e.target.name === 'pob') {
      const q = e.target.value.trim();
      clearTimeout(pobDebounceRef.current);
      if (q.length < 3) { setPobSuggestions([]); return; }
      pobDebounceRef.current = setTimeout(async () => {
        setPobLoading(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          setPobSuggestions(data.map(r => {
            const a = r.address || {};
            const city = a.city || a.town || a.village || a.county || '';
            const state = a.state || '';
            const country = a.country || '';
            const label = [city, state, country].filter(Boolean).join(', ');
            return { label: label || r.display_name.split(',').slice(0, 3).join(','), full: r.display_name };
          }));
        } catch { setPobSuggestions([]); }
        finally { setPobLoading(false); }
      }, 350);
    }
  };

  const selectPob = (label) => {
    const updated = { ...form, pob: label };
    setForm(updated);
    localStorage.setItem('kundaliForm', JSON.stringify(updated));
    setPobSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.dob || !form.tob || !form.pob) {
      setError('Please fill in all fields. Time of birth is required for an accurate chart.');
      return;
    }
    setError('');
    setActiveReading(null);

    if (!user) { setShowPayGate('login'); return; }
    if (!paid) { setPendingForm({ ...form }); setShowPayGate('pay'); return; }

    generateReading(form);
  };

  const onPaymentSuccess = (paymentId) => {
    setPaid(true);
    setShowPayGate(false);
    generateReading(pendingForm || form);
  };

  const generateReading = async (formData) => {
    setLoading(true);
    setReading('');
    setShowHistory(false);

    try {
      const res = await fetch(`${API_URL}/api/kundali-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language: lang }),
      });
      if (!res.ok) throw new Error();

      // Real ascendant index from server (Prokerala calculation)
      const ascHeader = res.headers.get('X-Ascendant');
      const currentAscendant = ascHeader !== null ? parseInt(ascHeader, 10) : 0;
      setAscendant(currentAscendant);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setReading(text);
      }

      // Save to Firestore after complete
      if (user && text) {
        saveKundaliReading(user.uid, {
          name: formData.name,
          dob: formData.dob,
          tob: formData.tob,
          pob: formData.pob,
          language: lang,
          ascendant: currentAscendant,
          reading: text,
        }).then(() => {
          loadKundaliReadings(user.uid).then(setSavedReadings);
        });
      }
    } catch {
      setReading('The cosmic reading could not be completed at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewSavedReading = (saved) => {
    setActiveReading(saved);
    setReading(saved.reading);
    setAscendant(saved.ascendant || 0);
    setForm({ name: saved.name, dob: saved.dob, tob: saved.tob || '', pob: saved.pob });
    setShowPayGate(false);
    setTimeout(() => {
      document.getElementById('kundali-reading-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const formatDate = (firestoreTimestamp) => {
    if (!firestoreTimestamp) return '';
    const date = firestoreTimestamp.toDate ? firestoreTimestamp.toDate() : new Date(firestoreTimestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="kundali-page">
      <div className="kundali-hero">
        <h1>Janma Kundali</h1>
        <p>Your birth chart reveals the cosmic blueprint of your life - your strengths, challenges, and destiny.</p>
        <div className="kundali-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {showPayGate === 'login' && (
        <LoginWall message="Sign in to get your Kundali reading" />
      )}

      {showPayGate === 'pay' && (
        <PaymentGate
          title="Personalized Kundali Reading"
          priceDisplay="₹14"
          description="A detailed Vedic birth chart reading based on your name, date, time, and place of birth - specific to you, not generic. Saved permanently to your account."
          orderEndpoint="/api/create-kundali-order"
          user={user}
          onSuccess={onPaymentSuccess}
        />
      )}

      {!showPayGate && (
        <div className="kundali-layout">
          <div className="kundali-form-section">
            <form onSubmit={handleSubmit} className="kundali-form">
              <h3>{activeReading ? `Reading for ${activeReading.name}` : 'Enter Birth Details'}</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Time of Birth</label>
                  <input type="time" name="tob" value={form.tob} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group pob-autocomplete" ref={pobWrapperRef}>
                <label>Place of Birth</label>
                <input
                  name="pob"
                  value={form.pob}
                  onChange={handleChange}
                  onFocus={() => form.pob.length >= 3 && handleChange({ target: { name: 'pob', value: form.pob } })}
                  placeholder="Start typing city name..."
                  autoComplete="off"
                />
                {pobLoading && <div className="pob-loading">Searching...</div>}
                {pobSuggestions.length > 0 && (
                  <ul className="pob-suggestions">
                    {pobSuggestions.map((s, i) => (
                      <li key={i} onMouseDown={() => selectPob(s.label)}>{s.label}</li>
                    ))}
                  </ul>
                )}
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="kundali-submit-btn" disabled={loading}>
                {loading ? 'Reading the stars...' : paid ? 'Generate My Kundali' : 'Get My Kundali — ₹14'}
              </button>
              {!paid && <p className="kundali-price-note">One-time payment · Reading saved to your account forever</p>}
              {paid && <p className="kundali-paid-note">You have access - generate for any birth details</p>}
            </form>
          </div>

          <div className="kundali-chart-section">
            <KundaliChart ascendant={ascendant} />
            <p className="kundali-chart-note">North Indian style · Lahiri ayanamsa</p>
          </div>
        </div>
      )}

      {(reading || loading) && !showPayGate && (
        <div className="kundali-reading" id="kundali-reading-section">
          <h3>{activeReading ? `Kundali Reading — ${activeReading.name}` : `Your Cosmic Reading — ${form.name}`}</h3>
          {loading && !reading && (
            <div className="kundali-reading-loading">
              <div className="kundali-spinner"></div>
              <span>The stars are aligning your reading...</span>
            </div>
          )}
          <div className="kundali-reading-text markdown-body">
            {renderMarkdown(reading)}
          </div>
        </div>
      )}

      {/* My Kundalis Section — below everything */}
      {user && savedReadings.length > 0 && (
        <div className="kundali-my-section">
          <div className="kundali-my-header">
            <h2>My Kundalis</h2>
            <span className="kundali-my-count">{savedReadings.length} saved</span>
          </div>
          <div className="kundali-my-grid">
            {savedReadings.map((r) => (
              <div
                key={r.id}
                className={`kundali-my-card${activeReading?.id === r.id ? ' active' : ''}`}
                onClick={() => viewSavedReading(r)}
              >
                <div className="kundali-my-card-name">{r.name}</div>
                <div className="kundali-my-card-dob">{r.dob}{r.tob ? ` · ${r.tob}` : ''}</div>
                <div className="kundali-my-card-pob">{r.pob}</div>
                <div className="kundali-my-card-footer">
                  <span className="kundali-my-card-lang">{r.language === 'hindi' ? 'हिं' : 'EN'}</span>
                  <span className="kundali-my-card-date">{formatDate(r.createdAt)}</span>
                  <span className="kundali-my-card-cta">{activeReading?.id === r.id ? 'Viewing ✓' : 'View →'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KundaliPage;
