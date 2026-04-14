export interface Location {
  lat: number;
  lng: number;
}

export interface PanoramaData {
  location: {
    latLng: google.maps.LatLng;
    pano: string;
  };
  tiles?: {
    centerHeading: number;
  };
}

export interface GameState {
  totalScore: number;
  currentRound: number;
  maxRounds: number;
  locationChoice: string;
  targetLocation: Location | null;
  playerMarker: google.maps.Marker | null;
  panorama: google.maps.StreetViewPanorama | null;
  map: google.maps.Map | null;
  mapInitialized: boolean;
  streetViewLoaded: boolean;
}

export interface WindowWithGoogle extends Window {
  google: typeof google;
  Game?: any;
  MapComponent?: any;
  Menu?: any;
  Utils?: any;
  GameState?: any;
  GoogleMapsLoader?: any;
}