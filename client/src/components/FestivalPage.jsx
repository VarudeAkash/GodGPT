import { useState, useMemo } from 'react';
import { FESTIVALS } from '../data/festivals.js';
import './FestivalPage.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const FILTER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'festival',  label: 'Festivals' },
  { key: 'ekadashi',  label: 'Ekadashi' },
  { key: 'fast',      label: 'Fasts' },
  { key: 'jayanti',   label: 'Jayanti' },
  { key: 'purnima',   label: 'Purnima' },
  { key: 'amavasya',  label: 'Amavasya' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isUpcoming(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const then = new Date(dateStr + 'T00:00:00');
  const diff = (then - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function isToday(dateStr) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dateStr === today;
}

function groupByMonth(festivals) {
  const groups = {};
  festivals.forEach(f => {
    const d = new Date(f.date + 'T00:00:00');
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups[key]) groups[key] = { year: d.getFullYear(), month: d.getMonth(), items: [] };
    groups[key].items.push(f);
  });
  return Object.values(groups).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );
}

function FestivalPage({ navigateTo }) {
  const [filter, setFilter] = useState('all');
  const [lang, setLang]     = useState('english');

  const filtered = useMemo(() =>
    FESTIVALS.filter(f => filter === 'all' || f.type === filter)
  , [filter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const upcomingCount = useMemo(() =>
    FESTIVALS.filter(f => isUpcoming(f.date)).length
  , []);

  return (
    <div className="festival-page">
      <div className="festival-hero">
        <h1>Festival &amp; Fasting Calendar</h1>
        <p>Sacred days, fasts, and celebrations across the Hindu calendar year</p>
        {upcomingCount > 0 && (
          <div className="festival-upcoming-badge">
            {upcomingCount} upcoming in the next 7 days
          </div>
        )}
        <div className="festival-lang">
          <button className={lang === 'english' ? 'active' : ''} onClick={() => setLang('english')}>EN</button>
          <button className={lang === 'hindi'   ? 'active' : ''} onClick={() => setLang('hindi')}>हिं</button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="festival-filters">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            className={`festival-filter-btn ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="festival-calendar">
        {grouped.map(group => (
          <div key={`${group.year}-${group.month}`} className="festival-month-group">
            <h2 className="festival-month-header">
              {MONTH_NAMES[group.month]} {group.year}
            </h2>
            <div className="festival-cards">
              {group.items.map((f, i) => (
                <div
                  key={`${f.date}-${i}`}
                  className={`festival-card festival-card--${f.type} ${isUpcoming(f.date) ? 'upcoming' : ''} ${isToday(f.date) ? 'today' : ''}`}
                >
                  <div className="festival-card-left">
                    <span className="festival-icon">{f.icon}</span>
                    <div className="festival-date-badge">
                      <span className="festival-day">{new Date(f.date + 'T00:00:00').getDate()}</span>
                      <span className="festival-month-abbr">{MONTH_NAMES[new Date(f.date + 'T00:00:00').getMonth()].slice(0, 3)}</span>
                    </div>
                  </div>
                  <div className="festival-card-body">
                    <div className="festival-card-top">
                      <h3 className="festival-name">
                        {lang === 'hindi' && f.nameHindi ? f.nameHindi : f.name}
                      </h3>
                      <span className={`festival-type-badge festival-type-badge--${f.type}`}>{f.type}</span>
                    </div>
                    {f.deity && (
                      <p className="festival-deity">Deity: {f.deity}</p>
                    )}
                    <p className="festival-description">{f.description}</p>
                    {isToday(f.date) && <span className="festival-today-tag">Today</span>}
                    {isUpcoming(f.date) && !isToday(f.date) && <span className="festival-upcoming-tag">Upcoming</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="festival-empty">
            <p>No festivals found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FestivalPage;
