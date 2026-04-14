import React, { useEffect, useRef } from 'react';

interface MapProps {
  onMarkerPlaced: (marker: google.maps.Marker) => void;
  targetLocation: { lat: number; lng: number };
}

const MapComponent: React.FC<MapProps> = ({ onMarkerPlaced, targetLocation }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (!window.google?.maps || mapInitialized.current) return;

    const initMap = () => {
      console.log("🗺️ Térkép inicializálása...");
      
      const mapElement = document.getElementById("map");
      if (!mapElement) return;
      
      try {
        const map = new google.maps.Map(mapElement, {
          center: targetLocation,
          zoom: 8,
          restriction: {
            latLngBounds: {
              north: 48.58,
              south: 45.74,
              west: 16.11,
              east: 22.90
            },
            strictBounds: true
          },
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        mapRef.current = map;
        mapInitialized.current = true;

        // Kattintás esemény
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            placeMarker(e.latLng);
          }
        });

        console.log("✅ Térkép inicializálva");
      } catch (error) {
        console.error("❌ Térkép hiba:", error);
      }
    };

    initMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      // Map-ot NEM töröljük, mert a DOM-ban marad
    };
  }, [targetLocation]);

  useEffect(() => {
    // Középre állítás új körben
    if (mapRef.current && targetLocation) {
      mapRef.current.setCenter(targetLocation);
      mapRef.current.setZoom(8);
    }
  }, [targetLocation]);

  const placeMarker = (location: google.maps.LatLng) => {
    if (!mapRef.current) return;

    // Régi marker törlése
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Új marker
    const marker = new google.maps.Marker({
      position: location,
      map: mapRef.current,
      draggable: true,
      title: "A tipped",
      animation: google.maps.Animation.DROP
    });

    markerRef.current = marker;
    onMarkerPlaced(marker);
    console.log("📍 Marker elhelyezve");
  };

  return null;
};

export default MapComponent;