import { getDomain } from '@/services/env';
import { GeolocationErrorCode, GeolocationResponse } from '@/types/geolocation';
import { SimmTagLocation } from '@/types/simmtag';

/**
 * Gets the user's current latitude and longitude using the browser's Geolocation API
 * @returns {Promise<GeolocationResponse>} Promise that resolves with coordinates or an error
 */
export function getUserLocation(): Promise<GeolocationResponse> {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      resolve({ code: GeolocationErrorCode.POSITION_UNAVAILABLE, status: 'error' });
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          timestamp: position.timestamp,
          status: 'success',
        });
      },
      // Error callback
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            resolve({ code: GeolocationErrorCode.PERMISSION_DENIED, status: 'error' });
            break;
          case error.POSITION_UNAVAILABLE:
            resolve({ code: GeolocationErrorCode.POSITION_UNAVAILABLE, status: 'error' });
            break;
          case error.TIMEOUT:
            resolve({ code: GeolocationErrorCode.TIMEOUT, status: 'error' });
            break;
          default:
            resolve({ code: GeolocationErrorCode.UNKNOWN_ERROR, status: 'error' });
            break;
        }
      },
      // Options
      {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000, // Wait max 10 seconds
        maximumAge: 0, // Don't use cached position
      },
    );
  });
}

export function createLocationString({
  location,
  mapPinName,
}: {
  location?: SimmTagLocation;
  mapPinName?: string;
}): string {
  if (!location) {
    return getDomain();
  }
  if (mapPinName) {
    return `https://www.google.com/maps?q=${encodeURIComponent(mapPinName)}@${location.latitude},${location.longitude}`;
  }
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}
