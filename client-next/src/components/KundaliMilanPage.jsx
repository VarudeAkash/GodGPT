import { useState, useEffect } from 'react';
import { renderMarkdown } from '../utils/renderMarkdown.jsx';
import { LoginWall, PaymentGate } from './PayGate.jsx';
import { checkFeaturePaid, saveFeaturePayment } from '../utils/cloudSave.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const emptyPerson = () => ({ name: '', dob: '', tob: '', pob: '' });

function KundaliMilanPage({ user }) {
  const [person1, setPerson1] = useState(emptyPerson());
  const [person2, setPerson2] = useState(emptyPerson());
  const [lang, setLang]       = useState('english');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPayGate, setShowPayGate] = useState(false);
  const [paid, setPaid]               = useState(false);
  const [pendingData, setPendingData] = useState(null);

  useEffect(() => {
    document.title = 'Kundali Milan — Compatibility | Astravedam';
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPaidStatus = async () => {
      if (!user) {
        if (!cancelled) setPaid(false);
        return;
      }
      const isPaid = await checkFeaturePaid(user.uid, 'kundaliMilan');
      if (!cancelled) setPaid(isPaid);
    };

    loadPaidStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleChange1 = (e) => setPerson1(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleChange2 = (e) => setPerson2(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!person1.name || !person1.dob || !person1.pob || !person2.name || !person2.dob || !person2.pob) {
      setError('Please fill in name, date of birth, and place of birth for both persons.');
      return;
    }
    setError('');
    if (!user) { setShowPayGate('login'); return; }
    if (!paid) { setPendingData({ person1, person2 }); setShowPayGate('pay'); return; }
    generateResult({ person1, person2 });
  };

  const onPaymentSuccess = async (paymentId) => {
    if (user) {
      await saveFeaturePayment(user.uid, 'kundaliMilan', paymentId);
    }
    setPaid(true);
    setShowPayGate(false);
    generateResult(pendingData || { person1, person2 });
  };

  const generateResult = async (data) => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/api/kundali-milan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1: data.person1, person2: data.person2, language: lang }),
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
      setResult('The compatibility reading could not be completed at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PersonForm = ({ title, data, onChange }) => (
    <div className="milan-person-form">
      <h3>{title}</h3>
      <div className="form-group">
        <label>Full Name</label>
        <input name="name" value={data.name} onChange={onChange} placeholder="Full name" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date of Birth</label>
          <input type="date" name="dob" value={data.dob} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>Time of Birth (optional)</label>
          <input type="time" name="tob" value={data.tob} onChange={onChange} />
        </div>
      </div>
      <div className="form-group">
        <label>Place of Birth</label>
        <input name="pob" value={data.pob} onChange={onChange} placeholder="City, Country" />
      </div>
    </div>
  );

  return (
    <div className="milan-page">
      <div className="milan-hero">
        <h1>Kundali Milan — Compatibility</h1>
        <p>Discover your cosmic compatibility through Vedic Ashtakoot analysis</p>
        <div className="milan-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {showPayGate === 'login' && (
        <LoginWall message="Sign in to get your Kundali Milan report" />
      )}

      {showPayGate === 'pay' && (
        <PaymentGate
          title="Kundali Milan — Compatibility Report"
          priceDisplay="₹49"
          description="Detailed Ashtakoot matching with Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi scores — total out of 36."
          orderEndpoint="/api/create-milan-order"
          user={user}
          onSuccess={onPaymentSuccess}
        />
      )}

      {!showPayGate && (
        <form onSubmit={handleSubmit} className="milan-form">
          <div className="milan-two-col">
            <PersonForm title="Person 1" data={person1} onChange={handleChange1} />
            <PersonForm title="Person 2" data={person2} onChange={handleChange2} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="milan-submit-btn" disabled={loading}>
            {loading ? 'Analyzing compatibility...' : paid ? 'Check Compatibility' : 'Check Compatibility — ₹49'}
          </button>
          {!paid && <p className="milan-price-note">One-time payment · Valid for today</p>}
          {paid  && <p className="milan-paid-note">Payment received — check anytime today</p>}
        </form>
      )}

      {(result || loading) && !showPayGate && (
        <div className="milan-result">
          <h3>Compatibility Report — {person1.name} &amp; {person2.name}</h3>
          {loading && !result && (
            <div className="milan-loading">
              <div className="milan-spinner"></div>
              <span>Calculating your Ashtakoot score...</span>
            </div>
          )}
          <div className="milan-result-text markdown-body">
            {renderMarkdown(result)}
          </div>
        </div>
      )}
    </div>
  );
}

export default KundaliMilanPage;
