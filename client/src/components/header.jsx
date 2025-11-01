import { useState } from 'react';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="header">
      {/* Highly Visible Rangoli Patterns */}
      <div className="rangoli-pattern rangoli-1"></div>
      <div className="rangoli-pattern rangoli-2"></div>
      <div className="rangoli-pattern rangoli-3"></div>
      <div className="rangoli-pattern rangoli-4"></div>
      <div className="rangoli-pattern rangoli-5"></div>
      
      <div className="header-background"></div>
      <div className="header-container">
        
        {/* Logo - No Background for Transparent Logo */}
        <div className="logo">
          <div className="logo-image">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Hindu.Dharma.AI" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="logo-fallback">🕉️</div>
            )}
          </div>
          <div className="logo-text">
            <span className="logo-main">Hindu.Dharma.AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="desktop-nav">
          <a href="/" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">Home</span>
          </a>
          <a href="/about" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">About</span>
          </a>
          <a href="/contact" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">Contact</span>
          </a>
          <a href="/privacy" className="nav-link">
            <span className="nav-glow"></span>
            <span className="nav-text">Privacy</span>
          </a>
        </nav>

        {/* Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="menu-dot"></span>
          <span className="menu-dot"></span>
          <span className="menu-dot"></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-rangoli"></div>
          <div className="mobile-nav-background"></div>
          <div className="mobile-nav-content">
            <div className="mobile-nav-header">
              <div className="logo">
                <div className="logo-image">
                  {!logoError ? (
                    <img 
                      src="/logo.png" 
                      alt="Hindu.Dharma.AI" 
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="logo-fallback">🕉️</div>
                  )}
                </div>
                <div className="logo-text">
                  <span className="logo-main">Hindu.Dharma.AI</span>
                </div>
              </div>
            </div>
            
            <div className="mobile-nav-links">
              <a href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">Home</span>
              </a>
              <a href="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">About</span>
              </a>
              <a href="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">Contact</span>
              </a>
              <a href="/privacy" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-text">Privacy</span>
              </a>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </div>
    </header>
  );
}

export default Header;