import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LoginIcon from "@mui/icons-material/Login";
import Login from "./Login";

const Header: React.FC = () => {
  const theme = useTheme();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLoginOpen = () => setLoginOpen(true);
  const handleLoginClose = () => setLoginOpen(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar
          sx={{ px: { xs: 2, sm: 4, md: 6 }, justifyContent: "space-between" }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocalShippingIcon
              sx={{
                mr: 2,
                color: theme.palette.mtcs.primary,
                fontSize: { xs: 28, md: 32 },
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.mtcs.primary}, ${theme.palette.mtcs.secondary})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              MTCS - Biển xanh Logistics
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLoginOpen}
            sx={{
              px: { xs: 2, md: 3 },
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              background: `linear-gradient(135deg, ${theme.palette.mtcs.primary}, ${theme.palette.mtcs.primary})`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.mtcs.secondary}, ${theme.palette.mtcs.primary})`,
              },
            }}
          >
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>
      <Login open={loginOpen} onClose={handleLoginClose} />
    </>
  );
};

export default Header;
