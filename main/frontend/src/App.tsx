import React, { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import { Auth } from './components/Auth';
import HamburgerMenu from './components/HamburgerMenu';
import PageContent from './components/PageContent';

interface UserData {
  userId: number;
  username: string;
}

interface GameSettings {
  maxRounds: number;
  locationChoice: string;
  selectedLevel: string; // Új mező a kiválasztott szinthez
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInGame, setIsInGame] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    maxRounds: 5,
    locationChoice: 'magyarország',
    selectedLevel: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Sötét mód állapota localStorage-ból
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Body stílusának beállítása darkMode függvényében
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#1e1e2e';
      document.body.style.color = '#e2e8f0';
    } else {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Ellenőrizzük, hogy van-e mentett bejelentkezés
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const savedUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (savedUserId && savedUsername) {
      setUserData({
        userId: parseInt(savedUserId),
        username: savedUsername
      });
      setIsAuthenticated(true);
    }
  }, []);

  // Resize listener a mobil nézethez
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoginSuccess = (userId: number, username: string) => {
    setUserData({ userId, username });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserData(null);
    setIsAuthenticated(false);
    setIsInGame(false);
    setCurrentPage(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
  };

  const handleStartGame = (rounds: number, location: string, level: string) => {
    setGameSettings({
      maxRounds: rounds,
      locationChoice: location,
      selectedLevel: level
    });
    setIsInGame(true);
    setCurrentPage(null);
  };

  const handleBackToMenu = () => {
    setIsInGame(false);
    setCurrentPage(null);
  };

  const handleMenuItemClick = (page: string) => {
    setCurrentPage(page);
    setIsInGame(false);
  };

  const handleBackFromPage = () => {
    setCurrentPage(null);
  };

  const renderContent = () => {
    if (currentPage) {
      return <PageContent 
        page={currentPage} 
        onBack={handleBackFromPage}
        userId={userData?.userId}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />;
    }
    
    if (!isInGame) {
      return <Menu 
        onStartGame={handleStartGame} 
        darkMode={darkMode} 
        userId={userData?.userId} 
      />;
    }
    
    return <Game onBackToMenu={handleBackToMenu} gameSettings={gameSettings} />;
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const headerStyles = {
    container: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      padding: isMobile ? '15px 10px' : '20px 30px',
      background: darkMode 
        ? 'linear-gradient(135deg, #2b2d42, #1d3557)' 
        : 'linear-gradient(135deg, #4361ee, #3a0ca3)',
      color: 'white',
      borderRadius: isMobile ? '0 0 20px 20px' : '0 0 30px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const,
      position: 'relative' as const,
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      flex: isMobile ? '0 0 auto' : 1
    },
    title: {
      margin: '0',
      fontSize: isMobile ? '1.5em' : '2.2em',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      flex: 1,
      order: isMobile ? 2 : 1
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '10px' : '20px',
      flex: isMobile ? '1 0 100%' : 1,
      justifyContent: isMobile ? 'center' : 'flex-end',
      order: isMobile ? 3 : 2,
      marginTop: isMobile ? '10px' : '0'
    },
    username: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 500,
      whiteSpace: 'nowrap' as const,
      background: 'rgba(255,255,255,0.15)',
      padding: '6px 12px',
      borderRadius: '30px',
      backdropFilter: 'blur(5px)'
    },
    logoutButton: {
      padding: isMobile ? '6px 16px' : '8px 20px',
      background: 'transparent',
      color: 'white',
      border: '2px solid white',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: isMobile ? '14px' : '15px',
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.2s ease',
      display: isMobile ? 'none' : 'block'
    },
    mainContent: {
      background: darkMode ? '#2d2d3a' : '#ffffff',
      padding: isMobile ? '20px' : '30px',
      borderRadius: '24px',
      boxShadow: darkMode 
        ? '0 20px 35px -10px rgba(0,0,0,0.5)' 
        : '0 20px 35px -10px rgba(0,0,0,0.1)',
      transition: 'background-color 0.3s, box-shadow 0.3s'
    }
  };

  return (
    <div>
      <header style={headerStyles.container}>
        <div style={headerStyles.leftSection}>
          <HamburgerMenu 
            onMenuItemClick={handleMenuItemClick} 
            onLogout={handleLogout}
            username={userData?.username || ''}
            isMobile={isMobile}
            darkMode={darkMode}
          />
        </div>
        <h1 style={headerStyles.title}>Magyar GeoGuessr</h1>
        <div style={headerStyles.rightSection}>
          <span style={headerStyles.username}>Üdv, {userData?.username}!</span>
          <button
            onClick={handleLogout}
            style={headerStyles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = darkMode ? '#1d3557' : '#3a0ca3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'white';
            }}
          >
            Kijelentkezés
          </button>
        </div>
      </header>

      <main style={headerStyles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;