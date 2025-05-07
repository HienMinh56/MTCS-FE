import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import {
  getPlaceAutocomplete,
  getGeocode,
  getGeocodeByAddress,
} from "../services/mapApi";
import { PlacePrediction, Coordinates } from "../types/map";

interface HistoryItem extends PlacePrediction {
  lat: number;
  lng: number;
}
const HISTORY_KEY = "locationHistory";

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (
    value: string,
    placeData?: PlacePrediction,
    coordinates?: Coordinates
  ) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  fullWidth?: boolean;
  currentLocation?: Coordinates;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  fullWidth = true,
  currentLocation,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveHistory = (item: HistoryItem) => {
    const newHist = [
      item,
      ...history.filter((h) => h.description !== item.description),
    ].slice(0, 8);
    setHistory(newHist);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHist));
  };

  const fetchPlaceSuggestions = async (query: string) => {
    if (query.length < 2) {
      // show history for empty or short queries
      const historyMatches = history
        .filter((h) =>
          h.description.toLowerCase().includes(query.toLowerCase())
        )
        .map((h) => ({ ...h, source: "history" }));
      setOptions(historyMatches);
      return;
    }

    setLoading(true);
    try {
      const response = await getPlaceAutocomplete({
        input: query,
        location: currentLocation,
        limit: 5,
        radius: 50,
      });
      const historyMatches = history
        .filter((h) =>
          h.description.toLowerCase().includes(query.toLowerCase())
        )
        .map((h) => ({ ...h, source: "history" }));
      const apiOptions = response.predictions.map((p) => ({
        ...p,
        source: "api",
      }));
      setOptions([...historyMatches, ...apiOptions]);
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);

    if (debounceTimeout.current) {
      window.clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
      fetchPlaceSuggestions(newInputValue);
    }, 300);
  };

  const handleChange = async (
    _event: React.SyntheticEvent,
    newValue: (PlacePrediction & { source?: string }) | null
  ) => {
    try {
      if (newValue) {
        setLoading(true);
        let coordinates: Coordinates | null = null;

        if (newValue.place_id) {
          coordinates = await getGeocode(newValue.place_id);
        }

        if (!coordinates && newValue.description) {
          coordinates = await getGeocodeByAddress(newValue.description);
        }

        onChange(newValue.description, newValue, coordinates || undefined);

        // only save history for selected predictions
        if (coordinates) {
          saveHistory({
            ...newValue,
            lat: coordinates.lat,
            lng: coordinates.lng,
          });
        }
      } else if (inputValue.trim()) {
        setLoading(true);

        const coordinates = await getGeocodeByAddress(inputValue);
        onChange(inputValue, undefined, coordinates || undefined);
        // remove saveHistory here
      } else {
        onChange(inputValue);
      }
    } catch (error) {
      console.error("Error in location selection:", error);
      onChange(newValue?.description || inputValue);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (inputValue.trim()) {
      setLoading(true);
      try {
        const coordinates = await getGeocodeByAddress(inputValue);
        onChange(inputValue, undefined, coordinates || undefined);
        // remove saveHistory here
      } catch (error) {
        console.error("Error geocoding manual input:", error);
        onChange(inputValue);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue !== value) {
      handleManualSubmit();
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        window.clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <Autocomplete
      id={`location-autocomplete-${label}`}
      open={open}
      onOpen={() => {
        setOpen(true);
        fetchPlaceSuggestions(inputValue);
      }}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) =>
        option.place_id === value.place_id
      }
      getOptionLabel={(option) => option.description}
      options={options}
      groupBy={(option: any) =>
        option.source === "history" ? "Địa điểm đã tìm" : "Gợi ý"
      }
      loading={loading}
      filterOptions={(x) => x}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={null}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      onBlur={handleBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.place_id}>
          <Box>
            <Typography variant="body1">
              {option.structured_formatting.main_text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.structured_formatting.secondary_text}
            </Typography>
          </Box>
        </li>
      )}
    />
  );
};

export default LocationAutocomplete;
