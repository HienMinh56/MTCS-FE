import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RouteIcon from "@mui/icons-material/Route";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import PendingIcon from "@mui/icons-material/Pending"; // Import icon for not started
import DirectionsIcon from "@mui/icons-material/Directions"; // Import icon for going to port
import { getTripForTable } from "../../services/tripApi";
import { getDeliveryStatus } from "../../services/deliveryStatus";
import { trip } from "../../types/trip";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `trip-tab-${index}`,
    "aria-controls": `trip-tabpanel-${index}`,
  };
}

const TripTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [trips, setTrips] = useState<trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [allTrips, setAllTrips] = useState<trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<trip[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [deliveryStatuses, setDeliveryStatuses] = useState<{[key: string]: {statusName: string, color: string}} | null>(null);
  const [statusesLoaded, setStatusesLoaded] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Fetch delivery statuses
  useEffect(() => {
    const fetchDeliveryStatuses = async () => {
      try {
        const statusData = await getDeliveryStatus();
        
        // Convert to a lookup map for easier use
        const statusMap: {[key: string]: {statusName: string, color: string}} = {};
        
        if (Array.isArray(statusData)) {
          statusData.forEach((status) => {
            statusMap[status.statusId] = {
              statusName: status.statusName,
              color: getStatusColor(status.statusId)
            };
          });
        } else if (statusData && typeof statusData === 'object') {
          // Handle if response is an object with a data property
          const dataArray = statusData.data || [];
          dataArray.forEach((status) => {
            statusMap[status.statusId] = {
              statusName: status.statusName,
              color: getStatusColor(status.statusId)
            };
          });
        }
        
        setDeliveryStatuses(statusMap);
        setStatusesLoaded(true);
      } catch (error) {
        console.error("Failed to fetch delivery statuses:", error);
        // Continue without delivery statuses - will fall back to hardcoded values
        setStatusesLoaded(true);
      }
    };
    
    fetchDeliveryStatuses();
  }, []);

  // Helper function to assign color based on status
  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "not_started":
        return "default";
      case "going_to_port":
      case "pick_up_container":
      case "is_delivering":
      case "at_delivery_point":
      case "going_to_port/depot":
        return "info";
      case "completed":
        return "success";
      case "delaying":
        return "warning";
      case "canceled":
        return "error";
      default:
        return "default";
    }
  };

  // Fetch all trips after delivery statuses are loaded
  useEffect(() => {
    if (!statusesLoaded) return;
    
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const result = await getTripForTable();

        if (Array.isArray(result)) {
          setTrips(result);
          setAllTrips(result);
          setFilteredTrips(result);
        } else {
          console.warn("Unexpected API response structure:", result);
          setTrips([]);
          setAllTrips([]);
          setFilteredTrips([]);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        setTrips([]);
        setAllTrips([]);
        setFilteredTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [statusesLoaded]);

  // Filter trips when tab changes or search term changes
  useEffect(() => {
    if (!allTrips.length) return;

    let statusFilter: string | undefined;
    let isOngoingFilter = false;
    
    switch (tabValue) {
      case 0: // All trips
        statusFilter = undefined;
        break;
      case 1: // Completed
        statusFilter = "Completed";
        break;
      case 2: // canceled
        statusFilter = "canceled";
        break;
      case 3: // not_started
        statusFilter = "not_started";
        break;
      case 4: // delaying
        statusFilter = "delaying";
        break;
      case 5: // onGoing (composite filter)
        isOngoingFilter = true;
        break;
      default:
        statusFilter = undefined;
    }

    let filtered = allTrips;
    
    // Apply status filter if selected
    if (statusFilter) {
      filtered = filtered.filter(trip => 
        trip.status && (
          trip.status.toLowerCase() === statusFilter.toLowerCase() || 
          trip.status === statusFilter
        )
      );
    } else if (isOngoingFilter) {
      // Special handling for "onGoing" filter - any of these statuses
      filtered = filtered.filter(trip => 
        trip.status && (
          trip.status.toLowerCase() === "at_delivery_point" ||
          trip.status.toLowerCase() === "going_to_port" ||
          trip.status.toLowerCase() === "going_to_port/depot" ||
          trip.status.toLowerCase() === "is_delivering" ||
          trip.status.toLowerCase() === "pick_up_container"
        )
      );
    }
    
    // Apply search filter if there's a search term
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(trip => {
        // Search by driver name or order tracking code
        const tripId = trip.tripId || ''; 
        const driverName = trip.driverName || ''; 
        const trackingCode = trip.trackingCode || '';
        const driverId = trip.driverId || '';
        
        return (
          tripId.toLowerCase().includes(lowerSearchTerm) ||
          driverName.toLowerCase().includes(lowerSearchTerm) ||
          trackingCode.toLowerCase().includes(lowerSearchTerm) ||
          driverId.toLowerCase().includes(lowerSearchTerm)
        );
      });
      setIsFiltering(true);
    } else {
      setIsFiltering(false);
    }
    
    setFilteredTrips(filtered);
    setTrips(filtered);
  }, [tabValue, searchTerm, allTrips]);

  // Calculate trip counts for summary cards
  const tripCounts = useMemo(() => {
    return {
      total: allTrips.length,
      completed: allTrips.filter(trip => 
        trip.status && trip.status.toLowerCase() === "completed").length,
      canceled: allTrips.filter(trip => 
        trip.status && trip.status.toLowerCase() === "canceled").length,
      delaying: allTrips.filter(trip => 
        trip.status && trip.status.toLowerCase() === "delaying").length,
      notStarted: allTrips.filter(trip => 
        trip.status && trip.status.toLowerCase() === "not_started").length,
      onGoing: allTrips.filter(trip => 
        trip.status && (
          trip.status.toLowerCase() === "at_delivery_point" ||
          trip.status.toLowerCase() === "going_to_port" ||
          trip.status.toLowerCase() === "going_to_port/depot" ||
          trip.status.toLowerCase() === "is_delivering" ||
          trip.status.toLowerCase() === "pick_up_container"
        )).length,
    };
  }, [allTrips]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleViewTripDetail = (tripId: string) => {
    navigate(`/staff-menu/trips/${tripId}`);
  };

  // Status display mapping for UI - enhanced to use delivery status names from API when available
  const getStatusDisplay = (status: string | null) => {
    if (!status) return { label: "Không xác định", color: "default" };
    
    // Check if we have dynamic statuses from API and if this status exists in our map
    if (deliveryStatuses && deliveryStatuses[status.toLowerCase()]) {
      return { 
        label: deliveryStatuses[status.toLowerCase()].statusName, 
        color: deliveryStatuses[status.toLowerCase()].color 
      };
    }
    
    // Fall back to default mapping if status is not found in API data
    switch (status.toLowerCase()) {
      case "completed":
        return { label: "Hoàn thành", color: "success" };
      case "canceled":
        return { label: "Đã hủy", color: "error" };
      case "not_started":
        return { label: "Chưa bắt đầu", color: "default" };
      case "going_to_port":
        return { label: "Đang đến cảng", color: "info" };
      default:
        return { label: status || "Không xác định", color: "default" };
    }
  };
  
  // Kiểm tra xem một trip có phải là canceled hay không (không phân biệt hoa thường)
  const iscanceled = (status: string | null) => {
    if (!status) return false;
    return status.toLowerCase() === "canceled";
  };

  // Trip status options with Vietnamese labels
  const tripStatusOptions = [
    { value: "all", label: "Tất cả", color: "default" },
    { value: "Completed", label: "Hoàn thành", color: "success" },
    { value: "Canceled", label: "Đã hủy", color: "error" },
    { value: "not_started", label: "Chưa bắt đầu", color: "default" },
    { value: "delaying", label: "Đang bị trễ", color: "warning" },
    { value: "onGoing", label: "Đang vận chuyển", color: "info" },
  ];

  // Get current trips for display with pagination
  const getCurrentTrips = () => {
    return filteredTrips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Create a function to handle card clicks
  const handleCardClick = (tabIndex: number) => {
    setTabValue(tabIndex);
    setPage(0); // Reset to first page when changing filter
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Summary Cards - all in one row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            elevation={1} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: tabValue === 0 ? '3px solid #1976d2' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              } 
            }}
            onClick={() => handleCardClick(0)}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Tổng số chuyến
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loading ? <CircularProgress size={20} /> : tripCounts.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <RouteIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            elevation={1} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: tabValue === 1 ? '3px solid #4caf50' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              } 
            }}
            onClick={() => handleCardClick(1)}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Hoàn thành
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loading ? <CircularProgress size={20} /> : tripCounts.completed}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <CheckCircleIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            elevation={1} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: tabValue === 2 ? '3px solid #f44336' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              } 
            }}
            onClick={() => handleCardClick(2)}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đã hủy
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loading ? <CircularProgress size={20} /> : tripCounts.canceled}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <CancelIcon color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            elevation={1} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: tabValue === 3 ? '3px solid #9e9e9e' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              } 
            }}
            onClick={() => handleCardClick(3)}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Chưa bắt đầu
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loading ? <CircularProgress size={20} /> : tripCounts.notStarted}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(158, 158, 158, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <PendingIcon color="action" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            elevation={1} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: tabValue === 4 ? '3px solid #ff9800' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              } 
            }}
            onClick={() => handleCardClick(4)}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đang bị trễ
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loading ? <CircularProgress size={20} /> : tripCounts.delaying}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <PendingIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            elevation={1} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: tabValue === 5 ? '3px solid #2196f3' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              } 
            }}
            onClick={() => handleCardClick(5)}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đang vận chuyển
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loading ? <CircularProgress size={20} /> : tripCounts.onGoing}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(33, 150, 243, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsIcon color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trips Table Section */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 200px)",
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 1,
            }}
          >
            <Typography variant="h6" component="div" fontWeight={500}>
              Danh sách chuyến hàng
              {isFiltering && (
                <Typography 
                  component="span" 
                  color="text.secondary" 
                  sx={{ ml: 1, fontSize: '0.875rem' }}
                >
                  (Đã lọc: {filteredTrips.length} kết quả)
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
              {/* Search input that searches across driver name and tracking code */}
              <TextField
                size="small"
                placeholder="Tìm kiếm theo tên tài xế, mã đơn hàng..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setSearchTerm('')}
                        aria-label="clear search"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { sm: 300 } }}
              />
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="trip status tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: "42px" }}
            >
              {tripStatusOptions.map((status, index) => (
                <Tab
                  key={`status-${index}`}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography component="span" variant="body2">
                        {status.label}
                      </Typography>
                    </Box>
                  }
                  {...a11yProps(index)}
                  sx={{ py: 1, minHeight: "42px" }}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: "hidden" }}>
          <TableContainer sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
            <Table
              stickyHeader
              size="small"
              sx={{ 
                minWidth: 650,
                "& .MuiTableHead-root": {
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "background.paper",
                },
                "& .MuiTableCell-stickyHeader": {
                  backgroundColor: "background.paper",
                  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)"
                }
              }}
              aria-label="trips table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">Mã chuyến</TableCell>
                  <TableCell align="center">Mã vận đơn</TableCell>
                  <TableCell align="center">Tài xế</TableCell>
                  <TableCell align="center">Thời gian bắt đầu</TableCell>
                  <TableCell align="center">Thời gian kết thúc</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box
                        sx={{
                          py: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : getCurrentTrips().length > 0 ? (
                  getCurrentTrips().map((trip, index) => (
                    <TableRow
                      key={trip.tripId || `trip-${index}`}
                      hover
                      onClick={() => trip.tripId && handleViewTripDetail(trip.tripId)}
                      sx={{ 
                        cursor: "pointer",
                        backgroundColor: iscanceled(trip.status) ? "rgba(244, 67, 54, 0.08)" : "inherit" 
                      }}
                    >
                      <TableCell align="center">{trip.tripId || 'N/A'}</TableCell>
                      <TableCell align="center">{trip.trackingCode || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                          {trip.driverName || trip.driverId || 'Chưa phân công'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{formatDate(trip.startTime)}</TableCell>
                      <TableCell align="center">{formatDate(trip.endTime)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={getStatusDisplay(trip.status).label}
                          color={getStatusDisplay(trip.status).color as any}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        {searchTerm ? "Không tìm thấy chuyến hàng phù hợp" : "Không có dữ liệu"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTrips.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TripTable;