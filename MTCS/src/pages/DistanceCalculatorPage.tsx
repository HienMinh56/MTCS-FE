import React from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DistanceCalculator from "../components/DistanceCalculator";
import StraightenIcon from "@mui/icons-material/Straighten";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const DistanceCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        bgcolor: "#f8fafc",
        minHeight: "100vh",
        pt: { xs: 8, sm: 9 },
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* <IconButton
                onClick={handleGoBack}
                sx={{ mr: 1 }}
                color="primary"
                aria-label="back"
              >
                <ArrowBackIcon />
              </IconButton> */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <StraightenIcon sx={{ mr: 1.5, color: "primary.main" }} />
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  component="h1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  Tính khoảng cách
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Công cụ giúp bạn tính toán khoảng cách, thời gian di chuyển và chi
              phí vận chuyển giữa các địa điểm.
            </Typography>
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <DistanceCalculator />
      </Container>
    </Box>
  );
};

export default DistanceCalculatorPage;
