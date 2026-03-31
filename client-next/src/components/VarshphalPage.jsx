import { useState, useEffect } from 'react';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall, PaymentGate } from './PayGate.jsx';
import { checkFeaturePaid, saveFeaturePayment } from '../utils/cloudSave.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

function VarshphalPage({ user }) {
  const currentYear = new Date().getFullYear();
  const [form, setForm]           = useState({ name: '', dob: '', tob: '', pob: '', year: currentYear });
  const [lang, setLang]           = useState('english');
  const [result, setResult]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPayGate, setShowPayGate] = useState(false);
  const [paid, setPaid]               = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  useEffect(() => {
    document.title = 'Varshphal — Annual Reading | Astravedam';
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPaidStatus = async () => {
      if (!user) {
        if (!cancelled) setPaid(false);
        return;
      }
      const isPaid = await checkFeaturePaid(user.uid, 'varshphal');
      if (!cancelled) setPaid(isPaid);
    };

    loadPaidStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.dob || !form.pob) {
      setError('Please fill in name, date of birth, and place of birth.');
      return;
    }
    setError('');
    if (!user) { setShowPayGate('login'); return; }
    if (!paid) { setPendingForm({ ...form }); setShowPayGate('pay'); return; }
    generateResult(form);
  };

  const onPaymentSuccess = async (paymentId) => {
    if (user) {
      await saveFeaturePayment(user.uid, 'varshphal', paymentId);
    }
    setPaid(true);
    setShowPayGate(false);
    generateResult(pendingForm || form);
  };

  const generateResult = async (formData) => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/api/varshphal`, {
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
      setResult('The Varshphal reading could not be completed at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="varshphal-page">
      <div className="varshphal-hero">
        <h1>Varshphal — Annual Reading</h1>
        <p>Your complete year ahead — planetary influences, key periods, and guidance for the year</p>
        <div className="varshphal-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {showPayGate === 'login' && (
        <LoginWall message="Sign in to get your Varshphal reading" />
      )}

      {showPayGate === 'pay' && (
        <PaymentGate
          title="Varshphal — Annual Reading"
          priceDisplay="₹49"
          description="Comprehensive Solar Return chart reading — key themes, best months, challenging periods, career, finance, health, and relationships."
          orderEndpoint="/api/create-varshphal-order"
          user={user}
          onSuccess={onPaymentSuccess}
        />
      )}

      {!showPayGate && (
        <div className="varshphal-form-section">
          <form onSubmit={handleSubmit} className="varshphal-form">
            <h3>Birth Details</h3>
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
            <div className="form-row">
              <div className="form-group">
                <label>Place of Birth</label>
                <input name="pob" value={form.pob} onChange={handleChange} placeholder="City, Country" />
              </div>
              <div className="form-group">
                <label>Year for Reading</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  min={currentYear - 5}
                  max={currentYear + 10}
                />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="varshphal-submit-btn" disabled={loading}>
              {loading ? 'Reading the year ahead...' : paid ? 'Get Annual Reading' : 'Get Annual Reading — ₹49'}
            </button>
            {!paid && <p className="varshphal-price-note">One-time payment · Valid for today</p>}
            {paid  && <p className="varshphal-paid-note">Payment received — generate anytime today</p>}
          </form>
        </div>
      )}

      {(result || loading) && !showPayGate && (
        <div className="varshphal-result">
          <h3>Annual Reading — {form.name} ({form.year})</h3>
          {loading && !result && (
            <div className="varshphal-loading">
              <div className="varshphal-spinner"></div>
              <span>Casting your Solar Return chart...</span>
            </div>
          )}
          <div className="varshphal-result-text markdown-body">
            {renderMarkdown(result)}
          </div>
        </div>
      )}
    </div>
  );
}

export default VarshphalPage;
