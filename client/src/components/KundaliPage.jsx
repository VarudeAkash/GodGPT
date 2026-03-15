import { useState, useEffect } from 'react';
import './KundaliPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const RASHI_LIST = [
  'Mesh (Aries)','Vrishabh (Taurus)','Mithun (Gemini)','Kark (Cancer)',
  'Simha (Leo)','Kanya (Virgo)','Tula (Libra)','Vrishchik (Scorpio)',
  'Dhanu (Sagittarius)','Makar (Capricorn)','Kumbh (Aquarius)','Meen (Pisces)',
];

const HOUSE_LABELS = [
  'I\nLagna', 'II\nDhan', 'III\nSahaj', 'IV\nSukh',
  'V\nPutra', 'VI\nShatru', 'VII\nKalatra', 'VIII\nMrityu',
  'IX\nDharma', 'X\nKarma', 'XI\nLabha', 'XII\nVyaya',
];

function KundaliChart({ ascendant }) {
  // Diamond (North Indian style) — 12 triangular/square houses
  const ascIdx = ascendant || 0;
  const houses = Array.from({ length: 12 }, (_, i) => ({
    label: HOUSE_LABELS[i],
    rashi: RASHI_LIST[(ascIdx + i) % 12].split(' ')[0],
  }));

  // North Indian chart grid positions (row, col) for houses 1-12
  const positions = [
    [1,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,1],
  ];

  const cells = Array(4).fill(null).map(() => Array(4).fill(null));
  houses.forEach((h, i) => {
    const [r, c] = positions[i];
    cells[r][c] = { ...h, num: i + 1 };
  });
  // Center cell (1,1)-(2,2) is the Om symbol
  cells[1][1] = 'center';
  cells[1][2] = null;
  cells[2][1] = null;
  cells[2][2] = null;

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
  const [form, setForm]     = useState({ name: '', dob: '', tob: '', pob: '' });
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ascendant, setAscendant] = useState(0);
  const [lang, setLang] = useState('english');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Free Kundali Reading | Astravedam";
    const saved = localStorage.getItem('kundaliForm');
    if (saved) {
      try { setForm(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    localStorage.setItem('kundaliForm', JSON.stringify(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dob || !form.pob) {
      setError('Please fill in name, date of birth, and place of birth.');
      return;
    }
    setError('');
    setLoading(true);
    setReading('');
    setSubmitted(true);

    // Rough ascendant guess from birth time (4 signs per 24h = 2h per sign)
    if (form.tob) {
      const [h] = form.tob.split(':').map(Number);
      setAscendant(Math.floor(h / 2) % 12);
    }

    try {
      const res = await fetch(`${API_URL}/api/kundali-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: lang }),
      });
      if (!res.ok) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setReading(text);
      }
    } catch {
      setReading('The cosmic reading could not be completed at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kundali-page">
      <div className="kundali-hero">
        <h1>Janma Kundali</h1>
        <p>Your birth chart reveals the cosmic blueprint of your life — your strengths, challenges, and destiny.</p>
        <div className="kundali-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      <div className="kundali-layout">
        <div className="kundali-form-section">
          <form onSubmit={handleSubmit} className="kundali-form">
            <h3>Enter Birth Details</h3>

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
              {loading ? 'Reading the stars...' : 'Generate My Kundali'}
            </button>
          </form>
        </div>

        <div className="kundali-chart-section">
          <KundaliChart ascendant={ascendant} />
          {submitted && (
            <p className="kundali-chart-note">
              North Indian style chart · Lagna in house I
            </p>
          )}
        </div>
      </div>

      {(reading || loading) && (
        <div className="kundali-reading">
          <h3>Your Cosmic Reading — {form.name}</h3>
          {loading && !reading && (
            <div className="kundali-reading-loading">
              <div className="kundali-spinner"></div>
              <span>The stars are aligning your reading...</span>
            </div>
          )}
          <div className="kundali-reading-text">
            {reading.split('\n').map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default KundaliPage;
