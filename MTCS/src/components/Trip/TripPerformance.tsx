import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  useTheme,
  alpha,
  Stack,
  Skeleton,
  Tooltip,
  useMediaQuery,
  Zoom,
  IconButton,
  Divider,
} from "@mui/material";
import CountUp from "react-countup";
import { InfoOutlined, TrendingUp, TrendingDown } from "@mui/icons-material";

interface TripMetric {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "error" | "info" | "secondary";
  prefix?: string;
  secondaryValue?: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}

interface TripPerformanceProps {
  metrics: TripMetric[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

const TripPerformanceCard: React.FC<{
  metric: TripMetric;
  index: number;
  loading: boolean;
}> = ({ metric, index, loading }) => {
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, index * 150); // Slightly slower animation for better visual effect

    return () => clearTimeout(timer);
  }, [index]);

  // Determine trend color
  const getTrendColor = () => {
    if (metric.trend === "up") return theme.palette.success.main;
    if (metric.trend === "down") return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          height: "100%",
          p: 2.5,
          borderRadius: 2.5,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Skeleton width={100} height={20} animation="wave" />
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation="wave"
          />
        </Stack>
        <Skeleton width="70%" height={40} animation="wave" sx={{ mb: 1 }} />
        <Skeleton width="50%" height={20} animation="wave" />
      </Card>
    );
  }

  return (
    <Zoom
      in={animate}
      timeout={500}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card
        elevation={0}
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
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 20px rgba(0, 0, 0, 0.08)",
            borderColor: alpha(theme.palette[metric.color].main, 0.3),
            "& .metric-icon": {
              transform: "scale(1.1)",
              backgroundColor: alpha(theme.palette[metric.color].main, 0.2),
            },
            "& .metric-divider": {
              width: "80%",
              opacity: 0.8,
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            backgroundColor: theme.palette[metric.color].main,
            transform: "translateX(-4px)",
            transition: "transform 0.3s ease",
          },
          "&:hover::before": {
            transform: "translateX(0)",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Box>
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
              {metric.title}
              {metric.description && (
                <Tooltip
                  title={metric.description}
                  placement="top"
                  arrow
                  enterDelay={300}
                  leaveDelay={200}
                >
                  <IconButton size="small" sx={{ ml: 0.5, p: 0.2 }}>
                    <InfoOutlined
                      fontSize="small"
                      color="action"
                      sx={{ fontSize: 16 }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
          </Box>
          <Box
            className="metric-icon"
            sx={{
              width: 45,
              height: 45,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alpha(theme.palette[metric.color].main, 0.1),
              color: theme.palette[metric.color].main,
              transition: "all 0.3s ease",
            }}
          >
            {metric.icon}
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1, mt: 2, position: "relative" }}>
          <Typography
            variant="h4"
            color="text.primary"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              display: "flex",
              alignItems: "baseline",
              fontSize: isMobile ? "1.8rem" : "2.2rem",
            }}
          >
            {metric.prefix && (
              <Box component="span" sx={{ mr: 0.5 }}>
                {metric.prefix}
              </Box>
            )}
            <CountUp
              end={metric.value}
              duration={2}
              separator="."
              decimals={
                metric.unit === "km/h" || metric.unit === "l/100km" ? 1 : 0
              }
              decimal=","
            />
            <Box
              component="span"
              sx={{
                ml: 0.5,
                fontSize: "1rem",
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              {metric.unit}
            </Box>
          </Typography>

          {(metric.secondaryValue || metric.trend) && (
            <Box sx={{ mt: 1.5 }}>
              <Divider
                className="metric-divider"
                sx={{
                  width: "60%",
                  transition: "all 0.3s ease",
                  opacity: 0.5,
                  my: 1.5,
                }}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                {metric.trend && (
                  <Box
                    sx={{
                      color: getTrendColor(),
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {metric.trend === "up" && <TrendingUp fontSize="small" />}
                    {metric.trend === "down" && (
                      <TrendingDown fontSize="small" />
                    )}

                    {metric.trendValue && (
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          fontWeight: 600,
                          ml: 0.5,
                          color: getTrendColor(),
                        }}
                      >
                        {metric.trendValue > 0 ? "+" : ""}
                        {metric.trendValue}%
                      </Typography>
                    )}
                  </Box>
                )}

                {metric.secondaryValue && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {metric.secondaryValue}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Card>
    </Zoom>
  );
};

const TripPerformance: React.FC<TripPerformanceProps> = ({
  metrics,
  loading = false,
  title,
  subtitle,
}) => {
  const theme = useTheme();

  return (
    <Box>
      {(title || subtitle) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                mb: 0.5,
                color: theme.palette.text.primary,
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: -8,
                  width: 40,
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1.5,
                },
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                  <TripPerformanceCard
                    metric={{
                      title: "",
                      value: 0,
                      unit: "",
                      icon: <></>,
                      color: "primary",
                    }}
                    index={index}
                    loading={true}
                  />
                </Grid>
              ))
          : metrics.map((metric, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={4}
                key={`${metric.title}-${index}`}
              >
                <TripPerformanceCard
                  metric={metric}
                  index={index}
                  loading={false}
                />
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};

export default TripPerformance;
