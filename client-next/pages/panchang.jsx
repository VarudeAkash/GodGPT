import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import PanchangPage from '../src/components/PanchangPage';

export default function Panchang() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>{"Today's Panchang & Tithi | Astravedam"}</title></Head>
      <PanchangPage user={user} />
    </>
  );
}
