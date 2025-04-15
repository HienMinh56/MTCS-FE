import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { getCustomerById } from "../services/customerApi";
import { CustomerDetail } from "../types/customer";

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerDetailPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have a tab specified in the location state (for direct navigation to Orders tab)
  const initialTabValue =
    location.state?.activeTab !== undefined ? location.state.activeTab : 0;
  const [tabValue, setTabValue] = useState(initialTabValue);

  // Add state for orders pagination
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersRowsPerPage, setOrdersRowsPerPage] = useState(5);

  // Add state for contracts pagination
  const [contractsPage, setContractsPage] = useState(0);
  const [contractsRowsPerPage, setContractsRowsPerPage] = useState(5);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;

      setLoading(true);
      try {
        const customerData = await getCustomerById(customerId);
        setCustomer(customerData);
        setError(null);
      } catch (err) {
        console.error("Error fetching customer details:", err);
        setError("Không thể tải thông tin khách hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add a new function to navigate to order details
  const handleViewOrderDetail = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/staff-menu/orders/${orderId}`);
  };

  const handleOrdersChangePage = (event: unknown, newPage: number) => {
    setOrdersPage(newPage);
  };

  const handleOrdersChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOrdersRowsPerPage(parseInt(event.target.value, 10));
    setOrdersPage(0);
  };

  const handleContractsChangePage = (event: unknown, newPage: number) => {
    setContractsPage(newPage);
  };

  const handleContractsChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContractsRowsPerPage(parseInt(event.target.value, 10));
    setContractsPage(0);
  };

  const renderContractsTab = () => (
    <TabPanel value={tabValue} index={2}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Danh sách hợp đồng</Typography>
      </Box>

      {customer?.contracts && customer.contracts.length > 0 ? (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Mã hợp đồng</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(customer.contracts) &&
                  customer.contracts
                    .slice(
                      contractsPage * contractsRowsPerPage,
                      contractsPage * contractsRowsPerPage +
                        contractsRowsPerPage
                    )
                    .map((contract, index) => {
                      const contractId =
                        typeof contract === "object" && contract !== null
                          ? contract.contractId
                          : contract;
                      const startDate =
                        typeof contract === "object" &&
                        contract !== null &&
                        contract.startDate
                          ? new Date(contract.startDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-";
                      const endDate =
                        typeof contract === "object" &&
                        contract !== null &&
                        contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-";
                      const status =
                        typeof contract === "object" && contract !== null
                          ? contract.status === 1
                            ? "Hoạt động"
                            : "Không hoạt động"
                          : "-";

                      return (
                        <TableRow key={index} hover>
                          <TableCell>{contractId}</TableCell>
                          <TableCell>{startDate}</TableCell>
                          <TableCell>{endDate}</TableCell>
                          <TableCell>
                            <Chip
                              label={status}
                              color={
                                status === "Hoạt động" ? "success" : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customer?.contracts?.length || 0}
            rowsPerPage={contractsRowsPerPage}
            page={contractsPage}
            onPageChange={handleContractsChangePage}
            onRowsPerPageChange={handleContractsChangeRowsPerPage}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
          />
        </Box>
      ) : (
        <Alert severity="info">Khách hàng chưa có hợp đồng nào</Alert>
      )}
    </TabPanel>
  );

  const renderOrdersTab = () => (
    <TabPanel value={tabValue} index={1}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Danh sách đơn hàng</Typography>
      </Box>

      {customer?.orders && customer.orders.length > 0 ? (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Tổng giá trị</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(customer.orders) &&
                  customer.orders
                    .slice(
                      ordersPage * ordersRowsPerPage,
                      ordersPage * ordersRowsPerPage + ordersRowsPerPage
                    )
                    .map((order, index) => {
                      const orderId =
                        typeof order === "object" && order !== null
                          ? order.orderId
                          : order;
                      const trackingCode =
                        typeof order === "object" &&
                        order !== null &&
                        order.trackingCode
                          ? order.trackingCode
                          : "N/A";
                      const createdDate =
                        typeof order === "object" &&
                        order !== null &&
                        order.createdDate
                          ? new Date(order.createdDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-";
                      const price =
                        typeof order === "object" &&
                        order !== null &&
                        order.price
                          ? order.price.toLocaleString("vi-VN") + " đ"
                          : "-";
                      const status =
                        typeof order === "object" && order !== null
                          ? order.status
                          : "-";
                      return (
                        <TableRow key={index} hover>
                          <TableCell>{trackingCode}</TableCell>
                          <TableCell>{createdDate}</TableCell>
                          <TableCell align="right">{price}</TableCell>
                          <TableCell>{status}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleViewOrderDetail(e, orderId)}
                              title="Xem chi tiết đơn hàng"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customer?.orders?.length || 0}
            rowsPerPage={ordersRowsPerPage}
            page={ordersPage}
            onPageChange={handleOrdersChangePage}
            onRowsPerPageChange={handleOrdersChangeRowsPerPage}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
          />
        </Box>
      ) : (
        <Alert severity="info">Khách hàng chưa có đơn hàng nào</Alert>
      )}
    </TabPanel>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" onClick={handleBack} sx={{ cursor: "pointer" }}>
            Danh sách khách hàng
          </Link>
          <Typography color="text.primary">
            <Skeleton width={150} />
          </Typography>
        </Breadcrumbs>

        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ mb: 2, borderRadius: 1 }}
              />
              <Skeleton height={30} sx={{ mb: 1 }} />
              <Skeleton height={25} sx={{ mb: 1 }} />
              <Skeleton height={25} sx={{ mb: 1 }} />
              <Skeleton height={25} sx={{ mb: 1 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Skeleton height={40} width="80%" />
              </Box>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Alert severity="info">Không tìm thấy thông tin khách hàng</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          onClick={handleBack}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: "0.8rem" }} />
          Danh sách khách hàng
        </Link>
        <Typography color="text.primary">{customer.companyName}</Typography>
      </Breadcrumbs>

      {/* Header with Actions */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="500">
          Chi tiết khách hàng
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Grid container>
          {/* Customer Info Card */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ borderRight: { md: "1px solid #e0e0e0" } }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 70,
                    height: 70,
                    fontSize: "2rem",
                  }}
                >
                  {customer.companyName && customer.companyName.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6" fontWeight="500">
                    {customer.companyName || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MST: {customer.taxNumber || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Thông tin liên hệ
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                <EmailIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {customer.email || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                <PhoneIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {customer.phoneNumber || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", my: 1 }}>
                <BusinessIcon
                  fontSize="small"
                  color="primary"
                  sx={{ mr: 1, mt: 0.3 }}
                />
                <Typography variant="body2">
                  {customer.address || "N/A"}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Thông tin hồ sơ
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo:
                </Typography>
                <Typography variant="body2">
                  {formatDate(customer.createdDate)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Người tạo:
                </Typography>
                <Typography variant="body2">
                  {customer.createdBy || "N/A"}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Lần cập nhật cuối:
                </Typography>
                <Typography variant="body2">
                  {formatDate(customer.modifiedDate)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Chip
                  icon={<AssignmentIcon />}
                  label={`${customer.contracts?.length || 0} Hợp đồng`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  color="primary"
                />
                <Chip
                  icon={<LocalShippingIcon />}
                  label={`${customer.orders?.length || 0} Đơn hàng`}
                  variant="outlined"
                  size="small"
                  color="primary"
                />
              </Box>
            </Box>
          </Grid>

          {/* Tabs Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="customer details tabs"
                >
                  <Tab label="Tổng quan" />
                  <Tab label="Đơn hàng" />
                  <Tab label="Hợp đồng" />
                </Tabs>
              </Box>

              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Thông tin chi tiết
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Tên công ty
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.companyName}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.email}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.phoneNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Mã số thuế
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.taxNumber || "N/A"}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Địa chỉ
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.address || "N/A"}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Trạng thái
                          </Typography>
                          <Chip
                            label={
                              customer.deletedDate ? "Đã xóa" : "Đang hoạt động"
                            }
                            color={customer.deletedDate ? "error" : "success"}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Orders Tab */}
              {renderOrdersTab()}

              {/* Contracts Tab */}
              {renderContractsTab()}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerDetailPage;
