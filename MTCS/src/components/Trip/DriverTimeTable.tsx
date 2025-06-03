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
  LinearProgress,
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
import { getDriverTimeTable } from "../../services/DriverApi";
import { DriverTimeTableItem, DriverTripSchedule } from "../../types/driver";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import RefreshIcon from "@mui/icons-material/Refresh";
import TodayIcon from "@mui/icons-material/Today";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface DriverTimeTableProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onRefresh: () => void;
  renderToggle?: () => React.ReactElement;
}

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

const DriverTimeTable: React.FC<DriverTimeTableProps> = ({
  currentDate,
  setCurrentDate,
  onRefresh,
  renderToggle,
}) => {
  const theme = useTheme();
  const [drivers, setDrivers] = useState<DriverTimeTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] =
    useState<DriverTimeTableItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const driversRef = useRef<HTMLDivElement>(null);

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

  const fetchDriverTimeTable = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDriverTimeTable(weekStart, weekEnd);
      if (response.success) {
        setDrivers(response.data || []);
      } else {
        setError(response.message || "Failed to load driver time table");
        setDrivers([]);
      }
    } catch (err) {
      setError("Error loading driver time table data. Please try again later.");
      console.error("Error fetching driver time table:", err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverTimeTable();
  }, [currentDate]);

  useEffect(() => {
    if (!loading && drivers && drivers.length > 0 && driversRef.current) {
      animateDrivers();
    }
  }, [loading, drivers]);

  const animateDrivers = () => {
    gsap.killTweensOf(".driver-item");
    gsap.set(".driver-item", { opacity: 0, y: 30, scale: 0.9 });

    gsap.to(".driver-item", {
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
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleRefresh = () => {
    onRefresh();
    fetchDriverTimeTable();
  };

  const getWorkingTimeForDay = (driver: DriverTimeTableItem, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayWorkingTime = driver.dailyWorkingTimes.find(
      (dwt) => dwt.date === dateStr
    );
    return dayWorkingTime || { workingTime: "00:00", totalMinutes: 0 };
  };

  const getTripsForDay = (driver: DriverTimeTableItem, date: Date) => {
    return driver.driverSchedule.filter((trip) => {
      const deliveryDate = parseISO(trip.deliveryDate);
      return isSameDay(deliveryDate, date);
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

  const formatDayLabel = (date: Date) => {
    return format(date, "E dd/MM", { locale: vi });
  };

  const WeeklyDriverStats: React.FC = () => {
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.totalCount > 0).length;
    const totalTrips = drivers.reduce((sum, d) => sum + d.totalCount, 0);

    return (
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
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {totalDrivers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng tài xế
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {activeDrivers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đang hoạt động
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {totalTrips}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng chuyến
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const DriverDetailModal: React.FC = () => {
    if (!selectedDriver) return null;

    return (
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
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
            <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Chi tiết lịch làm việc - {selectedDriver.driverName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">
                  Tổng chuyến
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {selectedDriver.totalCount}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">
                  Hoàn thành
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {selectedDriver.completedCount}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">
                  Thời gian dự kiến
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {selectedDriver.expectedWeeklyWorkingTime}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">
                  Thời gian thực tế
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {selectedDriver.weeklyWorkingTime}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <List sx={{ width: "100%" }}>
            {selectedDriver.driverSchedule.map((trip, index) => (
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
                          <strong>Tracking:</strong> {trip.orderDetailId}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>Đầu kéo:</strong> {trip.tractorPlate}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>Rơ moóc:</strong> {trip.trailerPlate}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>Dự kiến hoàn thành:</strong>{" "}
                          {trip.estimatedCompletionTime}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>Ngày giao hàng:</strong> {trip.deliveryDate}
                        </Typography>
                        {trip.startTime && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Bắt đầu:</strong>{" "}
                            {format(
                              parseISO(trip.startTime),
                              "HH:mm dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </Typography>
                        )}
                        {trip.endTime && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Kết thúc:</strong>{" "}
                            {format(
                              parseISO(trip.endTime),
                              "HH:mm dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < selectedDriver.driverSchedule.length - 1 && (
                  <Divider />
                )}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDetailModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const DriverCard: React.FC<{ driver: DriverTimeTableItem; day: Date }> = ({
    driver,
    day,
  }) => {
    const dayWorkingTime = getWorkingTimeForDay(driver, day);
    const dayTrips = getTripsForDay(driver, day);
    const expectedProgress = Math.min(
      (dayWorkingTime.expectedMinutes / 480) * 100,
      100
    ); // 8 hours = 480 minutes
    const actualProgress = Math.min(
      (dayWorkingTime.totalMinutes / 480) * 100,
      100
    );

    return (
      <Card
        className="driver-item"
        onClick={() => {
          setSelectedDriver(driver);
          setDetailModalOpen(true);
        }}
        sx={{
          mb: 1.2,
          cursor: "pointer",
          borderRadius: 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
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
                fontSize: "0.8rem",
                lineHeight: 1.2,
              }}
            >
              {driver.driverName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {dayTrips.length} chuyến
            </Typography>
          </Box>

          {/* Expected Working Time */}
          <Box sx={{ mb: 0.8 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mb: 0.3,
              }}
            ></Box>
          </Box>

          {/* Actual Working Time */}
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mb: 0.3,
              }}
            ></Box>
          </Box>

          {dayTrips.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {dayTrips.slice(0, 3).map((trip) => (
                <Chip
                  key={trip.tripId}
                  label={trip.tripId}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    height: 16,
                    backgroundColor: getStatusColor(trip.status) + "20",
                    color: getStatusColor(trip.status),
                    border: `1px solid ${getStatusColor(trip.status)}40`,
                  }}
                />
              ))}
              {dayTrips.length > 3 && (
                <Chip
                  label={`+${dayTrips.length - 3}`}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    height: 16,
                    backgroundColor: theme.palette.grey[200],
                    color: theme.palette.text.secondary,
                  }}
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
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
          Lịch Làm Việc Tài Xế
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

      {/* Weekly Stats */}
      <WeeklyDriverStats />

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
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {/* Time Table Grid */}
          <Box ref={driversRef} sx={{ mb: 3 }}>
            <Grid container spacing={1.8}>
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const driversForDay = drivers.filter(
                  (driver) =>
                    getWorkingTimeForDay(driver, day).totalMinutes > 0 ||
                    getTripsForDay(driver, day).length > 0
                );

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
                        overflow: "visible",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                        },
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
                          fontSize: "0.85rem",
                        }}
                      >
                        {formatDayLabel(day)}
                      </Typography>

                      {driversForDay.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 100,
                            flexDirection: "column",
                            color: "text.secondary",
                            opacity: 0.6,
                          }}
                        >
                          <PersonIcon
                            sx={{ fontSize: 28, mb: 0.8, opacity: 0.3 }}
                          />
                          <Typography variant="body2" textAlign="center">
                            Không có tài xế
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
                            {driversForDay.length} tài xế
                          </Typography>
                          {driversForDay.map((driver) => (
                            <DriverCard
                              key={driver.driverId}
                              driver={driver}
                              day={day}
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Driver Working Time Details List */}
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                backgroundColor: "rgba(25, 118, 210, 0.05)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Lịch phân công tài xế
              </Typography>
            </Box>

            <Box sx={{ overflow: "auto", maxHeight: "60vh" }}>
              {drivers.map((driver, driverIndex) => (
                <Box
                  key={driver.driverId}
                  sx={{
                    borderBottom:
                      driverIndex < drivers.length - 1
                        ? "1px solid rgba(0, 0, 0, 0.1)"
                        : "none",
                  }}
                >
                  {/* Driver Header */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor:
                        driverIndex % 2 === 0
                          ? "rgba(0, 0, 0, 0.02)"
                          : "transparent",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => {
                      setSelectedDriver(driver);
                      setDetailModalOpen(true);
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* Driver Info */}
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon
                            sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                          />
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {driver.driverName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {driver.totalCount} chuyến tuần này
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Weekly Summary */}
                      <Grid item xs={12} md={3}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            Tổng thời gian tuần
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="warning.main"
                            >
                              Dự kiến: {driver.expectedWeeklyWorkingTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              /
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              Thực tế: {driver.weeklyWorkingTime}
                            </Typography>
                          </Box>
                          {/* Weekly Progress Bar */}
                          <Box sx={{ mt: 0.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(
                                (driver.totalWeeklyMinutes /
                                  driver.expectedWeeklyMinutes) *
                                  100,
                                100
                              )}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: "rgba(0,0,0,0.1)",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 2,
                                  backgroundColor:
                                    driver.totalWeeklyMinutes >=
                                    driver.expectedWeeklyMinutes
                                      ? theme.palette.success.main
                                      : driver.totalWeeklyMinutes >=
                                        driver.expectedWeeklyMinutes * 0.8
                                      ? theme.palette.warning.main
                                      : theme.palette.error.main,
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      </Grid>

                      {/* Daily Working Times */}
                      <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                          {weekDays.map((day, dayIndex) => {
                            const dayWorkingTime = getWorkingTimeForDay(
                              driver,
                              day
                            );
                            const isToday = isSameDay(day, new Date());
                            const hasActivity =
                              dayWorkingTime.expectedMinutes > 0 ||
                              dayWorkingTime.totalMinutes > 0;

                            return (
                              <Grid item xs={12 / 7} key={dayIndex}>
                                <Box
                                  sx={{
                                    p: 0.5,
                                    textAlign: "center",
                                    borderRadius: 1,
                                    backgroundColor: isToday
                                      ? "rgba(25, 118, 210, 0.1)"
                                      : hasActivity
                                      ? "rgba(0, 0, 0, 0.03)"
                                      : "transparent",
                                    border: isToday
                                      ? `1px solid ${theme.palette.primary.main}`
                                      : "1px solid transparent",
                                    minHeight: 60,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.65rem",
                                      fontWeight: isToday ? "bold" : "normal",
                                      color: isToday
                                        ? "primary.main"
                                        : "text.secondary",
                                      mb: 0.3,
                                    }}
                                  >
                                    {format(day, "E", { locale: vi })}
                                  </Typography>

                                  {hasActivity ? (
                                    <>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: "0.6rem",
                                          color: "warning.main",
                                          fontWeight: "bold",
                                          lineHeight: 1,
                                        }}
                                      >
                                        {dayWorkingTime.expectedWorkingTime}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: "0.6rem",
                                          color: "primary.main",
                                          fontWeight: "bold",
                                          lineHeight: 1,
                                        }}
                                      >
                                        {dayWorkingTime.workingTime}
                                      </Typography>

                                      {/* Mini progress bar */}
                                      <Box sx={{ mt: 0.3 }}>
                                        <LinearProgress
                                          variant="determinate"
                                          value={Math.min(
                                            dayWorkingTime.expectedMinutes > 0
                                              ? (dayWorkingTime.totalMinutes /
                                                  dayWorkingTime.expectedMinutes) *
                                                  100
                                              : 0,
                                            100
                                          )}
                                          sx={{
                                            height: 2,
                                            borderRadius: 1,
                                            backgroundColor: "rgba(0,0,0,0.1)",
                                            "& .MuiLinearProgress-bar": {
                                              borderRadius: 1,
                                              backgroundColor:
                                                dayWorkingTime.totalMinutes >=
                                                dayWorkingTime.expectedMinutes
                                                  ? theme.palette.success.main
                                                  : dayWorkingTime.totalMinutes >=
                                                    dayWorkingTime.expectedMinutes *
                                                      0.5
                                                  ? theme.palette.warning.main
                                                  : theme.palette.error.main,
                                            },
                                          }}
                                        />
                                      </Box>
                                    </>
                                  ) : (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.6rem",
                                        color: "text.disabled",
                                      }}
                                    >
                                      --:--
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Driver Detail Modal */}
      <DriverDetailModal />
    </Box>
  );
};

export default DriverTimeTable;
