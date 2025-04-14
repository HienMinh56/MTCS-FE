import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, Button, useTheme, Tooltip } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import StraightenIcon from "@mui/icons-material/Straighten";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Login from "./Authentication/Login";
import logo1 from "../assets/logo1.png";
import { useAuth } from "../contexts/AuthContext";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const [showLoginButton, setShowLoginButton] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      const shouldShow = !token;
      setShowLoginButton(shouldShow);
    };

    checkAuth();

    window.addEventListener("auth-changed", checkAuth);

    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener("auth-changed", checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLoginOpen = () => setLoginOpen(true);
  const handleLoginClose = () => {
    setLoginOpen(false);
    const token = Cookies.get("token");
    setShowLoginButton(!token);
  };

  const handleLogout = () => {
    logout();
    setShowLoginButton(true);
  };

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  const handleNavigateToCalculator = () => {
    window.open("/distance-calculator", "_blank");
  };

  const handleNavigateToTrackOrder = () => {
    navigate("/tracking-order");
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
          <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
            <Tooltip title="Tính khoảng cách và chi phí vận chuyển">
              <Button
                variant="outlined"
                startIcon={<StraightenIcon />}
                onClick={handleNavigateToCalculator}
                size="small"
                color="primary"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 500,
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Tính khoảng cách
              </Button>
            </Tooltip>

            <Tooltip title="Theo dõi đơn hàng của bạn">
              <Button
                variant="outlined"
                startIcon={<LocalShippingIcon />}
                onClick={handleNavigateToTrackOrder}
                size="small"
                color="primary"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 500,
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Theo dõi đơn hàng
              </Button>
            </Tooltip>
          </Box>

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

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {showLoginButton ? (
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
            ) : (
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
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
                Đăng xuất
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Login open={loginOpen} onClose={handleLoginClose} />
    </>
  );
};

export default Header;
