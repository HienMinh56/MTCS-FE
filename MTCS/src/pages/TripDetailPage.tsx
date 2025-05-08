import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  SnackbarContent,
  Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DirectionsIcon from "@mui/icons-material/Directions";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GasMeterIcon from "@mui/icons-material/GasMeter";
import CancelIcon from "@mui/icons-material/Cancel";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useAuth } from "../contexts/AuthContext";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { tripDetail, tripStatusHistory } from "../types/trip";
import { getTripDetail, CancelTrip } from "../services/tripApi"; // Import getTripDetail and CancelTrip
import { getDeliveryStatus } from "../services/deliveryStatus";

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [tripData, setTripData] = useState<tripDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryStatuses, setDeliveryStatuses] = useState<{
    [key: string]: { statusName: string; color: string };
  } | null>(null);
  const [statusesLoaded, setStatusesLoaded] = useState<boolean>(false);

  // Add states for cancel trip functionality
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [confirmCancelModalOpen, setConfirmCancelModalOpen] =
    useState<boolean>(false);
  const [cancelNote, setCancelNote] = useState<string>("");
  const [noteError, setNoteError] = useState<string>("");
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelSuccess, setCancelSuccess] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Add state for image preview
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });

  // Add validation function for note
  const validateNote = (note: string): string => {
    const trimmedNote = note.trim();

    // Check if note is empty
    if (!trimmedNote) {
      return "Vui lòng nhập lý do hủy chuyến";
    }

    // Check if note starts and ends with valid characters (not whitespace)
    // Valid characters: letters, numbers, or punctuation marks
    if (/^\s/.test(trimmedNote) || /\s$/.test(trimmedNote)) {
      return "Lý do không được bắt đầu hoặc kết thúc bằng dấu cách";
    }

    // Check for multiple spaces between words
    if (/\s{2,}/.test(trimmedNote)) {
      return "Lý do không được chứa nhiều hơn một dấu cách giữa các từ";
    }

    return "";
  };

  // Handle note change with validation
  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCancelNote(value);
    setNoteError(validateNote(value));
  };

  // Handle first modal submission
  const handleCancelSubmit = () => {
    const error = validateNote(cancelNote);
    setNoteError(error);

    if (!error) {
      setCancelModalOpen(false);
      setConfirmCancelModalOpen(true);
    }
  };

  // Handle final confirmation and API call
  const handleConfirmCancel = async () => {
    if (!tripId) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      const result = await CancelTrip({
        tripId,
        note: cancelNote.trim(),
      });

      setCancelSuccess(true);
      setConfirmCancelModalOpen(false);

      // Reload the data after a short delay to show the updated trip status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error cancelling trip:", error);
      setCancelError(error.message || "Có lỗi xảy ra khi hủy chuyến");
    } finally {
      setCancelLoading(false);
    }
  };

  // Close modals and reset form
  const handleCancelModalClose = () => {
    setCancelModalOpen(false);
    setCancelNote("");
    setNoteError("");
  };

  const handleConfirmModalClose = () => {
    setConfirmCancelModalOpen(false);
  };

  // Add functions to handle image preview
  const openImagePreview = (src: string, title: string = "Image Preview") => {
    setImagePreview({
      open: true,
      src,
      title,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      ...imagePreview,
      open: false,
    });
  };

  // Fetch delivery statuses
  useEffect(() => {
    const fetchDeliveryStatuses = async () => {
      try {
        setLoading(true); // Show loading state while fetching both resources
        const statusData = await getDeliveryStatus();

        // Convert to a lookup map for easier use
        const statusMap: {
          [key: string]: { statusName: string; color: string };
        } = {};

        if (Array.isArray(statusData)) {
          statusData.forEach((status) => {
            // Use status.statusId as key and provide statusName with default color of "default"
            // You can modify this to map different colors based on status if needed
            statusMap[status.statusId] = {
              statusName: status.statusName,
              color: getStatusColor(status.statusId),
            };
          });
        } else if (statusData && typeof statusData === "object") {
          // Handle if response is an object with a data property
          const dataArray = statusData.data || [];
          dataArray.forEach((status) => {
            statusMap[status.statusId] = {
              statusName: status.statusName,
              color: getStatusColor(status.statusId),
            };
          });
        }

        setDeliveryStatuses(statusMap);
        setStatusesLoaded(true);
      } catch (error) {
        console.error("Failed to fetch delivery statuses:", error);
        // Continue without delivery statuses - will fall back to hardcoded values
        setStatusesLoaded(true);
      }
    };

    fetchDeliveryStatuses();
  }, []);

  // Fetch trip details using getTripDetail
  useEffect(() => {
    if (!statusesLoaded) return;

    const fetchTripDetails = async () => {
      if (!tripId) {
        setError("Trip ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching trip details for ID:", tripId);

        // Use getTripDetail function
        const responseData = await getTripDetail(tripId);
        console.log("Raw trip API response:", responseData);

        // Check if response has a data property (API wrapper format)
        let tripDetails;
        if (responseData && (responseData as any).data) {
          tripDetails = Array.isArray((responseData as any).data)
            ? (responseData as any).data[0] // If data is an array, get the first item
            : (responseData as any).data; // Otherwise use data directly
        } else if (Array.isArray(responseData)) {
          tripDetails = responseData[0]; // If response is an array, get the first item
        } else {
          tripDetails = responseData; // Otherwise use response directly
        }

        console.log("Processed trip details:", tripDetails);

        if (!tripDetails) {
          setError("Không thể tải thông tin chuyến đi");
          setLoading(false);
          return;
        }

        setTripData(tripDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trip details:", err);
        setError("Không thể tải thông tin chuyến đi. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId, statusesLoaded]);

  // Helper function to assign color based on status
  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "not_started":
        return "default";
      case "going_to_port":
      case "pick_up_container":
      case "is_delivering":
      case "at_delivery_point":
      case "going_to_port/depot":
        return "info";
      case "completed":
        return "success";
      case "canceled":
        return "error"; // Sử dụng màu đỏ (error) cho trạng thái hủy
      case "delaying":
        return "warning";
      default:
        return "default";
    }
  };

  // Helper function to format trip status
  const getTripStatusDisplay = (status: string | null) => {
    if (!status) return { label: "Không xác định", color: "default" };

    // Check if we have dynamic statuses from API and if this status exists in our map
    if (deliveryStatuses && deliveryStatuses[status]) {
      return {
        label: deliveryStatuses[status].statusName,
        color: deliveryStatuses[status].color,
      };
    }
  };

  // Format time helper
  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "N/A";
    try {
      return format(new Date(dateTimeString), "dd/MM/yyyy HH:mm", {
        locale: vi,
      });
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  // Format date only helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  // Check if trip is canceled (either by main status or in history)
  const isTripcanceled = () => {
    // Check main trip status
    if (tripData?.status === "canceled") {
      return true;
    }

    // Check if there's any canceled status in history
    if (
      tripData?.tripStatusHistories &&
      tripData.tripStatusHistories.length > 0
    ) {
      return tripData.tripStatusHistories.some(
        (history) =>
          history.statusId === "canceled" ||
          getTripStatusDisplay(history.statusId)?.label === "Đã hủy chuyến"
      );
    }

    return false;
  };

  // Get icon for each status step
  const getStatusIcon = (statusId: string | null) => {
    switch (statusId) {
      case "0":
        return <HourglassEmptyIcon />;
      case "1":
        return <DirectionsIcon />;
      case "2":
        return <LocationOnIcon />;
      case "3":
        return <LocalShippingIcon />;
      case "4":
        return <DeliveryDiningIcon />;
      case "5":
        return <DirectionsIcon />;
      case "6":
        return <LocationOnIcon />;
      case "7":
      case "completed":
        return <CheckCircleIcon />;
      case "delaying":
        return <ReportIcon color="white" />;
      default:
        return <DirectionsIcon />;
    }
  };

  // Navigate back
  const handleBack = () => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/orders`);
  };

  // Navigate to driver details
  const handleDriverClick = (driverId: string | null) => {
    if (driverId) {
      const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
      navigate(`${prefix}/drivers/${driverId}`);
    }
  };

  // Navigate to order details
  const handleOrderClick = (orderId: string | null) => {
    if (orderId) {
      const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
      navigate(`${prefix}/orders/${orderId}`);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => handleOrderClick(tripData.orderId)}
          sx={{ mb: 2 }}
        >
          Quay lại đơn hàng
        </Button>
        <Alert severity="error">
          {error}
          <Typography variant="caption" display="block" mt={1}>
            Trip ID: {tripId}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!tripData) {
    return (
      <Box p={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => handleOrderClick(tripData.orderId)}
          sx={{ mb: 2 }}
        >
          Quay lại đơn hàng
        </Button>
        <Alert severity="warning">
          Không tìm thấy thông tin chuyến đi
          <Typography variant="caption" display="block" mt={1}>
            Trip ID: {tripId}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Sort trip status histories by time
  const sortedStatusHistories = tripData.tripStatusHistories
    ? [...tripData.tripStatusHistories].sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      })
    : [];

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => handleOrderClick(tripData.orderId)}
        sx={{ mb: 2 }}
      >
        Quay lại đơn hàng
      </Button>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="500">
          Chi tiết chuyến đi
        </Typography>
        <Chip
          label={getTripStatusDisplay(tripData.status).label}
          color={getTripStatusDisplay(tripData.status).color as any}
          size="medium"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Main Trip Info */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <DirectionsIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin chung
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 3 }} /> */}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã chuyến đi
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {tripData.tripId || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã vận đơn
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="500"
                    sx={{
                      color: "primary.main",
                      cursor: "pointer",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      position: "relative",
                      transition: "all 0.3s ease",
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        width: "0%",
                        height: "2px",
                        bottom: 0,
                        left: 0,
                        backgroundColor: "primary.dark",
                        transition: "width 0.3s ease",
                      },
                      "&:hover": {
                        color: "primary.dark",
                        "&:after": {
                          width: "100%",
                        },
                      },
                    }}
                    onClick={() => handleOrderClick(tripData.orderId)}
                  >
                    {tripData.trackingCode || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian bắt đầu
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: "text.secondary", opacity: 0.7 }}
                    />
                    <Typography variant="body1">
                      {formatDateTime(tripData.startTime)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian kết thúc
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: "text.secondary", opacity: 0.7 }}
                    />
                    <Typography variant="body1">
                      {formatDateTime(tripData.endTime)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian ghép nối
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: "text.secondary", opacity: 0.7 }}
                    />
                    <Typography variant="body1">
                      {formatDateTime(tripData.matchTime)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ghép bởi
                  </Typography>
                  <Typography variant="body1">
                    {tripData.matchType == 1 ? "Staff" : "Hệ thống"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người ghép
                  </Typography>
                  <Typography variant="body1">{tripData.matchBy}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Trip Status History */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <EventNoteIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Lịch sử trạng thái
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 3 }} /> */}

            {sortedStatusHistories.length > 0 ? (
              <Stepper orientation="vertical">
                {sortedStatusHistories.map((historyItem, index) => (
                  <Step
                    key={historyItem.historyId || index}
                    active={true}
                    completed={true}
                  >
                    <StepLabel
                      StepIconComponent={() => (
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            backgroundColor:
                              getTripStatusDisplay(historyItem.statusId).color +
                              ".main",
                          }}
                        >
                          {getStatusIcon(historyItem.statusId)}
                        </Avatar>
                      )}
                    >
                      <Typography variant="subtitle2">
                        {getTripStatusDisplay(historyItem.statusId).label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(historyItem.startTime)}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Alert severity="info">
                Chưa có lịch sử trạng thái cho chuyến đi này
              </Alert>
            )}
          </Paper>

          {/* Reports and Logs */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <ReportIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Báo cáo & Nhật ký
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 3 }} /> */}

            <Grid container spacing={3}>
              {/* Delivery Reports - Full width on mobile, half width on md+ */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="500"
                  sx={{ mb: 2 }}
                >
                  Báo cáo giao hàng
                </Typography>
                {tripData.deliveryReports &&
                tripData.deliveryReports.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Thời gian</TableCell>
                          <TableCell align="center">Ghi chú</TableCell>
                          <TableCell align="center">Ảnh</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tripData.deliveryReports.map((report: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDateTime(report.reportTime)}
                            </TableCell>
                            <TableCell align="center">
                              {report.notes || "N/A"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              {report.deliveryReportsFiles &&
                              Array.isArray(report.deliveryReportsFiles) &&
                              report.deliveryReportsFiles.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    justifyContent: "center", // Center the image container horizontally
                                    alignItems: "center", // Center items vertically
                                  }}
                                >
                                  {report.deliveryReportsFiles.map(
                                    (file: any, fileIndex: number) => (
                                      <Box
                                        key={fileIndex}
                                        component="img"
                                        src={file.fileUrl}
                                        alt="Ảnh biên bản"
                                        sx={{
                                          width: 80,
                                          height: 60,
                                          objectFit: "cover",
                                          cursor: "pointer",
                                          borderRadius: 1,
                                        }}
                                        onClick={() =>
                                          openImagePreview(
                                            file.fileUrl,
                                            "Ảnh biên bản"
                                          )
                                        }
                                      />
                                    )
                                  )}
                                </Box>
                              ) : (
                                "Không có hoá đơn"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có báo cáo giao hàng
                  </Typography>
                )}
              </Grid>

              {/* Fuel Reports - Full width on mobile, half width on md+ */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="500"
                  sx={{ mb: 2 }}
                >
                  Báo cáo nhiên liệu
                </Typography>
                {tripData.fuelReports && tripData.fuelReports.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Thời gian</TableCell>
                          <TableCell align="center">Lượng tiêu thụ</TableCell>
                          <TableCell align="center">Chi phí</TableCell>
                          <TableCell align="center">Hoá đơn</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tripData.fuelReports.map((report: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDateTime(report.reportTime)}
                            </TableCell>
                            <TableCell align="center">
                              {report.refuelAmount} lít
                            </TableCell>
                            <TableCell align="center">
                              {new Intl.NumberFormat("vi-VN").format(
                                report.fuelCost
                              )}{" "}
                              VNĐ
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              {report.fuelReportFiles &&
                              report.fuelReportFiles.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    justifyContent: "center", // Center the image container horizontally
                                    alignItems: "center", // Center items vertically
                                  }}
                                >
                                  {report.fuelReportFiles.map(
                                    (file: any, fileIndex: number) => (
                                      <Box
                                        key={fileIndex}
                                        component="img"
                                        src={file.fileUrl}
                                        alt="Hoá đơn nhiên liệu"
                                        sx={{
                                          width: 80,
                                          height: 60,
                                          objectFit: "cover",
                                          cursor: "pointer",
                                          borderRadius: 1,
                                        }}
                                        onClick={() =>
                                          openImagePreview(
                                            file.fileUrl,
                                            "Hoá đơn nhiên liệu"
                                          )
                                        }
                                      />
                                    )
                                  )}
                                </Box>
                              ) : (
                                "Không có hoá đơn"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có báo cáo nhiên liệu
                  </Typography>
                )}
              </Grid>

              {/* Incident Reports */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom fontWeight="500">
                  Báo cáo sự cố
                </Typography>
                {tripData.incidentReports &&
                tripData.incidentReports.length > 0 ? (
                  <Box>
                    {tripData.incidentReports.map((report, index) => (
                      <Card
                        key={report.reportId || index}
                        sx={{ mb: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography variant="subtitle2">
                              {report.incidentType || "Sự cố"}
                            </Typography>
                            <Chip
                              size="small"
                              label={
                                report.status === "Resolved"
                                  ? "Đã xử lý"
                                  : "Chưa xử lý"
                              }
                              color={
                                report.status === "Resolved"
                                  ? "success"
                                  : "warning"
                              }
                            />
                          </Box>

                          <Divider sx={{ mb: 1.5 }} />

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Thời gian sự cố:
                              </Typography>
                              <Typography variant="body2">
                                {formatDateTime(report.incidentTime)}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Người báo cáo:
                              </Typography>
                              <Typography variant="body2">
                                {report.reportedBy || "N/A"}
                              </Typography>
                            </Grid>

                            <Grid item xs={12}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Mô tả:
                              </Typography>
                              <Typography variant="body2">
                                {report.description || "Không có mô tả"}
                              </Typography>
                            </Grid>

                            {report.status === "resolved" && (
                              <>
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Chi tiết xử lý:
                                  </Typography>
                                  <Typography variant="body2">
                                    {report.resolutionDetails ||
                                      "Không có thông tin"}
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Người xử lý:
                                  </Typography>
                                  <Typography variant="body2">
                                    {report.handledBy || "N/A"}
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Thời gian xử lý:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDateTime(report.handledTime)}
                                  </Typography>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có báo cáo sự cố
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Vehicle and Driver Info */}
        <Grid item xs={12} md={4}>
          {/* Driver Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <PersonIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin tài xế
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 2 }} /> */}

            {tripData.driverId ? (
              <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs="auto">
                      <Avatar
                        alt="Driver"
                        sx={{ width: 60, height: 60, bgcolor: "primary.main" }}
                      >
                        <PersonIcon fontSize="large" />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {/* Use driver name if available, otherwise just the ID */}
                        {tripData.driver?.name || "Tài xế"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          position: "relative",
                          transition: "all 0.3s ease",
                          "&:after": {
                            content: '""',
                            position: "absolute",
                            width: "0%",
                            height: "2px",
                            bottom: 0,
                            left: 0,
                            backgroundColor: "primary.dark",
                            transition: "width 0.3s ease",
                          },
                          "&:hover": {
                            color: "primary.dark",
                            "&:after": {
                              width: "100%",
                            },
                          },
                        }}
                        onClick={() => handleDriverClick(tripData.driverId)}
                      >
                        {tripData.driver.fullName}
                      </Typography>
                      {tripData.driver?.phone && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                        >
                          SĐT: {tripData.driver.phone}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">Chưa có tài xế được phân công</Alert>
            )}
          </Paper>

          {/* Vehicle Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <LocalShippingIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin phương tiện
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 3 }} /> */}

            <Grid container spacing={3}>
              {/* Tractor Info */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Xe đầu kéo
                </Typography>
                {tripData.tractorId ? (
                  <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Mã xe đầu kéo
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "primary.main",
                              cursor: "pointer",
                              fontWeight: 500,
                              display: "inline-flex",
                              alignItems: "center",
                              position: "relative",
                              transition: "all 0.3s ease",
                              "&:after": {
                                content: '""',
                                position: "absolute",
                                width: "0%",
                                height: "2px",
                                bottom: 0,
                                left: 0,
                                backgroundColor: "primary.dark",
                                transition: "width 0.3s ease",
                              },
                              "&:hover": {
                                color: "primary.dark",
                                "&:after": {
                                  width: "100%",
                                },
                              },
                            }}
                            onClick={() => {
                              const prefix =
                                user?.role === "Admin"
                                  ? "/admin"
                                  : "/staff-menu";
                              navigate(
                                `${prefix}/tractors/${tripData.tractorId}`
                              );
                            }}
                          >
                            {tripData.tractorId}
                          </Typography>
                        </Grid>

                        {/* Show tractor data if available */}
                        {tripData.tractor && (
                          <>
                            <Grid item xs={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Biển số
                              </Typography>
                              <Typography variant="body1">
                                {tripData.tractor.licensePlate || "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Model
                              </Typography>
                              <Typography variant="body1">
                                {tripData.tractor.model || "N/A"}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có thông tin về xe đầu kéo
                  </Typography>
                )}
              </Grid>

              {/* Trailer Info */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Rơ moóc
                </Typography>
                {tripData.trailerId ? (
                  <Card>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Mã rơ moóc
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "primary.main",
                              cursor: "pointer",
                              fontWeight: 500,
                              display: "inline-flex",
                              alignItems: "center",
                              position: "relative",
                              transition: "all 0.3s ease",
                              "&:after": {
                                content: '""',
                                position: "absolute",
                                width: "0%",
                                height: "2px",
                                bottom: 0,
                                left: 0,
                                backgroundColor: "primary.dark",
                                transition: "width 0.3s ease",
                              },
                              "&:hover": {
                                color: "primary.dark",
                                "&:after": {
                                  width: "100%",
                                },
                              },
                            }}
                            onClick={() =>
                              navigate(
                                `${
                                  user?.role === "Admin"
                                    ? "/admin"
                                    : "/staff-menu"
                                }/trailers/${tripData.trailerId}`
                              )
                            }
                          >
                            {tripData.trailerId}
                          </Typography>
                        </Grid>

                        {/* Show trailer data if available */}
                        {tripData.trailer && (
                          <>
                            <Grid item xs={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Biển số
                              </Typography>
                              <Typography variant="body1">
                                {tripData.trailer.licensePlate || "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Loại
                              </Typography>
                              <Typography variant="body1">
                                {tripData.trailer.type || "N/A"}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có thông tin về rơ moóc
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Trip Actions */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <MapIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Hành động
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 2 }} /> */}

            {/* Cancellation reason box */}
            {tripData.note && (
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="500" color="error" gutterBottom>
                  Lý do hủy chuyến:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderColor: 'error.light',
                    backgroundColor: 'error.lighter',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2">
                    {tripData.note}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box display="flex" flexDirection="column" gap={2}>
              {tripData.orderId && (
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<DirectionsIcon />}
                  onClick={() => handleOrderClick(tripData.orderId)}
                >
                  Xem chi tiết đơn hàng
                </Button>
              )}

              {tripData.driverId && (
                <Button
                  variant="outlined"
                  color="info"
                  fullWidth
                  startIcon={<PersonIcon />}
                  onClick={() => handleDriverClick(tripData.driverId)}
                >
                  Xem thông tin tài xế
                </Button>
              )}

              {/* Cancel Trip Button */}
              {!isAdmin &&
                !isTripcanceled() &&
                tripData.status !== "completed" && 
                tripData.status !== "pick_up_container" &&
                tripData.status !== "is_delivering" &&
                tripData.status !== "at_delivery_point" &&
                tripData.status !== "going_to_port/depot" && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={() => setCancelModalOpen(true)}
                  >
                    Hủy chuyến
                  </Button>
                )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Trip Modal */}
      <Dialog
        open={cancelModalOpen}
        onClose={handleCancelModalClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Hủy chuyến</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vui lòng nhập lý do hủy chuyến.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do hủy chuyến"
            fullWidth
            value={cancelNote}
            onChange={handleNoteChange}
            error={!!noteError}
            helperText={noteError}
            multiline
            rows={5}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "1.1rem",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelModalClose} color="primary">
            Đóng
          </Button>
          <Button
            onClick={handleCancelSubmit}
            color="error"
            disabled={!!noteError}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Cancel Modal */}
      <Dialog open={confirmCancelModalOpen} onClose={handleConfirmModalClose}>
        <DialogTitle>Xác nhận hủy chuyến</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy chuyến này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmModalClose} color="primary">
            Đóng
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            disabled={cancelLoading}
          >
            {cancelLoading ? "Đang xử lý..." : "Hủy chuyến"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={closeImagePreview}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center" }}>
          <ImageIcon sx={{ mr: 1 }} color="primary" />
          {imagePreview.title}
          <IconButton
            onClick={closeImagePreview}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, textAlign: "center", bgcolor: "#f5f5f5" }}>
          <img
            src={imagePreview.src}
            alt={imagePreview.title}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              padding: 16,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            component="a"
            href={imagePreview.src}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            variant="outlined"
          >
            Mở trong cửa sổ mới
          </Button>
          <Button
            onClick={closeImagePreview}
            color="primary"
            variant="contained"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Success Snackbar */}
      <Snackbar
        open={cancelSuccess}
        autoHideDuration={3000}
        onClose={() => setCancelSuccess(false)}
      >
        <SnackbarContent
          message="Chuyến đi đã được hủy thành công."
          sx={{ backgroundColor: "success.main", color: "white" }}
        />
      </Snackbar>

      {/* Cancel Error Snackbar */}
      <Snackbar
        open={!!cancelError}
        autoHideDuration={3000}
        onClose={() => setCancelError(null)}
      >
        <SnackbarContent
          message={cancelError}
          sx={{ backgroundColor: "error.main", color: "white" }}
        />
      </Snackbar>
    </Box>
  );
};

export default TripDetailPage;
