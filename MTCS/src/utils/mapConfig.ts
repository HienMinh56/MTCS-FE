export const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const DEFAULT_VEHICLE_TYPE = "truck";

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

export const MAP_MESSAGES = {
  CURRENT_LOCATION_SUCCESS: "Current location detected successfully",
  CURRENT_LOCATION_ERROR:
    "Could not get current location. Please try again or enter location manually.",
  GEOLOCATION_NOT_SUPPORTED: "Geolocation is not supported by your browser",
  ORIGIN_COORDINATES_UPDATED: "Origin coordinates updated automatically",
  DESTINATION_COORDINATES_UPDATED:
    "Destination coordinates updated automatically",
  DESTINATION_REMOVED: "Destination removed successfully",
};
