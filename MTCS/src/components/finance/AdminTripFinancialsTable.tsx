import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  TablePagination,
  alpha,
  Card,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
  Grid,
  Paper,
} from "@mui/material";
import {
  LocalGasStation,
  AttachMoney,
  Warning,
  MoneyOff,
  Close,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { AdminTripFinancial } from "../../types/admin-finance";

interface AdminTripFinancialsTableProps {
  data: AdminTripFinancial[];
  title?: string;
}

const AdminTripFinancialsTable: React.FC<AdminTripFinancialsTableProps> = ({
  data,
  title = "Tài Chính Mỗi Chuyến",
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTrip, setSelectedTrip] = useState<AdminTripFinancial | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const handleTripClick = (trip: AdminTripFinancial) => {
    setSelectedTrip(trip);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTrip(null);
  };

  const getIncidentTypeLabel = (type: string): string => {
    switch (type) {
      case "Incident-Type-1":
        return "Sửa chữa tại chỗ";
      case "Incident-Type-2":
        return "Thay thế xe kéo/rơ moóc";
      case "Incident-Type-3":
        return "Không thể tiếp tục";
      default:
        return type;
    }
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedRows = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      elevation={0}
      className="transition-all duration-300 hover:shadow-md"
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.grey[200]}`,
        backgroundColor: "#ffffff",
        overflow: "hidden",
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
        <Typography variant="h6" fontWeight="bold" className="text-lg">
          {title}
        </Typography>

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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 100 }}
              >
                Mã Chuyến
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 120 }}
              >
                Mã Đơn Hàng
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 150 }}
              >
                Khách Hàng
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 100 }}
              >
                Doanh Thu
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 100 }}
              >
                CP Phát Sinh
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 100 }}
              >
                CP Sự Cố
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 100 }}
              >
                Lợi Nhuận
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, py: 2, minWidth: 80 }}
              >
                % LN
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((trip) => {
              const revenue = trip.revenue || 0;
              const totalExpenses = trip.totalExpenses || 0;
              const incidentCost = trip.incidentCost || 0;
              const profitMargin = trip.profitMargin || 0;
              const profitMarginPercentage = trip.profitMarginPercentage || 0;
              const isProfit = profitMargin > 0;

              return (
                <TableRow
                  key={trip.tripId}
                  hover
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleTripClick(trip)}
                >
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 500, color: "primary.main", py: 2 }}
                    className="border-l-4"
                    style={{ borderLeftColor: theme.palette.primary.main }}
                  >
                    {trip.tripId || "-"}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {trip.trackingCode || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ maxWidth: 150 }}>
                      {trip.customerName || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Typography className="font-medium" variant="body2">
                      {formatCurrency(revenue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      {totalExpenses > 0 ? (
                        <>
                          <MoneyOff fontSize="small" color="error" />
                          <Typography
                            className="font-medium"
                            variant="body2"
                            color="error.main"
                          >
                            {formatCurrency(totalExpenses)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      {incidentCost > 0 ? (
                        <>
                          <Warning fontSize="small" color="warning" />
                          <Typography
                            className="font-medium"
                            variant="body2"
                            color="warning.main"
                          >
                            {formatCurrency(incidentCost)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                    <Typography
                      className="font-semibold"
                      variant="body2"
                      color={isProfit ? "success.main" : "error.main"}
                    >
                      {formatCurrency(profitMargin)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={isProfit ? "success.main" : "error.main"}
                    >
                      {profitMarginPercentage.toFixed(1)}%
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ borderTop: `1px solid ${theme.palette.grey[200]}` }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
          className="border-t border-gray-100"
        />
      </Box>

      {/* Expense Breakdown Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold">
              Chi Tiết Tài Chính Chuyến
            </Typography>
            <Button
              onClick={handleCloseModal}
              sx={{ minWidth: "auto", p: 1 }}
              color="inherit"
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedTrip && (
            <Box>
              {/* Trip Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  border: `1px solid ${theme.palette.grey[200]}`,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mã chuyến
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="primary.main"
                    >
                      {selectedTrip.tripId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mã đơn hàng
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedTrip.trackingCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Khách hàng
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedTrip.customerName}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Financial Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(theme.palette.success.main, 0.02),
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Doanh thu
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {formatCurrency(selectedTrip.revenue)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      border: `1px solid ${alpha(
                        theme.palette.error.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(theme.palette.error.main, 0.02),
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      CP Phát Sinh
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {formatCurrency(selectedTrip.totalExpenses)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      border: `1px solid ${alpha(
                        theme.palette.warning.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(theme.palette.warning.main, 0.02),
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      CP Sự Cố
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {formatCurrency(selectedTrip.incidentCost)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      border: `1px solid ${alpha(
                        selectedTrip.profitMargin > 0
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(
                        selectedTrip.profitMargin > 0
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                        0.02
                      ),
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Lợi nhuận
                    </Typography>
                    <Stack direction="column" alignItems="center" spacing={0.5}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        {selectedTrip.profitMargin > 0 ? (
                          <TrendingUp fontSize="small" color="success" />
                        ) : (
                          <TrendingDown fontSize="small" color="error" />
                        )}
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={
                            selectedTrip.profitMargin > 0
                              ? "success.main"
                              : "error.main"
                          }
                          sx={{
                            fontSize: "0.95rem",
                            lineHeight: 1.2,
                            textAlign: "center",
                            wordBreak: "break-word",
                          }}
                        >
                          {formatCurrency(selectedTrip.profitMargin)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color={
                          selectedTrip.profitMargin > 0
                            ? "success.main"
                            : "error.main"
                        }
                        fontWeight={600}
                      >
                        {selectedTrip.profitMarginPercentage.toFixed(1)}%
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Expense Breakdown */}
              {selectedTrip.expenseBreakdown &&
                Object.keys(selectedTrip.expenseBreakdown).length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Chi Tiết Chi Phí
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(selectedTrip.expenseBreakdown).map(
                        ([type, amount]) => (
                          <Grid item xs={12} sm={6} key={type}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                border: `1px solid ${theme.palette.grey[200]}`,
                                borderRadius: 1,
                                backgroundColor: type.includes("Incident")
                                  ? alpha(theme.palette.warning.main, 0.02)
                                  : alpha(theme.palette.error.main, 0.02),
                              }}
                            >
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {type.includes("Incident")
                                      ? getIncidentTypeLabel(type)
                                      : type}
                                  </Typography>
                                  <Chip
                                    label={
                                      type.includes("Incident")
                                        ? "Sự cố"
                                        : "Phí phát sinh"
                                    }
                                    size="small"
                                    color={
                                      type.includes("Incident")
                                        ? "warning"
                                        : "error"
                                    }
                                    sx={{ mt: 0.5, fontSize: "0.7rem" }}
                                  />
                                </Box>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  color={
                                    type.includes("Incident")
                                      ? "warning.main"
                                      : "error.main"
                                  }
                                >
                                  {formatCurrency(amount)}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseModal} variant="outlined" color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AdminTripFinancialsTable;
