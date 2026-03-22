import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import ProfilePage from '../src/components/ProfilePage';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <>
      <Head><title>My Profile — Astravedam</title></Head>
      <ProfilePage user={user} navigateTo={(screen) => router.push(`/${screen === 'welcome' ? '' : screen}`)} />
    </>
  );
}
