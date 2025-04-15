import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  Typography,
  Button,
  Divider,
  Tooltip,
  useTheme,
  Paper,
  useMediaQuery,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccountCircle,
  StraightenOutlined,
  LocalShipping,
  PersonOutlined,
  PriceChangeOutlined,
  BarChartOutlined,
  MenuOpen,
  ChevronLeft,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/Authentication/Logout";
import NotificationComponent from "../components/Notification";
import logo1 from "../assets/logo1.png";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import FinanceDashboard from "../components/finance/FinanceDashboard";
import Customers from "../components/Customers";
import SystemConfiguration from "../components/SystemConfiguration";

// Placeholder component for the Price Table
const PriceTable: React.FC = () => {
  return (
    <Box sx={{ my: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background:
            "linear-gradient(45deg, rgba(1, 70, 199, 0.8), rgba(1, 70, 199, 0.9))",
          color: "white",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Bảng Giá Dịch Vụ
        </Typography>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Nội dung bảng giá sẽ được cập nhật sớm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tính năng này đang trong quá trình phát triển. Vui lòng quay lại sau.
        </Typography>
      </Paper>
    </Box>
  );
};

const AdminFinanceDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeSideTab, setActiveSideTab] = useState<string>("finance");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const userId = localStorage.getItem("userId") || "admin-user";

  // Profile menu handlers
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setAnchorEl(null);
    navigate("/profile");
  };

  const handleNavigateToCalculator = () => {
    window.open("/distance-calculator", "_blank");
  };

  const handleNavigateToTrackOrder = () => {
    window.open("/tracking-order", "_blank");
  };

  const handleSideTabChange = (tab: string) => {
    setActiveSideTab(tab);
    // Additional logic to handle different sidebar tabs
  };

  const sidebarItems = [
    {
      id: "finance",
      text: "Báo Cáo Tài Chính",
      icon: <BarChartOutlined />,
      selected: activeSideTab === "finance",
    },
    {
      id: "customers",
      text: "Khách Hàng",
      icon: <PersonOutlined />,
      selected: activeSideTab === "customers",
    },
    {
      id: "pricing",
      text: "Bảng Giá",
      icon: <PriceChangeOutlined />,
      selected: activeSideTab === "pricing",
    },
    {
      id: "system-config",
      text: "Cấu Hình Hệ Thống",
      icon: <SettingsIcon />,
      selected: activeSideTab === "system-config",
    },
  ];

  useEffect(() => {
    if (isAuthenticated && user?.role !== "Admin") {
      navigate("/unauthorized");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Box sx={{ display: "flex" }} className="min-h-screen bg-gray-50">
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: "100%",
            md: drawerOpen ? `calc(100% - 240px)` : `calc(100% - 64px)`,
          },
          ml: { xs: 0, md: drawerOpen ? 240 : 64 },
          background: "linear-gradient(90deg, #0146C7, #3369d1)",
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", pr: 2 }}
        >
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Box
            component="img"
            src={logo1}
            alt="MTCS Logo"
            sx={{
              height: 40,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Tooltip title="Công cụ tính khoảng cách">
              <IconButton
                color="inherit"
                onClick={handleNavigateToCalculator}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.25)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                  borderRadius: 1.5,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <StraightenOutlined sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Theo dõi đơn hàng">
              <IconButton
                color="inherit"
                onClick={handleNavigateToTrackOrder}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.25)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                  borderRadius: 1.5,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LocalShipping sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>

            <NotificationComponent userId={userId} size="large" iconSize={28} />

            <IconButton
              size="large"
              edge="end"
              aria-label="account"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{
                ml: 0.5,
                border: "2px solid rgba(255,255,255,0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#4caf50",
                      border: "2px solid white",
                    }}
                  />
                }
              >
                <AccountCircle />
              </Badge>
            </IconButton>
          </Box>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={handleOpenProfile}
              sx={{
                py: 1.5,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              <AccountCircle
                sx={{ mr: 1.5, color: theme.palette.primary.main }}
              />
              Hồ sơ
            </MenuItem>
            <MenuItem
              sx={{
                color: "error.main",
                py: 1.5,
                "&:hover": { backgroundColor: "rgba(211,47,47,0.04)" },
              }}
            >
              <LogoutButton buttonType="menuItem" onClick={handleMenuClose} />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 240 : 64,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerOpen ? 240 : 64,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#f8f9fa",
            zIndex: 1,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            background:
              "linear-gradient(135deg, rgba(1, 70, 199, 0.05), rgba(117, 237, 209, 0.08))",
          }}
        >
          <Avatar
            alt="Admin User"
            sx={{
              mr: drawerOpen ? 2 : 0,
              border: `2px solid ${theme.palette.mtcs.secondary}`,
              bgcolor: theme.palette.mtcs.primary,
            }}
          />
          {drawerOpen && (
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, color: theme.palette.mtcs.primary }}
            >
              Quản trị viên
            </Typography>
          )}
        </Box>
        <Divider />
        <List sx={{ mt: 2 }}>
          {sidebarItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => handleSideTabChange(item.id)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  my: 0.5,
                  mx: 1,
                  borderRadius: 1,
                  background: item.selected
                    ? "linear-gradient(135deg, rgba(1, 70, 199, 0.1), rgba(117, 237, 209, 0.2))"
                    : "inherit",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(1, 70, 199, 0.05), rgba(117, 237, 209, 0.1))",
                  },
                  borderLeft: item.selected
                    ? `4px solid ${theme.palette.mtcs.primary}`
                    : "4px solid transparent",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 2 : 0,
                    justifyContent: "center",
                    color: item.selected
                      ? theme.palette.mtcs.primary
                      : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: item.selected ? "medium" : "normal",
                    }}
                    sx={{
                      color: item.selected
                        ? theme.palette.mtcs.primary
                        : "inherit",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          ml: 0,
          mt: "64px",
          height: "calc(100vh - 64px)",
          overflow: "auto",
          backgroundColor: "#f8f9fa",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, maxWidth: "100%" }}>
            {activeSideTab === "finance" && <FinanceDashboard />}
            {activeSideTab === "customers" && <Customers />}
            {activeSideTab === "pricing" && <PriceTable />}
            {activeSideTab === "system-config" && <SystemConfiguration />}
          </Box>
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default AdminFinanceDashboard;
