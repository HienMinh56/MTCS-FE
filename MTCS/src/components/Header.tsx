import React, { useState } from "react";
import { AppBar, Toolbar, Box, Button, useTheme } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Login from "./Login";
import logo1 from "../assets/logo1.png";

const Header: React.FC = () => {
  const theme = useTheme();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLoginOpen = () => setLoginOpen(true);
  const handleLoginClose = () => setLoginOpen(false);

  const handleLogoClick = () => {
    // Navigate to home page
    window.location.href = "/";
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#ffffff",
        }}
      >
        <Toolbar
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            px: { xs: 2, sm: 4, md: 6 },
          }}
        >
          {/* Left side - empty for balance */}
          <Box />

          {/* Center - logo */}
          <Box
            component="img"
            src={logo1}
            alt="MTCS Logo"
            onClick={handleLogoClick}
            sx={{
              height: { xs: 40, sm: 50, md: 60 },
              cursor: "pointer",
              display: "block",
              my: 1,
              justifySelf: "center",
            }}
          />

          {/* Right side - login button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
          </Box>
        </Toolbar>
      </AppBar>
      <Login open={loginOpen} onClose={handleLoginClose} />
    </>
  );
};

export default Header;
