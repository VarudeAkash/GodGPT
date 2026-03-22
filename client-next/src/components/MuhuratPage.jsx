import { useState, useEffect } from 'react';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall, PaymentGate } from './PayGate.jsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const EVENT_TYPES = [
  'Wedding',
  'Business Launch',
  'Property Purchase',
  'Travel',
  'Medical Procedure',
  'Naming Ceremony',
  'Griha Pravesh',
];

function MuhuratPage({ user }) {
  const [form, setForm]           = useState({ eventType: 'Wedding', date: '', location: '' });
  const [lang, setLang]           = useState('english');
  const [result, setResult]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPayGate, setShowPayGate] = useState(false);
  const [paid, setPaid]               = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  useEffect(() => {
    document.title = 'Muhurat Finder | Astravedam';
    const paidKey = `muhurat_paid_${new Date().toDateString()}`;
    if (localStorage.getItem(paidKey)) setPaid(true);
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.location) {
      setError('Please fill in the preferred date and location.');
      return;
    }
    setError('');
    if (!user) { setShowPayGate('login'); return; }
    if (!paid) { setPendingForm({ ...form }); setShowPayGate('pay'); return; }
    generateResult(form);
  };

  const onPaymentSuccess = (paymentId) => {
    const paidKey = `muhurat_paid_${new Date().toDateString()}`;
    localStorage.setItem(paidKey, paymentId);
    setPaid(true);
    setShowPayGate(false);
    generateResult(pendingForm || form);
  };

  const generateResult = async (formData) => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/api/muhurat`, {
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
      setResult('The muhurat reading could not be completed at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="muhurat-page">
      <div className="muhurat-hero">
        <h1>Muhurat Finder</h1>
        <p>Find the most auspicious moment for your important occasion</p>
        <div className="muhurat-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {showPayGate === 'login' && (
        <LoginWall message="Sign in to find your auspicious Muhurat" />
      )}

      {showPayGate === 'pay' && (
        <PaymentGate
          title="Muhurat Finder"
          priceDisplay="₹9"
          description="Vedic muhurta analysis for your chosen event — tithi, nakshatra, vara, yoga, and specific auspicious time windows."
          orderEndpoint="/api/create-muhurat-order"
          user={user}
          onSuccess={onPaymentSuccess}
        />
      )}

      {!showPayGate && (
        <div className="muhurat-form-section">
          <form onSubmit={handleSubmit} className="muhurat-form">
            <h3>Event Details</h3>
            <div className="form-group">
              <label>Event Type</label>
              <select name="eventType" value={form.eventType} onChange={handleChange}>
                {EVENT_TYPES.map(et => (
                  <option key={et} value={et}>{et}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Mumbai, India" />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="muhurat-submit-btn" disabled={loading}>
              {loading ? 'Consulting the stars...' : paid ? 'Find Muhurat' : 'Find Muhurat — ₹9'}
            </button>
            {!paid && <p className="muhurat-price-note">One-time payment · Valid for today</p>}
            {paid  && <p className="muhurat-paid-note">Payment received — check anytime today</p>}
          </form>
        </div>
      )}

      {(result || loading) && !showPayGate && (
        <div className="muhurat-result">
          <h3>Muhurat Report — {form.eventType}</h3>
          {loading && !result && (
            <div className="muhurat-loading">
              <div className="muhurat-spinner"></div>
              <span>Consulting Vedic muhurta shastra...</span>
            </div>
          )}
          <div className="muhurat-result-text markdown-body">
            {renderMarkdown(result)}
          </div>
        </div>
      )}
    </div>
  );
}

export default MuhuratPage;
