import { useState } from 'react';
import './Header.css';
import Login from './Login.jsx';

const NAV_ITEMS = [
  { label: 'Home',    screen: 'welcome' },
  { label: 'Today',   screen: 'panchang' },
  { label: 'Chat',    screen: 'deity-select' },
  { label: 'Kundali', screen: 'kundali' },
  { label: 'Upay',    screen: 'divya-upay' },
  { label: 'Blog',    screen: 'blog' },
];

const MORE_ITEMS = [
  { label: 'Kundali Milan',   screen: 'kundali-milan', icon: '💑' },
  { label: 'Muhurat Finder',  screen: 'muhurat',       icon: '🕐' },
  { label: 'Sade Sati',       screen: 'sade-sati',     icon: '🪐' },
  { label: 'Varshphal',       screen: 'varshphal',     icon: '📅' },
  { label: 'Festivals',       screen: 'festivals',     icon: '🪔' },
];

const BOTTOM_TABS = [
  { label: 'Home',    screen: 'welcome',      icon: '⌂' },
  { label: 'Today',   screen: 'panchang',     icon: '◉' },
  { label: 'Chat',    screen: 'deity-select', icon: '✦' },
  { label: 'Kundali', screen: 'kundali',      icon: '✧' },
  { label: 'Menu',    screen: null,           icon: '···' },
];

function Header({ user, navigateTo, currentScreen }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError]   = useState(false);
  const [showMore, setShowMore]     = useState(false);

  const nav = (screen) => {
    if (!screen) return;
    if (navigateTo) navigateTo(screen);
    else window.location.hash = screen;
    setIsMenuOpen(false);
    setShowMore(false);
  };

  return (
    <>
      {/* ── Desktop: floating pill ────────────────────────────────── */}
      <header className="header-pill">
        {/* Logo mark */}
        <button className="pill-logo" onClick={() => nav('welcome')}>
          <div className="pill-logo-img">
            {!logoError
              ? <img src="/logo.png" alt="Astravedam" onError={() => setLogoError(true)} />
              : <span>A</span>}
          </div>
          <span className="pill-logo-name">Astravedam</span>
        </button>

        <div className="pill-divider" />

        {/* Nav links */}
        <nav className="pill-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.screen}
              className={`pill-nav-btn${currentScreen === item.screen ? ' active' : ''}`}
              onClick={() => nav(item.screen)}
            >
              {item.label}
            </button>
          ))}

          {/* More dropdown */}
          <div className="pill-more-wrap">
            <button
              className="pill-nav-btn pill-more-btn"
              onClick={() => setShowMore(v => !v)}
            >
              More {showMore ? '▴' : '▾'}
            </button>
            {showMore && (
              <>
                <div className="pill-dropdown-backdrop" onClick={() => setShowMore(false)} />
                <div className="pill-dropdown">
                  {MORE_ITEMS.map(item => (
                    <button
                      key={item.screen}
                      className="pill-dropdown-item"
                      onClick={() => nav(item.screen)}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="pill-divider" />

        {/* Login / Profile */}
        <div className="pill-login">
          {user
            ? <button className="pill-profile-btn" onClick={() => nav('profile')}>
                <img src={user.photoURL} alt={user.displayName} className="pill-avatar" />
                <span className="pill-profile-name">{user.displayName?.split(' ')[0]}</span>
              </button>
            : <Login user={user} />
          }
        </div>
      </header>

      {/* ── Mobile: bottom tab bar ────────────────────────────────── */}
      <nav className="bottom-nav">
        {BOTTOM_TABS.map(tab => (
          <button
            key={tab.label}
            className={`bottom-tab${currentScreen === tab.screen ? ' active' : ''}`}
            onClick={() => tab.screen ? nav(tab.screen) : setIsMenuOpen(true)}
          >
            <span className="bottom-tab-icon">{tab.icon}</span>
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Mobile: full-screen overlay menu ─────────────────────── */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <div className="pill-logo-img">
              {!logoError
                ? <img src="/logo.png" alt="Astravedam" onError={() => setLogoError(true)} />
                : <span>A</span>}
            </div>
            <span className="pill-logo-name">Astravedam</span>
          </div>
          <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>✕</button>
        </div>
        <div className="mobile-menu-links">
          {[...NAV_ITEMS, ...MORE_ITEMS].map(item => (
            <button key={item.screen} className="mobile-menu-item" onClick={() => nav(item.screen)}>
              {item.icon && <span>{item.icon}</span>} {item.label}
            </button>
          ))}
        </div>
        <div className="mobile-menu-login">
          <Login user={user} />
        </div>
      </div>
    </>
  );
}

export default Header;
