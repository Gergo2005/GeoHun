import React, { useState, useEffect } from 'react';

interface HamburgerMenuProps {
  onMenuItemClick: (page: string) => void;
  onLogout?: () => void;
  username: string;
  isMobile?: boolean;
  darkMode?: boolean;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  onMenuItemClick, 
  onLogout,
  username,
  isMobile = false,
  darkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('hamburger-menu');
      if (menu && !menu.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (page: string) => {
    onMenuItemClick(page);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      setIsOpen(false);
    }
  };

  const menuStyles = {
    container: {
      position: 'relative' as const,
      marginRight: isMobile ? '10px' : '20px',
      zIndex: 1000
    },
    hamburgerButton: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-around',
      width: isMobile ? '28px' : '32px',
      height: isMobile ? '22px' : '26px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '0',
      zIndex: 1001,
      transition: 'transform 0.2s'
    },
    line: {
      width: '100%',
      height: '3px',
      background: 'white',
      borderRadius: '10px',
      transition: 'all 0.3s ease',
    },
    menu: {
      position: 'absolute' as const,
      top: '50px',
      left: '0',
      background: darkMode ? '#2d2d3a' : '#ffffff',
      borderRadius: '16px',
      boxShadow: darkMode 
        ? '0 15px 30px -10px rgba(0,0,0,0.5)' 
        : '0 15px 30px -10px rgba(0,0,0,0.2)',
      minWidth: isMobile ? '220px' : '250px',
      display: isOpen ? 'block' : 'none',
      zIndex: 1000,
      overflow: 'hidden',
    },
    menuList: {
      listStyle: 'none',
      margin: 0,
      padding: '8px 0'
    },
    menuItem: {
      padding: '14px 24px',
      cursor: 'pointer',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: 500,
      transition: 'background 0.2s',
      borderBottom: darkMode ? '1px solid #3d3d4e' : '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    userInfo: {
      padding: '16px 24px',
      color: darkMode ? '#cbd5e1' : '#475569',
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '600',
      borderBottom: darkMode ? '1px solid #3d3d4e' : '1px solid #f1f5f9',
      backgroundColor: darkMode ? '#252532' : '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoutItem: {
      padding: '14px 24px',
      cursor: 'pointer',
      color: '#ef4444',
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: 600,
      transition: 'background 0.2s',
      borderTop: darkMode ? '1px solid #3d3d4e' : '1px solid #f1f5f9',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  };

  return (
    <div id="hamburger-menu" style={menuStyles.container}>
      <button onClick={toggleMenu} style={menuStyles.hamburgerButton}>
        <span style={{...menuStyles.line, transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'}}></span>
        <span style={{...menuStyles.line, opacity: isOpen ? 0 : 1}}></span>
        <span style={{...menuStyles.line, transform: isOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'}}></span>
      </button>
      
      <div style={menuStyles.menu}>
        <ul style={menuStyles.menuList}>
          {isMobile && (
            <li style={menuStyles.userInfo}>
              <span>👤</span> {username}
            </li>
          )}
          
          <li style={menuStyles.menuItem} onClick={() => handleMenuItemClick('rolunk')}>
            <span>📄</span> Rólunk
          </li>
          <li style={menuStyles.menuItem} onClick={() => handleMenuItemClick('beallitasok')}>
            <span>⚙️</span> Beállítások
          </li>
          <li style={menuStyles.menuItem} onClick={() => handleMenuItemClick('shop')}>
            <span>🛒</span> Shop
          </li>
          <li style={menuStyles.menuItem} onClick={() => handleMenuItemClick('leaderboard')}>
            <span>🏆</span> Ranglista
          </li>
          
          {isMobile && onLogout && (
            <li style={menuStyles.logoutItem} onClick={handleLogoutClick}>
              <span>🚪</span> Kijelentkezés
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default HamburgerMenu;