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
          <div className="logo-image" style={{ width: '80px', height: '80px' }}>
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Astravedam" 
                onError={() => setLogoError(true)}
                style={{ width: '90px', height: '90px' }}
                />
            ) : (
              <div className="logo-fallback">🕉️</div>
            )}
          </div>
          <div className="logo-text">
            <span className="logo-main">Astravedam</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="desktop-nav">
          <a href="#welcome" className="nav-link" onClick={() => setCurrentScreen('welcome')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Home</span>
          </a>
          <a href="#about" className="nav-link" onClick={() => setCurrentScreen('about')}>
            <span className="nav-glow"></span>
            <span className="nav-text">About</span>
          </a>
          <a href="#contact" className="nav-link" onClick={() => setCurrentScreen('contact')}>
            <span className="nav-glow"></span>
            <span className="nav-text">Contact</span>
          </a>
          <a href="#privacy" className="nav-link" onClick={() => setCurrentScreen('privacy')}>
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
                <div className="logo-image" style={{ width: '80px', height: '80px' }}>
                  {!logoError ? (
                    <img 
                        src="/logo.png" 
                        alt="Astravedam" 
                        onError={() => setLogoError(true)}
                        style={{ width: '90px', height: '90px' }}
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
              <a href="#welcome" className="nav-link" onClick={() => { setIsMenuOpen(false); setCurrentScreen('welcome'); }}>
                <span className="nav-text">Home</span>
              </a>
              <a href="#about" className="nav-link" onClick={() => { setIsMenuOpen(false); setCurrentScreen('about'); }}>
                <span className="nav-text">About</span>
              </a>
              <a href="#contact" className="nav-link" onClick={() => { setIsMenuOpen(false); setCurrentScreen('contact'); }}>
                <span className="nav-text">Contact</span>
              </a>
              <a href="#privacy" className="nav-link" onClick={() => { setIsMenuOpen(false); setCurrentScreen('privacy'); }}>
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