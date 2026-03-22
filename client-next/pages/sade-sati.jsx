import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import SadeSatiPage from '../src/components/SadeSatiPage';

export default function SadeSati() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>Sade Sati Report — Saturn Transit | Astravedam</title></Head>
      <SadeSatiPage user={user} />
    </>
  );
}
