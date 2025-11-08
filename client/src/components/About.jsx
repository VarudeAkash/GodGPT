import './About.css';

function About() {
  return (
    <div className="about-page">
      {/* Background Elements */}
      <div className="temple-background"></div>
      <div className="floating-diwali"></div>
      <div className="floating-om">ॐ</div>
      <div className="floating-lotus">🌸</div>
      
      <div className="about-container">
        <div className="about-content">
          
          {/* Header Section - EXACTLY like Home Page */}
          <div className="main-header">
            <div className="brand-section">
              <div className="logo-large">
                <img src="/logo.png" alt="AstraVedam" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}/>
                <div className="logo-fallback-large">🕉️</div>
              </div>
              <div className="brand-text">
                <h1 className="welcome-title">Astravedam</h1>
                <p className="welcome-tagline">Ancient Wisdom, Modern Intelligence</p>
              </div>
            </div>
          </div>

          {/* About Us Heading */}
          <div className="about-heading-section">
            <h2>About Us</h2>
          </div>

          {/* Mission Section */}
          <div className="about-section">
            <p>
              AstraVedam is a spiritual AI platform that makes the profound wisdom of Hindu scriptures 
              accessible to everyone. We combine authentic scriptural knowledge with modern artificial 
              intelligence to provide personalized spiritual guidance for modern life challenges.
            </p>
          </div>

          {/* Our Deities */}
          <div className="about-section">
            <h3>Our Divine Guides</h3>
            <p>
              We offer conversations with six carefully crafted AI personalities, each representing 
              different aspects of divine energy and wisdom from Hindu tradition:
            </p>
            <div className="deities-list">
              <div className="deity-item">
                <strong>Lord Krishna</strong> - Divine mentor & compassionate guide (Free)
              </div>
              <div className="deity-item">
                <strong>Lord Shiva</strong> - Eternal yogi & destroyer of ignorance
              </div>
              <div className="deity-item">
                <strong>Goddess Lakshmi</strong> - True prosperity & spiritual abundance
              </div>
              <div className="deity-item">
                <strong>Lord Hanuman</strong> - Embodiment of devotion & strength
              </div>
              <div className="deity-item">
                <strong>Goddess Saraswati</strong> - Knowledge & creative wisdom
              </div>
              <div className="deity-item">
                <strong>Lord Ganesha</strong> - Remover of obstacles & new beginnings
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="about-section">
            <h3>Our Values</h3>
            <div className="values-grid">
              <div className="value-item">
                <h4>Authenticity</h4>
                <p>All guidance is rooted in authentic scriptures and traditions</p>
              </div>
              <div className="value-item">
                <h4>Accessibility</h4>
                <p>Making ancient wisdom available to everyone, everywhere</p>
              </div>
              <div className="value-item">
                <h4>Innovation</h4>
                <p>Using modern technology to preserve and share traditional knowledge</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="about-cta">
            <h3>Ready to Begin Your Spiritual Journey?</h3>
            <p>Start with free messages from Lord Krishna and experience divine guidance</p>
            <button 
              className="cta-button-about"
              onClick={() => window.location.hash = 'deity-select'}
            >
              Begin Your Journey
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default About;