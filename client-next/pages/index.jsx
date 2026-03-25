import Head from 'next/head';
import { useRouter } from 'next/router';
import { useChat } from '../src/context/ChatContext';
import DeityIcon from '../src/components/DeityIcon';

export default function Home() {
  const router = useRouter();
  const { deities } = useChat();

  return (
    <>
      <Head>
        <title>Astravedam — AI Vedic Astrology &amp; Spiritual Guidance</title>
        <meta name="description" content="Chat with Lord Krishna, Shiva, Lakshmi and more Hindu deities. Get free Kundali readings, daily horoscope, Panchang, Muhurat and sacred Vedic remedies — powered by AI." />
        <link rel="canonical" href="https://astravedam.com/" />
        <meta property="og:title" content="Astravedam — AI Vedic Astrology & Spiritual Guidance" />
        <meta property="og:description" content="Chat with Hindu deities, get personalized Kundali readings, daily horoscopes and sacred remedies — powered by AI, rooted in Vedic wisdom." />
        <meta property="og:url" content="https://astravedam.com/" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <div className="app welcome-screen">
        <div className="temple-background"></div>
        <div className="floating-diwali"></div>
        <div className="floating-om">ॐ</div>
        <div className="floating-lotus">🌸</div>

        {/* Hero — logo + tagline, no box */}
        <div className="welcome-hero">
          <div className="brand-section">
            <div className="logo-large">
              <img src="/logo.png" alt="Astravedam" onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} style={{ width: '80px', height: '80px' }}/>
              <div className="logo-fallback-large">A</div>
            </div>
            <div className="brand-text">
              <h1 className="welcome-title">Astravedam</h1>
              <p className="welcome-tagline">Ancient Wisdom, Modern Intelligence</p>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="features-section">

          {/* Featured: Chat — large prominent card */}
          <div className="feature-card feature-card--chat feature-card--featured" onClick={() => router.push('/deity-select')}>
            <div className="feature-card-glow"></div>
            <div className="featured-inner">
              <div className="featured-text">
                <span className="featured-badge">Sign in · 50 free messages with Krishna</span>
                <div className="feature-icon">✦</div>
                <h2>Chat with the Divine</h2>
                <p>Seek wisdom from Krishna, Shiva, Lakshmi, Hanuman, Saraswati and Ganesha — responses drawn from authentic Vedic scriptures, personalized to your life and questions.</p>
                <span className="feature-card-cta">Begin Your Journey</span>
              </div>
              <div className="featured-deity-grid">
                {[
                  { id: 'krishna',   color: '#FF6B35' },
                  { id: 'shiva',     color: '#8B5CF6' },
                  { id: 'lakshmi',   color: '#F59E0B' },
                  { id: 'hanuman',   color: '#FF6B6B' },
                  { id: 'saraswati', color: '#4ECDC4' },
                  { id: 'ganesha',   color: '#45B7D1' },
                ].map(d => (
                  <div key={d.id} className="featured-deity-chip">
                    <DeityIcon id={d.id} color={d.color} size={52} borderRadius={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary 2x2 grid */}
          <div className="features-grid-secondary">
            <div className="feature-card feature-card--panchang" onClick={() => router.push('/panchang')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">◉</div>
              <h4>Today's Panchang</h4>
              <p>Tithi, Nakshatra, Yoga, Rahukala and Muhurat — calculated for your location</p>
              <span className="feature-card-cta">View Today</span>
            </div>
            <div className="feature-card feature-card--kundali" onClick={() => router.push('/kundali')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">✧</div>
              <h4>Kundali Reading</h4>
              <p>Personalized Vedic birth chart reading from your name, date, time and place of birth</p>
              <span className="feature-card-cta">Get Reading</span>
            </div>
            <div className="feature-card feature-card--upay" onClick={() => router.push('/divya-upay')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">◈</div>
              <h4>Divya Upay</h4>
              <p>Sacred remedies — mantras, rituals and practices for your specific situation</p>
              <span className="feature-card-cta">Find Remedies</span>
            </div>
            <div className="feature-card feature-card--blog" onClick={() => router.push('/blog')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">◇</div>
              <h4>Vedic Wisdom Blog</h4>
              <p>Deep dives into Panchang, Navagraha, Sade Sati, Vastu and more</p>
              <span className="feature-card-cta">Read Articles</span>
            </div>
          </div>

          {/* Third row — 5 more features */}
          <div className="features-grid-more">
            <div className="feature-card feature-card--milan" onClick={() => router.push('/kundali-milan')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">💑</div>
              <h4>Kundali Milan</h4>
              <p>Ashtakoot compatibility analysis for marriage matching</p>
              <span className="feature-card-cta">Match Now</span>
            </div>
            <div className="feature-card feature-card--muhurat" onClick={() => router.push('/muhurat')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">🕐</div>
              <h4>Muhurat Finder</h4>
              <p>Auspicious timing for marriage, business, travel and more</p>
              <span className="feature-card-cta">Find Muhurat</span>
            </div>
            <div className="feature-card feature-card--sadesati" onClick={() => router.push('/sade-sati')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">🪐</div>
              <h4>Sade Sati Report</h4>
              <p>Saturn's 7.5-year transit and its impact on your moon sign</p>
              <span className="feature-card-cta">Check Report</span>
            </div>
            <div className="feature-card feature-card--varshphal" onClick={() => router.push('/varshphal')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">📅</div>
              <h4>Varshphal</h4>
              <p>Annual solar return reading — your year ahead, month by month</p>
              <span className="feature-card-cta">View Reading</span>
            </div>
            <div className="feature-card feature-card--festivals" onClick={() => router.push('/festivals')}>
              <div className="feature-card-glow"></div>
              <div className="feature-icon">🪔</div>
              <h4>Festival Calendar</h4>
              <p>Hindu festivals, fasting days and ekadashis for 2025–2026</p>
              <span className="feature-card-cta">View Calendar</span>
            </div>
          </div>
        </div>

        {/* Testimonials — static strip */}
        <div className="testimonials-strip">
          <div className="testimonial-card">
            <p>"The guidance felt genuinely divine. Practical and deeply spiritual."</p>
            <div className="testimonial-author"><strong>Priya Sharma</strong><span>Mumbai</span></div>
          </div>
          <div className="testimonial-card">
            <p>"Made ancient wisdom accessible and relevant to modern life."</p>
            <div className="testimonial-author"><strong>Arjun Patel</strong><span>Delhi</span></div>
          </div>
          <div className="testimonial-card">
            <p>"Krishna's guidance helped me find peace during difficult times."</p>
            <div className="testimonial-author"><strong>Rahul Verma</strong><span>Bangalore</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
