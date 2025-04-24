export type Coordinates = {
  lat: number;
  lng: number;
};

export type DistanceMatrixElement = {
  status: string;
  duration: {
    text: string;
    value: number; // in seconds
  };
  distance: {
    text: string;
    value: number; // in meters
  };
};

export type DistanceMatrixRow = {
  elements: DistanceMatrixElement[];
};

export type DistanceMatrixResponse = {
  rows: DistanceMatrixRow[];
};

export type DistanceCalculationParams = {
  origins: Coordinates;
  destinations: Coordinates[];
  vehicle?: "car" | "bike" | "taxi" | "truck" | "hd";
};

export type PlacePredictionTerm = {
  offset: number;
  value: string;
};

export type PlacePredictionMatchedSubstring = {
  length: number;
  offset: number;
};

export type PlacePredictionStructuredFormatting = {
  main_text: string;
  secondary_text: string;
};

export type PlacePlusCode = {
  compound_code: string;
  global_code: string;
};

export type PlacePrediction = {
  description: string;
  matched_substrings: PlacePredictionMatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: PlacePredictionStructuredFormatting;
  terms: PlacePredictionTerm[];
  has_children: boolean;
  display_type: string;
  score: number;
  plus_code?: PlacePlusCode;
};

export type PlaceAutocompleteResponse = {
  predictions: PlacePrediction[];
  executed_time: number;
  executed_time_all: number;
  status: string;
};

export type PlaceAutocompleteParams = {
  input: string;
  location?: Coordinates;
  limit?: number;
  radius?: number;
  more_compound?: boolean;
};

export interface PriceCalculationParams {
  distance: number;
  containerType: number; // 1 for khô, 2 for lạnh
  containerSize: number; // 1 for 20', 2 for 40'
}

export interface PriceResponse {
  basePrice: number;
  averagePrice: number;
  highestPrice: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  data: PriceResponse;
  message: string;
  messageVN: string;
  errors: any;
}
