import '../src/App.css';
import '../src/components/Header.css';
import '../src/components/Login.css';
import '../src/components/Footer.css';
import '../src/components/PayGate.css';
import '../src/components/PanchangPage.css';
import '../src/components/KundaliPage.css';
import '../src/components/DivyaUpayPage.css';
import '../src/components/Blog.css';
import '../src/components/KundaliMilanPage.css';
import '../src/components/MuhuratPage.css';
import '../src/components/SadeSatiPage.css';
import '../src/components/VarshphalPage.css';
import '../src/components/FestivalPage.css';
import '../src/components/ProfilePage.css';
import '../src/components/About.css';
import '../src/components/Contact.css';
import '../src/components/Privacy.css';
import '../src/components/HoroscopePage.css';
import '../src/mobile-consistency.css';
import { AuthProvider } from '../src/context/AuthContext';
import { ChatProvider } from '../src/context/ChatContext';
import Header from '../src/components/header';
import Footer from '../src/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import '../src/firebase.js';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const noFooterPages = ['/chat'];

  return (
    <AuthProvider>
      <ChatProvider>
        <Header />
        <div className="main-content">
          <Component {...pageProps} />
        </div>
        {!noFooterPages.includes(router.pathname) && <Footer />}
        <Analytics />
      </ChatProvider>
    </AuthProvider>
  );
}
