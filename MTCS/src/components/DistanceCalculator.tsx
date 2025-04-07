import React, { useState, useEffect } from "react";
import {
  Coordinates,
  DistanceMatrixResponse,
  PlacePrediction,
} from "../types/map";
import { calculateDistance, calculatePrice } from "../services/mapApi";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
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
  const [containerType, setContainerType] = useState<number>(1);
  const [containerSize, setContainerSize] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<number>(1);
  const [priceResult, setPriceResult] = useState<{
    basePrice: number;
    averagePrice: number;
    highestPrice: number;
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

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
        throw new Error("Cần có tọa độ điểm xuất phát");
      }

      const validDestinations = destinations.filter((d) => d.lat && d.lng);
      if (validDestinations.length === 0) {
        throw new Error("Cần có ít nhất một điểm đến hợp lệ");
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
        err instanceof Error ? err.message : "Không thể tính khoảng cách"
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

  const handleCalculatePrice = async () => {
    if (!totalDistance) return;

    try {
      setPriceLoading(true);
      setPriceError("");

      const response = await calculatePrice({
        distance: Math.round(totalDistance / 1000), // Convert meters to kilometers
        containerType,
        containerSize,
        deliveryType,
      });

      if (response.success && response.data) {
        setPriceResult(response.data);
        setNotification({
          open: true,
          message: response.messageVN || "Tính giá thành công",
        });
      } else {
        setPriceError(response.messageVN || "Không thể tính giá vận chuyển");
        setPriceResult(null);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      setPriceError(
        error instanceof Error ? error.message : "Không thể tính giá vận chuyển"
      );
      setPriceResult(null);
    } finally {
      setPriceLoading(false);
    }
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
        position: "relative",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          fontWeight={600}
          color="primary.main"
        >
          Tính khoảng cách và chi phí vận chuyển
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nhập điểm xuất phát và điểm đến để tính toán khoảng cách, thời gian di
          chuyển và chi phí ước tính.
        </Typography>
      </Box>

      <Card
        sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
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
                Điểm xuất phát
              </Typography>
            </Box>
            <Tooltip title="Sử dụng vị trí hiện tại">
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
            label="Nhập địa điểm xuất phát"
            value={originAddress}
            onChange={handleOriginLocationChange}
            placeholder="Tìm kiếm địa điểm hoặc địa chỉ"
            currentLocation={getCurrentLocation()}
          />

          {originCoordinatesSetByGeocoding && originLat && originLng && (
            <Box mt={1}>
              <Chip
                icon={<LocationOnIcon />}
                label="Đã tìm thấy vị trí"
                color="success"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
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
                Điểm đến
              </Typography>
            </Box>
            <Tooltip title="Thêm điểm đến">
              <Button
                startIcon={<AddIcon />}
                onClick={addDestination}
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Thêm điểm đến
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
                        <Tooltip title="Xóa điểm đến này">
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
                      label="Nhập địa điểm đến"
                      value={dest.address}
                      onChange={(value, placeData, coordinates) =>
                        handleDestinationLocationChange(
                          index,
                          value,
                          placeData,
                          coordinates
                        )
                      }
                      placeholder="Tìm kiếm địa điểm hoặc địa chỉ"
                      currentLocation={getCurrentLocation()}
                    />
                    {dest.coordinatesSetByGeocoding && dest.lat && dest.lng && (
                      <Fade in={dest.coordinatesSetByGeocoding}>
                        <Box mt={1}>
                          <Chip
                            icon={<LocationOnIcon />}
                            label="Đã tìm thấy vị trí"
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
          background: theme.palette.primary.main,
          "&:hover": {
            boxShadow: 5,
            background: theme.palette.primary.dark,
          },
        }}
        startIcon={<DirectionsIcon />}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : canCalculate ? (
          "Tính tuyến đường xe tải"
        ) : (
          "Nhập địa điểm để tính"
        )}
      </Button>

      {results && (
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: "1px dashed rgba(0,0,0,0.1)",
            animation: "fadeIn 0.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(10px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
          id="results-section"
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", mb: 0 }}
            >
              <DirectionsIcon sx={{ mr: 1 }} /> Kết quả tuyến đường
            </Typography>
            <Chip
              icon={<TimerIcon />}
              label={formatDuration(totalDuration)}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Card
            sx={{
              mb: 3,
              borderRadius: 2,
              backgroundColor: "#f0f7ff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Tổng quan tuyến đường
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
                    <strong>Tổng quãng đường:</strong>{" "}
                    {formatDistance(totalDistance)} km
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TimerIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.secondary.main }}
                  />
                  <Typography>
                    <strong>Tổng thời gian:</strong>{" "}
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
                Xuất phát từ:{" "}
                <Typography component="span" fontWeight="bold" sx={{ ml: 0.5 }}>
                  {originAddress || "Vị trí đã chọn"}
                </Typography>
              </Typography>
            </CardContent>
          </Card>

          {results.rows[0]?.elements.map((element, index) => (
            <Card
              key={`destination-${index}`}
              sx={{
                mb: 2,
                borderRadius: 2,
                borderLeft:
                  element.status === "OK"
                    ? `4px solid ${theme.palette.success.main}`
                    : `4px solid ${theme.palette.error.main}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
                "&::before":
                  element.status === "OK"
                    ? {
                        content: '""',
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(90deg, ${theme.palette.success.light}22, transparent)`,
                        top: 0,
                        left: 0,
                      }
                    : {},
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {destinations[index].address || "Vị trí đã chọn"}
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
                      Trạng thái:{" "}
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
                        {element.status === "OK" ? "Thành công" : "Lỗi"}
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
                              Khoảng cách
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
                              Thời gian ước tính
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

          <Card
            sx={{
              mt: 3,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
              background: "linear-gradient(145deg, #ffffff, #f9f9ff)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "200px",
                height: "200px",
                background:
                  "radial-gradient(circle, rgba(0,112,243,0.05) 0%, transparent 70%)",
                top: "-100px",
                right: "-100px",
                borderRadius: "50%",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                <MonetizationOnIcon
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                Tính giá vận chuyển
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Loại container</InputLabel>
                    <Select
                      value={containerType}
                      label="Loại container"
                      onChange={(e) =>
                        setContainerType(e.target.value as number)
                      }
                    >
                      <MenuItem value={1}>Container khô</MenuItem>
                      <MenuItem value={2}>Container lạnh</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Kích thước</InputLabel>
                    <Select
                      value={containerSize}
                      label="Kích thước"
                      onChange={(e) =>
                        setContainerSize(e.target.value as number)
                      }
                    >
                      <MenuItem value={1}>20 feet</MenuItem>
                      <MenuItem value={2}>40 feet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Loại vận chuyển</InputLabel>
                    <Select
                      value={deliveryType}
                      label="Loại vận chuyển"
                      onChange={(e) =>
                        setDeliveryType(e.target.value as number)
                      }
                    >
                      <MenuItem value={1}>Nhập</MenuItem>
                      <MenuItem value={2}>Xuất</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                color="primary"
                onClick={handleCalculatePrice}
                disabled={priceLoading || totalDistance === 0}
                startIcon={
                  priceLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ReceiptLongIcon />
                  )
                }
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  textTransform: "none",
                  fontWeight: 500,
                  borderWidth: "1.5px",
                }}
              >
                Tính giá
              </Button>

              {priceError && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    "& .MuiAlert-icon": {
                      alignItems: "center",
                    },
                  }}
                >
                  {priceError}
                </Alert>
              )}

              {priceResult && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "#f5faff",
                    borderRadius: 2,
                    border: "1px solid rgba(25, 118, 210, 0.12)",
                    animation: "fadeIn 0.5s ease",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    gutterBottom
                    fontWeight={600}
                  >
                    Khoảng giá (VND):
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.02)",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Giá cơ bản:
                        </Typography>
                        <Typography variant="h6" fontWeight="medium">
                          {new Intl.NumberFormat("vi-VN").format(
                            priceResult.basePrice
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(25, 118, 210, 0.08)",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          border: "1px solid rgba(25, 118, 210, 0.12)",
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "rgba(25, 118, 210, 0.12)" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ mb: 0.5 }}
                        >
                          Giá trung bình:
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {new Intl.NumberFormat("vi-VN").format(
                            priceResult.averagePrice
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.02)",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Giá cao nhất:
                        </Typography>
                        <Typography variant="h6" fontWeight="medium">
                          {new Intl.NumberFormat("vi-VN").format(
                            priceResult.highestPrice
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 1.5 }} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Chip
                      size="small"
                      icon={<StraightenIcon fontSize="small" />}
                      label={`${Math.round(totalDistance / 1000)} km`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      size="small"
                      icon={<LocalShippingIcon fontSize="small" />}
                      label={
                        containerType === 1 ? "Container khô" : "Container lạnh"
                      }
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={containerSize === 1 ? "20 feet" : "40 feet"}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={deliveryType === 1 ? "Nhập" : "Xuất"}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
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
