import { useState, useEffect } from 'react';
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
  const [activeReading, setActiveReading]       = useState(null); // reading being viewed from history
  const [showHistory, setShowHistory]           = useState(false);

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

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    localStorage.setItem('kundaliForm', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.dob || !form.pob) {
      setError('Please fill in name, date of birth, and place of birth.');
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
    setShowHistory(false);
    setShowPayGate(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Previous Readings Section */}
      {user && savedReadings.length > 0 && (
        <div className="kundali-history-section">
          <button
            className="kundali-history-toggle"
            onClick={() => setShowHistory(v => !v)}
          >
            {showHistory ? 'Hide' : 'View'} My Previous Readings ({savedReadings.length})
          </button>

          {showHistory && (
            <div className="kundali-history-list">
              {savedReadings.map((r) => (
                <div key={r.id} className="kundali-history-card" onClick={() => viewSavedReading(r)}>
                  <div className="kundali-history-name">{r.name}</div>
                  <div className="kundali-history-meta">
                    {r.dob} · {r.pob} · {r.language === 'hindi' ? 'Hindi' : 'English'}
                  </div>
                  <div className="kundali-history-date">{formatDate(r.createdAt)}</div>
                  <span className="kundali-history-view">View Reading →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                  <label>Time of Birth (optional)</label>
                  <input type="time" name="tob" value={form.tob} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Place of Birth</label>
                <input name="pob" value={form.pob} onChange={handleChange} placeholder="City, Country (e.g. Mumbai, India)" />
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
            <p className="kundali-chart-note">North Indian style · Approximate lagna</p>
          </div>
        </div>
      )}

      {(reading || loading) && !showPayGate && (
        <div className="kundali-reading">
          <h3>Your Cosmic Reading - {form.name}</h3>
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
    </div>
  );
}

export default KundaliPage;
