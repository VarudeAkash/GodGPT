import { useState, useEffect } from 'react';
import { RASHI_NAMES } from '../utils/panchang.js';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall, PaymentGate } from './PayGate.jsx';
import { checkFeaturePaid, saveFeaturePayment } from '../utils/cloudSave.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const CATEGORIES = [
  { id: 'career',        label: 'Career & Success',    icon: '✦' },
  { id: 'wealth',        label: 'Wealth & Prosperity',  icon: '◈' },
  { id: 'relationships', label: 'Relationships & Love', icon: '✧' },
  { id: 'health',        label: 'Health & Vitality',    icon: '◇' },
  { id: 'peace',         label: 'Peace & Mental Calm',  icon: '○' },
  { id: 'protection',    label: 'Protection & Clarity', icon: '◆' },
];

const DEITY_OPTIONS = [
  { id: 'krishna',   name: 'Krishna' },
  { id: 'shiva',     name: 'Shiva' },
  { id: 'lakshmi',   name: 'Lakshmi' },
  { id: 'hanuman',   name: 'Hanuman' },
  { id: 'saraswati', name: 'Saraswati' },
  { id: 'ganesha',   name: 'Ganesha' },
];

function DivyaUpayPage({ user }) {
  const [category,   setCategory]   = useState('');
  const [situation,  setSituation]  = useState('');
  const [rashi,      setRashi]      = useState('');
  const [deity,      setDeity]      = useState('ganesha');
  const [lang,       setLang]       = useState('english');
  const [upay,       setUpay]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [showPayGate, setShowPayGate] = useState(false);
  const [paid, setPaid]               = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  useEffect(() => {
    document.title = "Divya Upay — Your Sacred Remedies | Astravedam";
    const savedRashi = localStorage.getItem('userRashi');
    if (savedRashi) setRashi(savedRashi);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPaidStatus = async () => {
      if (!user) {
        if (!cancelled) setPaid(false);
        return;
      }
      const isPaid = await checkFeaturePaid(user.uid, 'divyaUpay');
      if (!cancelled) setPaid(isPaid);
    };

    loadPaidStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const onPaymentSuccess = async (paymentId) => {
    if (user) {
      await saveFeaturePayment(user.uid, 'divyaUpay', paymentId);
    }
    setPaid(true);
    setShowPayGate(false);
    generateUpay(pendingSubmit || { situation, category, rashi, deity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!situation.trim()) { setError('Please describe your situation.'); return; }
    if (!category)         { setError('Please select a category.'); return; }
    setError('');

    if (!user) { setShowPayGate('login'); return; }
    if (!paid) { setPendingSubmit({ situation, category, rashi, deity }); setShowPayGate('pay'); return; }

    generateUpay({ situation, category, rashi, deity });
  };

  const generateUpay = async ({ situation: s, category: c, rashi: r, deity: d }) => {
    setLoading(true);
    setUpay('');

    try {
      const res = await fetch(`${API_URL}/api/divya-upay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: s, category: c, sign: r, favoriteDeity: d, language: lang }),
      });
      if (!res.ok) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setUpay(text);
      }
    } catch {
      setUpay('The sacred connection is momentarily interrupted. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upay-page">
      <div className="upay-hero">
        <h1>Divya Upay</h1>
        <p>Sacred remedies drawn from Vedic wisdom — personalized for your situation, your sign, and your chosen deity.</p>
        <div className="upay-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {showPayGate === 'login' && (
        <LoginWall message="Sign in to receive your Divya Upay" />
      )}

      {showPayGate === 'pay' && (
        <PaymentGate
          title="Divya Upay — Sacred Remedies"
          priceDisplay="₹19"
          description="Personalized Vedic remedies — mantras, rituals, and practices drawn from your sign and chosen deity. Specific to your situation."
          orderEndpoint="/api/create-upay-order"
          user={user}
          onSuccess={onPaymentSuccess}
        />
      )}

      {!showPayGate && <div className="upay-layout">
        <form className="upay-form" onSubmit={handleSubmit}>

          <div className="upay-section">
            <label className="upay-label">What brings you here?</label>
            <div className="category-grid">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`category-btn ${category === c.id ? 'selected' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  <span className="cat-icon">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="upay-section">
            <label className="upay-label">Describe your situation <span className="upay-required">*</span></label>
            <textarea
              value={situation}
              onChange={e => setSituation(e.target.value)}
              placeholder="Be specific — the more context you share, the more meaningful your upay will be..."
              rows={4}
              className="upay-textarea"
            />
          </div>

          <div className="upay-row">
            <div className="upay-section">
              <label className="upay-label">Your Moon Sign (optional)</label>
              <select value={rashi} onChange={e => setRashi(e.target.value)} className="upay-select">
                <option value="">Select Rashi...</option>
                {RASHI_NAMES.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.english})</option>
                ))}
              </select>
            </div>

            <div className="upay-section">
              <label className="upay-label">Seek remedies from</label>
              <div className="deity-chips">
                {DEITY_OPTIONS.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className={`deity-chip ${deity === d.id ? 'selected' : ''}`}
                    onClick={() => setDeity(d.id)}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="upay-error">{error}</p>}

          <button type="submit" className="upay-submit-btn" disabled={loading}>
            {loading ? 'Preparing your sacred path...' : paid ? 'Reveal My Divya Upay' : 'Get My Divya Upay — ₹19'}
          </button>
          {!paid && <p className="upay-price-note">One-time payment · Sacred remedies tailored for you</p>}
          {paid && <p className="upay-paid-note">Payment received — generate anytime today</p>}
        </form>

        {(upay || loading) && (
          <div className="upay-result">
            <h3>Your Sacred Path</h3>
            {loading && !upay && (
              <div className="upay-loading">
                <div className="upay-spinner"></div>
                <span>The devas are preparing your remedies...</span>
              </div>
            )}
            <div className="upay-text markdown-body">
              {renderMarkdown(upay)}
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}

export default DivyaUpayPage;
