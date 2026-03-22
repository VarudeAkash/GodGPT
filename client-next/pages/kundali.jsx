import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import KundaliPage from '../src/components/KundaliPage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function Kundali() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>Kundali Reading — Vedic Birth Chart | Astravedam</title></Head>
      <KundaliPage user={user} API_URL={API_URL} />
    </>
  );
}
