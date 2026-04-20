import React, { useState, useEffect } from 'react';
import kep1 from './kep1.png';
import kep2 from './kep2.png';
import kep3 from './kep3.png';

interface MenuProps {
  onStartGame: (rounds: number, location: string, level: string) => void;
  darkMode: boolean;
  userId?: number;
}

const Menu: React.FC<MenuProps> = ({ onStartGame, darkMode, userId }) => {
  const [selectedRounds, setSelectedRounds] = useState<number>(5);
  const [selectedLocation, setSelectedLocation] = useState<string>('magyarország');
  const [selectedLevel, setSelectedLevel] = useState<string>('Alap szint');

  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const levels = [
    { id: 0, name: 'Alap szint', icon: '🌱', image: null, alwaysUnlocked: true },
    { id: 1, name: 'Haladó szint', icon: '⭐', image: kep1 },
    { id: 2, name: 'Lehetetlen szint', icon: '🔥', image: kep2 },
    { id: 3, name: 'Isteni szint', icon: '👑', image: kep3 }
  ];

  useEffect(() => {
    if (userId) {
      fetchUnlockedLevels();
    }
  }, [userId]);

  const fetchUnlockedLevels = async () => {
    setLoadingLevels(true);
    try {
      const response = await fetch(`http://localhost:3000/user/levels/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUnlockedLevels(data.levels);
      }
    } catch (error) {
      console.error('Hiba a szintek lekérésekor:', error);
    } finally {
      setLoadingLevels(false);
    }
  };

  const handleStartGame = () => {
    onStartGame(selectedRounds, selectedLocation, selectedLevel);
  };

  const handleExitGame = () => {
    window.location.href = "https://www.google.com";
  };

  const getLevelCardStyle = (level: typeof levels[0]) => {
    const isUnlocked = level.alwaysUnlocked || unlockedLevels.includes(level.name);
    const isSelected = selectedLevel === level.name;
    return {
      padding: '20px',
      borderRadius: '16px',
      background: isUnlocked 
        ? (isSelected 
            ? 'linear-gradient(135deg, #4361ee, #3a0ca3)' 
            : (darkMode ? '#2d2d3a' : '#ffffff'))
        : (darkMode ? '#3d3d4e' : '#e2e8f0'),
      color: isUnlocked 
        ? (isSelected ? 'white' : (darkMode ? '#e2e8f0' : '#1e293b'))
        : (darkMode ? '#94a3b8' : '#64748b'),
      border: isSelected && isUnlocked ? '2px solid #f97316' : 'none',
      boxShadow: isUnlocked ? '0 10px 20px -5px rgba(67,97,238,0.3)' : 'none',
      opacity: isUnlocked ? 1 : 0.7,
      cursor: isUnlocked ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '10px',
      flex: 1
    };
  };

  // Közös konténer stílusok
  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '20px',
    color: darkMode ? '#e2e8f0' : '#1e293b'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const roundButtonStyle = (rounds: number): React.CSSProperties => ({
    padding: '14px 28px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '40px',
    backgroundColor: selectedRounds === rounds ? '#4361ee' : (darkMode ? '#3d3d4e' : '#f1f5f9'),
    color: selectedRounds === rounds ? 'white' : (darkMode ? '#e2e8f0' : '#334155'),
    boxShadow: selectedRounds === rounds ? '0 10px 20px -5px rgba(67,97,238,0.4)' : 'none',
    transition: 'all 0.2s',
    flex: '1 1 auto'
  });

  const locationButtonStyle = (location: string): React.CSSProperties => ({
    padding: '14px 28px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '40px',
    backgroundColor: selectedLocation === location ? '#4361ee' : (darkMode ? '#3d3d4e' : '#f1f5f9'),
    color: selectedLocation === location ? 'white' : (darkMode ? '#e2e8f0' : '#334155'),
    boxShadow: selectedLocation === location ? '0 10px 20px -5px rgba(67,97,238,0.4)' : 'none',
    transition: 'all 0.2s',
    flex: '1 1 auto'
  });

  const startButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    fontWeight: '700',
    padding: '18px 45px',
    fontSize: '20px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '50px',
    boxShadow: '0 15px 25px -8px rgba(249,115,22,0.5)',
    transition: 'all 0.2s',
    minWidth: '220px'
  };

  const exitButtonStyle: React.CSSProperties = {
    background: '#64748b',
    color: 'white',
    fontWeight: '600',
    padding: '18px 35px',
    fontSize: '18px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '50px',
    boxShadow: '0 10px 20px -5px rgba(100,116,139,0.4)',
    transition: 'all 0.2s'
  };

  const actionContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2 style={sectionTitleStyle}>Válassz nehézségi szintet:</h2>
      {loadingLevels ? (
        <p style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#94a3b8' : '#64748b' }}>
          Szintek betöltése...
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {levels.map(level => {
            const isUnlocked = level.alwaysUnlocked || unlockedLevels.includes(level.name);
            const isSelected = selectedLevel === level.name;
            return (
              <div
                key={level.id}
                style={getLevelCardStyle(level)}
                onClick={() => isUnlocked && setSelectedLevel(level.name)}
                onMouseEnter={(e) => {
                  if (isUnlocked && !isSelected) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 25px -8px rgba(67,97,238,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isUnlocked && !isSelected) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(67,97,238,0.3)';
                  }
                }}
              >
                {level.image ? (
                  <img src={level.image} alt={level.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px' }} />
                ) : (
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>{level.icon}</div>
                )}
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{level.name}</div>
                {!isUnlocked && (
                  <div style={{ marginTop: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🔒</span> Zárolva
                  </div>
                )}
                {isUnlocked && isSelected && (
                  <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold', color: '#f97316' }}>
                    Kiválasztva
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <h2 style={sectionTitleStyle}>Válassz körszámot:</h2>
      <div style={buttonGroupStyle}>
        {[3, 5, 10].map(rounds => (
          <button 
            key={rounds}
            onClick={() => setSelectedRounds(rounds)}
            style={roundButtonStyle(rounds)}
            onMouseEnter={(e) => {
              if (selectedRounds !== rounds) {
                e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRounds !== rounds) {
                e.currentTarget.style.backgroundColor = darkMode ? '#3d3d4e' : '#f1f5f9';
              }
            }}
          >
            {rounds} Kör
          </button>
        ))}
      </div>

      <h2 style={sectionTitleStyle}>Válassz helyszínt:</h2>
      <div style={buttonGroupStyle}>
        <button 
          onClick={() => setSelectedLocation('budapest')}
          style={locationButtonStyle('budapest')}
          onMouseEnter={(e) => {
            if (selectedLocation !== 'budapest') {
              e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLocation !== 'budapest') {
              e.currentTarget.style.backgroundColor = darkMode ? '#3d3d4e' : '#f1f5f9';
            }
          }}
        >
          Budapest
        </button>
        <button 
          onClick={() => setSelectedLocation('magyarország')}
          style={locationButtonStyle('magyarország')}
          onMouseEnter={(e) => {
            if (selectedLocation !== 'magyarország') {
              e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLocation !== 'magyarország') {
              e.currentTarget.style.backgroundColor = darkMode ? '#3d3d4e' : '#f1f5f9';
            }
          }}
        >
          Magyarország
        </button>
      </div>

      <div style={actionContainerStyle}>
        <button 
          onClick={handleStartGame}
          style={startButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 30px -8px rgba(249,115,22,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 15px 25px -8px rgba(249,115,22,0.5)';
          }}
        >
          JÁTÉK INDÍTÁSA
        </button>
        <button 
          onClick={handleExitGame}
          style={exitButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.background = '#475569';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#64748b';
          }}
        >
          KILÉPÉS
        </button>
      </div>
    </div>
  );
};

export default Menu;