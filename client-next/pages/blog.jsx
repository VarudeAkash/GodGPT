import Head from 'next/head';
import { useRouter } from 'next/router';
import BlogPage from '../src/components/BlogPage';

export default function Blog() {
  const router = useRouter();
  return (
    <>
      <Head><title>Vedic Wisdom Blog — Astravedam</title></Head>
      <BlogPage navigateTo={(screen) => router.push(`/${screen === 'welcome' ? '' : screen}`)} />
    </>
  );
}
