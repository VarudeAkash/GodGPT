import Head from 'next/head';
import { useRouter } from 'next/router';
import BlogPage from '../src/components/BlogPage';

export default function Blog() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Vedic Wisdom Blog — Astrology Articles | Astravedam</title>
        <meta name="description" content="Learn Vedic astrology — articles on Panchang, Navagraha, Sade Sati, Kundali reading, Vastu, mantras and Hindu spirituality. Free guides for beginners and advanced seekers." />
        <link rel="canonical" href="https://astravedam.com/blog" />
        <meta property="og:title" content="Vedic Wisdom Blog — Astrology Articles | Astravedam" />
        <meta property="og:description" content="In-depth articles on Vedic astrology, Panchang, Navagraha, Sade Sati, Kundali and Hindu spirituality." />
        <meta property="og:url" content="https://astravedam.com/blog" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
      </Head>
      <BlogPage navigateTo={(screen) => router.push(`/${screen === 'welcome' ? '' : screen}`)} />
    </>
  );
}
