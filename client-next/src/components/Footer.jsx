import { useRouter } from 'next/router';

function Footer() {
  const router = useRouter();

  const PATH_MAP = {
    welcome: '/',
    panchang: '/panchang',
    kundali: '/kundali',
    'divya-upay': '/divya-upay',
    blog: '/blog',
    'deity-select': '/deity-select',
    about: '/about',
    contact: '/contact',
    privacy: '/privacy',
  };

  const nav = (screen) => {
    const path = PATH_MAP[screen] || `/${screen}`;
    router.push(path);
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Astravedam" onError={e => e.target.style.display='none'} />
            <span className="footer-logo-name">Astravedam</span>
          </div>
          <p className="footer-tagline">Ancient wisdom, modern intelligence.<br/>Bridging the divine and the everyday.</p>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <button onClick={() => nav('panchang')}>Today's Panchang</button>
          <button onClick={() => nav('kundali')}>Kundali Reading</button>
          <button onClick={() => nav('divya-upay')}>Divya Upay</button>
          <button onClick={() => nav('blog')}>Blog</button>
          <button onClick={() => nav('deity-select')}>Chat with Deities</button>
        </div>

        <div className="footer-links-group">
          <h4>Company</h4>
          <button onClick={() => nav('about')}>About Us</button>
          <button onClick={() => nav('contact')}>Contact</button>
          <button onClick={() => nav('privacy')}>Privacy Policy</button>
        </div>

        <div className="footer-links-group">
          <h4>Connect</h4>
          <p className="footer-connect-text">Questions, feedback, or partnership inquiries — we'd love to hear from you.</p>
          <button className="footer-cta-btn" onClick={() => nav('deity-select')}>Begin Your Journey</button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Astravedam. All rights reserved.</span>
        <span className="footer-made">Made with devotion in India</span>
      </div>
    </footer>
  );
}

export default Footer;
