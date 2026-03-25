import Head from 'next/head';
import { useRouter } from 'next/router';
import FestivalPage from '../src/components/FestivalPage';

export default function Festivals() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Hindu Festival Calendar 2026 — Dates & Significance | Astravedam</title>
        <meta name="description" content="Complete Hindu festival calendar for 2026 — Diwali, Holi, Navratri, Ekadashi, Janmashtami and all major festivals with dates, significance and fasting guidelines." />
        <link rel="canonical" href="https://astravedam.com/festivals" />
        <meta property="og:title" content="Hindu Festival Calendar 2026 | Astravedam" />
        <meta property="og:description" content="All Hindu festivals, fasting days and Ekadashis for 2026 with dates and significance." />
        <meta property="og:url" content="https://astravedam.com/festivals" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <FestivalPage navigateTo={(screen) => router.push(`/${screen === 'welcome' ? '' : screen}`)} />
    </>
  );
}
