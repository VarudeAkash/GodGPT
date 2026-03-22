import Head from 'next/head';
import About from '../src/components/About';

export default function AboutPage() {
  return (
    <>
      <Head><title>About Astravedam</title></Head>
      <About />
    </>
  );
}
