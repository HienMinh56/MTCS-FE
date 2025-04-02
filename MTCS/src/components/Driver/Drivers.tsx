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
import CloseIcon from "@mui/icons-material/Close";
import {
  getDrivers,
  getDriverById,
  Driver,
  getDriverStatusText,
  DriverParams,
  PaginatedData,
} from "../../services/DriverApi";
import { useNavigate } from "react-router-dom";
import DriverFilter, { FilterOptions } from "./DriverFilter";
import DriverProfileDialog from "./DriverProfileDialog";

const Drivers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [paginationData, setPaginationData] =
    useState<PaginatedData<Driver> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchDrivers = async (params?: DriverParams) => {
    setLoading(true);
    try {
      const response = await getDrivers({
        pageNumber: params?.pageNumber || page + 1,
        pageSize: params?.pageSize || rowsPerPage,
        status: params?.status || activeFilters.status,
        keyword: params?.keyword !== undefined ? params.keyword : searchTerm,
      });

      setDrivers(response.data.items);
      setPaginationData(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchDrivers({ pageNumber: newPage + 1 });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchDrivers({ pageNumber: 1, pageSize: newRowsPerPage });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchDrivers({ pageNumber: 1, keyword: searchTerm });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (searchTerm) {
      setPage(0);
      fetchDrivers({ pageNumber: 1, keyword: "" });
    }
  };

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const handleApplyFilter = (filterOptions: FilterOptions) => {
    setActiveFilters(filterOptions);
    setPage(0);
    fetchDrivers({
      pageNumber: 1,
      status: filterOptions.status,
    });
  };

  const handleEdit = (driverId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    navigateToDriverDetail(driverId);
  };

  const handleDelete = (driverId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Delete driver with ID: ${driverId}`);
  };

  const navigateToDriverDetail = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
  };

  const handleDriverClick = async (driverId: string) => {
    setProfileLoading(true);
    try {
      const driverData = await getDriverById(driverId);
      setSelectedDriver(driverData);
      setProfileDialogOpen(true);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
  };

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

  const activeDrivers = drivers.filter(
    (driver) => getDriverStatusText(driver.status) === "active"
  ).length;

  const onTripDrivers = drivers.filter(
    (driver) => getDriverStatusText(driver.status) === "on_trip"
  ).length;

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
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
                    {paginationData?.totalCount || 0}
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
                    {activeDrivers}
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
                    {onTripDrivers}
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
                placeholder="Tên/email/số điện thoại"
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={(ev) => {
                  if (ev.key === "Enter") {
                    handleSearchSubmit();
                    ev.preventDefault();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <Box sx={{ display: "flex" }}>
                        <IconButton
                          onClick={handleClearSearch}
                          edge="end"
                          size="small"
                          aria-label="clear search"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={handleSearchSubmit}
                          edge="end"
                          size="small"
                          aria-label="submit search"
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
                onClick={handleOpenFilterDialog}
                color={
                  Object.keys(activeFilters).length > 0 ? "primary" : "inherit"
                }
              >
                Lọc
                {Object.keys(activeFilters).length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "primary.main",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: 12,
                    }}
                  >
                    {Object.keys(activeFilters).length}
                  </Box>
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
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
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Tổng số KM đã chạy</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <TableRow
                        key={driver.driverId}
                        onClick={() => handleDriverClick(driver.driverId)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <TableCell>{driver.fullName}</TableCell>
                        <TableCell>{driver.email}</TableCell>
                        <TableCell>{driver.phoneNumber}</TableCell>
                        <TableCell>
                          {driver.totalKm?.toLocaleString() || "N/A"} KM
                        </TableCell>
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          py={3}
                        >
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
            count={paginationData?.totalCount || 0}
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

      <DriverFilter
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        onApplyFilter={handleApplyFilter}
        currentFilters={activeFilters}
      />

      <DriverProfileDialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        driver={selectedDriver}
        loading={profileLoading}
      />
    </Box>
  );
};

export default Drivers;
