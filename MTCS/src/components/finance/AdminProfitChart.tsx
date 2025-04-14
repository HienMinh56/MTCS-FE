import React, { useState, useMemo } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Box,
  Card,
  Typography,
  useTheme,
  alpha,
  Grid,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import { AdminProfitAnalytics } from "../../types/admin-finance";
import {
  LocalGasStation,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  BusinessCenter,
  AttachMoney,
} from "@mui/icons-material";
import { BarChart } from "@mui/x-charts/BarChart";

interface AdminProfitChartProps {
  data: AdminProfitAnalytics;
  title?: string;
}

type ChartType = "pie" | "bar";

const AdminProfitChart: React.FC<AdminProfitChartProps> = ({
  data,
  title = "Phân Tích Lợi Nhuận",
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>("pie");

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newChartType: ChartType | null
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Memoize chart data to prevent recalculations on every render
  const chartData = useMemo(
    () => [
      { id: 0, value: data.netProfit, label: "Lợi Nhuận Ròng" },
      { id: 1, value: data.totalFuelCost, label: "Chi Phí Nhiên Liệu" },
    ],
    [data.netProfit, data.totalFuelCost]
  );

  const barChartData = useMemo(
    () => [
      { category: "Doanh Thu", value: data.totalRevenue },
      { category: "Chi Phí Nhiên Liệu", value: data.totalFuelCost },
      { category: "Lợi Nhuận Ròng", value: data.netProfit },
    ],
    [data.totalRevenue, data.totalFuelCost, data.netProfit]
  );

  const isProfit = data.netProfit > 0;

  // Safe calculation to prevent division by zero
  const calculatePercentage = (value: number) => {
    const total = Math.abs(data.netProfit) + Math.abs(data.totalFuelCost);
    return total === 0 ? 0 : Math.round((value / total) * 100);
  };

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
            component="div"
            color="text.secondary"
            className="text-sm flex items-center gap-2 mt-1"
          >
            {data.period}
            <span className="mx-1">|</span>
            <span>Biên Lợi Nhuận:</span>
            <Chip
              label={`${data.profitMarginPercentage}%`}
              size="small"
              color={
                data.profitMarginPercentage >= 20
                  ? "success"
                  : data.profitMarginPercentage >= 10
                  ? "info"
                  : data.profitMarginPercentage >= 0
                  ? "warning"
                  : "error"
              }
              sx={{ fontWeight: 600, height: 20 }}
            />
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

          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
            aria-label="loại biểu đồ"
            className="bg-gray-50 rounded-lg"
          >
            <ToggleButton
              value="pie"
              aria-label="biểu đồ tròn"
              className="rounded-l-lg"
            >
              <Tooltip title="Biểu Đồ Tròn">
                <PieChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="bar"
              aria-label="biểu đồ cột"
              className="rounded-r-lg"
            >
              <Tooltip title="Biểu Đồ Cột">
                <BarChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
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
              className="shadow-sm"
            >
              <TrendingUp />
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
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              }}
              className="shadow-sm"
            >
              <LocalGasStation />
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                className="text-xs"
              >
                Chi Phí Nhiên Liệu
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="error"
                className="text-base"
              >
                {data.totalFuelCost.toLocaleString()}
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
                backgroundColor: alpha(
                  isProfit
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  0.1
                ),
                color: isProfit
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
              className="shadow-sm"
            >
              <BusinessCenter />
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                className="text-xs"
              >
                Lợi Nhuận Ròng
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={isProfit ? "success" : "error"}
                className="text-base"
              >
                {data.netProfit.toLocaleString()}
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
        {chartType === "pie" ? (
          <Box className="relative w-full" sx={{ height: 250 }}>
            <PieChart
              series={[
                {
                  data: chartData,
                  innerRadius: 60,
                  paddingAngle: 2,
                  arcLabel: (item) => `${calculatePercentage(item.value)}%`,
                  valueFormatter: (value) =>
                    value != null ? `${value.toLocaleString()}` : "0",
                },
              ]}
              height={250}
              margin={{ right: 5 }}
              className="mx-auto"
            >
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: "16px", fontWeight: "bold" }}
              >
                {data.profitMarginPercentage}%
              </text>
            </PieChart>
          </Box>
        ) : (
          <BarChart
            dataset={barChartData}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "category",
              },
            ]}
            grid={{ horizontal: true }}
            series={[
              {
                dataKey: "value",
                valueFormatter: (value) =>
                  value != null ? `${value.toLocaleString()}` : "0",
              },
            ]}
            height={250}
            margin={{ left: 80, right: 20, top: 10, bottom: 30 }}
            className="w-full"
          />
        )}
      </Box>
    </Card>
  );
};

export default AdminProfitChart;
