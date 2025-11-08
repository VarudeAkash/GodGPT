import './Contact.css';

function Contact() {
  return (
    <div className="contact-page">
      {/* Background Elements */}
      <div className="temple-background"></div>
      <div className="floating-diwali"></div>
      <div className="floating-om">ॐ</div>
      <div className="floating-lotus">🌸</div>
      
      <div className="contact-container">
        <div className="contact-content">
          
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

          {/* Contact Heading */}
          <div className="contact-heading-section">
            <h2>Contact Us</h2>
            <p>We're here to help you on your spiritual journey. Get in touch with us.</p>
          </div>

          {/* Simple Contact Methods */}
          <div className="simple-contact-methods">
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <h3>Email Us</h3>
              <p>astravedam.official@gmail.com</p>
              <small>For any questions or support</small>
            </div>

            <div className="contact-card">
              <div className="contact-icon">🌐</div>
              <h3>Visit Us</h3>
              <p>https://astravedam.com</p>
              <small>Start your spiritual journey</small>
            </div>

            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <h3>Feedback</h3>
              <p>Share your experience</p>
              <small>We value your suggestions</small>
            </div>
          </div>

          {/* Response Info */}
          <div className="response-info">
            <h3>Response Time</h3>
            <p>We typically respond to all emails within <strong>24 hours</strong> during business days.</p>
            <div className="business-hours">
              <p>📅 <strong>Operating Hours:</strong> Monday - Friday, 10 AM - 5 PM IST</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>Is AstraVedam free to use?</h4>
                <p>Yes! You get 50 free messages with Lord Krishna. Premium deities require a small payment for additional messages.</p>
              </div>
              <div className="faq-item">
                <h4>How accurate are the responses?</h4>
                <p>All responses are based on authentic Hindu scriptures and are carefully crafted to provide meaningful spiritual guidance.</p>
              </div>
              <div className="faq-item">
                <h4>Can I get a refund?</h4>
                <p>We offer refunds on a case-by-case basis. Please contact us with your payment details and reason for refund request.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;