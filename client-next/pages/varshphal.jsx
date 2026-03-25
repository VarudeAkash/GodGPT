import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import VarshphalPage from '../src/components/VarshphalPage';

export default function Varshphal() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Varshphal — Vedic Annual Horoscope Reading | Astravedam</title>
        <meta name="description" content="Get your Varshphal (annual solar return) reading — a month-by-month forecast for your year ahead based on Vedic astrology. Career, health, relationships and finances. Starting ₹49." />
        <link rel="canonical" href="https://astravedam.com/varshphal" />
        <meta property="og:title" content="Varshphal — Vedic Annual Horoscope | Astravedam" />
        <meta property="og:description" content="Month-by-month annual forecast based on your Vedic solar return chart. Career, health, relationships. ₹49." />
        <meta property="og:url" content="https://astravedam.com/varshphal" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <VarshphalPage user={user} />
    </>
  );
}
