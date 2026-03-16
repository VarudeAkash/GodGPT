import { useState } from 'react';
import './Header.css';
import Login from './Login.jsx';

function Header({ user, navigateTo }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const nav = (screen) => {
    if (navigateTo) navigateTo(screen);
    else window.location.hash = screen;
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-background"></div>
      <div className="header-container">
        {/* Left section */}
        <div className="left-section">
          <button
            className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="menu-dot"></span>
            <span className="menu-dot"></span>
            <span className="menu-dot"></span>
          </button>

          <a className="logo" href="#welcome" style={{ textDecoration: 'none' }} onClick={e => { e.preventDefault(); nav('welcome'); }}>
            <div className="logo-image">
              {!logoError ? (
                <img src="/logo.png" alt="Astravedam" onError={() => setLogoError(true)} />
              ) : (
                <div className="logo-fallback">A</div>
              )}
            </div>
            <div className="logo-text">
              <span className="logo-main">Astravedam</span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button className="nav-link nav-btn" onClick={() => nav('welcome')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Home</span>
          </button>
          <button className="nav-link nav-btn" onClick={() => nav('panchang')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Today</span>
          </button>
          <button className="nav-link nav-btn" onClick={() => nav('deity-select')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Chat</span>
          </button>
          <button className="nav-link nav-btn" onClick={() => nav('kundali')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Kundali</span>
          </button>
          <button className="nav-link nav-btn" onClick={() => nav('divya-upay')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Upay</span>
          </button>
          <button className="nav-link nav-btn" onClick={() => nav('blog')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Blog</span>
          </button>
          <div className="nav-more-wrapper">
            <button className="nav-link nav-btn nav-more-btn" onClick={() => setShowMore(v => !v)}>
              <span className="nav-glow"></span>
              <span className="nav-text">More {showMore ? '▴' : '▾'}</span>
            </button>
            {showMore && (
              <>
                <div className="nav-dropdown-backdrop" onClick={() => setShowMore(false)} />
                <div className="nav-dropdown">
                  <button className="nav-dropdown-item" onClick={() => { nav('kundali-milan'); setShowMore(false); }}>💑 Kundali Milan</button>
                  <button className="nav-dropdown-item" onClick={() => { nav('muhurat'); setShowMore(false); }}>🕐 Muhurat Finder</button>
                  <button className="nav-dropdown-item" onClick={() => { nav('sade-sati'); setShowMore(false); }}>🪐 Sade Sati</button>
                  <button className="nav-dropdown-item" onClick={() => { nav('varshphal'); setShowMore(false); }}>📅 Varshphal</button>
                  <button className="nav-dropdown-item" onClick={() => { nav('festivals'); setShowMore(false); }}>🪔 Festivals</button>
                </div>
              </>
            )}
          </div>
          <Login user={user} />
        </nav>

        {/* Overlay */}
        {isMenuOpen && (
          <div
            className={`mobile-overlay ${isMenuOpen ? 'visible' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-background"></div>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <div className="logo">
              <div className="logo-image">
                {!logoError ? (
                  <img src="/logo.png" alt="Astravedam" onError={() => setLogoError(true)} />
                ) : (
                  <div className="logo-fallback">A</div>
                )}
              </div>
              <div className="logo-text">
                <span className="logo-main">Astravedam</span>
              </div>
            </div>
          </div>

          <div className="mobile-nav-links">
            <button className="nav-link mobile-nav-btn" onClick={() => nav('welcome')}>
              <span className="nav-text">Home</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('panchang')}>
              <span className="nav-text">Today's Panchang</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('deity-select')}>
              <span className="nav-text">Chat with Deities</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('kundali')}>
              <span className="nav-text">Kundali Reading</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('divya-upay')}>
              <span className="nav-text">Divya Upay</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('kundali-milan')}>
              <span className="nav-text">Kundali Milan</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('muhurat')}>
              <span className="nav-text">Muhurat Finder</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('sade-sati')}>
              <span className="nav-text">Sade Sati Report</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('varshphal')}>
              <span className="nav-text">Varshphal Reading</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('festivals')}>
              <span className="nav-text">Festivals & Fasting</span>
            </button>
            <button className="nav-link mobile-nav-btn" onClick={() => nav('blog')}>
              <span className="nav-text">Blog</span>
            </button>
            <div className="mobile-login-section">
              <Login user={user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
