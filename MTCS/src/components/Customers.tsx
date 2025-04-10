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
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import { getCustomers, createCustomer } from "../services/customerApi";
import { Customer } from "../types/customer";

const Customers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    taxNumber: '',
    address: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    taxNumber: '',
    address: ''
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const result = await getCustomers(
          page + 1,
          rowsPerPage,
          searchTerm
        );

        console.log("Customer API response:", result);

        if (result && result.status === 1 && Array.isArray(result.data)) {
          // Process customers with direct response from API
          const processedCustomers = result.data.map(customer => ({
            customerId: customer.customerId,
            companyName: customer.companyName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            createdDate: customer.createdDate,
            // Calculate totalOrders from the orders array
            totalOrders: Array.isArray(customer.orders) ? customer.orders.length : 0
          }));
          
          setCustomers(processedCustomers);
          setTotalCustomers(processedCustomers.length);
          
          // Calculate total orders across all customers
          const orderSum = processedCustomers.reduce(
            (sum, customer) => sum + customer.totalOrders, 
            0
          );
          setTotalOrders(orderSum);
        } else if (result && result.orders && result.orders.items) {
          // Handle the previous response format if needed
          setCustomers(result.orders.items);
          setTotalCustomers(result.orders.totalCount || 0);

          const orderSum = result.orders.items.reduce(
            (sum, customer) => sum + (customer.totalOrders || 0), 
            0
          );
          setTotalOrders(orderSum);
        } else {
          const mockCustomers = transformCustomerData(result);
          if (mockCustomers && mockCustomers.length > 0) {
            setCustomers(mockCustomers);
            setTotalCustomers(mockCustomers.length);
            setTotalOrders(countTotalOrders(mockCustomers));
          } else {
            console.warn("Unexpected API response structure:", result);
            setCustomers([]);
            setTotalCustomers(0);
            setTotalOrders(0);
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
        setTotalCustomers(0);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, rowsPerPage, searchTerm]);

  const transformCustomerData = (data: any): Customer[] => {
    if (Array.isArray(data)) {
      return data.map(customer => ({
        customerId: customer.customerId,
        companyName: customer.companyName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        createdDate: customer.createdDate,
        // Count the number of orders from the orders array
        totalOrders: Array.isArray(customer.orders) ? customer.orders.length : 0
      }));
    }
    return [];
  };

  const countTotalOrders = (customers: Customer[]): number => {
    return customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0);
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm.trim()) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return (
      // Search by Company Name
      (customer.companyName && customer.companyName.toLowerCase().includes(lowerSearchTerm)) ||
      // Search by Email
      (customer.email && customer.email.toLowerCase().includes(lowerSearchTerm)) ||
      // Search by Phone Number
      (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(lowerSearchTerm))
    );
  });

  const handleEdit = (customerId: string) => {
    navigate(`/staff-menu/customers/${customerId}`);
  };

  const handleDelete = (customerId: string) => {
    console.log(`Delete customer with ID: ${customerId}`);
  };

  const handleViewCustomerDetail = (customerId: string) => {
    navigate(`/staff-menu/customers/${customerId}`);
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      companyName: '',
      email: '',
      phoneNumber: '',
      taxNumber: '',
      address: ''
    });
    setErrors({
      companyName: '',
      email: '',
      phoneNumber: '',
      taxNumber: '',
      address: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Tên công ty là bắt buộc';
      isValid = false;
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Tên công ty phải có ít nhất 2 ký tự';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    const phoneRegex = /^[0-9]+$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại chỉ được chứa số';
      isValid = false;
    } else if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 15) {
      newErrors.phoneNumber = 'Số điện thoại phải từ 10 đến 15 số';
      isValid = false;
    }

    if (!formData.taxNumber.trim()) {
      newErrors.taxNumber = 'Mã số thuế là bắt buộc';
      isValid = false;
    } else if (!phoneRegex.test(formData.taxNumber)) {
      newErrors.taxNumber = 'Mã số thuế chỉ được chứa số';
      isValid = false;
    } else if (formData.taxNumber.length < 10) {
      newErrors.taxNumber = 'Mã số thuế phải có ít nhất 10 số';
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
      isValid = false;
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    let success = false; // Flag to track if operation was successful
    
    try {
      // Make the API request and store the response
      const response = await createCustomer(formData);
      console.log("Customer created successfully:", response);
      
      // Check if the response indicates an error
      if (response && typeof response === 'object' && response.status === 400) {
        // This is an error response from the server with status 400
        const errorMessage = response.message || "Lỗi dữ liệu không hợp lệ";
        throw new Error(errorMessage);
      }
      
      // If we get here, it was successful
      success = true;
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Tạo khách hàng thành công!',
        severity: 'success'
      });

      // Reload the customer list
      refreshCustomerList();
      
    } catch (error: any) {
      success = false; // Ensure the success flag is false
      console.error("Error creating customer:", error);
      
      // Get the error message
      const errorMessage = error.message || "Lỗi khi tạo khách hàng. Vui lòng thử lại sau.";
      
      // Highlight fields based on error message
      if (errorMessage.includes('Số điện thoại')) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: 'Số điện thoại đã được sử dụng bởi khách hàng khác'
        }));
      } else if (errorMessage.includes('Mã số thuế')) {
        setErrors(prev => ({
          ...prev,
          taxNumber: 'Mã số thuế đã được sử dụng bởi khách hàng khác'
        }));
      }
      
      // Show error message
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      // Only close the dialog if the operation was successful
      if (success) {
        handleCloseDialog();
      }
      setIsSubmitting(false);
    }
  };

  // Helper function to reload customer list
  const refreshCustomerList = async () => {
    try {
      const result = await getCustomers(page + 1, rowsPerPage, searchTerm);
      if (result && result.orders && result.orders.items) {
        setCustomers(result.orders.items);
        setTotalCustomers(result.orders.totalCount || 0);
        setTotalOrders(result.orders.items.reduce(
          (sum, customer) => sum + (customer.totalOrders || 0), 0
        ));
      } else if (Array.isArray(result)) {
        const processedCustomers = transformCustomerData(result);
        setCustomers(processedCustomers);
        setTotalCustomers(processedCustomers.length);
        setTotalOrders(countTotalOrders(processedCustomers));
      }
    } catch (error) {
      console.error("Error refreshing customer list:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const getNewCustomersCount = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return customers.filter(customer => {
      const createdDate = new Date(customer.createdDate || '');
      return createdDate >= oneWeekAgo;
    }).length;
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
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
            <Box>
              <Typography variant="h6" component="div" fontWeight={500}>
                Danh sách khách hàng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số: {totalCustomers} khách hàng
                {searchTerm.trim() !== '' && ` (Đã lọc: ${filteredCustomers.length} kết quả)`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                size="small"
              >
                Thêm khách hàng
              </Button>
              <TextField
                size="small"
                placeholder="Tìm kiếm theo Công ty, Email, Số điện thoại..."
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
                        onClick={clearSearch}
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
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table
              stickyHeader
              size="small"
              sx={{ minWidth: 650 }}
              aria-label="customers table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Công ty</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Số đơn hàng</TableCell>
                  <TableCell align="center">Hành động</TableCell>
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
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer) => (
                      <TableRow
                        key={customer.customerId}
                        hover
                        onClick={() => handleViewCustomerDetail(customer.customerId)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{customer.companyName}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phoneNumber}</TableCell>
                        <TableCell>
                          {customer.createdDate 
                            ? new Date(customer.createdDate).toLocaleDateString('vi-VN') 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{customer.totalOrders || 0}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCustomerDetail(customer.customerId);
                              }}
                              title="Xem chi tiết"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
            count={filteredCustomers.length}
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

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Thêm khách hàng mới</DialogTitle>
        <form onSubmit={handleCreateCustomer}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="companyName"
                  label="Tên công ty"
                  fullWidth
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="phoneNumber"
                  label="Số điện thoại"
                  fullWidth
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="taxNumber"
                  label="Mã số thuế"
                  fullWidth
                  required
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  error={!!errors.taxNumber}
                  helperText={errors.taxNumber}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Địa chỉ"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  margin="dense"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;