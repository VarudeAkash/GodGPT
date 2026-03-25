import Head from 'next/head';
import About from '../src/components/About';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Astravedam — AI-Powered Vedic Astrology Platform</title>
        <meta name="description" content="Astravedam combines ancient Vedic astrology with modern AI to deliver personalized spiritual guidance, Kundali readings and deity chat — rooted in authentic Hindu scriptures." />
        <link rel="canonical" href="https://astravedam.com/about" />
        <meta property="og:title" content="About Astravedam" />
        <meta property="og:description" content="AI-powered Vedic astrology platform combining ancient wisdom with modern technology." />
        <meta property="og:url" content="https://astravedam.com/about" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <About />
    </>
  );
}
