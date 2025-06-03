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
  Collapse,
} from "@mui/material";
import {
  AccountCircle,
  StraightenOutlined,
  LocalShipping,
  PersonOutlined,
  PriceChangeOutlined,
  BarChartOutlined,
  ShoppingCart as ShoppingCartIcon,
  MenuOpen,
  ChevronLeft,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  ManageAccounts as ManageAccountsIcon,
  ExpandLess,
  ExpandMore,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useAuth } from "../contexts/AuthContext";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LogoutButton from "../components/Authentication/Logout";
import NotificationComponent from "../components/Notification";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import logo1 from "../assets/logo1.png";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import FinanceDashboard from "../components/finance/FinanceDashboard";
import Customers from "../components/Customers";
import SystemConfiguration from "../components/SystemConfiguration";
import PriceTableComponent from "../components/Price/PriceTable";
import UserManagement from "../components/User/UserManagement";
import Drivers from "./Drivers";
import Tractors from "./Tractors";
import OrderTable from "../components/Order/OrderTable";
import Trailers from "./Trailers";
import StraightenIcon from "@mui/icons-material/Straighten";
import DeliveryStatusPage from "./DeliveryStatusPage";
import ExpenseTypeManagement from "../components/ExpenseTypeManagement";

const AdminFinanceDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(false); // State for resource group
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const userId = localStorage.getItem("userId") || "admin-user";

  // Get active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname.split("/").filter(Boolean);
    return path.length > 1 ? path[1] : "finance";
  };

  const [activeSideTab, setActiveSideTab] = useState<string>(
    getActiveTabFromUrl()
  );

  useEffect(() => {
    setActiveSideTab(getActiveTabFromUrl());
  }, [location.pathname]);

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

  const handleResourcesToggle = () => {
    setResourcesOpen(!resourcesOpen);
  };

  const handleSideTabChange = (tab: string) => {
    navigate(`/admin/${tab}`);
  };
  const mainSidebarItems = [
    {
      id: "finance",
      text: "Báo Cáo Hoạt Động",
      icon: <BarChartOutlined />,
      selected: activeSideTab === "finance",
      path: "/admin/finance",
    },
    {
      id: "user-management",
      text: "Quản Lý Nhân Sự",
      icon: <ManageAccountsIcon />,
      selected: activeSideTab === "user-management",
      path: "/admin/user-management",
    },
    {
      id: "pricing",
      text: "Bảng Giá",
      icon: <PriceChangeOutlined />,
      selected: activeSideTab === "pricing",
      path: "/admin/pricing",
    },
    {
      id: "expense-types",
      text: "Quản Lý Loại Phí",
      icon: <ReceiptIcon />,
      selected: activeSideTab === "expense-types",
      path: "/admin/expense-types",
    },
    {
      id: "delivery-status",
      text: "Trạng thái giao hàng",
      icon: <StraightenIcon />,
      selected: activeSideTab === "delivery-status",
      path: "/admin/delivery-status",
    },
    {
      id: "system-config",
      text: "Cấu Hình Hệ Thống",
      icon: <SettingsIcon />,
      selected: activeSideTab === "system-config",
      path: "/admin/system-config",
    },
  ];

  const resourcesItems = [
    {
      id: "customers",
      text: "Khách Hàng",
      icon: <PersonOutlined />,
      selected: activeSideTab === "customers",
      path: "/admin/customers",
    },
    {
      id: "orders",
      text: "Đơn hàng",
      icon: <ShoppingCartIcon />,
      selected: activeSideTab === "orders",
      path: "/admin/orders",
    },
    {
      id: "drivers",
      text: "Tài xế",
      icon: <PeopleAltIcon />,
      selected: activeSideTab === "drivers",
      path: "/admin/drivers",
    },
    {
      id: "tractors",
      text: "Đầu kéo",
      icon: <LocalShippingIcon />,
      selected: activeSideTab === "tractors",
      path: "/admin/tractors",
    },
    {
      id: "trailers",
      text: "Rơ-moóc",
      icon: <DirectionsCarFilledIcon />,
      selected: activeSideTab === "trailers",
      path: "/admin/trailers",
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
          width: drawerOpen ? 240 : 70,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerOpen ? 240 : 70,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#f8f9fa",
            zIndex: 1,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            overflowY: "visible",
            overflowX: "hidden",
            height: "auto", // Set height to auto instead of 100%
            maxHeight: "none", // Remove any max-height constraint
            position: "fixed", // Change from absolute to fixed
            "&:hover": {
              boxShadow: drawerOpen ? "none" : "4px 0px 10px rgba(0,0,0,0.05)",
            },
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
              transition: theme.transitions.create(["margin"], {
                duration: theme.transitions.duration.standard,
              }),
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
              {user?.fullName || "Quản trị viên"}
            </Typography>
          )}
        </Box>
        <Divider />
        <List
          sx={{
            mt: 2,
            px: 1,
            overflowY: "visible",
            maxHeight: "none",
          }}
        >
          {mainSidebarItems.map((item) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{ display: "block", mb: 0.5 }}
            >
              <ListItemButton
                onClick={() => handleSideTabChange(item.id)}
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
                      ["color", "transform"],
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
                      transition: theme.transitions.create(
                        ["opacity", "transform"],
                        {
                          duration: 200,
                        }
                      ),
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1.5 }} />
        <List sx={{ px: 1 }}>
          {/* Resources group header */}
          <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
            <ListItemButton
              onClick={handleResourcesToggle}
              sx={{
                minHeight: 48,
                px: 2.5,
                py: 1,
                borderRadius: 1.5,
                justifyContent: drawerOpen ? "initial" : "center",
                background: resourcesItems.some((item) => item.selected)
                  ? "linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.15))"
                  : "transparent",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.15))",
                },
                borderLeft: resourcesItems.some((item) => item.selected)
                  ? `4px solid ${theme.palette.success.main}`
                  : "4px solid transparent",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 0,
                  justifyContent: "center",
                  color: resourcesItems.some((item) => item.selected)
                    ? theme.palette.success.main
                    : "inherit",
                }}
              >
                <InventoryIcon />
              </ListItemIcon>
              {drawerOpen && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexGrow: 1,
                    opacity: drawerOpen ? 1 : 0,
                    transition: theme.transitions.create(["opacity"], {
                      duration: 200,
                    }),
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: resourcesItems.some((item) => item.selected)
                        ? 500
                        : 400,
                      color: resourcesItems.some((item) => item.selected)
                        ? theme.palette.success.main
                        : "inherit",
                      fontSize: "0.94rem",
                    }}
                  >
                    Giám sát tài nguyên
                  </Typography>
                  {resourcesOpen ? (
                    <ExpandLess
                      sx={{
                        color: resourcesItems.some((item) => item.selected)
                          ? theme.palette.success.main
                          : "inherit",
                        transition: theme.transitions.create(["transform"], {
                          duration: 300,
                        }),
                      }}
                    />
                  ) : (
                    <ExpandMore
                      sx={{
                        color: resourcesItems.some((item) => item.selected)
                          ? theme.palette.success.main
                          : "inherit",
                        transition: theme.transitions.create(["transform"], {
                          duration: 300,
                        }),
                      }}
                    />
                  )}
                </Box>
              )}
            </ListItemButton>
          </ListItem>

          {/* Collapsible resources items */}
          <Collapse
            in={resourcesOpen}
            timeout="auto"
            sx={{
              maxHeight: "100%",
              overflowY: "visible",
              transition: theme.transitions.create(["height", "opacity"], {
                duration: 400,
                easing: theme.transitions.easing.easeInOut,
              }),
            }}
          >
            {resourcesItems.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                sx={{ display: "block", mb: 0.5 }}
              >
                <ListItemButton
                  onClick={() => handleSideTabChange(item.id)}
                  sx={{
                    minHeight: 44,
                    px: 2.5,
                    py: 0.75,
                    ml: drawerOpen ? 1.5 : 0,
                    mr: drawerOpen ? 1 : 0,
                    borderRadius: 1.5,
                    justifyContent: drawerOpen ? "initial" : "center",
                    background: item.selected
                      ? "linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(76, 175, 80, 0.23))"
                      : "transparent",
                    "&:hover": {
                      background: item.selected
                        ? "linear-gradient(135deg, rgba(76, 175, 80, 0.14), rgba(76, 175, 80, 0.24))"
                        : "linear-gradient(135deg, rgba(76, 175, 80, 0.07), rgba(76, 175, 80, 0.15))",
                    },
                    borderLeft: item.selected
                      ? `3px solid ${theme.palette.success.main}`
                      : "3px solid transparent",
                    boxShadow: item.selected
                      ? "0 1px 4px rgba(0,0,0,0.06)"
                      : "none",
                    transition: theme.transitions.create(
                      ["background-color", "box-shadow"],
                      {
                        duration: 100,
                      }
                    ),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 2 : 0,
                      justifyContent: "center",
                      color: item.selected
                        ? theme.palette.success.main
                        : "inherit",
                      transition: theme.transitions.create(
                        ["color", "transform"],
                        {
                          duration: 200,
                        }
                      ),
                      transform: item.selected ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: item.selected ? "medium" : "normal",
                        fontSize: "0.875rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      sx={{
                        color: item.selected
                          ? theme.palette.success.main
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
          </Collapse>
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
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 2 }, // Reduced top padding
              maxWidth: "100%",
            }}
          >
            {" "}
            <Routes>
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/orders" element={<OrderTable />} />
              <Route path="/tractors" element={<Tractors />} />
              <Route path="/trailers" element={<Trailers />} />
              <Route path="/pricing" element={<PriceTableComponent />} />
              <Route
                path="/expense-types"
                element={<ExpenseTypeManagement />}
              />
              <Route path="/system-config" element={<SystemConfiguration />} />
              <Route
                path="/user-management"
                element={
                  <Box sx={{ pt: 0 }}>
                    <UserManagement />
                  </Box>
                }
              />
              <Route path="/delivery-status" element={<DeliveryStatusPage />} />
              <Route
                path="/"
                element={<Navigate to="/admin/finance" replace />}
              />
            </Routes>
          </Box>
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default AdminFinanceDashboard;
