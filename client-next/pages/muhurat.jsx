import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import MuhuratPage from '../src/components/MuhuratPage';

export default function Muhurat() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Muhurat Finder — Auspicious Timing for Any Occasion | Astravedam</title>
        <meta name="description" content="Find the best Muhurat (auspicious time) for marriage, griha pravesh, business launch, travel, naming ceremony and more. Vedic Muhurat calculator starting at ₹9." />
        <link rel="canonical" href="https://astravedam.com/muhurat" />
        <meta property="og:title" content="Muhurat Finder — Auspicious Timing | Astravedam" />
        <meta property="og:description" content="Find Shubh Muhurat for marriage, travel, business, griha pravesh and more. Vedic auspicious timing calculator. ₹9." />
        <meta property="og:url" content="https://astravedam.com/muhurat" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <MuhuratPage user={user} />
    </>
  );
}
