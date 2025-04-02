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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../services/customerApi";
import { Customer } from "../types/customer";

const Customers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const result = await getCustomers(
          page + 1,
          rowsPerPage,
          searchTerm
        );

        // The API response doesn't match our expected structure
        // Let's handle it properly by logging and providing fallbacks
        console.log("Customer API response:", result);

        if (result && result.orders && result.orders.items) {
          setCustomers(result.orders.items);
          setTotalCustomers(result.orders.totalCount || 0);
          
          // Calculate total orders from all customers
          const orderSum = result.orders.items.reduce(
            (sum, customer) => sum + (customer.totalOrders || 0), 
            0
          );
          setTotalOrders(orderSum);
        } else {
          // If we receive the raw customer data with orders array
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

  // Transform the raw customer data response if needed
  const transformCustomerData = (data: any): Customer[] => {
    // If the data is an array of customers with embedded orders
    if (Array.isArray(data) && data.length > 0 && data[0].customerId) {
      return data.map(customer => ({
        customerId: customer.customerId,
        companyName: customer.companyName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        createdDate: customer.createdDate,
        totalOrders: customer.orders ? customer.orders.length : 0
      }));
    }
    
    // If the data is already in the expected format
    if (Array.isArray(data) && data.length > 0 && data[0].companyName) {
      return data;
    }
    
    return [];
  };

  // Count total orders for all customers
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

  const handleEdit = (customerId: string) => {
    navigate(`/staff-menu/customers/${customerId}`);
  };

  const handleDelete = (customerId: string) => {
    console.log(`Delete customer with ID: ${customerId}`);
    // Implement delete functionality
  };

  const handleViewCustomerDetail = (customerId: string) => {
    navigate(`/staff-menu/customers/${customerId}`);
  };

  // Calculate new customers (created within the last 7 days)
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
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
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
                    Tổng số khách hàng
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalCustomers}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <PeopleIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
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
                    Khách hàng mới
                  </Typography>
                  <Typography variant="h5" component="div">
                    {getNewCustomersCount()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <PersonAddIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
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
                    Tổng đơn hàng
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalOrders}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <LocalShippingIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}></Grid>
      </Grid>

      {/* Customers Table Section */}
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
              Danh sách khách hàng
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm khách hàng..."
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
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
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
                      <TableCell>{customer.totalOrders}</TableCell>
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
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(customer.customerId);
                            }}
                            title="Chỉnh sửa"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(customer.customerId);
                            }}
                            title="Xóa"
                          >
                            <DeleteIcon />
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
            count={totalCustomers}
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

export default Customers;