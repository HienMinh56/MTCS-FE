import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
  Badge,
  Paper,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarningIcon from "@mui/icons-material/Warning";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import PersonIcon from "@mui/icons-material/Person";
import StraightenIcon from "@mui/icons-material/Straighten";
import RouteIcon from "@mui/icons-material/Route";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import OrderManagement from "../components/Order/OrderTable";
import IncidentManagement from "../components/Incidents";
import Drivers from "./Drivers";
import Tractors from "./Tractors";
import Trailers from "./Trailers";
import Customers from "../components/Customers";
import TripTable from "../components/Trip/TripTable";
import DeliveryStatusPage from "./DeliveryStatusPage";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import LogoutButton from "../components/Authentication/Logout";
import NotificationComponent from "../components/Notification";
import logo1 from "../assets/logo1.png";

const drawerWidth = 240;
const drawerCollapsedWidth = 70;

const StaffMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [drawerOpen, setDrawerOpen] = useState(true);

  const userId = localStorage.getItem("userId") || "staff-user";

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/staff-menu/${tab}`);
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    {
      id: "orders",
      text: "Đơn hàng",
      icon: <ShoppingCartIcon />,
      selected: activeTab === "orders",
    },
    {
      id: "trips",
      text: "Chuyến hàng",
      icon: <RouteIcon />,
      selected: activeTab === "trips",
    },
    {
      id: "incidents",
      text: "Sự cố",
      icon: <WarningIcon />,
      selected: activeTab === "incidents",
    },
    {
      id: "customers",
      text: "Khách hàng",
      icon: <PersonIcon />,
      selected: activeTab === "customers",
    },
    {
      id: "drivers",
      text: "Tài xế",
      icon: <PeopleAltIcon />,
      selected: activeTab === "drivers",
    },
    {
      id: "tractors",
      text: "Đầu kéo",
      icon: <LocalShippingIcon />,
      selected: activeTab === "tractors",
    },
    {
      id: "trailers",
      text: "Rơ-moóc",
      icon: <DirectionsCarFilledIcon />,
      selected: activeTab === "trailers",
    },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "orders":
        return <OrderManagement />;
      case "trips":
        return <TripTable />;
      case "incidents":
        return <IncidentManagement />;
      case "customers":
        return <Customers />;
      case "drivers":
        return <Drivers />;
      case "tractors":
        return <Tractors />;
      case "trailers":
        return <Trailers />;
      case "delivery-status":
        return <DeliveryStatusPage />;
      default:
        return <OrderManagement />;
    }
  };

  return (
    <Box sx={{ display: "flex" }} className="min-h-screen bg-gray-50">
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: "100%",
            sm: drawerOpen
              ? `calc(100% - ${drawerWidth}px)`
              : `calc(100% - ${drawerCollapsedWidth}px)`,
          },
          ml: {
            xs: 0,
            sm: drawerOpen ? drawerWidth : drawerCollapsedWidth,
          },
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
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
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
                }}
              >
                <StraightenIcon sx={{ fontSize: 28 }} />
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
                }}
              >
                <LocalShippingIcon sx={{ fontSize: 28 }} />
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
                <AccountCircleIcon />
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
          width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#f8f9fa",
            zIndex: 1,
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            transition: theme.transitions.create(["width", "box-shadow"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
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
            alt="Staff User"
            src="/static/avatar.jpg"
            sx={{
              mr: drawerOpen ? 2 : 0,
              border: `2px solid ${theme.palette.mtcs.secondary}`,
              bgcolor: theme.palette.mtcs.primary,
              transition: theme.transitions.create(
                ["transform", "box-shadow", "margin"],
                {
                  duration: 200,
                }
              ),
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              },
            }}
          />
          {drawerOpen && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: theme.palette.mtcs.primary,
                opacity: drawerOpen ? 1 : 0,
                transition: theme.transitions.create(["opacity", "transform"], {
                  duration: theme.transitions.duration.standard,
                }),
                transform: drawerOpen ? "translateX(0)" : "translateX(-20px)",
              }}
            >
              {user?.fullName || "Nhân viên"}
            </Typography>
          )}
        </Box>
        <Divider />
        <List sx={{ mt: 2, px: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{ display: "block", mb: 0.5 }}
            >
              <ListItemButton
                onClick={() => handleTabChange(item.id)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  py: 1,
                  borderRadius: 1.5,
                  justifyContent: drawerOpen ? "initial" : "center",
                  background: item.selected
                    ? "linear-gradient(135deg, rgba(1, 70, 199, 0.13), rgba(117, 237, 209, 0.23))"
                    : "transparent",
                  "&:hover": {
                    background: item.selected
                      ? "linear-gradient(135deg, rgba(1, 70, 199, 0.15), rgba(117, 237, 209, 0.25))"
                      : "linear-gradient(135deg, rgba(1, 70, 199, 0.07), rgba(117, 237, 209, 0.12))",
                  },
                  transition: theme.transitions.create(
                    ["background-color", "box-shadow"],
                    {
                      duration: 100,
                    }
                  ),
                  borderLeft: item.selected
                    ? `4px solid ${theme.palette.mtcs.primary}`
                    : "4px solid transparent",
                  boxShadow: item.selected
                    ? "0 2px 5px rgba(0,0,0,0.08)"
                    : "none",
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
                    transition: theme.transitions.create(
                      ["color", "transform", "margin"],
                      {
                        duration: 200,
                      }
                    ),
                    transform: item.selected ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: item.selected ? "medium" : "normal",
                      fontSize: "0.94rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    sx={{
                      color: item.selected
                        ? theme.palette.mtcs.primary
                        : "inherit",
                      opacity: drawerOpen ? 1 : 0,
                      transition: theme.transitions.create(["opacity"], {
                        duration: 200,
                      }),
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box
          sx={{
            mt: "auto",
            mb: 2,
            mx: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              bgcolor: "rgba(1, 70, 199, 0.04)",
              border: "1px solid rgba(1, 70, 199, 0.1)",
              transition: theme.transitions.create(
                ["transform", "box-shadow"],
                {
                  duration: 200,
                }
              ),
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                bgcolor: "rgba(1, 70, 199, 0.06)",
              },
            }}
          ></Paper>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          ml: 0,
          mt: "64px",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Routes>
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/trips" element={<TripTable />} />
          <Route path="/incidents" element={<IncidentManagement />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/tractors" element={<Tractors />} />
          <Route path="/tractors/:tractorId" element={<Tractors />} />
          <Route path="/trailers" element={<Trailers />} />
          <Route path="/trailers/:trailerId" element={<Trailers />} />
          <Route path="/delivery-status" element={<DeliveryStatusPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default StaffMenu;
