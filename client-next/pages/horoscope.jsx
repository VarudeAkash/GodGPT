import Head from 'next/head';
import { useRouter } from 'next/router';
import HoroscopePage from '../src/components/HoroscopePage';

export default function Horoscope() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Aaj Ka Rashifal — Daily Horoscope for All 12 Rashis | Astravedam</title>
        <meta name="description" content="Free daily horoscope (Rashifal) for all 12 Rashis — Mesh, Vrishabh, Mithun, Kark, Singh, Kanya, Tula, Vrishchik, Dhanu, Makar, Kumbh, Meen. In Hindi and English." />
        <link rel="canonical" href="https://astravedam.com/horoscope" />
        <meta property="og:title" content="Aaj Ka Rashifal — Daily Horoscope for All 12 Rashis" />
        <meta property="og:description" content="Free daily Rashifal for all 12 zodiac signs in Hindi and English. Powered by Vedic astrology AI." />
        <meta property="og:url" content="https://astravedam.com/horoscope" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is Rashifal?", "acceptedAnswer": { "@type": "Answer", "text": "Rashifal is the daily horoscope based on your Vedic moon sign (Rashi). It provides guidance for the day based on planetary positions." } },
            { "@type": "Question", "name": "How is Vedic horoscope different from Western horoscope?", "acceptedAnswer": { "@type": "Answer", "text": "Vedic astrology uses the sidereal zodiac based on actual star positions, while Western astrology uses the tropical zodiac. Vedic Rashifal is based on your moon sign, not sun sign." } },
            { "@type": "Question", "name": "Which Rashi am I?", "acceptedAnswer": { "@type": "Answer", "text": "Your Rashi (moon sign) is determined by the position of the moon at the time of your birth. It is different from your Western sun sign. Use our free Kundali reading to find your exact Rashi." } }
          ]
        })}} />
      </Head>
      <HoroscopePage navigateTo={(screen) => router.push(screen === 'deity-select' ? '/deity-select' : `/${screen}`)} />
    </>
  );
}
