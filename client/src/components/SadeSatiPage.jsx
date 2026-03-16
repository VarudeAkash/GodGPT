import { useState, useEffect } from 'react';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall, PaymentGate } from './PayGate.jsx';
import { RASHI_NAMES } from '../utils/panchang.js';
import './SadeSatiPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

function SadeSatiPage({ user }) {
  const [form, setForm]           = useState({ name: '', moonSign: 'mesh', dob: '' });
  const [lang, setLang]           = useState('english');
  const [result, setResult]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPayGate, setShowPayGate] = useState(false);
  const [paid, setPaid]               = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  useEffect(() => {
    document.title = 'Sade Sati & Dhaiya Report | Astravedam';
    const paidKey = `sadesati_paid_${new Date().toDateString()}`;
    if (localStorage.getItem(paidKey)) setPaid(true);
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.dob) {
      setError('Please fill in your name and date of birth.');
      return;
    }
    setError('');
    if (!user) { setShowPayGate('login'); return; }
    if (!paid) { setPendingForm({ ...form }); setShowPayGate('pay'); return; }
    generateResult(form);
  };

  const onPaymentSuccess = (paymentId) => {
    const paidKey = `sadesati_paid_${new Date().toDateString()}`;
    localStorage.setItem(paidKey, paymentId);
    setPaid(true);
    setShowPayGate(false);
    generateResult(pendingForm || form);
  };

  const generateResult = async (formData) => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/api/sade-sati`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language: lang }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setResult(text);
      }
    } catch {
      setResult('The Sade Sati report could not be completed at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sadesati-page">
      <div className="sadesati-hero">
        <h1>Sade Sati &amp; Dhaiya Report</h1>
        <p>Understand Saturn's influence on your life and how to navigate this powerful transit</p>
        <div className="sadesati-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {showPayGate === 'login' && (
        <LoginWall message="Sign in to get your Sade Sati report" />
      )}

      {showPayGate === 'pay' && (
        <PaymentGate
          title="Sade Sati & Dhaiya Report"
          priceDisplay="₹49"
          description="Detailed Saturn transit analysis — current phase, life area effects, and specific Vedic remedies."
          orderEndpoint="/api/create-sadesati-order"
          user={user}
          onSuccess={onPaymentSuccess}
        />
      )}

      {!showPayGate && (
        <div className="sadesati-form-section">
          <form onSubmit={handleSubmit} className="sadesati-form">
            <h3>Your Details</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Moon Sign (Rashi)</label>
                <select name="moonSign" value={form.moonSign} onChange={handleChange}>
                  {RASHI_NAMES.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.english})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="sadesati-submit-btn" disabled={loading}>
              {loading ? 'Analyzing Saturn transit...' : paid ? 'Get My Report' : 'Get My Report — ₹49'}
            </button>
            {!paid && <p className="sadesati-price-note">One-time payment · Valid for today</p>}
            {paid  && <p className="sadesati-paid-note">Payment received — generate anytime today</p>}
          </form>
        </div>
      )}

      {(result || loading) && !showPayGate && (
        <div className="sadesati-result">
          <h3>Saturn Transit Report — {form.name}</h3>
          {loading && !result && (
            <div className="sadesati-loading">
              <div className="sadesati-spinner"></div>
              <span>Calculating Saturn's position and effects...</span>
            </div>
          )}
          <div className="sadesati-result-text markdown-body">
            {renderMarkdown(result)}
          </div>
        </div>
      )}
    </div>
  );
}

export default SadeSatiPage;
