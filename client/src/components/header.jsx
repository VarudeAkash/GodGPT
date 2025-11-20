import { useState } from 'react';
import './Header.css';
import Login from './Login.jsx';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="header">
      <div className="header-background"></div>
      <div className="header-container">
        {/* Everything on LEFT side */}
        <div className="left-section">
          {/* Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="menu-dot"></span>
            <span className="menu-dot"></span>
            <span className="menu-dot"></span>
          </button>

          {/* Logo and Brand Name */}
          <div className="logo">
            <div className="logo-image">
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Astravedam" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="logo-fallback">🕉️</div>
              )}
            </div>
            <div className="logo-text">
              <span className="logo-main">Astravedam</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation (right side - hidden on mobile) */}
        <nav className="desktop-nav">
          <a href="#welcome" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">Home</span>
          </a>
          <a href="#about" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">About</span>
          </a>
          <a href="#contact" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">Contact</span>
          </a>
          <a href="#privacy" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">Privacy</span>
          </a>
          <Login />
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
                    <img 
                      src="/logo.png" 
                      alt="Astravedam" 
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="logo-fallback">🕉️</div>
                  )}
                </div>
                <div className="logo-text">
                  <span className="logo-main">Astravedam</span>
                </div>
              </div>
            </div>
            
            <div className="mobile-nav-links">
              <a href="#welcome" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">Home</span>
              </a>
              <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">About</span>
              </a>
              <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">Contact</span>
              </a>
              <a href="#privacy" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">Privacy</span>
              </a>
            </div>
          </div>
        </div>
    </header>
  );
}

export default Header;