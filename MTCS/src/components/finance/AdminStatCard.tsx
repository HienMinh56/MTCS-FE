import React from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Stack,
  Tooltip,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "error" | "info" | "secondary";
  helperText?: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon,
  change,
  color = "primary",
  helperText,
}) => {
  const theme = useTheme();

  // Safe function to get color from palette
  const getColor = (colorName: string) => {
    switch (colorName) {
      case "primary":
        return theme.palette.primary.main;
      case "secondary":
        return theme.palette.secondary.main;
      case "success":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Paper
      elevation={0}
      className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        border: `1px solid ${alpha(getColor(color), 0.1)}`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          backgroundColor: getColor(color),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          className="text-sm"
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(getColor(color), 0.1),
            color: getColor(color),
          }}
        >
          {icon}
        </Box>
      </Box>
      <Tooltip title={helperText || ""} arrow placement="top">
        <Typography variant="h5" fontWeight="bold" mb={1} className="text-2xl">
          {value}
        </Typography>
      </Tooltip>
      {change && (
        <Stack direction="row" spacing={1} alignItems="center" mt="auto">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: change.isPositive ? "success.main" : "error.main",
              fontWeight: 500,
            }}
            className="text-sm"
          >
            {change.isPositive ? (
              <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
            ) : (
              <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
            )}
            {change.percentage}%
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            className="text-xs"
          >
            so với kỳ trước
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};

export default AdminStatCard;
