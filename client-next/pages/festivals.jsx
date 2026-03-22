import Head from 'next/head';
import { useRouter } from 'next/router';
import FestivalPage from '../src/components/FestivalPage';

export default function Festivals() {
  const router = useRouter();
  return (
    <>
      <Head><title>Hindu Festival Calendar 2026 | Astravedam</title></Head>
      <FestivalPage navigateTo={(screen) => router.push(`/${screen === 'welcome' ? '' : screen}`)} />
    </>
  );
}
