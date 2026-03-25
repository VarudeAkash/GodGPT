import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import SadeSatiPage from '../src/components/SadeSatiPage';

export default function SadeSati() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Sade Sati Report — Saturn Transit Effect on Your Rashi | Astravedam</title>
        <meta name="description" content="Check if you are currently under Sade Sati (Saturn's 7.5-year transit). Get a detailed report on its effect on your moon sign and personalized remedies. Starting ₹49." />
        <link rel="canonical" href="https://astravedam.com/sade-sati" />
        <meta property="og:title" content="Sade Sati Report — Saturn Transit | Astravedam" />
        <meta property="og:description" content="Are you under Sade Sati? Check Saturn's 7.5-year transit impact on your Rashi and get remedies. ₹49." />
        <meta property="og:url" content="https://astravedam.com/sade-sati" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is Sade Sati?", "acceptedAnswer": { "@type": "Answer", "text": "Sade Sati is a 7.5-year period when Saturn (Shani) transits through the 12th, 1st and 2nd houses from your natal moon sign. It is known to bring challenges but also growth and transformation." } },
            { "@type": "Question", "name": "How often does Sade Sati occur?", "acceptedAnswer": { "@type": "Answer", "text": "Sade Sati occurs approximately every 30 years, as Saturn takes about 30 years to complete one full orbit around the Sun. Most people experience it 2-3 times in their lifetime." } },
            { "@type": "Question", "name": "What are remedies for Sade Sati?", "acceptedAnswer": { "@type": "Answer", "text": "Common remedies include chanting Shani mantras, fasting on Saturdays, donating black sesame and mustard oil, wearing blue sapphire (after expert consultation), and performing Shani puja." } }
          ]
        })}} />
      </Head>
      <SadeSatiPage user={user} />
    </>
  );
}
