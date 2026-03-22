import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import DivyaUpayPage from '../src/components/DivyaUpayPage';

export default function DivyaUpay() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>Divya Upay — Sacred Vedic Remedies | Astravedam</title></Head>
      <DivyaUpayPage user={user} />
    </>
  );
}
