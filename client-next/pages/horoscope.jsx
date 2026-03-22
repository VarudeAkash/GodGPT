import Head from 'next/head';
import { useRouter } from 'next/router';
import HoroscopePage from '../src/components/HoroscopePage';

export default function Horoscope() {
  const router = useRouter();
  return (
    <>
      <Head><title>Aaj Ka Rashifal — Daily Horoscope for All 12 Rashis | Astravedam</title></Head>
      <HoroscopePage navigateTo={(screen) => router.push(screen === 'deity-select' ? '/deity-select' : `/${screen}`)} />
    </>
  );
}
