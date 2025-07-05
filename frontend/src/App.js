import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TrackShipment from './components/TrackShipment';
import Faq from './components/Faq';
import Footer from './components/Footer';

// Dil metinleri için merkezi bir obje
const translations = {
  en: {
    trackTitle: "Track Your Shipment",
    trackPlaceholder: "Enter your tracking number...",
    trackButton: "Track",
    faqTitle: "Frequently Asked Questions",
    // FAQ ve Footer metinleri de buraya eklenebilir
  },
  tr: {
    trackTitle: "Gönderinizi Takip Edin",
    trackPlaceholder: "Takip numaranızı girin...",
    trackButton: "Takip Et",
    faqTitle: "Sıkça Sorulan Sorular",
  }
};

function App() {
  // Dil state'i, varsayılan olarak 'en' (İngilizce)
  const [language, setLanguage] = useState('en');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mevcut dile göre doğru metin setini seç
  const t = translations[language];

  useEffect(() => {
    // Oturum bilgilerini localStorage'da sakla/kaldır
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const handleLoginSuccess = (newToken, email) => {
    setToken(newToken);
    setUser(email);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setIsModalOpen(true)}
        onLogoutClick={handleLogout}
        currentLang={language}
        onChangeLang={setLanguage}
      />
      <main className="main-content">
        <div className="hero-section">
            <div className="hero-content">
                <TrackShipment 
                  token={token} 
                  trackTitle={t.trackTitle}
                  trackPlaceholder={t.trackPlaceholder}
                  trackButton={t.trackButton}
                />
            </div>
        </div>
        
        {/* FAQ bileşenine de başlığı prop olarak geçirelim */}
        <Faq title={t.faqTitle} />
      </main>

      <Footer />

      {isModalOpen && !token && (
        <AuthModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default App;