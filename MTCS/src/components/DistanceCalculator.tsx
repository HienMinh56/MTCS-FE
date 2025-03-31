import React, { useState, useEffect } from "react";
import {
  Coordinates,
  DistanceMatrixResponse,
  PlacePrediction,
} from "../types/map";
import { calculateDistance } from "../services/mapApi";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Snackbar,
} from "@mui/material";
import LocationAutocomplete from "./LocationAutocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsIcon from "@mui/icons-material/Directions";
import TimerIcon from "@mui/icons-material/Timer";
import StraightenIcon from "@mui/icons-material/Straighten";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import {
  formatDistance,
  formatDuration,
  DEFAULT_VEHICLE_TYPE,
  GEOLOCATION_OPTIONS,
  MAP_MESSAGES,
} from "../utils/mapConfig";

const DistanceCalculator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [originAddress, setOriginAddress] = useState("");
  const [originLat, setOriginLat] = useState("");
  const [originLng, setOriginLng] = useState("");
  const [originCoordinatesSetByGeocoding, setOriginCoordinatesSetByGeocoding] =
    useState(false);

  const [destinations, setDestinations] = useState<
    {
      address: string;
      lat: string;
      lng: string;
      coordinatesSetByGeocoding: boolean;
    }[]
  >([{ address: "", lat: "", lng: "", coordinatesSetByGeocoding: false }]);

  const [results, setResults] = useState<DistanceMatrixResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const addDestination = () => {
    setDestinations([
      ...destinations,
      { address: "", lat: "", lng: "", coordinatesSetByGeocoding: false },
    ]);
    setTimeout(() => {
      const elements = document.querySelectorAll(".destination-item");
      if (elements.length > 0) {
        elements[elements.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      const newDestinations = [...destinations];
      newDestinations.splice(index, 1);
      setDestinations(newDestinations);
      setNotification({
        open: true,
        message: MAP_MESSAGES.DESTINATION_REMOVED,
      });
    }
  };

  const updateDestination = (
    index: number,
    field: "address" | "lat" | "lng",
    value: string,
    isFromGeocoding: boolean = false
  ) => {
    const newDestinations = [...destinations];
    newDestinations[index][field] = value;

    if ((field === "lat" || field === "lng") && !isFromGeocoding) {
      newDestinations[index].coordinatesSetByGeocoding = false;
    }

    setDestinations(newDestinations);
  };

  const handleOriginLocationChange = (
    value: string,
    placeData?: PlacePrediction,
    coordinates?: Coordinates
  ) => {
    setOriginAddress(value);

    if (coordinates) {
      setOriginLat(coordinates.lat.toString());
      setOriginLng(coordinates.lng.toString());
      setOriginCoordinatesSetByGeocoding(true);
      setNotification({
        open: true,
        message: MAP_MESSAGES.ORIGIN_COORDINATES_UPDATED,
      });
    } else {
      setOriginCoordinatesSetByGeocoding(false);
    }
  };

  const handleDestinationLocationChange = (
    index: number,
    value: string,
    placeData?: PlacePrediction,
    coordinates?: Coordinates
  ) => {
    updateDestination(index, "address", value);

    if (coordinates) {
      updateDestination(index, "lat", coordinates.lat.toString(), true);
      updateDestination(index, "lng", coordinates.lng.toString(), true);

      const newDestinations = [...destinations];
      newDestinations[index].coordinatesSetByGeocoding = true;
      setDestinations(newDestinations);
      setNotification({
        open: true,
        message: MAP_MESSAGES.DESTINATION_COORDINATES_UPDATED,
      });
    }
  };

  const handleCalculate = async () => {
    try {
      setError("");
      setLoading(true);

      if (!originLat || !originLng) {
        throw new Error("Origin coordinates are required");
      }

      const validDestinations = destinations.filter((d) => d.lat && d.lng);
      if (validDestinations.length === 0) {
        throw new Error("At least one valid destination is required");
      }

      const origins: Coordinates = {
        lat: parseFloat(originLat),
        lng: parseFloat(originLng),
      };

      const destinationCoords: Coordinates[] = validDestinations.map((d) => ({
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lng),
      }));

      const result = await calculateDistance({
        origins,
        destinations: destinationCoords,
        vehicle: DEFAULT_VEHICLE_TYPE,
      });

      setResults(result);

      setTimeout(() => {
        const resultsElement = document.querySelector("#results-section");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate distance"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              GEOLOCATION_OPTIONS
            );
          }
        );

        const { latitude, longitude } = position.coords;

        setOriginLat(latitude.toString());
        setOriginLng(longitude.toString());
        setOriginCoordinatesSetByGeocoding(true);

        setNotification({
          open: true,
          message: MAP_MESSAGES.CURRENT_LOCATION_SUCCESS,
        });
      } catch (error) {
        console.error("Error getting current location:", error);
        setNotification({
          open: true,
          message: MAP_MESSAGES.CURRENT_LOCATION_ERROR,
        });
      } finally {
        setLocationLoading(false);
      }
    } else {
      setNotification({
        open: true,
        message: MAP_MESSAGES.GEOLOCATION_NOT_SUPPORTED,
      });
    }
  };

  const validateCoordinate = (value: string): boolean => {
    return !value || !isNaN(parseFloat(value));
  };

  const getCurrentLocation = (): Coordinates | undefined => {
    if (originLat && originLng) {
      return {
        lat: parseFloat(originLat),
        lng: parseFloat(originLng),
      };
    }
    return undefined;
  };

  const canCalculate =
    originLat && originLng && destinations.some((d) => d.lat && d.lng);

  const calculateTotals = () => {
    if (!results?.rows[0]?.elements)
      return { totalDistance: 0, totalDuration: 0 };

    const totalDistance = results.rows[0].elements.reduce(
      (total, element) =>
        element.status === "OK" ? total + element.distance.value : total,
      0
    );

    const totalDuration = results.rows[0].elements.reduce(
      (total, element) =>
        element.status === "OK" ? total + element.duration.value : total,
      0
    );

    return { totalDistance, totalDuration };
  };

  const { totalDistance, totalDuration } = calculateTotals();

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 800,
        mx: "auto",
        my: 3,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocationOnIcon
                sx={{
                  mr: 1,
                  color: theme.palette.success.main,
                }}
              />
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Starting Point
              </Typography>
            </Box>
            <Tooltip title="Use current location">
              <IconButton
                color="primary"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                size="small"
              >
                {locationLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <MyLocationIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          <LocationAutocomplete
            label="Enter starting location"
            value={originAddress}
            onChange={handleOriginLocationChange}
            placeholder="Search for a location or address"
            currentLocation={getCurrentLocation()}
          />

          {originCoordinatesSetByGeocoding && originLat && originLng && (
            <Box mt={1}>
              <Chip
                icon={<LocationOnIcon />}
                label={`Coordinates found: (${originLat}, ${originLng})`}
                color="success"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocationOnIcon
                sx={{
                  mr: 1,
                  color: theme.palette.error.main,
                }}
              />
              <Typography variant="subtitle1" fontWeight={500}>
                Destinations
              </Typography>
            </Box>
            <Tooltip title="Add another destination">
              <Button
                startIcon={<AddIcon />}
                onClick={addDestination}
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Add Destination
              </Button>
            </Tooltip>
          </Box>

          <Stack spacing={3}>
            {destinations.map((dest, index) => (
              <Box key={index} className="destination-item">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mr: 1,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          justifyContent: "center",
                        }}
                      >
                        {index + 1}
                      </Typography>
                      {destinations.length > 1 && (
                        <Tooltip title="Remove this destination">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeDestination(index)}
                            sx={{ ml: "auto" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <LocationAutocomplete
                      label="Enter destination location"
                      value={dest.address}
                      onChange={(value, placeData, coordinates) =>
                        handleDestinationLocationChange(
                          index,
                          value,
                          placeData,
                          coordinates
                        )
                      }
                      placeholder="Search for a location or address"
                      currentLocation={getCurrentLocation()}
                    />
                    {dest.coordinatesSetByGeocoding && dest.lat && dest.lng && (
                      <Fade in={dest.coordinatesSetByGeocoding}>
                        <Box mt={1}>
                          <Chip
                            icon={<LocationOnIcon />}
                            label={`Coordinates found: (${dest.lat}, ${dest.lng})`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Fade>
                    )}
                  </Grid>
                </Grid>
                {index < destinations.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 1,
            "& .MuiAlert-icon": { alignItems: "center" },
          }}
        >
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleCalculate}
        disabled={loading || !canCalculate}
        size="large"
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: 3,
          "&:hover": {
            boxShadow: 5,
          },
        }}
        startIcon={<DirectionsIcon />}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : canCalculate ? (
          "Calculate Truck Route"
        ) : (
          "Enter Valid Locations to Calculate"
        )}
      </Button>

      {results && (
        <Box sx={{ mt: 4 }} id="results-section">
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <DirectionsIcon sx={{ mr: 1 }} /> Route Results
          </Typography>

          <Card sx={{ mb: 3, borderRadius: 2, backgroundColor: "#f0f7ff" }}>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Route Summary
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: isMobile ? 1 : 0,
                  }}
                >
                  <StraightenIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography>
                    <strong>Total Distance:</strong>{" "}
                    {formatDistance(totalDistance)} km
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TimerIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.secondary.main }}
                  />
                  <Typography>
                    <strong>Total Duration:</strong>{" "}
                    {formatDuration(totalDuration)}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                Starting from:{" "}
                <Typography component="span" fontWeight="bold" sx={{ ml: 0.5 }}>
                  {originAddress || `${originLat}, ${originLng}`}
                </Typography>
              </Typography>
            </CardContent>
          </Card>

          {results.rows[0]?.elements.map((element, index) => (
            <Card
              key={index}
              sx={{
                mb: 2,
                borderRadius: 2,
                borderLeft:
                  element.status === "OK"
                    ? `4px solid ${theme.palette.success.main}`
                    : `4px solid ${theme.palette.error.main}`,
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {destinations[index].address ||
                        `${destinations[index].lat}, ${destinations[index].lng}`}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            element.status === "OK"
                              ? "success.main"
                              : "error.main",
                          color: "white",
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          fontSize: "0.7rem",
                          mr: 0.5,
                        }}
                      >
                        {index + 1}
                      </Box>
                      Status:{" "}
                      <Box
                        component="span"
                        sx={{
                          color:
                            element.status === "OK"
                              ? "success.main"
                              : "error.main",
                          fontWeight: "bold",
                          ml: 0.5,
                        }}
                      >
                        {element.status}
                      </Box>
                    </Typography>
                  </Grid>

                  {element.status === "OK" && (
                    <>
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StraightenIcon
                            fontSize="small"
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          <Box>
                            <Typography variant="h6">
                              {formatDistance(element.distance.value)} km
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Distance
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TimerIcon
                            fontSize="small"
                            sx={{ mr: 1, color: theme.palette.secondary.main }}
                          />
                          <Box>
                            <Typography variant="h6">
                              {formatDuration(element.duration.value)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Estimated Time
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Paper>
  );
};

export default DistanceCalculator;
