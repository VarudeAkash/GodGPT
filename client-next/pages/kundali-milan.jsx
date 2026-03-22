import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import KundaliMilanPage from '../src/components/KundaliMilanPage';

export default function KundaliMilan() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>Kundali Milan — Compatibility Report | Astravedam</title></Head>
      <KundaliMilanPage user={user} />
    </>
  );
}
