import React from "react";
import {
  Typography,
  Container,
  Box,
  useTheme,
  Fade,
  Grid,
} from "@mui/material";
import Header from "../components/Header";
import TractorIllustration from "../components/TractorIllustration";

const MTCSLogistics: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <Box
        component="section"
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
        {/* Background Elements */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.05,
            backgroundSize: "cover",
          }}
        />

        {/* Main Content */}
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            alignItems="center"
            sx={{
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Text Content - Title with Slogan Below */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box
                  sx={{
                    textAlign: { xs: "center", md: "left" },
                    color: "white",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="h1"
                    noWrap
                    sx={{
                      fontFamily: "'Montserrat', 'Roboto', sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: "2rem", sm: "3rem", md: "3.8rem" },
                      letterSpacing: -0.5,
                      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      width: "100%",
                    }}
                  >
                    Công ty Biển Xanh
                  </Typography>

                  <Box
                    sx={{
                      mt: { xs: 1, sm: 2 },
                      display: "inline-block",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h2"
                      noWrap
                      sx={{
                        fontFamily: "'Racing Sans One', 'Oswald', cursive",
                        fontWeight: 700,
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                        letterSpacing: { xs: -0.2, md: 0 },
                        textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                        whiteSpace: "nowrap",
                        overflow: "visible",
                        opacity: 0.9,
                        display: "inline-block",
                        transform: "skewX(-10deg) rotate(-3deg)",
                        transformOrigin: "bottom left",
                        px: 1,
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.1)",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: -4,
                          left: 8,
                          right: 8,
                          height: 3,
                          borderRadius: 4,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          transform: "skewX(-5deg)",
                        },
                      }}
                    >
                      Giao Siêu Nhanh, Giá Siêu Tốt
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Illustration */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={1500}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    mt: { xs: 4, md: 0 },
                    transform: { xs: "scale(0.9)", md: "scale(1)" },
                    filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))",
                    perspective: "1000px",
                  }}
                >
                  <TractorIllustration width={500} height={400} />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default MTCSLogistics;
