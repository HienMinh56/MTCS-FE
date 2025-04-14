import React from "react";
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
} from "@mui/material";
import { DownloadOutlined, FilterList, Search } from "@mui/icons-material";
import { AdminCustomerRevenue } from "../../types/admin-finance";

interface AdminCustomerRevenueTableProps {
  data: AdminCustomerRevenue[];
  title?: string;
}

const AdminCustomerRevenueTable: React.FC<AdminCustomerRevenueTableProps> = ({
  data,
  title = "Doanh Thu Khách Hàng",
}) => {
  const theme = useTheme();

  // Sắp xếp dữ liệu theo doanh thu giảm dần
  const sortedData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);

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
        <Typography variant="h6" fontWeight="bold" className="text-lg">
          {title}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" spacing={1}>
            <Tooltip title="Lọc dữ liệu">
              <IconButton
                size="small"
                color="primary"
                className="hover:bg-blue-50"
              >
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tìm kiếm">
              <IconButton
                size="small"
                color="primary"
                className="hover:bg-blue-50"
              >
                <Search />
              </IconButton>
            </Tooltip>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined />}
            size="small"
            color="primary"
            className="text-xs rounded-lg"
            sx={{ borderRadius: 2 }}
          >
            Tải Xuống
          </Button>
        </Stack>
      </Box>

      <TableContainer sx={{ flexGrow: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell sx={{ fontWeight: 600, py: 2 }}>Tên Công Ty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>
                Tổng Doanh Thu
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>
                Số Đơn Hoàn Thành
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>
                Doanh Thu TB/Đơn
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((customer, index) => {
              // Add highlighting for top customers
              const isTopThree = index < 3;

              return (
                <TableRow
                  key={customer.customerId}
                  hover
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isTopThree ? "bg-blue-50/30" : ""
                  }`}
                >
                  <TableCell
                    sx={{ fontWeight: 500, py: 2 }}
                    className={isTopThree ? "border-l-4" : ""}
                    style={{
                      borderLeftColor: isTopThree
                        ? theme.palette.primary.main
                        : "transparent",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
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
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Typography
                      fontWeight={isTopThree ? 600 : 500}
                      color={isTopThree ? "primary.main" : "inherit"}
                    >
                      {customer.totalRevenue.toLocaleString()} VNĐ
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    {customer.completedOrders}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Chip
                      label={`${customer.averageRevenuePerOrder.toLocaleString()} VNĐ`}
                      size="small"
                      color={isTopThree ? "primary" : "default"}
                      variant={isTopThree ? "filled" : "outlined"}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {sortedData.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Không có dữ liệu để hiển thị
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default AdminCustomerRevenueTable;
