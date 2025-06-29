import React, { useState } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Chip,
  Button,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import {
  DownloadOutlined,
  FilterList,
  Search,
  AttachMoney,
} from "@mui/icons-material";
import { PagedCustomerRevenue } from "../../types/admin-finance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface AdminCustomerRevenueTableProps {
  data: PagedCustomerRevenue;
  title?: string;
  loading?: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

const AdminCustomerRevenueTable: React.FC<AdminCustomerRevenueTableProps> = ({
  data,
  title = "Doanh Thu Khách Hàng",
  loading = false,
  onPageChange,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCustomerClick = (customerId: string) => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/customers/${customerId}`, {
      state: { activeTab: 1 },
    });
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1, data.pageSize);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageChange(1, newPageSize);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const getPaymentStatusColor = (paidOrders: number, unpaidOrders: number) => {
    if (unpaidOrders === 0) return "success";
    if (paidOrders === 0) return "error";
    return "warning";
  };

  const getPaymentStatusText = (paidOrders: number, unpaidOrders: number) => {
    if (unpaidOrders === 0) return "Thanh toán đủ";
    if (paidOrders === 0) return "Chưa thanh toán";
    return "Một phần";
  };

  return (
    <Card
      elevation={0}
      className="transition-all duration-300 hover:shadow-md"
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.grey[200]}`,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.grey[100]}`,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" className="text-lg">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className="text-sm mt-1"
          >
            Tổng khách hàng: {data.totalCount}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              mr: 1,
            }}
          >
            <AttachMoney
              fontSize="small"
              sx={{ mr: 0.5, color: "info.main" }}
            />
            <Typography variant="body2" fontWeight={500} color="info.main">
              Đơn vị: VNĐ
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer sx={{ flexGrow: 1 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "left",
                    paddingLeft: 3,
                    minWidth: 200,
                  }}
                >
                  Tên Công Ty
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  Tổng Doanh Thu
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 100,
                  }}
                >
                  CP Phát sinh
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 100,
                  }}
                >
                  CP Sự Cố
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  Doanh Thu Ròng
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  Số Đơn
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  Trạng Thái TT
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    py: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  DT TB/Đơn
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items?.map((customer, index) => {
                const isTopThree = index < 3;
                const paymentStatusColor = getPaymentStatusColor(
                  customer.paidOrders,
                  customer.unpaidOrders
                );
                const paymentStatusText = getPaymentStatusText(
                  customer.paidOrders,
                  customer.unpaidOrders
                );

                return (
                  <TableRow
                    key={customer.customerId}
                    hover
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      isTopThree ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => handleCustomerClick(customer.customerId)}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        py: 2,
                        textAlign: "left",
                        paddingLeft: 3,
                        borderLeftColor: isTopThree
                          ? theme.palette.primary.main
                          : "transparent",
                        borderLeftWidth: isTopThree ? 4 : 0,
                        borderLeftStyle: isTopThree ? "solid" : "none",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        justifyContent="flex-start"
                      >
                        {isTopThree && (
                          <Chip
                            label={index + 1}
                            size="small"
                            color="primary"
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.75rem",
                              "& .MuiChip-label": { p: 0 },
                            }}
                          />
                        )}
                        <Typography fontWeight={isTopThree ? 600 : 500}>
                          {customer.companyName}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Typography
                        fontWeight={isTopThree ? 600 : 500}
                        color={isTopThree ? "primary.main" : "inherit"}
                        variant="body2"
                      >
                        {formatCurrency(customer.totalRevenue)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color={
                          customer.totalExpenses > 0
                            ? "error.main"
                            : "text.secondary"
                        }
                        fontWeight={customer.totalExpenses > 0 ? 600 : 400}
                      >
                        {customer.totalExpenses > 0
                          ? formatCurrency(customer.totalExpenses)
                          : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color={
                          customer.totalIncidentCosts > 0
                            ? "warning.main"
                            : "text.secondary"
                        }
                        fontWeight={customer.totalIncidentCosts > 0 ? 600 : 400}
                      >
                        {customer.totalIncidentCosts > 0
                          ? formatCurrency(customer.totalIncidentCosts)
                          : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          customer.netRevenue > 0
                            ? "success.main"
                            : customer.netRevenue < 0
                            ? "error.main"
                            : "text.secondary"
                        }
                      >
                        {customer.netRevenue !== 0
                          ? formatCurrency(customer.netRevenue)
                          : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Typography variant="body2" fontWeight={500}>
                        {customer.completedOrders}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Stack
                        direction="column"
                        spacing={0.5}
                        alignItems="center"
                      >
                        <Chip
                          label={paymentStatusText}
                          size="small"
                          color={paymentStatusColor}
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            minWidth: 80,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {customer.paidOrders}/{customer.completedOrders}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: "center" }}>
                      <Box display="flex" justifyContent="center">
                        <Chip
                          label={
                            customer.averageRevenuePerOrder > 0
                              ? formatCurrency(customer.averageRevenuePerOrder)
                              : "-"
                          }
                          size="small"
                          color={isTopThree ? "primary" : "default"}
                          variant={isTopThree ? "filled" : "outlined"}
                          sx={{
                            fontWeight: 600,
                            minWidth: 100,
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {(!data.items || data.items.length === 0) && !loading && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Không có dữ liệu để hiển thị
          </Typography>
        </Box>
      )}

      <TablePagination
        component="div"
        count={data.totalCount}
        page={data.currentPage - 1}
        onPageChange={handleChangePage}
        rowsPerPage={data.pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Số dòng:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Card>
  );
};

export default AdminCustomerRevenueTable;
