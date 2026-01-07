export enum GeolocationErrorCode {
  PERMISSION_DENIED,
  POSITION_UNAVAILABLE,
  TIMEOUT,
  UNKNOWN_ERROR,
}

export interface GeolocationResult {
  coords: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  status: 'success';
}

export interface GeolocationPositionError {
  code: GeolocationErrorCode;
  status: 'error';
}

export type GeolocationResponse = GeolocationResult | GeolocationPositionError;
