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
} from "@mui/material";
import { LocalGasStation, AttachMoney } from "@mui/icons-material";
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
              <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                Mã Chuyến
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                Mã Đơn Hàng
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                Khách Hàng
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                Doanh Thu
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                Chi Phí Nhiên Liệu
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                Lợi Nhuận
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((trip) => {
              const isProfit = trip.profitMargin > 0;

              return (
                <TableRow
                  key={trip.tripId}
                  hover
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 500, color: "primary.main", py: 2 }}
                    className="border-l-4"
                    style={{ borderLeftColor: theme.palette.primary.main }}
                  >
                    {trip.tripCode || trip.tripId}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    {trip.trackingCode}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    {trip.customerName}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Typography className="font-medium">
                      {trip.revenue.toLocaleString()}
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
                      <LocalGasStation fontSize="small" color="error" />
                      <Typography className="font-medium">
                        {trip.fuelCost.toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 2 }}
                    color={isProfit ? "success" : "error"}
                  >
                    <Typography
                      className="font-semibold"
                      color={isProfit ? "success.main" : "error.main"}
                    >
                      {trip.profitMargin.toLocaleString()}
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
    </Card>
  );
};

export default AdminTripFinancialsTable;
