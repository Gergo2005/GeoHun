import React, { useState, useEffect } from 'react';
import csapat from './csapat.jpg';
import kep1 from './kep1.png';
import kep2 from './kep2.png';
import kep3 from './kep3.png';

interface PageContentProps {
  page: string;
  onBack: () => void;
  userId?: number;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CartItem {
  productName: string;
  productPrice: number;
}

interface OrderStatus {
  status: string;
  rawStatus?: string;
  lastOrder?: {
    id: number;
    productName: string;
    productPrice: number;
    date: string;
  };
}

interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  rounds: number;
  createdAt: string;
}

const PageContent: React.FC<PageContentProps> = ({ page, onBack, userId, onLogout, darkMode, setDarkMode }) => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);

  const products = [
    { id: 1, name: 'Haladó szint', price: 1249, image: kep1 },
    { id: 2, name: 'Lehetetlen szint', price: 2499, image: kep2 },
    { id: 3, name: 'Isteni szint', price: 3499, image: kep3 }
  ];

  useEffect(() => {
    if (page === 'shop' && userId) {
      fetchCart();
      fetchOrderStatus();
    }
    if (page === 'leaderboard') {
      loadLeaderboard();
    }
  }, [page, userId]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`http://localhost:3000/shop/cart/${userId}`);
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Hiba a kosár lekérésekor:', error);
    }
  };

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3000/shop/status/${userId}`);
      const data = await response.json();
      setOrderStatus(data);
      setHasPendingOrder(data.rawStatus === 'PENDING');
    } catch (error) {
      console.error('Hiba a státusz lekérésekor:', error);
    }
  };

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    setErrorLeaderboard(null);
    try {
      const response = await fetch('http://localhost:3000/members');
      if (!response.ok) throw new Error(`Hiba: ${response.status}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (err: any) {
      setErrorLeaderboard(err.message);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const addToCart = async (product: typeof products[0]) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:3000/shop/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productName: product.name,
          productPrice: product.price
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCart({ productName: product.name, productPrice: product.price });
        setMessage({ text: 'Termék sikeresen a kosárba helyezve!', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Hiba történt', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Hálózati hiba történt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:3000/shop/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setCart(null);
        setMessage({ text: 'Termék eltávolítva a kosárból', type: 'success' });
      }
    } catch (error) {
      setMessage({ text: 'Hálózati hiba történt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    if (!cart) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:3000/shop/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productName: cart.productName,
          productPrice: cart.productPrice
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCart(null);
        setMessage({ 
          text: 'Sikeres fizetés! Rendelésed függőben van, admin jóváhagyásra vár.', 
          type: 'info' 
        });
        fetchOrderStatus();
      } else {
        setMessage({ text: data.error || 'Hiba történt a fizetés során', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Hálózati hiba történt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    
    if (window.confirm('Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem visszavonható!')) {
      try {
        const response = await fetch(`http://localhost:3000/auth/delete/${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Fiók sikeresen törölve!');
          onLogout();
        } else {
          alert('Hiba történt a fiók törlése során');
        }
      } catch (error) {
        alert('Hálózati hiba történt');
      }
    }
  };

  const getTitle = () => {
    switch(page) {
      case 'rolunk': return 'Rólunk';
      case 'beallitasok': return 'Beállítások';
      case 'shop': return 'Shop';
      case 'leaderboard': return 'Ranglista';
      default: return '';
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getStatusColor = (rawStatus?: string) => {
    switch(rawStatus) {
      case 'PENDING': return '#f97316';
      case 'COMPLETED': return '#22c55e';
      case 'CANCELLED': return '#ef4444';
      default: return '#64748b';
    }
  };

  const canPlaceNewOrder = () => {
    return !hasPendingOrder && !cart;
  };

  // ---------------------- STÍLUSOK ----------------------
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      padding: '40px',
      textAlign: 'center',
      backgroundColor: darkMode ? '#1e1e2e' : '#f8fafc',
      minHeight: '100vh',
      transition: 'background-color 0.3s'
    },
    title: {
      fontSize: '2.5em',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      marginBottom: '30px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      transition: 'color 0.3s'
    },
    backButton: {
      padding: '12px 28px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 600,
      marginTop: '20px',
      boxShadow: '0 8px 15px -5px rgba(67,97,238,0.4)',
      transition: 'all 0.2s'
    },
    contentContainer: {
      marginTop: '30px',
      padding: '30px',
      background: '#ffffff',
      borderRadius: '24px',
      minHeight: '200px',
      boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)'
    },
    darkContentContainer: {
      marginTop: '30px',
      padding: '30px',
      background: '#2d2d3a',
      borderRadius: '24px',
      minHeight: '200px',
      boxShadow: '0 20px 35px -10px rgba(0,0,0,0.3)'
    },
    text: {
      color: '#334155',
      lineHeight: 1.8,
      fontSize: '22px',
      textAlign: 'justify',
      marginBottom: '30px'
    },
    darkText: {
      color: '#e2e8f0',
      lineHeight: 1.8,
      fontSize: '22px',
      textAlign: 'justify',
      marginBottom: '30px'
    },
    imageContainer: {
      textAlign: 'center',
      marginTop: '30px'
    },
    bottomImage: {
      maxWidth: '600px',
      width: '100%',
      height: 'auto',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
    },
    settingItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      padding: '20px',
      borderBottom: darkMode ? '1px solid #3d3d4e' : '1px solid #e2e8f0'
    },
    settingLabel: {
      fontSize: '18px',
      color: '#334155',
      fontWeight: 500,
      flex: 1,
      textAlign: 'left'
    },
    darkSettingLabel: {
      fontSize: '18px',
      color: '#e2e8f0',
      fontWeight: 500,
      flex: 1,
      textAlign: 'left'
    },
    darkModeButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: 600,
      minWidth: '140px',
      transition: 'all 0.2s',
      backgroundColor: darkMode ? '#f1f5f9' : '#1e293b',
      color: darkMode ? '#1e293b' : '#f1f5f9'
    },
    downloadButton: {
      padding: '10px 20px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: 600,
      minWidth: '140px',
      transition: 'all 0.2s',
      boxShadow: '0 5px 10px -3px rgba(67,97,238,0.4)'
    },
    deleteAccountButton: {
      padding: '10px 20px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: 600,
      minWidth: '140px',
      transition: 'all 0.2s',
      boxShadow: '0 5px 10px -3px rgba(239,68,68,0.4)'
    },
    statusBar: {
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '20px',
      textAlign: 'left',
      boxShadow: '0 5px 15px -5px rgba(0,0,0,0.1)'
    },
    statusTitle: {
      margin: '0 0 10px 0',
      fontSize: '18px',
      fontWeight: 600
    },
    statusText: {
      margin: '5px 0',
      fontWeight: 700,
      fontSize: '18px'
    },
    statusDetail: {
      margin: '5px 0',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '14px'
    },
    successMessage: {
      background: '#dcfce7',
      color: '#166534',
      padding: '15px 20px',
      borderRadius: '30px',
      marginBottom: '20px',
      fontWeight: 500
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#b91c1c',
      padding: '15px 20px',
      borderRadius: '30px',
      marginBottom: '20px',
      fontWeight: 500
    },
    infoMessage: {
      background: '#dbeafe',
      color: '#1e40af',
      padding: '15px 20px',
      borderRadius: '30px',
      marginBottom: '20px',
      fontWeight: 500
    },
    warningMessage: {
      background: '#fff3cd',
      color: '#92400e',
      padding: '15px 20px',
      borderRadius: '30px',
      marginBottom: '20px',
      border: '1px solid #fbbf24',
      fontWeight: 600
    },
    activeCart: {
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '20px',
      boxShadow: '0 5px 15px -5px rgba(0,0,0,0.1)'
    },
    cartTitle: {
      margin: '0 0 15px 0',
      fontSize: '18px',
      fontWeight: 600
    },
    cartItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px',
      borderRadius: '12px',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
    },
    cartActions: {
      display: 'flex',
      gap: '12px'
    },
    removeButton: {
      padding: '8px 16px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'all 0.2s'
    },
    checkoutButton: {
      padding: '8px 16px',
      background: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'all 0.2s'
    },
    shopContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '30px',
      padding: '20px 0'
    },
    card: {
      borderRadius: '24px',
      padding: '25px 20px',
      boxShadow: '0 15px 30px -10px rgba(0,0,0,0.2)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: darkMode ? '1px solid #3d3d4e' : 'none'
    },
    cardImage: {
      width: '160px',
      height: '160px',
      objectFit: 'contain',
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '10px'
    },
    cardPrice: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#4361ee',
      marginBottom: '20px'
    },
    cardButton: {
      padding: '12px 24px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 600,
      transition: 'all 0.2s',
      width: '100%',
      maxWidth: '200px'
    },
    disabledButton: {
      padding: '12px 24px',
      background: '#cbd5e1',
      color: '#64748b',
      border: 'none',
      borderRadius: '40px',
      cursor: 'not-allowed',
      fontSize: '16px',
      fontWeight: 600,
      width: '100%',
      maxWidth: '200px'
    },
    // Leaderboard specifikus stílusok
    leaderboardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    leaderboardTitle: {
      color: darkMode ? '#e2e8f0' : '#1e293b',
      margin: 0,
      fontSize: '24px',
      fontWeight: 700
    },
    refreshButton: {
      padding: '8px 16px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      transition: 'all 0.2s'
    },
    leaderboardTableContainer: {
      overflowX: 'auto',
      marginTop: '20px',
      borderRadius: '16px',
      border: darkMode ? '1px solid #3d3d4e' : '1px solid #e2e8f0'
    },
    leaderboardTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      minWidth: '600px'
    },
    tableHeader: {
      borderBottom: darkMode ? '2px solid #4b5563' : '2px solid #e2e8f0',
      backgroundColor: darkMode ? '#252532' : '#f8fafc'
    },
    tableHeaderCell: {
      padding: '14px 16px',
      color: darkMode ? '#cbd5e1' : '#475569',
      fontWeight: 600,
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tableRow: {
      borderBottom: darkMode ? '1px solid #3d3d4e' : '1px solid #e2e8f0',
      transition: 'background-color 0.2s'
    },
    tableCell: {
      padding: '12px 16px',
      color: darkMode ? '#e2e8f0' : '#1e293b'
    },
    rankCell: {
      padding: '12px 16px',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontWeight: 600
    },
    scoreCell: {
      padding: '12px 16px',
      color: '#4361ee',
      fontWeight: 600
    },
    secondaryCell: {
      padding: '12px 16px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    loadingText: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '16px'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '40px',
      color: '#ef4444'
    },
    emptyText: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '16px'
    }
  };

  // ---------------------- RENDER ----------------------
  const renderContent = () => {
    switch(page) {
      case 'rolunk':
        return (
          <div style={darkMode ? styles.darkContentContainer : styles.contentContainer}>
            <p style={darkMode ? styles.darkText : styles.text}>
              Üdvözlünk a GeoGuessr világában! Csapatunk egy lelkes baráti társaság, akik hatékonyan és gyorsan, illetve jókedvben fejlesztik az oldalt. Célunk, hogy egy olyan játékot hozzunk létre, amely nem csak szórakoztató, hanem tanulságos is, és lehetőséget ad arra, hogy felfedezzétek Magyarországot anélkül, hogy elhagynátok otthonotok kényelmét. Ámbár maga az oldal ötlete nem saját találmány, a miénk ingyenes és mindig az is fog maradni a játékosok számára.
            </p>
            <div style={styles.imageContainer}>
              <img src={csapat} alt="Csapat" style={styles.bottomImage} />
            </div>
          </div>
        );
      
      case 'beallitasok':
        return (
          <div style={darkMode ? styles.darkContentContainer : styles.contentContainer}>
            <div style={styles.settingItem}>
              <span style={darkMode ? styles.darkSettingLabel : styles.settingLabel}>
                Sötét mód
              </span>
              <button
                onClick={toggleDarkMode}
                style={styles.darkModeButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#e2e8f0' : '#334155';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#f1f5f9' : '#1e293b';
                }}
              >
                {darkMode ? '☀️ Világos mód' : '🌙 Sötét mód'}
              </button>
            </div>

            <div style={styles.settingItem}>
              <span style={darkMode ? styles.darkSettingLabel : styles.settingLabel}>
                Letöltés
              </span>
              <button
                onClick={() => window.open('https://github.com/Gergo2005/GeoHun', '_blank')}
                style={styles.downloadButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#5a6fd8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4361ee';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📥 GitHub
              </button>
            </div>

            <div style={styles.settingItem}>
              <span style={darkMode ? styles.darkSettingLabel : styles.settingLabel}>
                Fiók kezelés
              </span>
              <button
                onClick={handleDeleteAccount}
                style={styles.deleteAccountButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🗑️ Fiók törlése
              </button>
            </div>
          </div>
        );
      
      case 'shop':
        return (
          <div style={darkMode ? styles.darkContentContainer : styles.contentContainer}>
            {orderStatus && orderStatus.status !== "Még nem fizettél" && (
              <div style={{
                ...styles.statusBar,
                borderLeft: `6px solid ${getStatusColor(orderStatus.rawStatus)}`,
                background: darkMode ? '#2d2d3a' : '#ffffff'
              }}>
                <h3 style={{ ...styles.statusTitle, color: darkMode ? '#e2e8f0' : '#1e293b' }}>Rendelésed státusza:</h3>
                <p style={{
                  ...styles.statusText,
                  color: getStatusColor(orderStatus.rawStatus)
                }}>{orderStatus.status}</p>
                {orderStatus.lastOrder && (
                  <>
                    <p style={styles.statusDetail}>
                      Utolsó rendelés: {orderStatus.lastOrder.productName} - 
                      {orderStatus.lastOrder.productPrice} Ft
                    </p>
                    <p style={styles.statusDetail}>
                      Rendelés azonosító: #{orderStatus.lastOrder.id}
                    </p>
                  </>
                )}
              </div>
            )}

            {hasPendingOrder && (
              <div style={styles.warningMessage}>
                ⏳ Már van egy függőben lévő rendelésed. Amíg az admin nem hagyja jóvá, nem rendelhetsz újat.
              </div>
            )}

            {message && (
              <div style={
                message.type === 'success' ? styles.successMessage :
                message.type === 'error' ? styles.errorMessage :
                styles.infoMessage
              }>
                {message.text}
              </div>
            )}

            {cart && (
              <div style={{ ...styles.activeCart, background: darkMode ? '#2d2d3a' : '#fff3cd' }}>
                <h3 style={{ ...styles.cartTitle, color: darkMode ? '#e2e8f0' : '#856404' }}>Aktív kosár:</h3>
                <div style={{ ...styles.cartItem, background: darkMode ? '#3d3d4e' : '#fff' }}>
                  <span style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>{cart.productName} - {cart.productPrice} Ft</span>
                  <div style={styles.cartActions}>
                    <button 
                      style={styles.removeButton}
                      onClick={removeFromCart}
                      disabled={loading}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#dc2626')}
                      onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#ef4444')}
                    >
                      Eltávolítás
                    </button>
                    <button 
                      style={styles.checkoutButton}
                      onClick={checkout}
                      disabled={loading}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#16a34a')}
                      onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#22c55e')}
                    >
                      Fizetés
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.shopContainer}>
              {products.map((product) => {
                const isDisabled = !canPlaceNewOrder() || loading;
                
                return (
                  <div key={product.id} style={{
                    ...styles.card,
                    opacity: !canPlaceNewOrder() && !cart ? 0.6 : 1,
                    background: darkMode ? '#2d2d3a' : '#ffffff'
                  }}>
                    <img src={product.image} alt={product.name} style={styles.cardImage} />
                    <h3 style={{ ...styles.cardTitle, color: darkMode ? '#e2e8f0' : '#1e293b' }}>{product.name}</h3>
                    <p style={styles.cardPrice}>{product.price} Ft</p>
                    <button 
                      style={cart ? styles.disabledButton : styles.cardButton}
                      onClick={() => addToCart(product)}
                      disabled={isDisabled}
                      title={!canPlaceNewOrder() && !cart ? 'Függőben lévő rendelés miatt nem vásárolhatsz' : ''}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !cart) {
                          e.currentTarget.style.background = '#5a6fd8';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled && !cart) {
                          e.currentTarget.style.background = '#4361ee';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {loading ? 'Folyamatban...' : 
                       cart ? 'Kosárban' : 
                       !canPlaceNewOrder() && !cart ? 'Függőben' : 'Kosárba'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'leaderboard':
        return (
          <div style={darkMode ? styles.darkContentContainer : styles.contentContainer}>
            <div style={styles.leaderboardHeader}>
              <h2 style={styles.leaderboardTitle}>🏆 Legjobb játékosok</h2>
              <button 
                onClick={loadLeaderboard}
                style={styles.refreshButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#5a6fd8';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4361ee';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                🔄 Frissítés
              </button>
            </div>

            {loadingLeaderboard ? (
              <p style={styles.loadingText}>Ranglista betöltése...</p>
            ) : errorLeaderboard ? (
              <div style={styles.errorContainer}>
                <p>❌ Hiba: {errorLeaderboard}</p>
                <button 
                  onClick={loadLeaderboard} 
                  style={{...styles.refreshButton, marginTop: '15px'}}
                >
                  Újrapróbálkozás
                </button>
              </div>
            ) : leaderboard.length === 0 ? (
              <p style={styles.emptyText}>Még nincs eredmény. Játssz egyet!</p>
            ) : (
              <div style={styles.leaderboardTableContainer}>
                <table style={styles.leaderboardTable}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableHeaderCell}>#</th>
                      <th style={styles.tableHeaderCell}>Név</th>
                      <th style={styles.tableHeaderCell}>Pont</th>
                      <th style={styles.tableHeaderCell}>Körök</th>
                      <th style={styles.tableHeaderCell}>Dátum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr 
                        key={entry.id} 
                        style={{
                          ...styles.tableRow,
                          backgroundColor: index % 2 === 0 
                            ? (darkMode ? '#1e1e2e' : '#ffffff') 
                            : (darkMode ? '#2d2d3a' : '#fafafa')
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = darkMode ? '#3d3d4e' : '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 
                            ? (darkMode ? '#1e1e2e' : '#ffffff') 
                            : (darkMode ? '#2d2d3a' : '#fafafa');
                        }}
                      >
                        <td style={styles.rankCell}>{index + 1}</td>
                        <td style={styles.tableCell}>{entry.username}</td>
                        <td style={styles.scoreCell}>{entry.score}</td>
                        <td style={styles.secondaryCell}>{entry.rounds}</td>
                        <td style={styles.secondaryCell}>
                          {new Date(entry.createdAt).toLocaleString('hu-HU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{getTitle()}</h1>
      {renderContent()}
      <button 
        style={styles.backButton} 
        onClick={onBack}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#5a6fd8';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 15px 20px -5px rgba(67,97,238,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#4361ee';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 15px -5px rgba(67,97,238,0.4)';
        }}
      >
        Vissza a főmenübe
      </button>
    </div>
  );
};

export default PageContent;