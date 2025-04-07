import React from "react";
import DriverDetailDialog from "../components/DriverDetailDialog";
import { Container, Box } from "@mui/material";

const DriverDetailPage: React.FC = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Container maxWidth="lg">
        <DriverDetailDialog standalone={true} />
      </Container>
    </Box>
  );
};

export default DriverDetailPage;
