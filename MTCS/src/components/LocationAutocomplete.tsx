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

  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const fetchPlaceSuggestions = async (query: string) => {
    if (query.length < 2) {
      setOptions([]);
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
      setOptions(response.predictions);
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
    newValue: PlacePrediction | null
  ) => {
    try {
      if (newValue) {
        setLoading(true);
        let coordinates: Coordinates | null = null;

        // If we have a place_id, use it for geocoding (more accurate)
        if (newValue.place_id) {
          coordinates = await getGeocode(newValue.place_id);
        }

        // If we couldn't get coordinates from place_id or if we don't have a place_id,
        // try geocoding by address
        if (!coordinates && newValue.description) {
          coordinates = await getGeocodeByAddress(newValue.description);
        }

        onChange(newValue.description, newValue, coordinates || undefined);
      } else if (inputValue.trim()) {
        // If user has entered text but not selected from dropdown,
        // try to geocode the raw text input
        setLoading(true);

        const coordinates = await getGeocodeByAddress(inputValue);
        onChange(inputValue, undefined, coordinates || undefined);
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

  // Handle manual form submission - try to geocode the current input value
  const handleManualSubmit = async () => {
    if (inputValue.trim()) {
      setLoading(true);
      try {
        const coordinates = await getGeocodeByAddress(inputValue);
        onChange(inputValue, undefined, coordinates || undefined);
      } catch (error) {
        console.error("Error geocoding manual input:", error);
        onChange(inputValue);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle blur event to try geocoding on input blur
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
        if (inputValue.length >= 2) {
          fetchPlaceSuggestions(inputValue);
        }
      }}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) =>
        option.place_id === value.place_id
      }
      getOptionLabel={(option) => option.description}
      options={options}
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
