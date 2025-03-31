import axios from "axios";
import {
  Coordinates,
  DistanceMatrixResponse,
  DistanceCalculationParams,
  PlaceAutocompleteResponse,
  PlaceAutocompleteParams,
} from "../types/map";

const GOONG_API_KEY = import.meta.env.VITE_GOONG_MAP_API_KEY;
const GOONG_API_BASE_URL = "https://rsapi.goong.io";

export const calculateDistance = async ({
  origins,
  destinations,
  vehicle = "car",
}: DistanceCalculationParams): Promise<DistanceMatrixResponse> => {
  try {
    const originsStr = `${origins.lat},${origins.lng}`;
    const destinationsStr = destinations
      .map((dest) => `${dest.lat},${dest.lng}`)
      .join("|");

    const response = await axios.get<DistanceMatrixResponse>(
      `${GOONG_API_BASE_URL}/DistanceMatrix`,
      {
        params: {
          origins: originsStr,
          destinations: destinationsStr,
          vehicle,
          api_key: GOONG_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error calculating distance:", error);
    throw error;
  }
};

export const getPlaceAutocomplete = async ({
  input,
  location,
  limit = 10,
  radius = 50,
  more_compound = false,
}: PlaceAutocompleteParams): Promise<PlaceAutocompleteResponse> => {
  try {
    const locationParam = location
      ? `${location.lat},${location.lng}`
      : undefined;

    const response = await axios.get<PlaceAutocompleteResponse>(
      `${GOONG_API_BASE_URL}/place/autocomplete`,
      {
        params: {
          input,
          location: locationParam,
          limit,
          radius,
          more_compound,
          api_key: GOONG_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting place autocomplete:", error);
    throw error;
  }
};

// Get coordinates from place_id
export const getGeocode = async (
  placeId: string
): Promise<Coordinates | null> => {
  try {
    const response = await axios.get(`${GOONG_API_BASE_URL}/Geocode`, {
      params: {
        place_id: placeId,
        api_key: GOONG_API_KEY,
      },
    });

    if (response.data.status === "OK" && response.data.results?.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding place:", error);
    return null;
  }
};

// Get coordinates from address
export const getGeocodeByAddress = async (
  address: string
): Promise<Coordinates | null> => {
  try {
    const response = await axios.get(`${GOONG_API_BASE_URL}/Geocode`, {
      params: {
        address,
        api_key: GOONG_API_KEY,
      },
    });

    if (response.data.status === "OK" && response.data.results?.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};
