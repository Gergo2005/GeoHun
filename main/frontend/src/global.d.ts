declare global {
  interface Window {
    google: typeof google | undefined;
  }
  // Google Maps namespace fallback, ha nincs betöltve
  namespace google {
    export import maps = google.maps;
  }
}
export {};
