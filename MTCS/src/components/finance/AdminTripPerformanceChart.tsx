import React from "react";
import {
  Box,
  Card,
  Typography,
  useTheme,
  alpha,
  Grid,
  Divider,
  Stack,
  CircularProgress,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import {
  LocalShipping,
  LocalGasStation,
  CheckCircleOutline,
  Speed,
  LocationOn,
  AccessTime,
  Person,
} from "@mui/icons-material";
import { TripPerformanceDTO } from "../../types/admin-finance";

interface AdminTripPerformanceChartProps {
  data: TripPerformanceDTO;
  title?: string;
  loading?: boolean;
}

const AdminTripPerformanceChart: React.FC<AdminTripPerformanceChartProps> = ({
  data,
  title = "Hiệu Suất Chuyến Đi",
  loading = false,
}) => {
  const theme = useTheme();

  // Enhanced color palette
  const chartColors = {
    onTime: "#1976D2", // Rich blue
    incident: "#D32F2F", // Rich red
  };

  // Format period to DD/MM/YYYY
  const formatPeriod = (period: string) => {
    const [startDate, endDate] = period.split(" - ");
    const formatDate = (dateStr: string) => {
      const [month, day, year] = dateStr.split("/");
      return `${day}/${month}/${year}`;
    };
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Performance Metrics Data for Bar Chart
  const performanceMetrics = [
    {
      metric: "Tỉ lệ đúng giờ",
      value: data.onTimeDeliveryRate,
      color: chartColors.onTime,
    },
    {
      metric: "Tỉ lệ sự cố",
      value: data.incidentRate,
      color: chartColors.incident,
    },
  ];

  const formatCurrency = (value: number) => {
    return value?.toLocaleString("vi-VN") + " ₫";
  };

  const formatDistance = (value: number) => {
    return value?.toLocaleString("vi-VN") + " km";
  };

  const formatPercent = (value: number) => {
    return value?.toFixed(1) + "%";
  };

  const formatHours = (value: number) => {
    return value?.toFixed(1) + " giờ";
  };

  return (
    <Card
      elevation={0}
      className="transition-all duration-300 hover:shadow-md"
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.grey[200]}`,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.grey[100]}`,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" className="text-lg">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className="text-sm mt-1"
          >
            {formatPeriod(data.period)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              mr: 1,
            }}
          >
            <LocalShipping
              fontSize="small"
              sx={{ mr: 0.5, color: "info.main" }}
            />
            <Typography variant="body2" fontWeight={500} color="info.main">
              {data.totalTrips} chuyến
            </Typography>
          </Box>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Key Performance Indicators */}
          <Grid container spacing={2} sx={{ p: 3 }}>
            {/* Volume KPI */}
            <Grid item xs={12} md={6} xl={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Tổng chuyến đi
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                      }}
                    >
                      <LocalShipping fontSize="small" color="primary" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {data.totalTrips}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            {/* Distance KPI */}
            <Grid item xs={12} md={6} xl={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Tổng quãng đường
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                      }}
                    >
                      <Speed fontSize="small" color="info" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {formatDistance(data.totalDistance)}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            {/* Fuel Cost KPI */}
            <Grid item xs={12} md={6} xl={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Chi phí nhiên liệu
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                      }}
                    >
                      <LocalGasStation fontSize="small" color="warning" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(data.totalFuelCost)}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            {/* Average Distance KPI */}
            <Grid item xs={12} md={6} xl={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Quãng đường trung bình
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                      }}
                    >
                      <LocationOn fontSize="small" color="success" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {formatDistance(data.averageDistance)}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Divider />

          {/* Charts and Detailed Metrics */}
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`,
                  height: "100%",
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                  Chỉ số hiệu suất
                </Typography>

                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <BarChart
                    dataset={performanceMetrics}
                    yAxis={[{ scaleType: "band", dataKey: "metric" }]}
                    series={[
                      {
                        dataKey: "value",
                        label: "Tỉ lệ (%)",
                        valueFormatter: (v) => `${v}%`,
                      },
                    ]}
                    layout="horizontal"
                    height={200}
                    margin={{ left: 100 }}
                    colors={performanceMetrics.map((item) => item.color)}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  {/* Average trip distance */}
                  <Grid item xs={6}>
                    <Tooltip
                      title="Quãng đường trung bình cho mỗi chuyến"
                      placement="top"
                      arrow
                    >
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <LocationOn color="info" />
                          <Typography variant="body2" fontWeight="medium">
                            Quãng đường TB
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="bold">
                          {formatDistance(data.averageDistance)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>

                  {/* Average fuel cost */}
                  <Grid item xs={6}>
                    <Tooltip
                      title="Chi phí nhiên liệu trung bình cho mỗi chuyến"
                      placement="top"
                      arrow
                    >
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <LocalGasStation color="warning" />
                          <Typography variant="body2" fontWeight="medium">
                            Chi phí nhiên liệu trung bình
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(data.averageFuelCost)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>

                  {/* On-time delivery rate */}
                  <Grid item xs={6}>
                    <Tooltip
                      title="Tỉ lệ giao hàng đúng giờ"
                      placement="top"
                      arrow
                    >
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <CheckCircleOutline color="success" />
                          <Typography variant="body2" fontWeight="medium">
                            Tỉ lệ đúng giờ
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="bold">
                          {formatPercent(data.onTimeDeliveryRate)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Driver Hours */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTime
                      fontSize="small"
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Tài xế có nhiều giờ làm việc
                    </Typography>
                  </Box>
                </Box>

                <TableContainer component={Box} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Tài xế</TableCell>
                        <TableCell align="center">Tổng giờ</TableCell>
                        <TableCell align="center">Ngày làm việc</TableCell>
                        <TableCell align="center">TB giờ/ngày</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.driversWithMostHours?.slice(0, 5).map((driver) => (
                        <TableRow key={driver.driverId}>
                          <TableCell align="center">
                            {driver.driverName}
                          </TableCell>
                          <TableCell align="center">
                            {formatHours(driver.totalHours)}
                          </TableCell>
                          <TableCell align="center">
                            {driver.daysWorked}
                          </TableCell>
                          <TableCell align="center">
                            {formatHours(driver.dailyAverageHours)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!data.driversWithMostHours?.length && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Top Drivers */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Person
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Tài xế có nhiều chuyến đi
                  </Typography>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Tài xế</TableCell>
                        <TableCell align="center">Số chuyến</TableCell>
                        <TableCell align="center">Tổng quãng đường</TableCell>
                        <TableCell align="center">Đúng giờ</TableCell>
                        <TableCell align="center">Tỉ lệ đúng giờ</TableCell>
                        <TableCell align="center">Số sự cố</TableCell>
                        <TableCell align="center">Tỉ lệ sự cố</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.driversWithMostTrips?.slice(0, 5).map((driver) => (
                        <TableRow key={driver.driverId}>
                          <TableCell align="center">
                            {driver.driverName}
                          </TableCell>
                          <TableCell align="center">
                            {driver.completedTrips}
                          </TableCell>
                          <TableCell align="center">
                            {formatDistance(driver.totalDistance)}
                          </TableCell>
                          <TableCell align="center">
                            {driver.onTimeDeliveries}
                          </TableCell>
                          <TableCell align="center">
                            {formatPercent(driver.onTimePercentage)}
                          </TableCell>
                          <TableCell align="center">
                            {driver.incidentsCount}
                          </TableCell>
                          <TableCell align="center">
                            {formatPercent(driver.incidentRate)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!data.driversWithMostTrips?.length && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Card>
  );
};

export default AdminTripPerformanceChart;
