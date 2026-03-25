import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import KundaliPage from '../src/components/KundaliPage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function Kundali() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Kundali Reading — Vedic Birth Chart | Astravedam</title>
        <meta name="description" content="Get your personalized Vedic Kundali reading instantly. Enter your name, date, time and place of birth for a detailed birth chart analysis — planets, houses, doshas and remedies. Just ₹14." />
        <link rel="canonical" href="https://astravedam.com/kundali" />
        <meta property="og:title" content="Kundali Reading — Vedic Birth Chart | Astravedam" />
        <meta property="og:description" content="Personalized Vedic Kundali reading with planetary positions, doshas and remedies. Starting ₹14." />
        <meta property="og:url" content="https://astravedam.com/kundali" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is a Kundali?", "acceptedAnswer": { "@type": "Answer", "text": "Kundali (also called Janam Kundali or birth chart) is a map of the sky at the exact moment of your birth. It shows the position of all planets across 12 houses and is the foundation of Vedic astrology." } },
            { "@type": "Question", "name": "What do I need to get my Kundali reading?", "acceptedAnswer": { "@type": "Answer", "text": "You need your full name, date of birth, exact time of birth, and place of birth. The more accurate your birth time, the more precise your reading." } },
            { "@type": "Question", "name": "What is Mangal Dosha?", "acceptedAnswer": { "@type": "Answer", "text": "Mangal Dosha (also called Manglik Dosha) occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th or 12th house of the Kundali. It is considered significant for marriage compatibility." } }
          ]
        })}} />
      </Head>
      <KundaliPage user={user} API_URL={API_URL} />
    </>
  );
}
