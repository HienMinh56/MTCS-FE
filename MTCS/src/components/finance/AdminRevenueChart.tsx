import React from "react";
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
} from "@mui/material";
import { AdminRevenueAnalytics } from "../../types/admin-finance";
import { TrendingUp, Payments, ShoppingCart } from "@mui/icons-material";

interface AdminRevenueChartProps {
  data: AdminRevenueAnalytics;
  title?: string;
}

const AdminRevenueChart: React.FC<AdminRevenueChartProps> = ({
  data,
  title = "Biểu Đồ Doanh Thu",
}) => {
  const theme = useTheme();

  const chartData =
    data.totalRevenue > 0
      ? [
          Math.round(data.totalRevenue * 0.65),
          Math.round(data.totalRevenue * 0.25),
          Math.round(data.totalRevenue * 0.1),
        ]
      : [0, 0, 0];

  const xLabels = ["Vận Chuyển", "Dịch Vụ Bổ Sung", "Phí Khác"];

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
            className="text-sm"
          >
            {data.period}
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
            {data.totalRevenue.toLocaleString()} VNĐ
          </Typography>
        </Box>
      </Box>

      <Grid container sx={{ px: 3, py: 2 }}>
        <Grid item xs={12} md={4}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
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
                {data.totalRevenue.toLocaleString()} VNĐ
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
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

        <Grid item xs={12} md={4}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
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
                {data.averageRevenuePerOrder.toLocaleString()} VNĐ
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
        <BarChart
          dataset={chartData.map((value, index) => ({
            category: xLabels[index],
            value: value,
          }))}
          series={[
            {
              dataKey: "value",
              label: "Doanh Thu",
              valueFormatter: (value) => `${value.toLocaleString()} VNĐ`,
            },
          ]}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "category",
            },
          ]}
          height={250}
          margin={{ left: 80, right: 20, top: 10, bottom: 30 }}
          grid={{ horizontal: true }}
          className="w-full"
        />
      </Box>
    </Card>
  );
};

export default AdminRevenueChart;
