import { useState, useEffect } from 'react';
import { RASHI_NAMES } from '../utils/panchang.js';
import './DivyaUpayPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

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

function DivyaUpayPage() {
  const [category,   setCategory]   = useState('');
  const [situation,  setSituation]  = useState('');
  const [rashi,      setRashi]      = useState('');
  const [deity,      setDeity]      = useState('ganesha');
  const [lang,       setLang]       = useState('english');
  const [upay,       setUpay]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    document.title = "Divya Upay — Your Sacred Remedies | Astravedam";
    const savedRashi = localStorage.getItem('userRashi');
    if (savedRashi) setRashi(savedRashi);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!situation.trim()) { setError('Please describe your situation.'); return; }
    if (!category)         { setError('Please select a category.'); return; }
    setError('');
    setLoading(true);
    setUpay('');

    try {
      const res = await fetch(`${API_URL}/api/divya-upay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, category, sign: rashi, favoriteDeity: deity, language: lang }),
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

      <div className="upay-layout">
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
            {loading ? 'Preparing your sacred path...' : 'Reveal My Divya Upay'}
          </button>
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
            <div className="upay-text">
              {upay.split('\n').map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : <br key={i} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DivyaUpayPage;
