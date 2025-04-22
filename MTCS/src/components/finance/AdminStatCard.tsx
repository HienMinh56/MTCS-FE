import React from "react";
import {
  Box,
  Card,
  Typography,
  useTheme,
  alpha,
  Grow,
  Tooltip,
} from "@mui/material";
import CountUp from "react-countup";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "info" | "secondary";
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  tooltip?: string;
  isRevenue?: boolean; // New prop to identify if this is a revenue metric
  useAnimation?: boolean; // New prop to control animation
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon,
  color = "primary",
  percentage,
  trend,
  subtitle,
  tooltip,
  isRevenue = false, // Default to false
  useAnimation = true, // Default to true
}) => {
  const theme = useTheme();

  // Get trend color and icon
  const getTrendColor = () => {
    if (trend === "up") return theme.palette.success.main;
    if (trend === "down") return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  // Determine if we should use CountUp animation
  // Don't animate revenue values as per requirement
  const shouldAnimate = useAnimation && !isRevenue;

  // Format numeric value for display with or without animation
  const renderValue = () => {
    // If it's already a string or we shouldn't animate, just display it
    if (typeof value === "string" || !shouldAnimate) {
      return <>{value}</>;
    }

    // If it's a number and we should animate, use CountUp
    return <CountUp end={value} duration={2} separator="." decimal="," />;
  };

  return (
    <Tooltip title={tooltip || ""} arrow={!!tooltip}>
      <Grow in={true} timeout={800}>
        <Card
          elevation={0}
          className="transition-all duration-300 hover:shadow-md"
          sx={{
            height: "100%",
            p: 2.5,
            borderRadius: 2.5,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            border: `1px solid ${theme.palette.grey[200]}`,
            overflow: "hidden",
            position: "relative",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.05)",
              "&::before": {
                transform: "translateX(0)",
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              backgroundColor: theme.palette[color].main,
              transform: "translateX(-4px)",
              transition: "transform 0.3s ease",
            },
          }}
        >
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              color="text.primary"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {renderValue()}
            </Typography>

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {percentage !== undefined && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(getTrendColor(), 0.08),
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: getTrendColor(),
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {trend === "up" && "▲ "}
                {trend === "down" && "▼ "}
                {percentage.toFixed(1)}%
              </Box>
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  color: "text.secondary",
                }}
              >
                so với kỳ trước
              </Typography>
            </Box>
          )}
        </Card>
      </Grow>
    </Tooltip>
  );
};

export default AdminStatCard;
