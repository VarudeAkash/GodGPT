import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import KundaliMilanPage from '../src/components/KundaliMilanPage';

export default function KundaliMilan() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Kundali Milan — Marriage Compatibility Report | Astravedam</title>
        <meta name="description" content="Check marriage compatibility with Kundali Milan. Ashtakoot gun milan, Mangal Dosha check and detailed compatibility analysis for both partners. Just ₹49." />
        <link rel="canonical" href="https://astravedam.com/kundali-milan" />
        <meta property="og:title" content="Kundali Milan — Marriage Compatibility | Astravedam" />
        <meta property="og:description" content="Vedic marriage compatibility through Ashtakoot analysis. Check Kundali matching for both partners. ₹49." />
        <meta property="og:url" content="https://astravedam.com/kundali-milan" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is Kundali Milan?", "acceptedAnswer": { "@type": "Answer", "text": "Kundali Milan is the Vedic astrology process of matching two birth charts before marriage. It uses Ashtakoot (8 factors) to assess compatibility in areas like nature, health, mental compatibility, and progeny." } },
            { "@type": "Question", "name": "How many Gunas are needed for a good match?", "acceptedAnswer": { "@type": "Answer", "text": "Out of 36 Gunas, a score of 18 or above is considered acceptable for marriage. A score of 24 or above is considered good, and 32+ is considered excellent." } }
          ]
        })}} />
      </Head>
      <KundaliMilanPage user={user} />
    </>
  );
}
