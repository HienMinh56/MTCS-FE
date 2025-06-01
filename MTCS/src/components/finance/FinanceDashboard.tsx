import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import {
  DatePicker,
  DateCalendar,
  MonthCalendar,
  YearCalendar,
  PickersDay,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import { AttachMoney, TrendingUp, LocalShipping } from "@mui/icons-material";
import {
  getAdminRevenueAnalytics,
  getAdminRevenueByCustomer,
  getAdminTripsFinancialDetails,
  getAdminTripPerformance,
} from "../../services/adminFinanceApi";
import {
  AdminRevenueAnalytics,
  PagedCustomerRevenue,
  AdminTripFinancial,
  AdminRevenuePeriodType,
  TripPerformanceDTO,
} from "../../types/admin-finance";
import AdminRevenueChart from "./AdminRevenueChart";
import AdminCustomerRevenueTable from "./AdminCustomerRevenueTable";
import AdminTripFinancialsTable from "./AdminTripFinancialsTable";
import AdminStatCard from "./AdminStatCard";
import AdminTripPerformanceChart from "./AdminTripPerformanceChart";
import { DATE_FORMAT } from "../../utils/dateConfig";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

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

interface FinanceDashboardProps {
  onBackClick?: () => void;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ onBackClick }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<AdminRevenueAnalytics | null>(
    null
  );
  const [customerRevenue, setCustomerRevenue] = useState<PagedCustomerRevenue>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
    items: [],
  });
  const [customerPageParams, setCustomerPageParams] = useState({
    page: 1,
    pageSize: 10,
  });
  const [tripFinancials, setTripFinancials] = useState<AdminTripFinancial[]>(
    []
  );
  const [tripPerformance, setTripPerformance] =
    useState<TripPerformanceDTO | null>(null);
  const [periodType, setPeriodType] = useState<AdminRevenuePeriodType>(
    AdminRevenuePeriodType.Monthly
  );
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(() =>
    dayjs().startOf("month").startOf("day")
  );
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(() =>
    dayjs().endOf("month").endOf("day")
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePeriodTypeChange = (e: any) => {
    const newPeriodType = e.target.value as AdminRevenuePeriodType;
    setPeriodType(newPeriodType);

    const today = dayjs();

    switch (newPeriodType) {
      case AdminRevenuePeriodType.Monthly:
        setStartDate(today.startOf("month"));
        setEndDate(today.endOf("month"));
        break;
      case AdminRevenuePeriodType.Yearly:
        setStartDate(today.startOf("year"));
        setEndDate(today.endOf("year"));
        break;
      case AdminRevenuePeriodType.Custom:
        break;
    }

    setShowDatePicker(false);
  };

  const handleWeekSelection = (date: dayjs.Dayjs | null) => {
    if (!date) return;

    const weekStart = date.startOf("week");
    const weekEnd = date.endOf("week");

    setStartDate(weekStart);
    setEndDate(weekEnd);
    setShowDatePicker(false);
  };

  const handleMonthSelection = (date: dayjs.Dayjs | null) => {
    if (!date) return;

    const monthStart = date.startOf("month");
    const monthEnd = date.endOf("month");

    setStartDate(monthStart);
    setEndDate(monthEnd);
    setShowDatePicker(false);
  };

  const handleYearSelection = (date: dayjs.Dayjs | null) => {
    if (!date) return;

    const yearStart = date.startOf("year");
    const yearEnd = date.endOf("year");

    setStartDate(yearStart);
    setEndDate(yearEnd);
    setShowDatePicker(false);
  };

  const formatDateToString = (
    date: dayjs.Dayjs,
    isEnd: boolean = false
  ): string => {
    if (isEnd) {
      return date.endOf("day").format("YYYY-MM-DD");
    }
    return date.startOf("day").format("YYYY-MM-DD");
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 0) {
        await fetchRevenueData();
      } else if (activeTab === 1) {
        await fetchCustomerRevenueData();
      } else if (activeTab === 2) {
        await fetchTripsData();
      } else if (activeTab === 3) {
        await fetchTripPerformanceData();
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

  const fetchCustomerRevenueData = async (
    page: number = customerPageParams.page,
    pageSize: number = customerPageParams.pageSize
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminRevenueByCustomer(
        formatDateToString(startDate),
        formatDateToString(endDate, true),
        page,
        pageSize
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

  // Handle pagination for customer revenue table
  const handleCustomerPageChange = (page: number, pageSize: number) => {
    setCustomerPageParams({ page, pageSize });
    fetchCustomerRevenueData(page, pageSize);
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

  const fetchTripPerformanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminTripPerformance(
        formatDateToString(startDate),
        formatDateToString(endDate, true)
      );

      if (response.success && response.data) {
        setTripPerformance(response.data);
      } else {
        setError(
          response.message || "Không thể tải dữ liệu hiệu suất chuyến đi"
        );
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải dữ liệu hiệu suất chuyến đi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeDisplay = () => {
    switch (periodType) {
      case AdminRevenuePeriodType.Monthly:
        return `Tháng ${startDate.format("MM/YYYY")}`;
      case AdminRevenuePeriodType.Yearly:
        return `Năm ${startDate.format("YYYY")}`;
      case AdminRevenuePeriodType.Custom:
        return `${startDate.format("DD/MM/YYYY")} - ${endDate.format(
          "DD/MM/YYYY"
        )}`;
      default:
        return "";
    }
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    switch (periodType) {
      case AdminRevenuePeriodType.Monthly:
        return (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              zIndex: 1000,
              mt: 1,
              p: 2,
              borderRadius: 2,
            }}
          >
            <MonthCalendar value={startDate} onChange={handleMonthSelection} />
          </Paper>
        );
      case AdminRevenuePeriodType.Yearly:
        return (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              zIndex: 1000,
              mt: 1,
              p: 2,
              borderRadius: 2,
            }}
          >
            <YearCalendar
              value={startDate}
              onChange={handleYearSelection}
              minDate={dayjs().subtract(10, "year")}
              maxDate={dayjs().add(1, "year")}
            />
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[200]}`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Thời gian báo cáo
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="period-type-label">Khoảng Thời Gian</InputLabel>
                <Select
                  labelId="period-type-label"
                  value={periodType}
                  label="Khoảng Thời Gian"
                  onChange={handlePeriodTypeChange}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value={AdminRevenuePeriodType.Monthly}>
                    Hàng Tháng
                  </MenuItem>
                  <MenuItem value={AdminRevenuePeriodType.Yearly}>
                    Hàng Năm
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {periodType !== AdminRevenuePeriodType.Custom ? (
              <Grid item xs={12} sm={5} sx={{ position: "relative" }}>
                <Box
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Typography>{getDateRangeDisplay()}</Typography>
                </Box>
                {renderDatePicker()}
              </Grid>
            ) : (
              <>
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
              </>
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
              minHeight: "56px",
              fontWeight: 500,
              transition: "all 0.2s",
              fontSize: "0.95rem",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            },
            "& .Mui-selected": {
              fontWeight: 600,
              color: theme.palette.primary.main,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
              height: 3,
            },
          }}
          variant="fullWidth"
        >
          <Tab label="Tổng Quan Doanh Thu" />
          <Tab label="Doanh Thu Theo Khách Hàng" />
          <Tab label="Chi Phí Mỗi Chuyến" />
          <Tab label="Hiệu Suất Chuyến Đi" />
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
                    <Grid item xs={12} md={3}>
                      <AdminStatCard
                        title="Tổng Doanh Thu"
                        value={`${revenueData.totalRevenue.toLocaleString(
                          "vi-VN"
                        )} ₫`}
                        icon={<AttachMoney />}
                        color="success"
                        isRevenue={true}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <AdminStatCard
                        title="Chi phí phát sinh"
                        value={`${revenueData.totalExpenses.toLocaleString(
                          "vi-VN"
                        )} ₫`}
                        icon={<AttachMoney />}
                        color="error"
                        isRevenue={true}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <AdminStatCard
                        title="Chi Phí xử lý Sự Cố"
                        value={`${revenueData.totalIncidentCosts.toLocaleString(
                          "vi-VN"
                        )} ₫`}
                        icon={<AttachMoney />}
                        color="warning"
                        isRevenue={true}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <AdminStatCard
                        title="Doanh Thu Ròng"
                        value={`${revenueData.netRevenue.toLocaleString(
                          "vi-VN"
                        )} ₫`}
                        icon={<TrendingUp />}
                        color="primary"
                        isRevenue={true}
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
                  <AdminCustomerRevenueTable
                    data={customerRevenue}
                    onPageChange={handleCustomerPageChange}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AdminTripFinancialsTable data={tripFinancials} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {tripPerformance ? (
                    <AdminTripPerformanceChart
                      data={tripPerformance}
                      loading={loading}
                    />
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Không có dữ liệu hiệu suất chuyến đi cho khoảng thời gian
                      đã chọn
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FinanceDashboard;
