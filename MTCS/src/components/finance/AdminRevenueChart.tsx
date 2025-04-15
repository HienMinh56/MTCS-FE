import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
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
} from "@mui/material";
import {
  TrendingUp,
  Payments,
  ShoppingCart,
  AttachMoney,
} from "@mui/icons-material";
import {
  AdminRevenueAnalytics,
  AdminRevenuePeriodType,
} from "../../types/admin-finance";
import { getAdminRevenueAnalytics } from "../../services/adminFinanceApi";

interface AdminRevenueChartProps {
  data: AdminRevenueAnalytics;
  title?: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
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

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);

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
            loading: true,
            error: null,
          });
        }

        setMonthlyData(monthlyDataArray);

        // Fetch data for each month
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
                  loading: false,
                  error: null,
                };
              } else {
                return {
                  month: monthNames[index],
                  revenue: 0,
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
      }
    };

    fetchMonthlyData();
  }, []);

  return (
    <Card
      elevation={0}
      className="transition-all duration-300 hover:shadow-md"
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        border: `1px solid ${theme.palette.grey[200]}`,
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
            {data.period}
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
            <AttachMoney
              fontSize="small"
              sx={{ mr: 0.5, color: "info.main" }}
            />
            <Typography variant="body2" fontWeight={500} color="info.main">
              Đơn vị: VNĐ
            </Typography>
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TrendingUp fontSize="small" color="success" />
            <Typography
              fontWeight="bold"
              color="success.main"
              className="text-sm"
            >
              {data.totalRevenue.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container sx={{ px: 3, py: 2 }}>
        <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            className="p-2"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Payments />
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                className="text-xs"
              >
                Doanh Thu Tổng
              </Typography>
              <Typography variant="h6" fontWeight="bold" className="text-base">
                {data.totalRevenue.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            className="p-2"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
              }}
            >
              <ShoppingCart />
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                className="text-xs"
              >
                Đơn Hàng Hoàn Thành
              </Typography>
              <Typography variant="h6" fontWeight="bold" className="text-base">
                {data.completedOrders}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            className="p-2"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
              }}
            >
              <TrendingUp />
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                className="text-xs"
              >
                Doanh Thu TB/Đơn
              </Typography>
              <Typography variant="h6" fontWeight="bold" className="text-base">
                {data.averageRevenuePerOrder.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Divider />

      <Box
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <BarChart
            dataset={monthlyData.map((item) => ({
              month: item.month,
              value: item.revenue,
            }))}
            series={[
              {
                dataKey: "value",
                label: "Doanh Thu",
                valueFormatter: (value) =>
                  value != null ? `${value.toLocaleString()}` : "0",
                color: theme.palette.primary.main,
              },
            ]}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "month",
              },
            ]}
            height={250}
            margin={{ left: 80, right: 20, top: 10, bottom: 30 }}
            grid={{ horizontal: true }}
            className="w-full"
          />
        )}
      </Box>
    </Card>
  );
};

export default AdminRevenueChart;
