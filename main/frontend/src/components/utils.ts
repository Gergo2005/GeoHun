export class Utils {
  static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static calculateDistance(pos1: any, pos2: { lat: number; lng: number }): number {
    const R = 6371;
    
    let lat1: number, lng1: number;
    const lat2 = pos2.lat;
    const lng2 = pos2.lng;
    
    // Első pozíció (marker) kezelése
    if (typeof (pos1 as google.maps.LatLng).lat === 'function') {
      const latLng = pos1 as google.maps.LatLng;
      lat1 = latLng.lat();
      lng1 = latLng.lng();
    } else if (pos1.lat && pos1.lng) {
      lat1 = pos1.lat;
      lng1 = pos1.lng;
    } else if ((pos1 as any).position) {
      const position = (pos1 as any).position;
      lat1 = typeof position.lat === 'function' ? position.lat() : position.lat;
      lng1 = typeof position.lng === 'function' ? position.lng() : position.lng;
    } else {
      console.error("❌ Érvénytelen pos1:", pos1);
      return 9999;
    }
    
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * 
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}