import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import DivyaUpayPage from '../src/components/DivyaUpayPage';

export default function DivyaUpay() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Divya Upay — Sacred Vedic Remedies | Astravedam</title>
        <meta name="description" content="Get personalized Vedic remedies (Upay) for your problems — mantras, gemstones, fasting, charity and rituals based on your birth chart. AI-powered Divya Upay starting at ₹19." />
        <link rel="canonical" href="https://astravedam.com/divya-upay" />
        <meta property="og:title" content="Divya Upay — Sacred Vedic Remedies | Astravedam" />
        <meta property="og:description" content="Personalized Vedic remedies — mantras, gemstones, rituals for health, love, career and finances. Starting ₹19." />
        <meta property="og:url" content="https://astravedam.com/divya-upay" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <DivyaUpayPage user={user} />
    </>
  );
}
