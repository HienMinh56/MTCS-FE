import React, { useState, useEffect } from "react";
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
  Button,
  InputAdornment,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { getAllDrivers, Driver, getDriverStatusText } from "../services/DriverApi";
import { useNavigate } from "react-router-dom";

const Drivers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch drivers from API
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const data = await getAllDrivers();
        // Add mock data for missing properties (this should be removed when API provides all data)
        const enhancedData = data.map(driver => ({
          ...driver,
          phoneNumber: driver.phoneNumber || "N/A",
          // Removed the birthDate mock data
          totalKm: driver.totalKm || Math.floor(Math.random() * 2000 + 500),
        }));
        setDrivers(enhancedData);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (driverId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevents row click event from firing
    }
    navigateToDriverDetail(driverId);
  };

  const handleDelete = (driverId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents row click event from firing
    console.log(`Delete driver with ID: ${driverId}`);
  };
  
  const navigateToDriverDetail = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
  };

  // Filtered drivers based on search term
  const filteredDrivers = drivers.filter((driver) =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.email && driver.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Status chip component
  const getStatusChip = (status: number) => {
    const statusText = getDriverStatusText(status);
    switch (statusText) {
      case "active":
        return <Chip label="Hoạt động" color="success" size="small" />;
      case "inactive":
        return <Chip label="Không hoạt động" color="error" size="small" />;
      case "on_trip":
        return <Chip label="Đang trên đường" color="warning" size="small" />;
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  // Format birth date to display as DD/MM/YYYY or return N/A if null/empty
  const formatBirthDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={4}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
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
                    Tổng số tài xế
                  </Typography>
                  <Typography variant="h5" component="div">
                    {drivers.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <PersonIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
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
                    Tài xế đang hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      drivers.filter((driver) => getDriverStatusText(driver.status) === "active")
                        .length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
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
                    Đang trong chuyến đi
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      drivers.filter((driver) => getDriverStatusText(driver.status) === "on_trip")
                        .length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drivers Table Section */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
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
              Danh sách tài xế
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm tài xế..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Lọc
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
              <Table
                stickyHeader
                size="small"
                sx={{ minWidth: 650 }}
                aria-label="drivers table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tổng số KM đã chạy</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDrivers.length > 0 ? (
                    filteredDrivers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((driver) => (
                        <TableRow 
                          key={driver.driverId} 
                          onClick={() => navigateToDriverDetail(driver.driverId)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                            } 
                          }}
                        >
                          <TableCell>{driver.fullName}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.totalKm?.toLocaleString()} KM</TableCell>
                          <TableCell>{getStatusChip(driver.status)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleEdit(driver.driverId, e)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleDelete(driver.driverId, e)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          Không có dữ liệu
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredDrivers.length}
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

export default Drivers;