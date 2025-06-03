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
  TableSortLabel, // Thêm import TableSortLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { getOrders, exportExcel } from "../../services/orderApi";
import { OrderStatus, Order, DeliveryType, IsPay } from "../../types/order";
import OrderCreate from "./OrderCreate";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";

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

// Define search field types
type SearchField = "trackingCode" | "customer" | "deliveryType" | "all";

const OrderManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  // Remove searchField state variable since we'll search across all fields
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Export feature states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [fromDateStr, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDateStr, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Payment filter state
  const [paymentFilter, setPaymentFilter] = useState<IsPay | null>(null);

  // State for all orders (not filtered) to use for counts
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingAllOrders, setLoadingAllOrders] = useState(false);
  const [allFetchedOrders, setAllFetchedOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Thêm state cho chức năng sắp xếp
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "deliveryDate",
    direction: null,
  });

  // Fetch all orders once to use for count calculations
  useEffect(() => {
    const fetchAllOrders = async () => {
      setLoadingAllOrders(true);
      try {
        // Get all orders with large page size and no filters
        const result = await getOrders(1, 1000);

        if (Array.isArray(result)) {
          setAllOrders(result);
        } else if (result && result.orders && result.orders.items) {
          setAllOrders(result.orders.items);
        } else {
          setAllOrders([]);
        }
      } catch (error) {
        console.error("Error fetching all orders:", error);
        setAllOrders([]);
      } finally {
        setLoadingAllOrders(false);
      }
    };

    fetchAllOrders();
  }, []);

  // Combined useEffect to fetch orders and handle filtering
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Map tab values to correct OrderStatus values
        let statusFilter: OrderStatus | undefined;

        switch (tabValue) {
          case 0: // All orders
            statusFilter = undefined;
            break;
          case 1: // Pending
            statusFilter = OrderStatus.Pending;
            break;
          case 2: // Scheduled
            statusFilter = OrderStatus.Scheduled;
            break;
          case 3: // Delivering
            statusFilter = OrderStatus.Delivering;
            break;
          case 4: // Complete - fixed index from 5 to 4 since Shipped is commented out
            statusFilter = OrderStatus.Completed;
            break;
          case 5: // Canceled
            statusFilter = OrderStatus.Canceled;
            break;
          default:
            statusFilter = undefined;
        }

        console.log("Fetching orders with status:", statusFilter);

        // Get data from API, but don't send searchTerm since we'll filter locally
        const result = await getOrders(
          1, // Always get page 1 with a large number of records
          1000, // Get a large batch of orders to handle client-side pagination
          "", // Don't pass searchTerm to API
          statusFilter,
          paymentFilter
        );

        let fetchedOrders: Order[] = [];

        if (Array.isArray(result)) {
          fetchedOrders = result;
          setTotalOrders(result.length);
        } else if (result && result.orders) {
          fetchedOrders = result.orders.items || [];
          setTotalOrders(result.orders.totalCount || 0);
        } else {
          console.warn("Unexpected API response structure:", result);
          fetchedOrders = [];
          setTotalOrders(0);
        }

        // Store fetched orders before filtering
        setAllFetchedOrders(fetchedOrders);

        // Apply search filtering if there's a search term
        if (searchTerm.trim() === "") {
          setOrders(fetchedOrders);
          setFilteredOrders(fetchedOrders);
          setIsFiltering(false);
        } else {
          // Apply filtering
          const lowerSearchTerm = searchTerm.toLowerCase();

          const filtered = fetchedOrders.filter((order) => {
            return (
              (order.trackingCode &&
                order.trackingCode.toLowerCase().includes(lowerSearchTerm)) ||
              (order.customerId &&
                order.customerId.toLowerCase().includes(lowerSearchTerm)) ||
              getDeliveryTypeDisplay(order.deliveryType)
                .toLowerCase()
                .includes(lowerSearchTerm)
            );
          });

          setOrders(filtered);
          setFilteredOrders(filtered);
          setIsFiltering(true);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setFilteredOrders([]);
        setAllFetchedOrders([]);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tabValue, paymentFilter, searchTerm]); // Remove page and rowsPerPage from dependencies

  // Calculate order counts from the allOrders state
  const orderCounts = {
    total: allOrders.length,
    pending: allOrders.filter((order) => order.status === OrderStatus.Pending)
      .length,
    complete: allOrders.filter(
      (order) => order.status === OrderStatus.Completed
    ).length,
    cancelled: allOrders.filter(
      (order) => order.status === OrderStatus.Canceled
    ).length,
    scheduled: allOrders.filter(
      (order) => order.status === OrderStatus.Scheduled
    ).length,
    delivering: allOrders.filter(
      (order) => order.status === OrderStatus.Delivering
    ).length,
    shipped: allOrders.filter((order) => order.status === OrderStatus.Shipped)
      .length,
  };

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

  const { user } = useAuth();

  const handleViewOrderDetail = (orderId: string) => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";

    navigate(`${prefix}/orders/${orderId}`);
  };

  const handleAddNew = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleOrderCreationSuccess = () => {
    // Đóng dialog tạo đơn hàng
    setCreateDialogOpen(false);

    // Đặt lại về trang đầu tiên
    setPage(0);

    // Làm mới dữ liệu đơn hàng
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Lấy tất cả đơn hàng cho counter cards
        const allOrdersResult = await getOrders(1, 1000);
        if (Array.isArray(allOrdersResult)) {
          setAllOrders(allOrdersResult);
        } else if (
          allOrdersResult &&
          allOrdersResult.orders &&
          allOrdersResult.orders.items
        ) {
          setAllOrders(allOrdersResult.orders.items);
        }

        // Lấy dữ liệu đơn hàng theo tab hiện tại
        let statusFilter: OrderStatus | undefined;
        switch (tabValue) {
          case 0:
            statusFilter = undefined;
            break;
          case 1:
            statusFilter = OrderStatus.Pending;
            break;
          case 2:
            statusFilter = OrderStatus.Scheduled;
            break;
          case 3:
            statusFilter = OrderStatus.Delivering;
            break;
          case 4:
            statusFilter = OrderStatus.Completed;
            break;
          case 5:
            statusFilter = OrderStatus.Canceled;
            break;
          default:
            statusFilter = undefined;
        }

        // Lấy dữ liệu đơn hàng từ API
        const result = await getOrders(
          1,
          1000,
          "",
          statusFilter,
          paymentFilter
        );

        let fetchedOrders: Order[] = [];
        if (Array.isArray(result)) {
          fetchedOrders = result;
          setTotalOrders(result.length);
        } else if (result && result.orders) {
          fetchedOrders = result.orders.items || [];
          setTotalOrders(result.orders.totalCount || 0);
        }

        // Cập nhật state với dữ liệu mới
        setAllFetchedOrders(fetchedOrders);
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
        setIsFiltering(false);
        setSearchTerm(""); // Xóa bất kỳ tìm kiếm hiện tại
      } catch (error) {
        console.error("Lỗi khi làm mới dữ liệu đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    // Thực hiện fetch dữ liệu
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
      const fromDateString = fromDateStr
        ? fromDateStr.format("YYYY-MM-DD")
        : null;
      const toDateString = toDateStr ? toDateStr.format("YYYY-MM-DD") : null;

      // Call exportExcel with individual parameters, not as an object
      await exportExcel(fromDateString, toDateString);

      // Close the modal after export completes
      handleCloseExportModal();
    } catch (error) {
      console.error("Error exporting Excel:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Order status options with Vietnamese labels - Update to match OrderStatus values exactly
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
      value: OrderStatus.Completed,
      label: "Hoàn thành",
      color: "success",
    },
    {
      value: OrderStatus.Canceled,
      label: "Đã hủy",
      color: "error",
    },
  ];

  // Status display mapping for UI
  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Canceled:
        return { label: "Đã hủy", color: "error" };
      case OrderStatus.Pending:
        return { label: "Chờ xử lý", color: "warning" };
      case OrderStatus.Scheduled:
        return { label: "Đã lên lịch", color: "info" };
      case OrderStatus.Delivering:
        return { label: "Đang giao hàng", color: "info" };
      case OrderStatus.Completed:
        return { label: "Hoàn thành", color: "success" };
      default:
        return { label: "Unknown", color: "default" };
    }
  };

  // Delivery type display
  const getDeliveryTypeDisplay = (type: DeliveryType) => {
    return type === DeliveryType.Import ? "Nhập" : "Xuất";
  };

  // Helper function to get payment status display
  const getPaymentStatusDisplay = (isPay: IsPay | null) => {
    switch (isPay) {
      case IsPay.Yes:
        return { label: "Đã thanh toán", color: "success" };
      case IsPay.No:
        return { label: "Chưa thanh toán", color: "warning" };
      default:
        return { label: "Không xác định", color: "default" };
    }
  };

  // Update the orders to display (filtered or all)
  const displayedOrders = useMemo(() => {
    return searchTerm.trim() !== "" ? filteredOrders : allFetchedOrders;
  }, [searchTerm, filteredOrders, allFetchedOrders]);

  // Calculate count of filtered results for display
  const filteredCount = useMemo(() => {
    return filteredOrders.length;
  }, [filteredOrders]);

  // Helper function to filter orders by status - similar to incident component
  const getFilteredOrdersByStatus = (status: string) => {
    if (status === "all") {
      return filteredOrders;
    }
    return filteredOrders.filter((order) => order.status === status);
  };

  // Get current orders for display with client-side pagination
  const getCurrentOrders = () => {
    const statusValue = orderStatusOptions[tabValue].value;
    let filtered =
      typeof statusValue === "string" && statusValue === "all"
        ? filteredOrders
        : filteredOrders.filter((order) => order.status === statusValue);

    // Áp dụng sắp xếp theo ngày giao hàng nếu có
    if (sortConfig.key === "deliveryDate" && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.deliveryDate).getTime();
        const dateB = new Date(b.deliveryDate).getTime();

        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Create a function to handle card clicks
  const handleCardClick = (tabIndex: number) => {
    setTabValue(tabIndex);
    setPage(0); // Reset to first page when changing filter
  };

  // Thêm hàm xử lý sắp xếp cho cột ngày giao hàng
  const handleRequestSort = () => {
    const isAsc =
      sortConfig.key === "deliveryDate" && sortConfig.direction === "asc";
    setSortConfig({
      key: "deliveryDate",
      direction: isAsc ? "desc" : "asc",
    });
    setPage(0); // Reset về trang đầu khi sắp xếp
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 0 ? "3px solid #1976d2" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(0)} // All orders - index 0
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
                    Tổng số đơn
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loadingAllOrders ? (
                      <CircularProgress size={20} />
                    ) : (
                      orderCounts.total
                    )}
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
        <Grid item xs={12} sm={6} md={2}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 1 ? "3px solid #ff9800" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(1)} // Pending - index 1
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
                    Chờ xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loadingAllOrders ? (
                      <CircularProgress size={20} />
                    ) : (
                      orderCounts.pending
                    )}
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
        <Grid item xs={12} sm={6} md={2}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 2 ? "3px solid #2196f3" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(2)} // Scheduled - index 2
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
                    Đã lên lịch
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loadingAllOrders ? (
                      <CircularProgress size={20} />
                    ) : (
                      orderCounts.scheduled
                    )}
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
        <Grid item xs={12} sm={6} md={2}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 3 ? "3px solid #00acc1" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(3)} // Delivering - index 3
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
                    Đang giao
                  </Typography>
                  <Typography variant="h5" component="div">
                    {loadingAllOrders ? (
                      <CircularProgress size={20} />
                    ) : (
                      orderCounts.delivering
                    )}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(0, 150, 136, 0.08)",
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
        <Grid item xs={12} sm={6} md={2}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 4 ? "3px solid #4caf50" : "none", // Changed from 5 to 4
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(4)} // Changed from 5 to 4
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
                    {loadingAllOrders ? (
                      <CircularProgress size={20} />
                    ) : (
                      orderCounts.complete
                    )}
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
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 5 ? "3px solid #f44336" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(5)} // Canceled - index 5
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
                    {loadingAllOrders ? (
                      <CircularProgress size={20} />
                    ) : (
                      orderCounts.cancelled
                    )}
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
              Danh sách đơn hàng
              {isFiltering && (
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: "0.875rem" }}
                >
                  (Đã lọc: {filteredCount} kết quả)
                </Typography>
              )}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {/* Simplified search input that searches across all fields */}
              <TextField
                size="small"
                placeholder="Tìm kiếm theo mã đơn, khách hàng, loại VC..."
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
                        onClick={() => setSearchTerm("")}
                        aria-label="clear search"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { sm: 300 } }}
              />

              <Button
                variant="outlined"
                color="success"
                startIcon={<DownloadIcon />}
                size="small"
                onClick={handleOpenExportModal}
              >
                Xuất Excel
              </Button>
              {user?.role !== "Admin" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={handleAddNew}
                >
                  Thêm mới
                </Button>
              )}
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

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TableContainer
            sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{
                minWidth: 650,
                "& .MuiTableHead-root": {
                  position: "sticky",
                  top: 0,
                  zIndex: 1, // Đảm bảo header nằm trên các nội dung khác
                  backgroundColor: "background.paper", // Thêm màu nền cho header
                },
                "& .MuiTableCell-stickyHeader": {
                  backgroundColor: "background.paper", // Phù hợp với theme
                  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)", // Thêm đổ bóng nhẹ
                },
              }}
              aria-label="orders table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">Mã vận chuyển</TableCell>
                  <TableCell align="center">Khách hàng</TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortConfig.key === "deliveryDate"}
                      direction={
                        sortConfig.direction === null
                          ? "asc"
                          : sortConfig.direction
                      }
                      onClick={handleRequestSort}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Ngày giao hàng
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Số lượng đơn</TableCell>
                  <TableCell align="center">Giá (VNĐ)</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Thanh toán</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
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
                ) : getCurrentOrders().length > 0 ? (
                  getCurrentOrders().map((order, index) => (
                    <TableRow
                      key={order.trackingCode || `order-${index}`}
                      hover
                      onClick={() => handleViewOrderDetail(order.orderId)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell align="center">{order.trackingCode}</TableCell>
                      <TableCell align="center">{order.companyName}</TableCell>
                      <TableCell align="center">
                        {new Date(order.createdDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {order.quantity}
                      </TableCell>
                      <TableCell align="center">
                        {new Intl.NumberFormat("vi-VN").format(order.totalAmount ? order.totalAmount : "N/A")}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={getStatusDisplay(order.status).label}
                          color={getStatusDisplay(order.status).color as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={getPaymentStatusDisplay(order.isPay).label}
                          color={
                            getPaymentStatusDisplay(order.isPay).color as any
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        {searchTerm
                          ? "Không tìm thấy đơn hàng phù hợp"
                          : "Không có dữ liệu"}
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
            count={
              orderStatusOptions[tabValue].value === "all"
                ? filteredOrders.length
                : filteredOrders.filter(
                    (order) =>
                      order.status === orderStatusOptions[tabValue].value
                  ).length
            }
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

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {getCurrentOrders().map((order, index) => (
                  <TableRow
                    key={order.trackingCode || `order-${index}`}
                    hover
                    onClick={() => handleViewOrderDetail(order.orderId)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* ... row content ... */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {getCurrentOrders().map((order, index) => (
                  <TableRow
                    key={order.trackingCode || `order-${index}`}
                    hover
                    onClick={() => handleViewOrderDetail(order.orderId)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* ... row content ... */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {getCurrentOrders().map((order, index) => (
                  <TableRow
                    key={order.trackingCode || `order-${index}`}
                    hover
                    onClick={() => handleViewOrderDetail(order.orderId)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* ... row content ... */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {getCurrentOrders().map((order, index) => (
                  <TableRow
                    key={order.trackingCode || `order-${index}`}
                    hover
                    onClick={() => handleViewOrderDetail(order.orderId)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* ... row content ... */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {getCurrentOrders().map((order, index) => (
                  <TableRow
                    key={order.trackingCode || `order-${index}`}
                    hover
                    onClick={() => handleViewOrderDetail(order.orderId)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* ... row content ... */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {getCurrentOrders().map((order, index) => (
                  <TableRow
                    key={order.trackingCode || `order-${index}`}
                    hover
                    onClick={() => handleViewOrderDetail(order.orderId)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* ... row content ... */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>

      {/* Order Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
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
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Xuất dữ liệu đơn hàng</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: 400 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Từ ngày
                </Typography>
                <DatePicker
                  value={fromDateStr}
                  onChange={(newValue) => setFromDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Đến ngày
                </Typography>
                <DatePicker
                  value={toDateStr}
                  onChange={(newValue) => setToDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseExportModal}>Hủy</Button>
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
