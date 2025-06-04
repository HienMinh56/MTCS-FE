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
  PieChart,
  Pie,
  Cell,
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
  MoneyOff,
  Warning,
} from "@mui/icons-material";
import {
  AdminRevenueAnalytics,
  AdminRevenuePeriodType,
  OrderSummary,
  PeriodicRevenueItem,
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
  const [periodChartData, setPeriodChartData] = useState<PeriodicRevenueItem[]>(
    []
  );

  // Process the new periodicData when it's available
  useEffect(() => {
    if (data?.periodicData && data.periodicData.length > 0) {
      setPeriodChartData(data.periodicData);
      setLoading(false);
    }
  }, [data?.periodicData]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (initialRenderRef.current || dataRef.current !== data.totalRevenue) {
        setLoading(true);
        dataRef.current = data.totalRevenue;

        // If we have periodicData, we don't need to fetch additional data
        if (data?.periodicData && data.periodicData.length > 0) {
          setPeriodChartData(data.periodicData);
          setLoading(false);
          initialRenderRef.current = false;
          return;
        }

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
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const translateMonthToVietnamese = (period: string): string => {
    if (!period) return "";

    const monthMap: Record<string, string> = {
      January: "Tháng 1",
      February: "Tháng 2",
      March: "Tháng 3",
      April: "Tháng 4",
      May: "Tháng 5",
      June: "Tháng 6",
      July: "Tháng 7",
      August: "Tháng 8",
      September: "Tháng 9",
      October: "Tháng 10",
      November: "Tháng 11",
      December: "Tháng 12",
    };

    // Check if period contains a month name (e.g., "May 2025")
    for (const [englishMonth, vietnameseMonth] of Object.entries(monthMap)) {
      if (period.includes(englishMonth)) {
        return period.replace(englishMonth, vietnameseMonth);
      }
    }

    return period;
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
    return value.toString();
  };

  // Format date labels for the chart based on periodicData
  const formatDateLabel = (item: PeriodicRevenueItem) => {
    // For daily data in monthly view (e.g. "01/01/2025")
    if (item.periodLabel.includes("/")) {
      return item.periodLabel.split("/")[1]; // Return just the day part
    }

    // For monthly data in yearly view (e.g. "January 2025")
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const englishMonthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const vietnameseMonthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    // Extract month name from the periodLabel (handle both English and Vietnamese formats)
    let monthName = item.periodLabel.split(" ")[0];

    // Check English month names
    let monthIndex = englishMonthNames.findIndex((m) => m === monthName);
    if (monthIndex === -1) {
      // Check Vietnamese month names
      monthIndex = vietnameseMonthNames.findIndex((m) => m === monthName);
    }

    // Return month number (1-12)
    return monthIndex > -1 ? (monthIndex + 1).toString() : "1";
  };

  // Determine if we need to show periodic data from API or historical chart
  const shouldUsePeriodicData =
    data.periodicData && data.periodicData.length > 0;
  const chartDataToUse = shouldUsePeriodicData
    ? data.periodicData.map((item) => ({
        period: formatDateLabel(item),
        periodFull: item.periodLabel,
        totalRevenue: item.totalRevenue,
        paidRevenue: item.paidRevenue,
        unpaidRevenue: item.unpaidRevenue,
        paidOrders: item.paidOrders,
        unpaidOrders: item.unpaidOrders,
        completedOrders: item.completedOrders,
        averageRevenuePerOrder: item.averageRevenuePerOrder,
        totalExpenses: item.totalExpenses,
        // Calculate paid expenses from expenseBreakdown for periodic data
        paidExpenses: (() => {
          if (
            item.expenseBreakdown &&
            Object.keys(item.expenseBreakdown).length > 0
          ) {
            // For periodic data, we need to calculate based on the ratio of paid vs total revenue
            // or use a more sophisticated approach if we have specific paid/unpaid breakdowns
            const totalExpenseAmount = Object.values(
              item.expenseBreakdown
            ).reduce((sum, amount) => sum + amount, 0);

            // If we have specific paid/unpaid breakdowns in the main data for current period
            if (item.periodLabel === data.periodicData?.[0]?.periodLabel) {
              return data.paidExpenses || 0;
            }

            // For historical periods, estimate based on revenue ratio
            if (item.totalRevenue > 0) {
              const paidRatio = item.paidRevenue / item.totalRevenue;
              return Math.round(totalExpenseAmount * paidRatio);
            }

            return totalExpenseAmount; // If no unpaid revenue, assume all paid
          }
          return 0;
        })(),
        unpaidExpenses: (() => {
          if (
            item.expenseBreakdown &&
            Object.keys(item.expenseBreakdown).length > 0
          ) {
            const totalExpenseAmount = Object.values(
              item.expenseBreakdown
            ).reduce((sum, amount) => sum + amount, 0);

            // For current period, use main data
            if (item.periodLabel === data.periodicData?.[0]?.periodLabel) {
              return data.unpaidExpenses || 0;
            }

            // For historical periods, estimate based on revenue ratio
            if (item.totalRevenue > 0) {
              const unpaidRatio = item.unpaidRevenue / item.totalRevenue;
              return Math.round(totalExpenseAmount * unpaidRatio);
            }

            return 0; // If no unpaid revenue, assume no unpaid expenses
          }
          return 0;
        })(),
        totalIncidentCosts: item.totalIncidentCosts,
        // Calculate paid/unpaid incident costs similarly
        paidIncidentCosts: (() => {
          if (item.periodLabel === data.periodicData?.[0]?.periodLabel) {
            return data.paidIncidentCosts || 0;
          }

          if (item.totalIncidentCosts > 0 && item.totalRevenue > 0) {
            const paidRatio = item.paidRevenue / item.totalRevenue;
            return Math.round(item.totalIncidentCosts * paidRatio);
          }

          return item.totalIncidentCosts || 0;
        })(),
        unpaidIncidentCosts: (() => {
          if (item.periodLabel === data.periodicData?.[0]?.periodLabel) {
            return data.unpaidIncidentCosts || 0;
          }

          if (item.totalIncidentCosts > 0 && item.totalRevenue > 0) {
            const unpaidRatio = item.unpaidRevenue / item.totalRevenue;
            return Math.round(item.totalIncidentCosts * unpaidRatio);
          }

          return 0;
        })(),
        netRevenue: item.netRevenue,
      }))
    : monthlyData.map((item) => ({
        ...item,
        totalExpenses: 0,
        paidExpenses: 0,
        unpaidExpenses: 0,
        totalIncidentCosts: 0,
        paidIncidentCosts: 0,
        unpaidIncidentCosts: 0,
        netRevenue: item.revenue,
      }));

  const getIncidentTypeLabel = (type: string): string => {
    switch (type) {
      case "1":
        return "Sửa chữa tại chỗ";
      case "2":
        return "Thay thế xe kéo/rơ moóc";
      case "3":
        return "Không thể tiếp tục";
      default:
        return `Loại ${type}`;
    }
  };

  const renderExpenseBreakdownChart = () => {
    // Prepare data for expense breakdown chart
    const expenseChartData = shouldUsePeriodicData
      ? data.periodicData.map((item) => {
          const breakdown = item.expenseBreakdown || {};
          return {
            period: formatDateLabel(item),
            periodFull: item.periodLabel,
            totalExpenses: item.totalExpenses,
            ...breakdown, // Spread the expense breakdown (e.g., "Phí đổ nhiên liệu", "Phí cầu đường", etc.)
          };
        })
      : chartDataToUse.map((item) => ({
          period: item.period || item.month,
          periodFull: item.periodFull || item.month,
          totalExpenses: item.totalExpenses,
        }));

    // Get all unique expense types from the data
    const expenseTypes = shouldUsePeriodicData
      ? [
          ...new Set(
            data.periodicData.flatMap((item) =>
              Object.keys(item.expenseBreakdown || {})
            )
          ),
        ]
      : [];

    // Color palette for different expense types
    const expenseColors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={expenseChartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={alpha(theme.palette.divider, 0.7)}
          />
          <XAxis
            dataKey="period"
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
          <RechartsTooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name,
            ]}
            labelFormatter={(label) => {
              const item = expenseChartData.find(
                (item) => item.period === label
              );
              return item?.periodFull || label;
            }}
          />
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

          {/* Render bars for each expense type */}
          {expenseTypes.map((expenseType, index) => (
            <Bar
              key={expenseType}
              dataKey={expenseType}
              name={expenseType}
              fill={expenseColors[index % expenseColors.length]}
              barSize={
                shouldUsePeriodicData && expenseChartData.length > 12 ? 12 : 24
              }
              radius={[2, 2, 0, 0]}
            />
          ))}

          {/* Total expenses line */}
          <Line
            type="monotone"
            dataKey="totalExpenses"
            name="Tổng chi phí"
            stroke={theme.palette.error.main}
            strokeWidth={3}
            dot={{
              r: shouldUsePeriodicData && expenseChartData.length > 12 ? 3 : 6,
              strokeWidth: 2,
              fill: "#fff",
            }}
            activeDot={{
              r: shouldUsePeriodicData && expenseChartData.length > 12 ? 5 : 8,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderIncidentCostBreakdownChart = () => {
    // Prepare data for incident cost breakdown chart
    const incidentChartData = shouldUsePeriodicData
      ? data.periodicData.map((item) => {
          const breakdown = item.incidentCostBreakdown || {};
          return {
            period: formatDateLabel(item),
            periodFull: item.periodLabel,
            totalIncidentCosts: item.totalIncidentCosts,
            ...breakdown, // Spread the incident cost breakdown (e.g., "1", "2", "3")
          };
        })
      : chartDataToUse.map((item) => ({
          period: item.period || item.month,
          periodFull: item.periodFull || item.month,
          totalIncidentCosts: item.totalIncidentCosts,
        }));

    // Get all unique incident types from the data
    const incidentTypes = shouldUsePeriodicData
      ? [
          ...new Set(
            data.periodicData.flatMap((item) =>
              Object.keys(item.incidentCostBreakdown || {})
            )
          ),
        ]
      : [];

    // Color palette for different incident types
    const incidentColors = [
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
      theme.palette.secondary.main,
      theme.palette.primary.main,
      theme.palette.success.main,
    ];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={incidentChartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={alpha(theme.palette.divider, 0.7)}
          />
          <XAxis
            dataKey="period"
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
          <RechartsTooltip
            formatter={(value: number, name: string) => {
              // Format incident type names for tooltip
              if (["1", "2", "3"].includes(name)) {
                return [formatCurrency(value), getIncidentTypeLabel(name)];
              }
              return [formatCurrency(value), name];
            }}
            labelFormatter={(label) => {
              const item = incidentChartData.find(
                (item) => item.period === label
              );
              return item?.periodFull || label;
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => {
              // Format incident type names for legend
              const displayName = ["1", "2", "3"].includes(value)
                ? getIncidentTypeLabel(value)
                : value;
              return (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                  }}
                >
                  {displayName}
                </Typography>
              );
            }}
          />

          {/* Render bars for each incident type */}
          {incidentTypes.map((incidentType, index) => (
            <Bar
              key={incidentType}
              dataKey={incidentType}
              name={incidentType}
              fill={incidentColors[index % incidentColors.length]}
              barSize={
                shouldUsePeriodicData && incidentChartData.length > 12 ? 12 : 24
              }
              radius={[2, 2, 0, 0]}
            />
          ))}

          {/* Total incident costs line */}
          <Line
            type="monotone"
            dataKey="totalIncidentCosts"
            name="Tổng chi phí sự cố"
            stroke={theme.palette.error.main}
            strokeWidth={3}
            dot={{
              r: shouldUsePeriodicData && incidentChartData.length > 12 ? 3 : 6,
              strokeWidth: 2,
              fill: "#fff",
            }}
            activeDot={{
              r: shouldUsePeriodicData && incidentChartData.length > 12 ? 5 : 8,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
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
              {translateMonthToVietnamese(data.period)}
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
      <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
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
                    Đã thu
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
                    Chưa thu
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

      <Divider sx={{ mx: 0, my: 0 }} />

      {/* Expense and Incident Cost Details Section */}
      <Box
        sx={{
          px: 3,
          py: 3,
          backgroundColor: alpha(theme.palette.grey[50], 0.3),
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Chi tiết chi phí và sự cố
        </Typography>

        <Grid container spacing={4}>
          {/* Expense Breakdown Details */}
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 2,
                p: 3,
                border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 2, color: "error.main" }}
              >
                Chi phí phát sinh
              </Typography>

              {data.expenseBreakdown &&
              Object.keys(data.expenseBreakdown).length > 0 ? (
                <Box>
                  <Grid container spacing={1}>
                    {Object.entries(data.expenseBreakdown).map(
                      ([type, amount]) => (
                        <Grid item xs={12} key={type}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              border: `1px solid ${alpha(
                                theme.palette.grey[300],
                                0.5
                              )}`,
                              borderRadius: 1,
                              backgroundColor: alpha(
                                theme.palette.error.main,
                                0.02
                              ),
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium">
                                {type}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="error.main"
                                fontWeight="600"
                              >
                                {formatCurrency(amount)}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      )
                    )}
                  </Grid>

                  {/* Paid/Unpaid Expense Breakdown */}
                  <Box sx={{ mt: 2.5 }}>
                    <Grid container spacing={1}>
                      {data.paidExpenseBreakdown &&
                        Object.keys(data.paidExpenseBreakdown).length > 0 && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="success.main"
                              fontWeight="medium"
                              sx={{ fontSize: "1rem" }}
                            >
                              Chi phí phát sinh đã thanh toán:
                            </Typography>
                            {Object.entries(data.paidExpenseBreakdown).map(
                              ([type, amount]) =>
                                amount > 0 && (
                                  <Box
                                    key={`paid-${type}`}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      py: 0.5,
                                      pl: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {type}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="success.main"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {formatCurrency(amount)}
                                    </Typography>
                                  </Box>
                                )
                            )}
                          </Grid>
                        )}

                      {data.unpaidExpenseBreakdown &&
                        Object.keys(data.unpaidExpenseBreakdown).length > 0 && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="warning.main"
                              fontWeight="medium"
                              sx={{ fontSize: "0.9rem" }}
                            >
                              Chi phí chưa thanh toán:
                            </Typography>
                            {Object.entries(data.unpaidExpenseBreakdown).map(
                              ([type, amount]) =>
                                amount > 0 && (
                                  <Box
                                    key={`unpaid-${type}`}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      py: 0.5,
                                      pl: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {type}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="warning.main"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {formatCurrency(amount)}
                                    </Typography>
                                  </Box>
                                )
                            )}
                          </Grid>
                        )}
                    </Grid>
                  </Box>

                  {/* Total Expenses at Bottom */}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      backgroundColor: alpha(theme.palette.error.main, 0.05),
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="error.main"
                    >
                      Tổng chi phí phát sinh:
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {formatCurrency(data.totalExpenses)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 1,
                  }}
                >
                  <MoneyOff
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Không có chi phí phát sinh trong kỳ này
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Incident Cost Breakdown Details */}
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 2,
                p: 3,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 2, color: "warning.main" }}
              >
                Chi phí xử lý sự cố
              </Typography>

              {data.incidentCostBreakdown &&
              Object.keys(data.incidentCostBreakdown).length > 0 &&
              Object.values(data.incidentCostBreakdown).some(
                (amount) => amount > 0
              ) ? (
                <Box>
                  <Grid container spacing={1}>
                    {Object.entries(data.incidentCostBreakdown).map(
                      ([type, amount]) =>
                        amount > 0 && (
                          <Grid item xs={12} key={type}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                border: `1px solid ${alpha(
                                  theme.palette.warning.main,
                                  0.3
                                )}`,
                                borderRadius: 1,
                                backgroundColor: alpha(
                                  theme.palette.warning.main,
                                  0.02
                                ),
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {getIncidentTypeLabel(type)}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Loại {type}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="warning.main"
                                  fontWeight="600"
                                >
                                  {formatCurrency(amount)}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        )
                    )}
                  </Grid>

                  {/* Paid/Unpaid Incident Cost Breakdown */}
                  <Box sx={{ mt: 2.5 }}>
                    <Grid container spacing={1}>
                      {data.paidIncidentCostBreakdown &&
                        Object.keys(data.paidIncidentCostBreakdown).length >
                          0 && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="success.main"
                              fontWeight="medium"
                              sx={{ fontSize: "1rem" }}
                            >
                              Chi phí sự cố đã thanh toán:
                            </Typography>
                            {Object.entries(data.paidIncidentCostBreakdown).map(
                              ([type, amount]) =>
                                amount > 0 && (
                                  <Box
                                    key={`paid-incident-${type}`}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      py: 0.5,
                                      pl: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {getIncidentTypeLabel(type)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="success.main"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {formatCurrency(amount)}
                                    </Typography>
                                  </Box>
                                )
                            )}
                          </Grid>
                        )}

                      {data.unpaidIncidentCostBreakdown &&
                        Object.keys(data.unpaidIncidentCostBreakdown).length >
                          0 && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="warning.main"
                              fontWeight="medium"
                              sx={{ fontSize: "0.9rem" }}
                            >
                              Chi phí sự cố chưa thanh toán:
                            </Typography>
                            {Object.entries(
                              data.unpaidIncidentCostBreakdown
                            ).map(
                              ([type, amount]) =>
                                amount > 0 && (
                                  <Box
                                    key={`unpaid-incident-${type}`}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      py: 0.5,
                                      pl: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {getIncidentTypeLabel(type)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="warning.main"
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {formatCurrency(amount)}
                                    </Typography>
                                  </Box>
                                )
                            )}
                          </Grid>
                        )}
                    </Grid>
                  </Box>

                  {/* Total Incident Costs at Bottom */}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      backgroundColor: alpha(theme.palette.warning.main, 0.05),
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      Tổng chi phí sự cố:
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {formatCurrency(data.totalIncidentCosts)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 1,
                  }}
                >
                  <Warning
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Không có chi phí sự cố trong kỳ này
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 0, mb: 0 }} />

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
              fontSize: "0.875rem",
            },
            "& .Mui-selected": {
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Doanh thu theo thời gian" />
          <Tab label="So sánh loại đơn" />
          <Tab label="Chi phí phát sinh" />
          <Tab label="Chi phí sự cố" />
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
                  <ComposedChart data={chartDataToUse}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={alpha(theme.palette.divider, 0.7)}
                    />
                    <XAxis
                      dataKey={shouldUsePeriodicData ? "period" : "month"}
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
                    <RechartsTooltip
                      formatter={(value: number, name: string) => {
                        if (
                          name === "Doanh thu đã thu" ||
                          name === "Doanh thu chưa thu" ||
                          name === "Tổng doanh thu" ||
                          name === "Doanh thu ròng"
                        ) {
                          return [formatCurrency(value), name];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const item = chartDataToUse.find(
                          (item) =>
                            item.period === label || item.month === label
                        );
                        return item && shouldUsePeriodicData
                          ? item.periodFull
                          : label;
                      }}
                    />
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
                      name="Doanh thu đã thu"
                      fill={theme.palette.success.main}
                      barSize={
                        shouldUsePeriodicData && chartDataToUse.length > 12
                          ? 16
                          : 32
                      }
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="unpaidRevenue"
                      name="Doanh thu chưa thu"
                      fill={theme.palette.warning.main}
                      barSize={
                        shouldUsePeriodicData && chartDataToUse.length > 12
                          ? 16
                          : 32
                      }
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="netRevenue"
                      name="Doanh thu ròng"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{
                        r:
                          shouldUsePeriodicData && chartDataToUse.length > 12
                            ? 3
                            : 6,
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      activeDot={{
                        r:
                          shouldUsePeriodicData && chartDataToUse.length > 12
                            ? 5
                            : 8,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : chartTab === 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartDataToUse}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={alpha(theme.palette.divider, 0.7)}
                    />
                    <XAxis
                      dataKey={shouldUsePeriodicData ? "period" : "month"}
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      labelFormatter={(label) => {
                        const item = chartDataToUse.find(
                          (item) =>
                            item.period === label || item.month === label
                        );
                        return item && shouldUsePeriodicData
                          ? item.periodFull
                          : label;
                      }}
                    />
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
                      barSize={
                        shouldUsePeriodicData && chartDataToUse.length > 12
                          ? 10
                          : 20
                      }
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="unpaidOrders"
                      name="Số đơn chưa thanh toán"
                      fill={alpha(theme.palette.warning.main, 0.8)}
                      barSize={
                        shouldUsePeriodicData && chartDataToUse.length > 12
                          ? 10
                          : 20
                      }
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="completedOrders"
                      name="Số đơn đã hoàn thành"
                      stroke={theme.palette.info.main}
                      strokeWidth={3}
                      dot={{
                        r:
                          shouldUsePeriodicData && chartDataToUse.length > 12
                            ? 3
                            : 5,
                        strokeWidth: 2,
                        fill: "#fff",
                        stroke: theme.palette.info.main,
                      }}
                      activeDot={{
                        r:
                          shouldUsePeriodicData && chartDataToUse.length > 12
                            ? 5
                            : 7,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : chartTab === 2 ? (
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    Phí phát sinh theo thời gian
                  </Typography>
                  {renderExpenseBreakdownChart()}
                </Box>
              ) : (
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    Phí sự cố theo thời gian
                  </Typography>
                  {renderIncidentCostBreakdownChart()}
                </Box>
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
