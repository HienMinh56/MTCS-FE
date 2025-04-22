import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
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
  Paper,
  Zoom,
  Tooltip,
  Fade,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import {
  TrendingUp,
  Payments,
  ShoppingCart,
  AttachMoney,
  CheckCircle,
  AccessTime,
  InfoOutlined,
  Download,
  CalendarMonth,
} from "@mui/icons-material";
import {
  AdminRevenueAnalytics,
  AdminRevenuePeriodType,
  OrderSummary,
} from "../../types/admin-finance";
import { getAdminRevenueAnalytics } from "../../services/adminFinanceApi";
import OrdersListModal from "./OrdersListModal";

interface AdminRevenueChartProps {
  data: AdminRevenueAnalytics;
  title?: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  paidOrders: number;
  unpaidOrders: number;
  paidOrdersList: OrderSummary[];
  unpaidOrdersList: OrderSummary[];
  loading: boolean;
  error: string | null;
}

const AdminRevenueChart: React.FC<AdminRevenueChartProps> = ({
  data,
  title = "Biểu Đồ Doanh Thu",
}) => {
  const theme = useTheme();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<OrderSummary[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState(0);
  const initialRenderRef = useRef(true);
  const dataRef = useRef(data.totalRevenue);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (initialRenderRef.current || dataRef.current !== data.totalRevenue) {
        setLoading(true);
        dataRef.current = data.totalRevenue;

        try {
          const currentDate = new Date();
          const monthNames: string[] = [];
          const monthlyDataArray: MonthlyData[] = [];

          for (let i = 3; i >= 0; i--) {
            const month = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - i,
              1
            );
            const monthName = month.toLocaleString("vi-VN", { month: "long" });
            monthNames.push(monthName);

            monthlyDataArray.push({
              month: monthName,
              revenue: 0,
              paidRevenue: 0,
              unpaidRevenue: 0,
              paidOrders: 0,
              unpaidOrders: 0,
              paidOrdersList: [],
              unpaidOrdersList: [],
              loading: true,
              error: null,
            });
          }

          setMonthlyData(monthlyDataArray);

          const results = await Promise.all(
            monthlyDataArray.map(async (_, index) => {
              const monthIndex = currentDate.getMonth() - (3 - index);
              const year = currentDate.getFullYear() - (monthIndex < 0 ? 1 : 0);
              const adjustedMonthIndex =
                monthIndex < 0 ? monthIndex + 12 : monthIndex;

              const startDate = new Date(year, adjustedMonthIndex, 1);
              const endDate = new Date(year, adjustedMonthIndex + 1, 0);

              const startDateString = startDate.toISOString().split("T")[0];
              const endDateString = endDate.toISOString().split("T")[0];

              try {
                const response = await getAdminRevenueAnalytics(
                  AdminRevenuePeriodType.Custom,
                  startDateString,
                  endDateString
                );

                if (response.success && response.data) {
                  return {
                    month: monthNames[index],
                    revenue: response.data.totalRevenue,
                    paidRevenue: response.data.paidRevenue,
                    unpaidRevenue: response.data.unpaidRevenue,
                    paidOrders: response.data.paidOrders,
                    unpaidOrders: response.data.unpaidOrders,
                    paidOrdersList: response.data.paidOrdersList || [],
                    unpaidOrdersList: response.data.unpaidOrdersList || [],
                    loading: false,
                    error: null,
                  };
                } else {
                  return {
                    month: monthNames[index],
                    revenue: 0,
                    paidRevenue: 0,
                    unpaidRevenue: 0,
                    paidOrders: 0,
                    unpaidOrders: 0,
                    paidOrdersList: [],
                    unpaidOrdersList: [],
                    loading: false,
                    error: response.message || "Failed to fetch data",
                  };
                }
              } catch (err) {
                console.error(
                  `Error fetching data for ${monthNames[index]}:`,
                  err
                );
                return {
                  month: monthNames[index],
                  revenue: 0,
                  paidRevenue: 0,
                  unpaidRevenue: 0,
                  paidOrders: 0,
                  unpaidOrders: 0,
                  paidOrdersList: [],
                  unpaidOrdersList: [],
                  loading: false,
                  error: "Error fetching data",
                };
              }
            })
          );

          setMonthlyData(results);
        } catch (error) {
          console.error("Error fetching monthly data:", error);
        } finally {
          setLoading(false);
          initialRenderRef.current = false;
        }
      }
    };

    fetchMonthlyData();
  }, [data.totalRevenue]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const handlePaidOrdersClick = () => {
    setActiveStat("paid");
    setTimeout(() => setActiveStat(null), 300);

    if (!data.paidOrdersList) {
      alert("Dữ liệu danh sách đơn hàng đã thanh toán chưa được cập nhật");
      return;
    }

    setModalTitle("Danh sách đơn hàng đã thanh toán");
    setSelectedOrders(data.paidOrdersList);
    setModalOpen(true);
  };

  const handleUnpaidOrdersClick = () => {
    setActiveStat("unpaid");
    setTimeout(() => setActiveStat(null), 300);

    if (!data.unpaidOrdersList) {
      alert("Dữ liệu danh sách đơn hàng chưa thanh toán chưa được cập nhật");
      return;
    }

    setModalTitle("Danh sách đơn hàng chưa thanh toán");
    setSelectedOrders(data.unpaidOrdersList);
    setModalOpen(true);
  };

  const paidPercentage =
    data.totalRevenue > 0
      ? Math.round((data.paidRevenue / data.totalRevenue) * 100)
      : 0;

  const unpaidPercentage =
    data.totalRevenue > 0
      ? Math.round((data.unpaidRevenue / data.totalRevenue) * 100)
      : 0;

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString(); // Convert number to string
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        border: `1px solid ${theme.palette.grey[200]}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `1px solid ${theme.palette.grey[100]}`,
          backgroundImage: `linear-gradient(to right, ${alpha(
            theme.palette.primary.light,
            0.05
          )}, ${alpha(theme.palette.primary.dark, 0.01)})`,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {title}
            <Box
              component="span"
              sx={{
                ml: 1.5,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "text.secondary",
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <CalendarMonth
                fontSize="small"
                sx={{ mr: 0.5, fontSize: "0.9rem" }}
              />
              {data.period}
            </Box>
          </Typography>

          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <AttachMoney
              fontSize="small"
              sx={{ color: "primary.main", mr: 0.5 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 500,
                mr: 2,
              }}
            >
              Tổng doanh thu:
              <Box component="span" sx={{ ml: 0.5, fontWeight: 600 }}>
                {formatCurrency(data.totalRevenue)}
              </Box>
            </Typography>

            <ShoppingCart
              fontSize="small"
              sx={{ color: "info.main", mr: 0.5 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "info.main",
                fontWeight: 500,
              }}
            >
              Đơn hàng:
              <Box component="span" sx={{ ml: 0.5, fontWeight: 600 }}>
                {data.completedOrders.toLocaleString()}
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <TrendingUp fontSize="small" color="success" />
            <Typography fontWeight="bold" color="success.main">
              {formatCurrency(data.averageRevenuePerOrder)}/đơn
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Payment status section */}
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Trạng thái thanh toán
          </Typography>
          <Tooltip title="Nhấp vào từng phần để xem chi tiết đơn hàng">
            <InfoOutlined fontSize="small" color="action" />
          </Tooltip>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Zoom in={true} style={{ transitionDelay: "100ms" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: activeStat === "paid" ? "scale(0.98)" : "scale(1)",
                  backgroundColor:
                    activeStat === "paid"
                      ? alpha(theme.palette.success.main, 0.08)
                      : "transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={handlePaidOrdersClick}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="body1" fontWeight="medium">
                    Đã thanh toán
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(data.paidRevenue)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {data.paidOrders} đơn hàng
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.success.main,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                    }}
                  >
                    {paidPercentage}%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 1,
                    height: 6,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: `${paidPercentage}%`,
                      bgcolor: theme.palette.success.main,
                      height: "100%",
                      borderRadius: 1,
                      transition: "width 1s ease-in-out",
                    }}
                  />
                </Box>
              </Paper>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Zoom in={true} style={{ transitionDelay: "150ms" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform:
                    activeStat === "unpaid" ? "scale(0.98)" : "scale(1)",
                  backgroundColor:
                    activeStat === "unpaid"
                      ? alpha(theme.palette.warning.main, 0.08)
                      : "transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.warning.main, 0.05),
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={handleUnpaidOrdersClick}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <AccessTime fontSize="small" color="warning" />
                  <Typography variant="body1" fontWeight="medium">
                    Chưa thanh toán
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(data.unpaidRevenue)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {data.unpaidOrders} đơn hàng
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.warning.main,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                    }}
                  >
                    {unpaidPercentage}%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    borderRadius: 1,
                    height: 6,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: `${unpaidPercentage}%`,
                      bgcolor: theme.palette.warning.main,
                      height: "100%",
                      borderRadius: 1,
                      transition: "width 1s ease-in-out",
                    }}
                  />
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 3, mb: 0 }} />

      {/* Chart tabs */}
      <Box sx={{ px: 2, pt: 1 }}>
        <Tabs
          value={chartTab}
          onChange={(_, newValue) => setChartTab(newValue)}
          variant="fullWidth"
          sx={{
            minHeight: "42px",
            "& .MuiTab-root": {
              minHeight: "42px",
              py: 0.5,
            },
            "& .Mui-selected": {
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Doanh thu theo thời gian" />
          <Tab label="So sánh thanh toán" />
        </Tabs>
      </Box>

      <Box
        sx={{
          p: 3,
          pt: 2,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 350,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 6,
            }}
          >
            <CircularProgress size={44} />
            <Typography variant="body2" color="text.secondary">
              Đang tải dữ liệu biểu đồ...
            </Typography>
          </Box>
        ) : (
          <Fade in={!loading} timeout={800}>
            <Box sx={{ width: "100%", height: 350 }}>
              {chartTab === 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={alpha(theme.palette.divider, 0.7)}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxisTick}
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <RechartsTooltip />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                          }}
                        >
                          {value}
                        </Typography>
                      )}
                    />
                    <Bar
                      dataKey="paidRevenue"
                      name="Doanh thu đã thanh toán"
                      fill={theme.palette.success.main}
                      barSize={32}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="unpaidRevenue"
                      name="Doanh thu chưa thanh toán"
                      fill={theme.palette.warning.main}
                      barSize={32}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Tổng doanh thu"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={alpha(theme.palette.divider, 0.7)}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxisTick}
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                      yAxisId="left"
                    />
                    <YAxis
                      orientation="right"
                      yAxisId="right"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <RechartsTooltip />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                          }}
                        >
                          {value}
                        </Typography>
                      )}
                    />
                    <Bar
                      dataKey="paidOrders"
                      name="Số đơn đã thanh toán"
                      fill={alpha(theme.palette.success.main, 0.8)}
                      barSize={20}
                      yAxisId="right"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="unpaidOrders"
                      name="Số đơn chưa thanh toán"
                      fill={alpha(theme.palette.warning.main, 0.8)}
                      barSize={20}
                      yAxisId="right"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="paidRevenue"
                      name="Doanh thu đã thanh toán"
                      stroke={theme.palette.success.main}
                      yAxisId="left"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="unpaidRevenue"
                      name="Doanh thu chưa thanh toán"
                      stroke={theme.palette.warning.main}
                      yAxisId="left"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Fade>
        )}
      </Box>

      {/* Orders List Modal */}
      <OrdersListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        orders={selectedOrders}
      />
    </Card>
  );
};

export default AdminRevenueChart;
