import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Container,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  AttachMoney,
  TrendingUp,
  LocalShipping,
  BusinessCenter,
  LocalGasStation,
  ArrowBack,
} from "@mui/icons-material";
import {
  getAdminRevenueAnalytics,
  getAdminRevenueByCustomer,
  getAdminProfitAnalytics,
  getAdminTripsFinancialDetails,
  getAdminAverageFuelCostPerDistance,
} from "../services/adminFinanceApi";
import {
  AdminRevenueAnalytics,
  AdminCustomerRevenue,
  AdminProfitAnalytics,
  AdminTripFinancial,
  AdminRevenuePeriodType,
} from "../types/admin-finance";
import AdminRevenueChart from "../components/finance/AdminRevenueChart";
import AdminCustomerRevenueTable from "../components/finance/AdminCustomerRevenueTable";
import AdminTripFinancialsTable from "../components/finance/AdminTripFinancialsTable";
import AdminProfitChart from "../components/finance/AdminProfitChart";
import AdminStatCard from "../components/finance/AdminStatCard";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DATE_FORMAT } from "../utils/dateConfig";

dayjs.locale("vi");

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-finance-tabpanel-${index}`}
      aria-labelledby={`admin-finance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminFinanceDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<AdminRevenueAnalytics | null>(
    null
  );
  const [customerRevenue, setCustomerRevenue] = useState<
    AdminCustomerRevenue[]
  >([]);
  const [profitData, setProfitData] = useState<AdminProfitAnalytics | null>(
    null
  );
  const [tripFinancials, setTripFinancials] = useState<AdminTripFinancial[]>(
    []
  );
  const [avgFuelCost, setAvgFuelCost] = useState<number | null>(null);

  const [periodType, setPeriodType] = useState<AdminRevenuePeriodType>(
    AdminRevenuePeriodType.Monthly
  );

  const [startDate, setStartDate] = useState<dayjs.Dayjs>(() =>
    dayjs().startOf("month").startOf("day")
  );
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(() =>
    dayjs().endOf("month").endOf("day")
  );

  const formatDateToString = (
    date: dayjs.Dayjs,
    isEnd: boolean = false
  ): string => {
    if (isEnd) {
      return date.endOf("day").format("YYYY-MM-DD");
    }
    return date.startOf("day").format("YYYY-MM-DD");
  };

  useEffect(() => {
    if (isAuthenticated && user?.role !== "Admin") {
      navigate("/unauthorized");
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGoToStaffMenu = () => {
    navigate("/staff-menu/orders");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 0) {
        await fetchRevenueData();
      } else if (activeTab === 1) {
        await fetchCustomerRevenueData();
      } else if (activeTab === 2) {
        await fetchProfitData();
      } else if (activeTab === 3) {
        await fetchTripsData();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, periodType, startDate, endDate]);

  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminRevenueAnalytics(
        periodType,
        formatDateToString(startDate),
        periodType === AdminRevenuePeriodType.Custom
          ? formatDateToString(endDate, true)
          : undefined
      );

      if (response.success && response.data) {
        setRevenueData(response.data);
      } else {
        setError(response.message || "Không thể tải dữ liệu doanh thu");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải dữ liệu doanh thu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerRevenueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminRevenueByCustomer(
        formatDateToString(startDate),
        formatDateToString(endDate, true)
      );

      if (response.success && response.data) {
        setCustomerRevenue(response.data);
      } else {
        setError(
          response.message || "Không thể tải dữ liệu doanh thu theo khách hàng"
        );
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải dữ liệu doanh thu theo khách hàng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profitResponse, fuelCostResponse] = await Promise.all([
        getAdminProfitAnalytics(
          formatDateToString(startDate),
          formatDateToString(endDate, true)
        ),
        getAdminAverageFuelCostPerDistance(
          formatDateToString(startDate),
          formatDateToString(endDate, true)
        ),
      ]);

      if (profitResponse.success && profitResponse.data) {
        setProfitData(profitResponse.data);
      } else {
        setError(profitResponse.message || "Không thể tải dữ liệu lợi nhuận");
      }

      if (fuelCostResponse.success && fuelCostResponse.data !== undefined) {
        setAvgFuelCost(fuelCostResponse.data);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải dữ liệu lợi nhuận");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminTripsFinancialDetails(
        formatDateToString(startDate),
        formatDateToString(endDate, true)
      );

      if (response.success && response.data) {
        setTripFinancials(response.data);
      } else {
        setError(
          response.message || "Không thể tải dữ liệu tài chính chuyến đi"
        );
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải dữ liệu tài chính chuyến đi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${alpha(
                theme.palette.primary.main,
                0.8
              )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
              color: "white",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Bảng Điều Khiển Tài Chính
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGoToStaffMenu}
                startIcon={<ArrowBack />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: theme.shadows[4],
                }}
              >
                Quay Lại Menu Nhân Viên
              </Button>
            </Box>
          </Paper>

          <Box sx={{ mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.grey[200]}`,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Tùy Chọn
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-type-label">
                      Khoảng Thời Gian
                    </InputLabel>
                    <Select
                      labelId="period-type-label"
                      value={periodType}
                      label="Khoảng Thời Gian"
                      onChange={(e) =>
                        setPeriodType(e.target.value as AdminRevenuePeriodType)
                      }
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value={AdminRevenuePeriodType.Weekly}>
                        Hàng Tuần
                      </MenuItem>
                      <MenuItem value={AdminRevenuePeriodType.Monthly}>
                        Hàng Tháng
                      </MenuItem>
                      <MenuItem value={AdminRevenuePeriodType.Yearly}>
                        Hàng Năm
                      </MenuItem>
                      <MenuItem value={AdminRevenuePeriodType.Custom}>
                        Tùy Chỉnh
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Ngày Bắt Đầu"
                    value={startDate}
                    onChange={(newDate) => newDate && setStartDate(newDate)}
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { borderRadius: 1.5 },
                      },
                    }}
                  />
                </Grid>
                {periodType === AdminRevenuePeriodType.Custom && (
                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      label="Ngày Kết Thúc"
                      value={endDate}
                      onChange={(newDate) => newDate && setEndDate(newDate)}
                      format={DATE_FORMAT}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: { borderRadius: 1.5 },
                        },
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 2,
              border: `1px solid ${theme.palette.grey[200]}`,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                backgroundColor: theme.palette.background.default,
                "& .MuiTab-root": {
                  minHeight: "64px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                },
                "& .Mui-selected": {
                  fontWeight: 600,
                },
              }}
              variant="fullWidth"
            >
              <Tab label="Tổng Quan Doanh Thu" />
              <Tab label="Doanh Thu Theo Khách Hàng" />
              <Tab label="Phân Tích Lợi Nhuận" />
              <Tab label="Tài Chính Chuyến Đi" />
            </Tabs>

            {error && (
              <Alert
                severity="error"
                sx={{
                  m: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={3}>
                    {revenueData && (
                      <>
                        <Grid item xs={12} md={4}>
                          <AdminStatCard
                            title="Tổng Doanh Thu"
                            value={`${revenueData.totalRevenue.toLocaleString(
                              "vi-VN"
                            )} ₫`}
                            icon={<AttachMoney />}
                            color="success"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <AdminStatCard
                            title="Đơn Hàng Hoàn Thành"
                            value={revenueData.completedOrders.toString()}
                            icon={<LocalShipping />}
                            color="primary"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <AdminStatCard
                            title="Doanh Thu TB/Đơn"
                            value={`${revenueData.averageRevenuePerOrder.toLocaleString(
                              "vi-VN"
                            )} ₫`}
                            icon={<TrendingUp />}
                            color="warning"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <AdminRevenueChart data={revenueData} />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <AdminCustomerRevenueTable data={customerRevenue} />
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Grid container spacing={3}>
                    {profitData && (
                      <>
                        <Grid item xs={12} md={3}>
                          <AdminStatCard
                            title="Tổng Doanh Thu"
                            value={`${profitData.totalRevenue.toLocaleString(
                              "vi-VN"
                            )} ₫`}
                            icon={<AttachMoney />}
                            color="success"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <AdminStatCard
                            title="Tổng Chi Phí Nhiên Liệu"
                            value={`${profitData.totalFuelCost.toLocaleString(
                              "vi-VN"
                            )} ₫`}
                            icon={<LocalGasStation />}
                            color="error"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <AdminStatCard
                            title="Lợi Nhuận Ròng"
                            value={`${profitData.netProfit.toLocaleString(
                              "vi-VN"
                            )} ₫`}
                            icon={<BusinessCenter />}
                            color="secondary"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <AdminStatCard
                            title="Tỷ Suất Lợi Nhuận"
                            value={`${profitData.profitMarginPercentage.toFixed(
                              2
                            )}%`}
                            icon={<TrendingUp />}
                            color="warning"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <AdminProfitChart data={profitData} />
                        </Grid>
                        {avgFuelCost !== null && (
                          <Grid item xs={12}>
                            <Paper
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.grey[200]}`,
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <LocalGasStation
                                  sx={{
                                    fontSize: 40,
                                    color: theme.palette.error.main,
                                  }}
                                />
                                <Box>
                                  <Typography variant="h6" gutterBottom>
                                    Chỉ Số Chi Phí Nhiên Liệu
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Chi Phí Nhiên Liệu TB:{" "}
                                    {avgFuelCost.toLocaleString("vi-VN")} ₫/km
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <AdminTripFinancialsTable data={tripFinancials} />
                    </Grid>
                  </Grid>
                </TabPanel>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminFinanceDashboard;
