import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import MuhuratPage from '../src/components/MuhuratPage';

export default function Muhurat() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>Muhurat Finder — Auspicious Timing | Astravedam</title></Head>
      <MuhuratPage user={user} />
    </>
  );
}
