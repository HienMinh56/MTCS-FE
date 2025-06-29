import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  Card,
  CardContent,
  Chip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  parseISO,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import { gsap } from "gsap";
import { getTripTimeTable } from "../../services/tripApi";
import { TripTimeTableItem } from "../../types/trip";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import RefreshIcon from "@mui/icons-material/Refresh";
import TodayIcon from "@mui/icons-material/Today";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const statusColors = {
  completed: "#4caf50",
  canceled: "#f44336",
  pending: "#ff9800",
  active: "#2196f3",
  going_to_port: "#3f51b5",
  at_port: "#009688",
  loading: "#795548",
  delivering: "#ff5722",
  delivered: "#4caf50",
  returning: "#9c27b0",
  default: "#9e9e9e",
  delaying: "#ff9800",
  not_started: "#9e9e9e",
};

interface TimeTableProps {
  renderToggle?: () => React.ReactElement;
}

const TimeTable: React.FC<TimeTableProps> = ({ renderToggle }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [trips, setTrips] = useState<TripTimeTableItem[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    activeTrips: 0,
    pendingTrips: 0,
    canceledTrips: 0,
    notStartedTrips: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notStartedModalOpen, setNotStartedModalOpen] =
    useState<boolean>(false);
  const tripsRef = useRef<HTMLDivElement>(null);

  // Get start and end of current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Get all days in the week as Date objects
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Format dates for display
  const weekRange = `${format(weekStart, "dd/MM/yyyy")} - ${format(
    weekEnd,
    "dd/MM/yyyy"
  )}`;

  const fetchTimeTable = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTripTimeTable(weekStart, weekEnd);
      if (response.success) {
        setTrips(response.data?.trips || []);
        // Use API counts from the new structure
        setWeeklyStats({
          totalTrips: response.data?.totalCount || 0,
          completedTrips: response.data?.completedCount || 0,
          activeTrips: response.data?.deliveringCount || 0,
          pendingTrips: response.data?.delayingCount || 0,
          canceledTrips: response.data?.canceledCount || 0,
          notStartedTrips: response.data?.notStartedCount || 0,
        });
      } else {
        setError(response.message || "Failed to load time table");
        setTrips([]);
        setWeeklyStats({
          totalTrips: 0,
          completedTrips: 0,
          activeTrips: 0,
          pendingTrips: 0,
          canceledTrips: 0,
          notStartedTrips: 0,
        });
      }
    } catch (err) {
      setError("Error loading time table data. Please try again later.");
      console.error("Error fetching time table:", err);
      setTrips([]);
      setWeeklyStats({
        totalTrips: 0,
        completedTrips: 0,
        activeTrips: 0,
        pendingTrips: 0,
        canceledTrips: 0,
        notStartedTrips: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeTable();
  }, [currentDate]);

  useEffect(() => {
    if (!loading && trips && trips.length > 0 && tripsRef.current) {
      animateTrips();
    }
  }, [loading, trips]);
  const animateTrips = () => {
    gsap.killTweensOf(".trip-item");
    gsap.set(".trip-item", { opacity: 0, y: 30, scale: 0.9 });

    gsap.to(".trip-item", {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: {
        amount: 0.8,
        grid: "auto",
        from: "start",
      },
      ease: "back.out(1.7)",
    });
  };

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleRefresh = () => {
    fetchTimeTable();
  };

  // Get trips for a specific day based on delivery date and sort by start time
  const getTripsForDay = (date: Date) => {
    const dayTrips = trips.filter((trip) => {
      const deliveryDate = parseISO(trip.deliveryDate);
      return isSameDay(deliveryDate, date);
    });

    // Sort trips by start time (earliest first), handle null start times
    return dayTrips.sort((a, b) => {
      // If both have start times, sort by start time
      if (a.startTime && b.startTime) {
        const timeA = parseISO(a.startTime);
        const timeB = parseISO(b.startTime);
        return timeA.getTime() - timeB.getTime();
      }
      // If only one has start time, prioritize the one with start time
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      // If neither has start time, sort by trip ID for consistent ordering
      return a.tripId.localeCompare(b.tripId);
    });
  };

  const getStatusColor = (status: string) => {
    return (
      statusColors[status as keyof typeof statusColors] || statusColors.default
    );
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "Hoàn thành",
      canceled: "Đã hủy",
      pending: "Chờ xử lý",
      active: "Đang hoạt động",
      going_to_port: "Đang đi cảng",
      at_port: "Tại cảng",
      loading: "Đang tải hàng",
      delivering: "Đang giao hàng",
      delivered: "Đã giao hàng",
      returning: "Đang trả container",
      delaying: "Đang delay",
      not_started: "Chưa bắt đầu",
    };
    return statusMap[status] || status;
  };

  const formatTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "Chưa xác định";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "HH:mm", { locale: vi });
    } catch (error) {
      return "Chưa xác định";
    }
  };

  const formatDayLabel = (date: Date) => {
    return format(date, "E dd/MM", { locale: vi });
  };

  const WeeklyStatsCard: React.FC = () => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {weeklyStats.totalTrips}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {weeklyStats.completedTrips}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hoàn thành
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold" color="info.main">
              {weeklyStats.activeTrips}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Đang giao
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold" color="warning.main">
              {weeklyStats.pendingTrips}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chờ xử lý
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold" color="error.main">
              {weeklyStats.canceledTrips}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Đã hủy
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box
            sx={{
              textAlign: "center",
              cursor: "pointer",
              p: 1,
              borderRadius: 1,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.05)",
                transform: "scale(1.02)",
              },
            }}
            onClick={() => setNotStartedModalOpen(true)}
          >
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
              {weeklyStats.notStartedTrips}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chưa bắt đầu
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const NotStartedTripsModal: React.FC = () => {
    const notStartedTrips = trips.filter(
      (trip) => trip.status === "not_started"
    );

    return (
      <Dialog
        open={notStartedModalOpen}
        onClose={() => setNotStartedModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocalShippingIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="h6" fontWeight="bold">
              Danh sách chuyến chưa bắt đầu ({notStartedTrips.length})
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {notStartedTrips.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Không có chuyến nào chưa bắt đầu
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: "100%" }}>
              {notStartedTrips.map((trip, index) => (
                <React.Fragment key={trip.tripId}>
                  <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="primary"
                          >
                            {trip.tripId}
                          </Typography>
                          <Chip
                            label={getStatusText(trip.status)}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(trip.status),
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Mã theo dõi:</strong> {trip.orderDetailId}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Tài xế:</strong> {trip.driverName}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Lấy hàng:</strong> {trip.pickUpLocation}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Giao hàng:</strong> {trip.deliveryLocation}
                          </Typography>
                          {trip.conReturnLocation && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              <strong>Trả container:</strong>{" "}
                              {trip.conReturnLocation}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notStartedTrips.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setNotStartedModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const TripCard: React.FC<{ trip: TripTimeTableItem }> = ({ trip }) => {
    const [isHovered, setIsHovered] = useState(false);

    const tooltipContent = (
      <Paper
        elevation={8}
        sx={{
          p: 1.5,
          maxWidth: 380,
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocalShippingIcon
            sx={{
              mr: 1,
              color: getStatusColor(trip.status),
              fontSize: 18,
            }}
          />
          <Typography variant="subtitle2" fontWeight="bold" color="primary">
            Chi tiết chuyến hàng
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="caption" fontWeight="bold">
              Mã theo dõi: {trip.orderDetailId}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PersonIcon sx={{ mr: 1, color: "text.secondary", fontSize: 14 }} />
            <Typography variant="caption">
              <strong>Tài xế:</strong> {trip.driverName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <LocationOnIcon
              sx={{ mr: 1, color: "success.main", fontSize: 14, mt: 0.1 }}
            />
            <Typography variant="caption">
              <strong>Lấy:</strong> {trip.pickUpLocation}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <LocationOnIcon
              sx={{ mr: 1, color: "error.main", fontSize: 14, mt: 0.1 }}
            />
            <Typography variant="caption">
              <strong>Giao:</strong> {trip.deliveryLocation}
            </Typography>
          </Box>

          {trip.conReturnLocation && (
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <LocationOnIcon
                sx={{ mr: 1, color: "warning.main", fontSize: 14, mt: 0.1 }}
              />
              <Typography variant="caption">
                <strong>Trả:</strong> {trip.conReturnLocation}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              mt: 0.5,
              pt: 0.5,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.3 }}>
              <AccessTimeIcon
                sx={{ mr: 1, color: "success.main", fontSize: 14 }}
              />
              <Typography variant="caption">
                <strong>Bắt đầu:</strong> {formatTime(trip.startTime)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.3 }}>
              <AccessTimeIcon
                sx={{ mr: 1, color: "error.main", fontSize: 14 }}
              />
              <Typography variant="caption">
                <strong>Kết thúc:</strong> {formatTime(trip.endTime)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 0.5,
              pt: 0.5,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Chip
              label={getStatusText(trip.status)}
              size="small"
              sx={{
                backgroundColor: getStatusColor(trip.status),
                color: "white",
                fontWeight: "bold",
                fontSize: "0.65rem",
                height: 20,
              }}
            />
          </Box>
        </Box>
      </Paper>
    );

    return (
      <Tooltip
        title={tooltipContent}
        placement="right"
        arrow
        enterDelay={200}
        leaveDelay={100}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <Card
          className="trip-item"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            mb: 1.2,
            cursor: "pointer",
            borderLeft: `3px solid ${getStatusColor(trip.status)}`,
            borderRadius: 1,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "visible",
            "&:hover": {
              boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
              borderLeftWidth: "4px",
              "& .trip-status-indicator": {
                transform: "scale(1.1)",
              },
              "& .trip-content": {
                backgroundColor: "rgba(0,0,0,0.02)",
              },
            },
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${getStatusColor(
                trip.status
              )}10, transparent)`,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
              borderRadius: "inherit",
              zIndex: 0,
            },
          }}
        >
          <CardContent
            className="trip-content"
            sx={{
              p: 1.5,
              position: "relative",
              zIndex: 1,
              "&:last-child": { pb: 1.5 },
              transition: "background-color 0.3s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.8,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{
                  color: "primary.main",
                  fontSize: "0.85rem",
                  lineHeight: 1.2,
                }}
              >
                {trip.tripId}
              </Typography>

              <Box
                className="trip-status-indicator"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: getStatusColor(trip.status),
                  transition: "transform 0.3s ease",
                  boxShadow: `0 0 0 2px ${getStatusColor(trip.status)}20`,
                  animation:
                    trip.status === "active" ? "pulse 2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: `0 0 0 0 ${getStatusColor(trip.status)}70`,
                    },
                    "70%": {
                      boxShadow: `0 0 0 4px ${getStatusColor(trip.status)}00`,
                    },
                    "100%": {
                      boxShadow: `0 0 0 0 ${getStatusColor(trip.status)}00`,
                    },
                  },
                }}
              />
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontSize: "0.7rem",
                opacity: 0.8,
                fontWeight: "medium",
              }}
            >
              {trip.startTime
                ? `Bắt đầu: ${formatTime(trip.startTime)}`
                : "Chưa bắt đầu"}
            </Typography>
          </CardContent>
        </Card>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          pb: 1,
          borderBottom: `2px solid ${theme.palette.primary.main}20`,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Lịch Trình Giao Hàng
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Paper
            elevation={2}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.9)",
            }}
          >
            <IconButton
              onClick={handlePreviousWeek}
              size="small"
              sx={{
                mr: 0.5,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main + "20",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="caption"
              fontWeight="medium"
              sx={{ mx: 1, minWidth: "120px", textAlign: "center" }}
            >
              {weekRange}
            </Typography>

            <IconButton
              onClick={handleNextWeek}
              size="small"
              sx={{
                ml: 0.5,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main + "20",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
          </Paper>

          <Tooltip title="Về hôm nay" arrow>
            <IconButton
              onClick={handleToday}
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": {
                  backgroundColor: theme.palette.warning.main + "20",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <TodayIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Làm mới dữ liệu" arrow>
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={loading}
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": {
                  backgroundColor: theme.palette.success.main + "20",
                  transform: "rotate(180deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Weekly Stats Card */}
      <WeeklyStatsCard />

      {/* Toggle Button */}
      {renderToggle && renderToggle()}

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <CircularProgress size={40} thickness={4} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{
            mb: 1,
            borderRadius: 1,
          }}
        >
          {error}
        </Alert>
      ) : (
        <Box sx={{ flex: 1, overflow: "auto" }} ref={tripsRef}>
          <Grid container spacing={1.8}>
            {weekDays.map((day, index) => {
              const dayTrips = getTripsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <Grid item xs={12} sm={6} md={4} lg={12 / 7} key={index}>
                  <Paper
                    elevation={isToday ? 6 : 1}
                    sx={{
                      p: 1.8,
                      height: "100%",
                      borderRadius: 2,
                      backgroundColor: isToday
                        ? "rgba(25, 118, 210, 0.05)"
                        : "rgba(255, 255, 255, 0.9)",
                      border: isToday
                        ? `2px solid ${theme.palette.primary.main}`
                        : "1px solid transparent",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "visible", // Changed from "hidden" to "visible"
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                      },
                      "&:before": isToday
                        ? {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            zIndex: 1,
                          }
                        : {},
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        mb: 1.2,
                        textAlign: "center",
                        color: isToday
                          ? theme.palette.primary.main
                          : "text.primary",
                        borderBottom: `1px solid ${
                          isToday
                            ? theme.palette.primary.main
                            : theme.palette.divider
                        }`,
                        pb: 0.6,
                        position: "relative",
                        fontSize: "0.85rem",
                        "&:after": isToday
                          ? {
                              content: '"●"',
                              position: "absolute",
                              right: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: theme.palette.primary.main,
                              animation: "blink 1.5s infinite",
                              "@keyframes blink": {
                                "0%, 100%": { opacity: 1 },
                                "50%": { opacity: 0.3 },
                              },
                            }
                          : {},
                      }}
                    >
                      {formatDayLabel(day)}
                    </Typography>

                    {dayTrips.length === 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 100, // Reduced height for empty state
                          flexDirection: "column",
                          color: "text.secondary",
                          opacity: 0.6,
                        }}
                      >
                        <LocalShippingIcon
                          sx={{ fontSize: 28, mb: 0.8, opacity: 0.3 }}
                        />
                        <Typography variant="body2" textAlign="center">
                          Chưa có chuyến
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{
                            mb: 0.8,
                            display: "block",
                            fontWeight: "medium",
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            px: 0.7,
                            py: 0.3,
                            borderRadius: 0.5,
                            textAlign: "center",
                            fontSize: "0.7rem",
                          }}
                        >
                          {dayTrips.length} chuyến hàng
                        </Typography>
                        {dayTrips.map((trip) => (
                          <TripCard key={trip.tripId} trip={trip} />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Not Started Trips Modal */}
      <NotStartedTripsModal />
    </Box>
  );
};

export default TimeTable;
