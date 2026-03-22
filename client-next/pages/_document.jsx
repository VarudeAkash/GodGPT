import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="google-adsense-account" content="ca-pub-3454724051912655" />
        <meta name="description" content="Astravedam — AI-powered Vedic astrology platform. Chat with Lord Krishna, Shiva, Lakshmi and more. Get Kundali readings, daily horoscopes, Panchang, Muhurat, Sade Sati and sacred remedies." />
        <meta name="keywords" content="vedic astrology, kundali reading, daily horoscope, rashifal, panchang today, chat with Krishna, sade sati, muhurat, divya upay, jyotish, Hindu astrology AI" />
        <meta name="author" content="Astravedam" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://astravedam.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Astravedam" />
        <meta property="og:title" content="Astravedam — AI Vedic Astrology & Spiritual Guidance" />
        <meta property="og:description" content="Chat with Hindu deities, get personalized Kundali readings, daily horoscopes and sacred remedies — powered by AI, rooted in Vedic wisdom." />
        <meta property="og:url" content="https://astravedam.com/" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Astravedam — AI Vedic Astrology & Spiritual Guidance" />
        <meta name="twitter:description" content="Chat with Hindu deities, get Kundali readings, daily horoscopes and sacred remedies — powered by AI." />
        <meta name="twitter:image" content="https://astravedam.com/logo.png" />
        <link rel="icon" href="/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Astravedam",
          "url": "https://astravedam.com",
          "description": "AI-powered Vedic astrology platform — chat with Hindu deities, get Kundali readings, daily horoscopes, Panchang and sacred remedies.",
          "inLanguage": ["en", "hi"]
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Astravedam",
          "url": "https://astravedam.com",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web",
          "description": "AI-powered Vedic astrology — Kundali readings, daily horoscopes, deity chat, Panchang, Muhurat, Sade Sati and Divya Upay.",
          "offers": [
            { "@type": "Offer", "name": "Kundali Reading", "price": "14", "priceCurrency": "INR" },
            { "@type": "Offer", "name": "Divya Upay", "price": "19", "priceCurrency": "INR" },
            { "@type": "Offer", "name": "Kundali Milan", "price": "49", "priceCurrency": "INR" },
            { "@type": "Offer", "name": "Muhurat Finder", "price": "9", "priceCurrency": "INR" },
            { "@type": "Offer", "name": "Sade Sati Report", "price": "49", "priceCurrency": "INR" },
            { "@type": "Offer", "name": "Varshphal", "price": "49", "priceCurrency": "INR" }
          ]
        })}} />
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
