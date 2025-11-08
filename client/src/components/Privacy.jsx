import './Privacy.css';

function Privacy() {
  return (
    <div className="privacy-page">
      {/* Background Elements */}
      <div className="temple-background"></div>
      <div className="floating-diwali"></div>
      <div className="floating-om">ॐ</div>
      <div className="floating-lotus">🌸</div>
      
      <div className="privacy-container">
        <div className="privacy-content">
          
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
                <h1 className="welcome-title">AstraVedam</h1>
                <p className="welcome-tagline">Ancient Wisdom, Modern Intelligence</p>
              </div>
            </div>
          </div>

          {/* Privacy Heading */}
          <div className="privacy-heading-section">
            <h2>Privacy Policy</h2>
            <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="privacy-sections">
            {/* Introduction */}
            <div className="privacy-section">
              <h3>Introduction</h3>
              <p>
                At AstraVedam, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our spiritual AI platform.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="privacy-section">
              <h3>Information We Collect</h3>
              <div className="info-types">
                <div className="info-item">
                  <h4>Chat Conversations</h4>
                  <p>We store your chat messages locally in your browser to provide a continuous conversation experience. These are not stored on our servers.</p>
                </div>
                <div className="info-item">
                  <h4>Payment Information</h4>
                  <p>When you make payments, we process them through secure payment gateways. We do not store your credit card or bank details on our servers.</p>
                </div>
                <div className="info-item">
                  <h4>Usage Analytics</h4>
                  <p>We collect anonymous usage data to improve our service, such as which deities are most popular and general usage patterns.</p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="privacy-section">
              <h3>How We Use Your Information</h3>
              <ul>
                <li>To provide and maintain our spiritual AI service</li>
                <li>To process your payments securely</li>
                <li>To improve our platform and user experience</li>
                <li>To respond to your inquiries and provide support</li>
                <li>To ensure the security of our platform</li>
              </ul>
            </div>

            {/* Data Storage & Security */}
            <div className="privacy-section">
              <h3>Data Storage & Security</h3>
              <p>
                Your chat conversations are stored locally in your browser using localStorage. 
                This means your spiritual discussions remain private on your device and are not transmitted to our servers.
              </p>
              <p>
                Payment information is handled securely by compliant payment processors. 
                We implement appropriate security measures to protect your data from unauthorized access.
              </p>
            </div>

            {/* Your Rights */}
            <div className="privacy-section">
              <h3>Your Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access any personal information we hold about you</li>
                <li>Request correction of your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Request transfer of your personal information</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="privacy-section">
              <h3>Cookies & Tracking</h3>
              <p>
                We use minimal cookies only for essential functionality. We do not use tracking cookies 
                for advertising or extensive analytics.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="privacy-section">
              <h3>Children's Privacy</h3>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="privacy-section">
              <h3>Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>

            {/* Contact */}
            <div className="privacy-section">
              <h3>Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <strong>Email:</strong> astravedam.official@gmail.com
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Privacy;