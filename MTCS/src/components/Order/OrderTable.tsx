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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { getOrders, exportExcel } from "../../services/orderApi";
import { OrderStatus, Order, DeliveryType } from "../../types/order";
import OrderCreate from "./OrderCreate";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `order-tab-${index}`,
    "aria-controls": `order-tabpanel-${index}`,
  };
}

const OrderManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // New state variables for export feature
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const status =
          tabValue === 0
            ? undefined
            : tabValue === 1
            ? OrderStatus.Pending
            : tabValue === 2
            ? OrderStatus.Scheduled // Changed from InProgress to Scheduled
            : OrderStatus.Complete;

        const result = await getOrders(
          page + 1,
          rowsPerPage,
          searchTerm,
          status
        );

        // Handle the API response which is coming as a direct array
        if (Array.isArray(result)) {
          setOrders(result);
          setTotalOrders(result.length); // Total is the length of the array
        } else if (result && result.orders) {
          // Fallback to original structure if that's provided instead
          setOrders(result.orders.items || []);
          setTotalOrders(result.orders.totalCount || 0);
        } else {
          // If the response doesn't match either expected structure, set empty data
          console.warn("Unexpected API response structure:", result);
          setOrders([]);
          setTotalOrders(0);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, rowsPerPage, tabValue, searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleEdit = (orderId: string) => {
    navigate(`/staff-menu/orders/${orderId}`);
  };

  const handleViewOrderDetail = (orderId: string) => {
    navigate(`/staff-menu/orders/${orderId}`);
  };
  
  const handleAddNew = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleOrderCreationSuccess = () => {
    // Close the dialog
    setCreateDialogOpen(false);
    
    // Refresh the order list to show the newly created order
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const status =
          tabValue === 0
            ? undefined
            : tabValue === 1
            ? OrderStatus.Pending
            : tabValue === 2
            ? OrderStatus.Scheduled
            : OrderStatus.Complete;

        const result = await getOrders(
          page + 1,
          rowsPerPage,
          searchTerm,
          status
        );

        // Handle the API response
        if (Array.isArray(result)) {
          setOrders(result);
          setTotalOrders(result.length);
        } else if (result && result.orders) {
          setOrders(result.orders.items || []);
          setTotalOrders(result.orders.totalCount || 0);
        } else {
          console.warn("Unexpected API response structure:", result);
          setOrders([]);
          setTotalOrders(0);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  };
  
  // New functions for export feature
  const handleOpenExportModal = () => {
    setExportModalOpen(true);
  };
  
  const handleCloseExportModal = () => {
    setExportModalOpen(false);
    setFromDate(null);
    setToDate(null);
  };
  
  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      
      // Format dates as strings in YYYY-MM-DD format
      const formattedData = {
        fromDate: fromDate ? fromDate.format('YYYY-MM-DD') : null,
        toDate: toDate ? toDate.format('YYYY-MM-DD') : null
      };
      
      await exportExcel(formattedData);
      
      // Close the modal after export completes
      handleCloseExportModal();
    } catch (error) {
      console.error("Error exporting Excel:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Order status options with Vietnamese labels
  const orderStatusOptions = [
    { value: "all", label: "Tất cả", color: "default" },
    {
      value: OrderStatus.Pending,
      label: "Chờ xử lý",
      color: "warning",
    },
    {
      value: OrderStatus.Scheduled,
      label: "Đã lên lịch",
      color: "info",
    },
    {
      value: OrderStatus.Delivering,
      label: "Đang giao hàng",
      color: "info",
    },
    {
      value: OrderStatus.Shipped,
      label: "Đã giao hàng",
      color: "info",
    },
    {
      value: OrderStatus.Complete,
      label: "Hoàn thành",
      color: "success",
    },
  ];

  // Status display mapping for UI
  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return { label: "Chờ xử lý", color: "warning" };
      case OrderStatus.Scheduled:
        return { label: "Đã lên lịch", color: "info" };
      case OrderStatus.Delivering:
        return { label: "Đang giao hàng", color: "info" };
      case OrderStatus.Shipped:
        return { label: "Đã giao hàng", color: "info" };
      case OrderStatus.InProgress:
        return { label: "Đang xử lý", color: "info" };
      case OrderStatus.Complete:
        return { label: "Hoàn thành", color: "success" };
      default:
        return { label: "Unknown", color: "default" };
    }
  };

  // Delivery type display
  const getDeliveryTypeDisplay = (type: DeliveryType) => {
    return type === DeliveryType.Import ? "Nhập khẩu" : "Xuất khẩu";
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
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
                    Tổng số đơn
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalOrders}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <AssignmentIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Other summary cards with same styling adjustments */}
        <Grid item xs={6} sm={6} md={3}>
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
                    Chờ xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      orders.filter(
                        (order) => order.status === OrderStatus.Pending
                      ).length
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
                  <AccessTimeIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                    Hoàn thành
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      orders.filter(
                        (order) => order.status === OrderStatus.Complete
                      ).length
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
                  <CheckCircleIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                    Đã hủy
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      orders.filter(
                        (order) => order.status === OrderStatus.Cancelled
                      ).length
                    }
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
        <Grid item xs={6} sm={6} md={3}>
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
                    Đã lên lịch
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      orders.filter(
                        (order) => order.status === OrderStatus.Scheduled
                      ).length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(33, 150, 243, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <AccessTimeIcon color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table Section */}
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
              Danh sách đơn hàng
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm đơn hàng..."
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
              <Button
                variant="outlined"
                color="success"
                startIcon={<DownloadIcon />}
                size="small"
                onClick={handleOpenExportModal}
              >
                Xuất Excel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddNew}
              >
                Thêm mới
              </Button>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="order status tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: "42px" }}
            >
              {orderStatusOptions.map((status, index) => (
                <Tab
                  key={status.value}
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

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table
              stickyHeader
              size="small"
              sx={{ minWidth: 650 }}
              aria-label="orders table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Ngày giao hàng</TableCell>
                  <TableCell>Loại vận chuyển</TableCell>
                  <TableCell>Giá (VNĐ)</TableCell>
                  <TableCell>Khoảng cách</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
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
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow
                      key={order.trackingCode}
                      hover
                      onClick={() => handleViewOrderDetail(order.orderId)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{order.trackingCode}</TableCell>
                      <TableCell>{order.customerId}</TableCell>
                      <TableCell>
                        {new Date(order.deliveryDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        {getDeliveryTypeDisplay(order.deliveryType)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN").format(order.price)}
                      </TableCell>
                      <TableCell>
                        {order.distance ? `${order.distance} km` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getStatusDisplay(order.status).label}
                          color={getStatusDisplay(order.status).color as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrderDetail(order.orderId);
                            }}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(order.orderId);
                            }}
                            title="Chỉnh sửa"
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        Không có dữ liệu
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
            count={totalOrders}
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

      {/* Order Create Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <OrderCreate 
            onClose={handleCloseCreateDialog} 
            onSuccess={handleOrderCreationSuccess} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Excel Export Dialog */}
      <Dialog
        open={exportModalOpen}
        onClose={handleCloseExportModal}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Xuất dữ liệu đơn hàng
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: 400 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Từ ngày
                </Typography>
                <DatePicker
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: { 
                      fullWidth: true, 
                      size: "small" 
                    }
                  }}
                />
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Đến ngày
                </Typography>
                <DatePicker
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: { 
                      fullWidth: true, 
                      size: "small" 
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseExportModal}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleExportExcel}
            startIcon={<DownloadIcon />}
            disabled={exportLoading}
          >
            {exportLoading ? "Đang xuất..." : "Xuất Excel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;
