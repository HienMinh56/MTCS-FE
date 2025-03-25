import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" paragraph>
          Bạn không có quyền để truy cập trang này.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Trở về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
