import React, { useState, useEffect } from "react";
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
  Grid,
  Button,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutButton from "../components/Logout";
import NotificationComponent from "../components/Notification";
import logo1 from "../assets/logo1.png";
import TripManagement from "../components/Trips";
import IncidentReportDialog from "../components/IncidentReportDialog";
import AddTripDialog from "../components/AddTripDialog";

const drawerWidth = 240;

const TripPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [selectedIncidentReport, setSelectedIncidentReport] = useState<any>(null);
  const [addTripDialogOpen, setAddTripDialogOpen] = useState(false);
  const [trips, setTrips] = useState([
    {
      tripId: "T001",
      orderId: "001",
      driverId: "D001",
      tractorId: "TR001",
      trailerId: "TL001",
      startTime: "2025-03-01 08:00:00",
      endTime: "2025-03-01 12:00:00",
      status: "completed",
      distance: 120.5,
      matchType: 1,
      matchBy: "System",
      matchTime: "2025-02-28 15:00:00",
      deliveryReports: [],
      driver: {},
      fuelReports: [],
      incidentReports: [
        {
          reportId: "IR001",
          reportBy: "John Doe",
          incidentType: "Accident",
          description: "Minor accident with no injuries.",
          incidentTime: "2025-03-01 09:00:00",
          location: "Highway 1",
          type: "Minor",
          status: "Resolved",
          resolutionDetails: "Resolved by on-site team.",
          handleBy: "Jane Smith",
          handleTime: "2025-03-01 10:00:00",
          createdDate: "2025-03-01 08:30:00",
          incidentImages: ["/path/to/incident_image1.jpg", "/path/to/incident_image2.jpg"],
          invoiceImages: ["/path/to/invoice_image1.jpg", "/path/to/invoice_image2.jpg"],
          transferImages: ["/path/to/transfer_image1.jpg", "/path/to/transfer_image2.jpg"],
        },
      ],
      inspectionLogs: [],
      order: {},
      tractor: {},
      trailer: {},
      tripStatusHistories: [],
    },
    {
      tripId: "T002",
      orderId: "002",
      driverId: "D002",
      tractorId: "TR002",
      trailerId: "TL002",
      startTime: "2025-03-02 09:00:00",
      status: "in-progress",
      distance: 80.0,
      matchType: 2,
      matchBy: "Admin",
      matchTime: "2025-03-01 10:00:00",
      deliveryReports: [],
      driver: {},
      fuelReports: [],
      incidentReports: [],
      inspectionLogs: [],
      order: {},
      tractor: {},
      trailer: {},
      tripStatusHistories: [],
    },
    // Add more trips as needed
  ]);

  const userId = localStorage.getItem("userId") || "staff-user";

  useEffect(() => {
    console.log("StaffMenu is using userId:", userId);
  }, [userId]);

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

  const handleOpenIncidentReport = (incidentReport: any) => {
    setSelectedIncidentReport(incidentReport);
  };

  const handleCloseIncidentReport = () => {
    setSelectedIncidentReport(null);
  };

  const handleOpenAddTripDialog = () => {
    setAddTripDialogOpen(true);
  };

  const handleCloseAddTripDialog = () => {
    setAddTripDialogOpen(false);
  };

  const handleAddTrip = (newTrip: any) => {
    setTrips((prevTrips) => [...prevTrips, newTrip]);
  };

  const menuItems = [
    {
      id: "orders",
      text: "Đơn hàng",
      icon: <ShoppingCartIcon />,
      selected: activeTab === "orders",
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

  return (
    <Box sx={{ display: "flex" }} className="min-h-screen bg-gray-50">
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "linear-gradient(90deg, #0146C7, #3369d1)",
          color: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ width: "48px" }} />

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

          <Box sx={{ display: "flex" }}>
            <NotificationComponent userId={userId} />

            <IconButton
              size="large"
              edge="end"
              aria-label="account"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpenProfile}>Hồ sơ</MenuItem>
            <MenuItem sx={{ color: "error.main" }}>
              <LogoutButton buttonType="menuItem" onClick={handleMenuClose} />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={true}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#f8f9fa",
            zIndex: 1,
          },
        }}
      >
        <Box
          className="flex items-center p-4"
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
            className="mr-3"
            sx={{
              border: `2px solid ${theme.palette.mtcs.secondary}`,
              bgcolor: theme.palette.mtcs.primary,
            }}
          />
          <div>
            <Typography
              variant="subtitle1"
              className="font-medium"
              sx={{ color: theme.palette.mtcs.primary }}
            >
              Nhân viên
            </Typography>
          </div>
        </Box>
        <Divider />
        <List className="mt-2">
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => handleTabChange(item.id)}
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
                    mr: 2,
                    justifyContent: "center",
                    color: item.selected
                      ? theme.palette.mtcs.primary
                      : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
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
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={handleOpenAddTripDialog}>
            Add Trip
          </Button>
        </Box>
        <Grid container spacing={2}>
          {trips.map((trip) => (
            <Grid item xs={12} md={6} key={trip.tripId}>
              <TripManagement trip={trip} onOpenIncidentReport={handleOpenIncidentReport} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {selectedIncidentReport && (
        <IncidentReportDialog
          incidentReport={selectedIncidentReport}
          onClose={handleCloseIncidentReport}
        />
      )}

      <AddTripDialog
        open={addTripDialogOpen}
        onClose={handleCloseAddTripDialog}
        onAddTrip={handleAddTrip}
      />
    </Box>
  );
};

export default TripPage;