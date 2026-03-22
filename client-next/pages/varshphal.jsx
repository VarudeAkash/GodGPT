import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import VarshphalPage from '../src/components/VarshphalPage';

export default function Varshphal() {
  const { user } = useAuth();
  return (
    <>
      <Head><title>Varshphal — Annual Reading | Astravedam</title></Head>
      <VarshphalPage user={user} />
    </>
  );
}
