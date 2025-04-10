import React, { useState, useEffect, useRef } from "react";
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
  Stepper,
  Step,
  StepButton,
  StepLabel,
  StepContent,
  Zoom,
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
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import RouteIcon from "@mui/icons-material/Route";
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
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const [activeStep, setActiveStep] = useState(0);

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
        message: "Đã xóa điểm đến",
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
        message: `Đã chọn vị trí: ${value}`,
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
        message: `Đã chọn điểm đến ${index + 1}: ${value}`,
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

      handleNext();

      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
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
          message: "Đã sử dụng vị trí hiện tại của bạn",
        });
      } catch (error) {
        console.error("Error getting current location:", error);
        setNotification({
          open: true,
          message: "Không thể lấy vị trí hiện tại của bạn",
        });
      } finally {
        setLocationLoading(false);
      }
    } else {
      setNotification({
        open: true,
        message: "Trình duyệt của bạn không hỗ trợ định vị",
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const steps = [
    {
      label: "Chọn địa điểm",
      description: "Nhập điểm xuất phát và điểm đến để tính khoảng cách",
    },
    {
      label: "Kết quả khoảng cách",
      description: "Xem chi tiết khoảng cách và thời gian di chuyển",
    },
    {
      label: "Chi phí vận chuyển",
      description: "Tính toán chi phí vận chuyển dựa trên khoảng cách",
    },
  ];

  const { totalDistance, totalDuration } = calculateTotals();

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: "100%",
        mx: "auto",
        mb: 5,
        borderRadius: 2,
        backgroundColor: "#ffffff",
        position: "relative",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ mb: 4, width: "100%" }}>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepButton
                  onClick={handleStep(index)}
                  disabled={
                    (!canCalculate && index > 0) || (!results && index > 0)
                  }
                >
                  <StepLabel>
                    <Typography
                      variant="body2"
                      fontWeight={index === activeStep ? 600 : 400}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepButton
                  onClick={handleStep(index)}
                  disabled={
                    (!canCalculate && index > 0) || (!results && index > 0)
                  }
                >
                  <StepLabel>{step.label}</StepLabel>
                </StepButton>
                {index === activeStep && (
                  <StepContent>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepContent>
                )}
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        {activeStep === 0 && (
          <Fade in={activeStep === 0}>
            <Box>
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
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
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        fontWeight={500}
                      >
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

                  {originCoordinatesSetByGeocoding &&
                    originLat &&
                    originLng && (
                      <Box mt={1}>
                        <Zoom in={originCoordinatesSetByGeocoding}>
                          <Chip
                            icon={<LocationOnIcon />}
                            label={
                              originAddress
                                ? `Đã chọn: ${originAddress}`
                                : "Đã chọn vị trí"
                            }
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Zoom>
                      </Box>
                    )}
                </CardContent>
              </Card>

              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
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
                            {dest.coordinatesSetByGeocoding &&
                              dest.lat &&
                              dest.lng && (
                                <Fade in={dest.coordinatesSetByGeocoding}>
                                  <Box mt={1}>
                                    <Chip
                                      icon={<LocationOnIcon />}
                                      label={
                                        dest.address
                                          ? `Đã chọn: ${dest.address}`
                                          : "Đã chọn vị trí"
                                      }
                                      color="success"
                                      size="small"
                                      sx={{ fontWeight: 500 }}
                                    />
                                  </Box>
                                </Fade>
                              )}
                          </Grid>
                        </Grid>
                        {index < destinations.length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  "&:hover": {
                    boxShadow: 5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#e0e0e0",
                  },
                }}
                startIcon={<DirectionsIcon />}
                endIcon={<NavigateNextIcon />}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : canCalculate ? (
                  "Tính tuyến đường xe tải"
                ) : (
                  "Nhập địa điểm để tính"
                )}
              </Button>
            </Box>
          </Fade>
        )}

        {activeStep === 1 && results && (
          <Fade in={activeStep === 1}>
            <Box ref={resultsRef}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 0,
                    color: theme.palette.primary.main,
                  }}
                >
                  <RouteIcon sx={{ mr: 1 }} /> Kết quả tính tuyến đường
                </Typography>
                <Chip
                  icon={<TimerIcon />}
                  label={formatDuration(totalDuration)}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(0,112,243,0.05)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    Thông tin tuyến đường
                  </Typography>

                  {/* Xuất phát từ - Origin */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 500,
                        color: theme.palette.success.main,
                      }}
                    >
                      <LocationOnIcon
                        fontSize="small"
                        sx={{ mr: 0.5, color: theme.palette.success.main }}
                      />
                      Xuất phát từ:
                    </Typography>
                    <Typography sx={{ ml: 3, mt: 0.5 }}>
                      {originAddress || "Vị trí đã chọn"}
                    </Typography>
                  </Box>

                  {/* Đến - Destinations */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 500,
                        color: theme.palette.error.main,
                      }}
                    >
                      <LocationOnIcon
                        fontSize="small"
                        sx={{ mr: 0.5, color: theme.palette.error.main }}
                      />
                      Đến:
                    </Typography>
                    <Box sx={{ ml: 3, mt: 0.5 }}>
                      {destinations.map(
                        (dest, index) =>
                          results.rows[0]?.elements[index]?.status === "OK" && (
                            <Typography key={`dest-${index}`} sx={{ mb: 0.5 }}>
                              {index + 1}. {dest.address || "Vị trí đã chọn"}
                            </Typography>
                          )
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2, mt: 1 }} />

                  {/* Tổng quãng đường & thời gian */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      gap: 2,
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
                ></Card>
              ))}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<NavigateBeforeIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<PriceChangeIcon />}
                  sx={{
                    textTransform: "none",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  }}
                >
                  Tính giá vận chuyển
                </Button>
              </Box>
            </Box>
          </Fade>
        )}

        {activeStep === 2 && results && (
          <Fade in={activeStep === 2}>
            <Box>
              {/* First show the previous results */}
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(0,112,243,0.05)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    Thông tin tuyến đường
                  </Typography>

                  {/* Xuất phát từ - Origin */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 500,
                        color: theme.palette.success.main,
                      }}
                    >
                      <LocationOnIcon
                        fontSize="small"
                        sx={{ mr: 0.5, color: theme.palette.success.main }}
                      />
                      Xuất phát từ:
                    </Typography>
                    <Typography sx={{ ml: 3, mt: 0.5 }}>
                      {originAddress || "Vị trí đã chọn"}
                    </Typography>
                  </Box>

                  {/* Đến - Destinations */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 500,
                        color: theme.palette.error.main,
                      }}
                    >
                      <LocationOnIcon
                        fontSize="small"
                        sx={{ mr: 0.5, color: theme.palette.error.main }}
                      />
                      Đến:
                    </Typography>
                    <Box sx={{ ml: 3, mt: 0.5 }}>
                      {destinations.map(
                        (dest, index) =>
                          results.rows[0]?.elements[index]?.status === "OK" && (
                            <Typography key={`dest-${index}`} sx={{ mb: 0.5 }}>
                              {index + 1}. {dest.address || "Vị trí đã chọn"}
                            </Typography>
                          )
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2, mt: 1 }} />

                  {/* Tổng quãng đường & thời gian */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      gap: 2,
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
                </CardContent>
              </Card>

              {/* Then show the price calculation section */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  background: "linear-gradient(145deg, #ffffff, #f9f9ff)",
                  position: "relative",
                  overflow: "hidden",
                  mb: 3,
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
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 3,
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <MonetizationOnIcon
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    Tính giá vận chuyển
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 3 }}
                  >
                    Nhập thông tin container để nhận báo giá vận chuyển. Báo giá
                    dựa trên quãng đường {Math.round(totalDistance / 1000)} km.
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
                    <Fade in={Boolean(priceResult)}>
                      <Box
                        sx={{
                          mt: 2,
                          p: { xs: 2, md: 3 },
                          bgcolor: "#f5faff",
                          borderRadius: 2,
                          border: "1px solid rgba(25, 118, 210, 0.12)",
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
                                "&:hover": {
                                  bgcolor: "rgba(25, 118, 210, 0.12)",
                                },
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
                              containerType === 1
                                ? "Container khô"
                                : "Container lạnh"
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
                    </Fade>
                  )}
                </CardContent>
              </Card>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<NavigateBeforeIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Xem lại kết quả
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setActiveStep(0)}
                  startIcon={<DirectionsIcon />}
                  sx={{
                    textTransform: "none",
                  }}
                >
                  Tính lại
                </Button>
              </Box>
            </Box>
          </Fade>
        )}
      </Box>

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
