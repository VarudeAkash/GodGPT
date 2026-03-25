import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import PanchangPage from '../src/components/PanchangPage';

export default function Panchang() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>{"Today's Panchang & Tithi | Astravedam"}</title>
        <meta name="description" content="Today's Panchang — Tithi, Nakshatra, Yoga, Karana, Rahukala and auspicious Muhurat timings calculated for your location. Free daily Panchang." />
        <link rel="canonical" href="https://astravedam.com/panchang" />
        <meta property="og:title" content="Today's Panchang & Tithi | Astravedam" />
        <meta property="og:description" content="Free daily Panchang with Tithi, Nakshatra, Yoga, Rahukala and Muhurat timings for your location." />
        <meta property="og:url" content="https://astravedam.com/panchang" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is Panchang?", "acceptedAnswer": { "@type": "Answer", "text": "Panchang is the Hindu almanac that provides five key elements of the day: Tithi (lunar day), Vara (weekday), Nakshatra (star), Yoga, and Karana. It is used for auspicious timing and daily planning." } },
            { "@type": "Question", "name": "What is Rahukala?", "acceptedAnswer": { "@type": "Answer", "text": "Rahukala is an inauspicious period of approximately 90 minutes each day governed by Rahu. Important activities like travel, business deals and ceremonies are generally avoided during Rahukala." } }
          ]
        })}} />
      </Head>
      <PanchangPage user={user} />
    </>
  );
}
