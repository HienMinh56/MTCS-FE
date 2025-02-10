import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  useTheme,
  Fade,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LoginIcon from "@mui/icons-material/Login";

const MTCSLogistics: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 6 }, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocalShippingIcon
              sx={{ mr: 2, color: "primary.main", fontSize: 32 }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              MTCS Logistics
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          pt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: "center", color: "white" }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  letterSpacing: -1,
                }}
              >
                Welcome to MTCS Logistics
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: "800px",
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                Your comprehensive solution for modern supply chain management
                and logistics operations.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default MTCSLogistics;
