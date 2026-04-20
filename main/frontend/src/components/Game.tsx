import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Utils } from './utils';
import MapComponent from './Map';
import { useToast } from '../context/ToastContext';

interface GameProps {
  onBackToMenu: () => void;
  gameSettings: {
    maxRounds: number;
    locationChoice: string;
    selectedLevel: string;
    timeLimit: number; // másodperc, 0 = korlátlan
  };
}

const Game: React.FC<GameProps> = ({ onBackToMenu, gameSettings }) => {
  const { showToast } = useToast();
  const [totalScore, setTotalScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [targetLocation, setTargetLocation] = useState<{lat: number, lng: number} | null>(null);
  const [playerMarker, setPlayerMarker] = useState<google.maps.Marker | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Készülj fel a játékra...');
  const [showResults, setShowResults] = useState(false);
  const [roundScore, setRoundScore] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRetryButtons, setShowRetryButtons] = useState(false);
  
  // Időzítő állapotok
  const [timeLeft, setTimeLeft] = useState<number>(gameSettings.timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaContainerRef = useRef<HTMLDivElement>(null);
  const currentPanoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const streetViewServiceRef = useRef<google.maps.StreetViewService | null>(null);
  const usedLocationsRef = useRef<Set<string>>(new Set());

  const roundDelay = 1500;

  // StreetViewService inicializálása
  useEffect(() => {
    if (window.google?.maps && !streetViewServiceRef.current) {
      streetViewServiceRef.current = new google.maps.StreetViewService();
    }
    
    initRound();
  }, []);

  // Időzítő kezelése
  useEffect(() => {
    if (isLoading || showResults) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (gameSettings.timeLimit > 0) {
      setTimeLeft(gameSettings.timeLimit);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            showToast('⏰ Idő lejárt! Továbblépés...', 'info');
            if (currentRound >= gameSettings.maxRounds) {
              endGame();
            } else {
              nextRound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, showResults, currentRound, gameSettings.timeLimit]);

  useEffect(() => {
    return () => {
      if (currentPanoramaRef.current) {
        try {
          google.maps.event.clearInstanceListeners(currentPanoramaRef.current);
          currentPanoramaRef.current.setVisible(false);
        } catch (e) {
          console.warn("Cleanup error:", e);
        }
      }
    };
  }, []);

  const initRound = useCallback(() => {
    console.log(`🔄 KÖR ${currentRound} KEZDETE`);
    
    if (isLoading) {
      console.log("⚠️ Már töltődik, várakozás...");
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Véletlenszerű Street View keresése');
    setErrorMessage(null);
    setShowRetryButtons(false);
    
    if (currentPanoramaRef.current) {
      try {
        google.maps.event.clearInstanceListeners(currentPanoramaRef.current);
        currentPanoramaRef.current.setVisible(false);
        currentPanoramaRef.current = null;
      } catch (e) {
        console.warn("Panorama cleanup:", e);
      }
    }
    
    if (panoramaContainerRef.current) {
      panoramaContainerRef.current.innerHTML = '';
    }
    
    setTargetLocation(null);

    setTimeout(() => {
      findStreetViewLocation();
    }, 500);
  }, [currentRound, isLoading]);

  const findStreetViewLocation = useCallback(() => {
    if (!streetViewServiceRef.current) {
      console.error("StreetViewService nincs inicializálva!");
      return;
    }

    let attempts = 0;
    const maxAttempts = 15; // Több próbálkozás

    const tryRandomLocation = () => {
      attempts++;
      setLoadingMessage(`Street View keresése (${attempts}/${maxAttempts})...`);

      const randomLocation = generateRandomLocation();
      const locationKey = `${randomLocation.lat.toFixed(4)},${randomLocation.lng.toFixed(4)}`;
      
      console.log(`📍 Próbálkozás ${attempts}:`, randomLocation);

      if (usedLocationsRef.current.has(locationKey) && attempts < maxAttempts) {
        setTimeout(tryRandomLocation, 500);
        return;
      }

      streetViewServiceRef.current!.getPanorama({
        location: randomLocation,
        radius: 50000,
        source: google.maps.StreetViewSource.DEFAULT,
        preference: google.maps.StreetViewPreference.NEAREST
      }, (data, status) => {
        if (status === 'OK' && data?.location?.pano) {
          console.log("✅ Street View található!");
          usedLocationsRef.current.add(locationKey);
          
          setTimeout(() => {
            loadStreetView(data);
          }, 500);
        } else {
          console.log(`❌ Nem található Street View (${status})`);
          
          if (attempts < maxAttempts) {
            setTimeout(tryRandomLocation, 800);
          } else {
            // Próbáljunk meg fallback helyszíneket
            loadFallbackLocation();
          }
        }
      });
    };

    tryRandomLocation();
  }, []);

  const generateRandomLocation = useCallback(() => {
    if (gameSettings.locationChoice === 'budapest') {
      return {
        lat: 47.49 + Math.random() * 0.06,
        lng: 19.03 + Math.random() * 0.09
      };
    } else {
      return {
        lat: 46.9 + Math.random() * 1.3,
        lng: 18.4 + Math.random() * 2.6
      };
    }
  }, [gameSettings.locationChoice]);

  // Bővített fallback helyszínek, hogy nagyobb eséllyel legyen kép
  const loadFallbackLocation = useCallback(() => {
    if (!streetViewServiceRef.current) return;
    
    const fallbackLocations = [
      { lat: 47.4983, lng: 19.0434 }, // Budapest, Parlament
      { lat: 47.5008, lng: 19.0465 }, // Budapest, Lánchíd
      { lat: 46.2530, lng: 20.1480 }, // Szeged, Dóm tér
      { lat: 47.5299, lng: 21.6393 }, // Debrecen, Nagytemplom
      { lat: 46.0731, lng: 18.2285 }, // Pécs, Székesegyház
      { lat: 47.1741, lng: 19.8026 }, // Kecskemét, Városháza
      { lat: 47.6875, lng: 17.6504 }, // Győr, Bazilika
      { lat: 48.1035, lng: 20.7884 }, // Miskolc, Avas kilátó
    ];
    
    // Véletlenszerű fallback
    const fallback = fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
    console.log("🔄 Fallback helyszín:", fallback);
    
    streetViewServiceRef.current.getPanorama({
      location: fallback,
      radius: 5000
    }, (data, status) => {
      if (status === 'OK') {
        console.log("🔄 Fallback Street View betöltése");
        loadStreetView(data);
      } else {
        console.error("❌ Még fallback sem működik:", status);
        handleNoStreetViewFound();
      }
    });
  }, []);

  const loadStreetView = useCallback((panoramaData: any) => {
    setLoadingMessage("Street View betöltése...");
    
    if (!panoramaContainerRef.current) return;
    
    try {
      panoramaContainerRef.current.innerHTML = '';
      
      const targetLocation = {
        lat: panoramaData.location.latLng.lat(),
        lng: panoramaData.location.latLng.lng()
      };

      console.log("🎯 Cél hely:", targetLocation);

      setTimeout(() => {
        try {
          const panoramaOptions: google.maps.StreetViewPanoramaOptions = {
            pano: panoramaData.location.pano,
            pov: {
              heading: panoramaData.tiles?.centerHeading || Math.random() * 360,
              pitch: 0
            },
            zoom: 1,
            visible: true,
            addressControl: false,
            fullscreenControl: true,
            motionTrackingControl: false,
            panControl: true,
            zoomControl: true,
            enableCloseButton: false,
            showRoadLabels: true,
            clickToGo: true,
            scrollwheel: true,
            disableDoubleClickZoom: false,
            linksControl: false,
            imageDateControl: false
          };

          const panorama = new google.maps.StreetViewPanorama(
            panoramaContainerRef.current!,
            panoramaOptions
          );

          currentPanoramaRef.current = panorama;
          setTargetLocation(targetLocation);

          setupPanoramaListeners(panorama);

        } catch (error: any) {
          console.error("❌ Panoráma hiba:", error);
          handlePanoramaError(error.message);
        }
      }, 300);
      
    } catch (error: any) {
      console.error("❌ Container hiba:", error);
      handlePanoramaError(error.message);
    }
  }, []);

  const setupPanoramaListeners = useCallback((panorama: google.maps.StreetViewPanorama) => {
    let panoramaLoaded = false;

    const onPanoramaLoaded = () => {
      if (panoramaLoaded) return;
      
      panoramaLoaded = true;
      setIsLoading(false);
      console.log("✅ Street View SIKERESEN betöltve!");
    };

    panorama.addListener('status_changed', () => {
      const status = panorama.getStatus();
      console.log("📊 Street View státusz:", status);
      
      if (status === 'OK') {
        onPanoramaLoaded();
      } else if (status === 'UNKNOWN_ERROR') {
        console.log("⚠️ Street View hiba");
        // Ha hosszú ideig nem tölt be, próbáljuk újra
        setTimeout(() => {
          if (!panoramaLoaded) {
            handlePanoramaError("Nem sikerült betölteni a panorámát");
          }
        }, 8000);
      }
    });

    panorama.addListener('pano_changed', () => {
      if (panorama.getPano() && !panoramaLoaded) {
        onPanoramaLoaded();
      }
    });

    // Biztonsági időzítő
    setTimeout(() => {
      if (!panoramaLoaded) {
        console.log("⏰ Timeout - újrapróbálkozás");
        handlePanoramaError("Betöltési időtúllépés");
      }
    }, 12000);
  }, []);

  const handleNoStreetViewFound = useCallback(() => {
    setIsLoading(false);
    setErrorMessage("Nem található Street View a kiválasztott területen. Próbáld újra!");
    setShowRetryButtons(true);
  }, []);

  const handlePanoramaError = useCallback((errorMessage: string) => {
    setIsLoading(false);
    setErrorMessage(`Hiba: ${errorMessage}`);
    setShowRetryButtons(true);
  }, []);

  const retryRound = useCallback(() => {
    console.log("🔄 Újrapróbálkozás");
    setErrorMessage(null);
    setShowRetryButtons(false);
    setTimeout(() => {
      initRound();
    }, 1000);
  }, [initRound]);

  const checkGuess = useCallback(() => {
    if (!playerMarker) {
      showToast('Helyezz el egy tippet a térképen!', 'warning');
      return;
    }

    if (!targetLocation) {
      showToast('Hiba: nincs célhely!', 'error');
      return;
    }

    const markerPosition = playerMarker.getPosition 
      ? playerMarker.getPosition() 
      : (playerMarker as any).position;
    
    const distance = Utils.calculateDistance(
      markerPosition,
      targetLocation
    );

    const score = Math.max(0, Math.round(5000 - distance * 10));
    const newTotalScore = totalScore + score;

    setRoundScore(`Távolság: ${distance.toFixed(2)} km | Pont: ${score}`);
    setShowResults(true);
    setTotalScore(newTotalScore);
    
    // Időzítő leállítása
    if (timerRef.current) clearInterval(timerRef.current);
  }, [playerMarker, targetLocation, totalScore, showToast]);

  const nextRound = useCallback(() => {
    if (currentRound >= gameSettings.maxRounds) {
      endGame();
      return;
    }

    setCurrentRound(prev => prev + 1);
    setShowResults(false);

    if (playerMarker) {
      playerMarker.setMap(null);
      setPlayerMarker(null);
    }

    setTimeout(() => {
      initRound();
    }, roundDelay);
  }, [currentRound, gameSettings.maxRounds, totalScore, playerMarker, initRound]);

  const endGame = useCallback(() => {
    if (currentPanoramaRef.current) {
      try {
        google.maps.event.clearInstanceListeners(currentPanoramaRef.current);
        currentPanoramaRef.current.setVisible(false);
        currentPanoramaRef.current = null;
      } catch (e) {
        console.warn("End game cleanup:", e);
      }
    }

    const username = localStorage.getItem('username') || sessionStorage.getItem('username') || 'Vendég';
    const score = totalScore;
    const rounds = gameSettings.maxRounds;
    fetch('http://localhost:3000/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score, rounds })
    }).catch(err => console.warn('Nem sikerült leaderboardra menteni:', err));

    usedLocationsRef.current.clear();
    setTotalScore(0);
    setCurrentRound(1);
    setTargetLocation(null);
    setPlayerMarker(null);
    setIsLoading(false);
    setShowResults(false);
    setErrorMessage(null);
    setShowRetryButtons(false);

    showToast(`Játék vége! Összpontszám: ${score}`, 'success');
    onBackToMenu();
  }, [onBackToMenu, totalScore, gameSettings.maxRounds, showToast]);

  const updatePlayerMarker = useCallback((marker: google.maps.Marker) => {
    setPlayerMarker(marker);
  }, []);

  return (
    <div>
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '20px',
        padding: '15px 20px',
        background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
        color: 'white',
        borderRadius: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        boxShadow: '0 8px 20px -5px rgba(67,97,238,0.3)'
      }}>
        <span>🏆 Összpont: {totalScore}</span>
        <span>🎯 Kör: {currentRound}/{gameSettings.maxRounds}</span>
      </div>

      {/* Időzítő kijelzése - JAVÍTOTT SZÍN */}
      {gameSettings.timeLimit > 0 && !isLoading && !showResults && (
        <div style={{
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '28px',
          fontWeight: 'bold',
          // Új színlogika: alap kék, 30 mp alatt narancs, 10 mp alatt piros
          color: timeLeft <= 10 ? '#ef4444' : (timeLeft <= 30 ? '#f59e0b' : '#3b82f6'),
          background: 'rgba(0,0,0,0.05)',
          padding: '5px',
          borderRadius: '40px',
          display: 'inline-block',
          width: 'auto',
          margin: '0 auto 15px',
          paddingLeft: '20px',
          paddingRight: '20px'
        }}>
          ⏳ {timeLeft} mp
        </div>
      )}

      <section 
        ref={streetViewRef}
        style={{
          width: '100%',
          height: '450px',
          background: isLoading ? 'linear-gradient(45deg, #1a1a2e, #16213e)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          position: 'relative' as 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          marginBottom: '20px',
          boxShadow: '0 20px 30px -10px rgba(0,0,0,0.3)'
        }}
        className={isLoading ? 'loading' : ''}
      >
        <div 
          ref={panoramaContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 10
          }}>
            <div className="loading-text">
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                Kör {currentRound} betöltése...
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>{loadingMessage}</div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: showRetryButtons ? 'rgba(255,165,0,0.95)' : 'rgba(220,38,38,0.95)',
            backdropFilter: 'blur(5px)',
            zIndex: 10
          }}>
            <div style={{ textAlign: 'center', padding: '30px', color: 'white' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                {errorMessage}
              </div>
              {showRetryButtons && (
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button 
                    onClick={retryRound}
                    style={{
                      padding: '12px 30px',
                      background: '#4361ee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 8px 15px -5px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    Újrapróbálkozás
                  </button>
                  <button 
                    onClick={onBackToMenu}
                    style={{
                      padding: '12px 30px',
                      background: '#475569',
                      color: 'white',
                      border: 'none',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 8px 15px -5px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    Vissza a menühöz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section style={{ marginBottom: '20px' }}>
        <div id="map" style={{
          height: '350px',
          borderRadius: '24px',
          marginBottom: '15px',
          boxShadow: '0 15px 25px -8px rgba(0,0,0,0.2)'
        }}></div>
        <button 
          onClick={checkGuess}
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            width: '100%',
            boxShadow: '0 12px 20px -8px rgba(34,197,94,0.4)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -8px rgba(34,197,94,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(34,197,94,0.4)';
          }}
        >
          Tipp leadása
        </button>
      </section>

      {showResults && (
        <section style={{
          marginTop: '20px',
          padding: '25px',
          background: '#f8fafc',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <p style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '15px'
          }}>{roundScore}</p>
          <button 
            onClick={nextRound}
            style={{
              padding: '14px 35px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
              color: 'white',
              boxShadow: '0 12px 20px -8px rgba(67,97,238,0.4)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -8px rgba(67,97,238,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(67,97,238,0.4)';
            }}
          >
            {currentRound === gameSettings.maxRounds ? 'Játék vége' : 'Következő kör'}
          </button>
        </section>
      )}

      {targetLocation && (
        <MapComponent 
          onMarkerPlaced={updatePlayerMarker}
          targetLocation={targetLocation}
        />
      )}
    </div>
  );
};

export default Game;