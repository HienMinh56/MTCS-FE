import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import DistanceCalculator from "../components/DistanceCalculator";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const DistanceCalculatorPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper
        elevation={0}
        sx={{
          my: 4,
          p: { xs: 2, sm: 3 },
          backgroundColor: "transparent",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              backgroundColor: "primary.main",
              color: "white",
              p: 1,
              borderRadius: "50%",
              width: 56,
              height: 56,
              justifyContent: "center",
            }}
          >
            <LocalShippingIcon fontSize="large" />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight={600}
            sx={{ mt: 1 }}
          >
            Truck Distance Calculator
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{
              maxWidth: 600,
              mx: "auto",
              mb: 4,
            }}
          >
            Easily calculate optimal truck routes, distances, and estimated
            travel times between multiple locations.
          </Typography>
        </Box>

        <DistanceCalculator />
      </Paper>
    </Container>
  );
};

export default DistanceCalculatorPage;
