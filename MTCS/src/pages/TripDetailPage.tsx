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

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { tripDetail, tripStatusHistory } from "../types/trip";
import { getTripDetail } from "../services/tripApi"; // Import getTripDetail

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [tripData, setTripData] = useState<tripDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trip details using getTripDetail
  useEffect(() => {
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
          setError("No trip data found");
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
  }, [tripId]);

  // Helper function to format trip status
  const getTripStatusDisplay = (status: string | null) => {
    if (!status) return { label: "Không xác định", color: "default" };

    switch (status) {
      case "completed":
        return { label: "Hoàn thành", color: "success" };
      case "delaying":
        return { label: "Tạm dừng", color: "warning" };
      case "going_to_port":
        return { label: "Đang di chuyển đến cảng", color: "info" };
      case "0":
        return { label: "Chưa bắt đầu", color: "default" };
      case "1":
        return { label: "Đang di chuyển đến điểm lấy hàng", color: "info" };
      case "2":
        return { label: "Đã đến điểm lấy hàng", color: "info" };
      case "3":
        return { label: "Đang di chuyển đến điểm giao hàng", color: "info" };
      case "4":
        return { label: "Đã đến điểm giao hàng", color: "info" };
      case "5":
        return {
          label: "Đang di chuyển đến điểm trả container",
          color: "info",
        };
      case "6":
        return { label: "Đã đến điểm trả container", color: "success" };
      case "7":
        return { label: "Hoàn thành", color: "success" };
      default:
        return { label: status, color: "default" };
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
        return <ReportIcon color="warning" />;
      default:
        return <DirectionsIcon />;
    }
  };

  // Navigate back
  const handleBack = () => {
    navigate("/staff-menu/trips"); // Adjust this path if needed
  };

  // Navigate to driver details
  const handleDriverClick = (driverId: string | null) => {
    if (driverId) {
      navigate(`/drivers/${driverId}`);
    }
  };

  // Navigate to order details
  const handleOrderClick = (orderId: string | null) => {
    if (orderId) {
      navigate(`/staff-menu/orders/${orderId}`);
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
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách chuyến đi
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
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách chuyến đi
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
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Quay lại danh sách chuyến đi
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
            <Box display="flex" alignItems="center" mb={2}>
              <DirectionsIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Thông tin chung</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

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
                    Mã đơn hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="500"
                    sx={{
                      color: "primary.main",
                      cursor: "pointer",
                      textDecoration: "underline",
                      "&:hover": {
                        color: "primary.dark",
                      },
                    }}
                    onClick={() => handleOrderClick(tripData.orderId)}
                  >
                    {tripData.orderId || "N/A"}
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
                    Ghép bởi
                  </Typography>
                  <Typography variant="body1">{tripData.matchBy}</Typography>
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
            </Grid>
          </Paper>

          {/* Trip Status History */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventNoteIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Lịch sử trạng thái</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

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
            <Box display="flex" alignItems="center" mb={2}>
              <ReportIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Báo cáo & Nhật ký</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Delivery Reports */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Báo cáo giao hàng
                </Typography>
                {tripData.deliveryReports &&
                tripData.deliveryReports.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Thời gian</TableCell>
                          <TableCell>Ghi chú</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tripData.deliveryReports.map((report: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDateTime(report.reportTime)}
                            </TableCell>
                            <TableCell>{report.notes || "N/A"}</TableCell>
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

              {/* Fuel Reports */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Báo cáo nhiên liệu
                </Typography>
                {tripData.fuelReports && tripData.fuelReports.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Thời gian</TableCell>
                          <TableCell>Lượng tiêu thụ</TableCell>
                          <TableCell>Chi phí</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tripData.fuelReports.map((report: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDateTime(report.reportTime)}
                            </TableCell>
                            <TableCell>{report.refuelAmount} lít</TableCell>
                            <TableCell>{report.fuelCost} VNĐ</TableCell>
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
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
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
                                report.status === "resolved"
                                  ? "Đã xử lý"
                                  : "Chưa xử lý"
                              }
                              color={
                                report.status === "resolved"
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

              {/* Inspection Logs */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  fontWeight="500"
                  mt={2}
                >
                  Nhật ký kiểm tra
                </Typography>
                {tripData.inspectionLogs &&
                tripData.inspectionLogs.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Thời gian</TableCell>
                          <TableCell>Loại kiểm tra</TableCell>
                          <TableCell>Kết quả</TableCell>
                          <TableCell>Người kiểm tra</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tripData.inspectionLogs.map((log: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDateTime(log.inspectionTime)}
                            </TableCell>
                            <TableCell>{log.type}</TableCell>
                            <TableCell>
                              <Chip
                                label={log.passed ? "Đạt" : "Không đạt"}
                                color={log.passed ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{log.inspector || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có nhật ký kiểm tra
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
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Thông tin tài xế</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

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
                          cursor: "pointer",
                          textDecoration: "underline",
                          "&:hover": { color: "primary.dark" },
                        }}
                        onClick={() => handleDriverClick(tripData.driverId)}
                      >
                        Mã tài xế: {tripData.driverId}
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
            <Box display="flex" alignItems="center" mb={2}>
              <LocalShippingIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Thông tin phương tiện</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

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
                          <Typography variant="body1">
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
                          <Typography variant="body1">
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
            <Box display="flex" alignItems="center" mb={2}>
              <MapIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Hành động</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

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
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TripDetailPage;
