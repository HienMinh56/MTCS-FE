import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import OrderDetailDialog from "./OrderDetails";

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

interface Order {
  id: string;
  customer: string;
  date: string;
  status: string;
  driverName?: string;
  trailerLicense?: string;
  tractorLicense?: string;
  containerCode?: string;
  containerType?: string;
  weight?: string;
  images?: {
    contract: string[];
    exportDocs: string[];
  };
}

const OrderManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "001",
      customer: "Nguyen Van A",
      date: "2025-03-01",
      status: "pending",
      driverName: "Tran Van X",
      trailerLicense: "51R-12345",
      tractorLicense: "51C-54321",
      containerCode: "MSCU1234567",
      containerType: "40HC",
      weight: "28.5 tấn",
      images: {
        contract: ["/path/to/image1.jpg", "/path/to/image2.jpg"],
        exportDocs: ["/path/to/image4.jpg", "/path/to/image5.jpg"],
      },
    },
    {
      id: "002",
      customer: "Tran Thi B",
      date: "2025-03-02",
      status: "processing",
      driverName: "Pham Van Y",
      trailerLicense: "50R-67890",
      tractorLicense: "50C-09876",
      containerCode: "CMAU7654321",
      containerType: "20GP",
      weight: "18.2 tấn",
      images: {
        contract: ["/path/to/image1.jpg"],
        exportDocs: ["/path/to/image4.jpg", "/path/to/image6.jpg"],
      },
    },
    {
      id: "003",
      customer: "Le Van C",
      date: "2025-03-03",
      status: "completed",
      driverName: "Hoang Van Z",
      trailerLicense: "59R-13579",
      tractorLicense: "59C-97531",
      containerCode: "OOLU9876543",
      containerType: "40GP",
      weight: "25.7 tấn",
      images: {
        contract: ["/path/to/image2.jpg", "/path/to/image3.jpg"],
        exportDocs: ["/path/to/image5.jpg"],
      },
    },
    {
      id: "004",
      customer: "Pham Thi D",
      date: "2025-03-04",
      status: "cancelled",
      driverName: "Nguyen Van W",
      trailerLicense: "61R-24680",
      tractorLicense: "61C-08642",
      containerCode: "MAEU1122334",
      containerType: "20RF",
      weight: "15.8 tấn",
      images: {
        contract: ["/path/to/image3.jpg"],
        exportDocs: ["/path/to/image6.jpg"],
      },
    },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

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
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleEdit = (orderId: string) => {
    navigate(`/staff-menu/orders/trip/${orderId}`);
  };

  // Order status options with Vietnamese labels
  const orderStatusOptions = [
    { value: "all", label: "Tất cả", color: "default", count: orders.length },
    {
      value: "pending",
      label: "Chờ xử lý",
      color: "warning",
      count: orders.filter((order) => order.status === "pending").length,
    },
    {
      value: "processing",
      label: "Đang xử lý",
      color: "info",
      count: orders.filter((order) => order.status === "processing").length,
    },
    {
      value: "completed",
      label: "Hoàn thành",
      color: "success",
      count: orders.filter((order) => order.status === "completed").length,
    },
    {
      value: "cancelled",
      label: "Đã hủy",
      color: "error",
      count: orders.filter((order) => order.status === "cancelled").length,
    },
  ];

  const filteredOrders = orders.filter((order) =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredOrdersByStatus = (status: string) => {
    if (status === "all") {
      return filteredOrders;
    }
    return filteredOrders.filter((order) => order.status === status);
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
                    {orders.length}
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
                      orders.filter((order) => order.status === "pending")
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
                      orders.filter((order) => order.status === "completed")
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
                      orders.filter((order) => order.status === "cancelled")
                        .length
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
                      <Chip
                        label={status.count}
                        size="small"
                        color="default"
                        sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                      />
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
          {orderStatusOptions.map((status, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
                <Table
                  stickyHeader
                  size="small"
                  sx={{ minWidth: 650 }}
                  aria-label="orders table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredOrdersByStatus(status.value).length > 0 ? (
                      getFilteredOrdersByStatus(status.value).map((order) => (
                        <TableRow
                          key={order.id}
                          hover
                          onClick={() => handleOpenDialog(order)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                order.status === "pending"
                                  ? "Chờ xử lý"
                                  : order.status === "processing"
                                  ? "Đang xử lý"
                                  : order.status === "completed"
                                  ? "Hoàn thành"
                                  : "Đã hủy"
                              }
                              color={
                                order.status === "pending"
                                  ? "warning"
                                  : order.status === "processing"
                                  ? "info"
                                  : order.status === "completed"
                                  ? "success"
                                  : "error"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(order);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(order.id);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={getFilteredOrdersByStatus(status.value).length}
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
            </TabPanel>
          ))}
        </Box>
      </Paper>

      {/* Order Detail Dialog Component */}
      <OrderDetailDialog
        open={openDialog}
        order={selectedOrder}
        onClose={handleCloseDialog}
        onEdit={handleEdit}
      />
    </Box>
  );
};

export default OrderManagement;
