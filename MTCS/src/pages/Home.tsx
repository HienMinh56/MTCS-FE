import React from "react";
import {
  Typography,
  Container,
  Box,
  Button,
  useTheme,
  Fade,
} from "@mui/material";
import Header from "../components/Header";

const MTCSLogistics: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Header />

      {/* Main Content */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${theme.palette.mtcs.primary} 0%, ${theme.palette.mtcs.secondary} 100%)`,
          pt: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.1,
            background: "url('/path/to/pattern.png')",
            backgroundSize: "cover",
          }}
        />
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box
              sx={{
                textAlign: "center",
                color: "white",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                  letterSpacing: -1,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Welcome to MTCS Logistics
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 6,
                  opacity: 0.9,
                  maxWidth: "800px",
                  mx: "auto",
                  lineHeight: 1.6,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                }}
              >
                Your comprehensive solution for modern supply chain management
                and logistics operations.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 2,
                  bgcolor: "white",
                  color: theme.palette.mtcs.primary,
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default MTCSLogistics;
