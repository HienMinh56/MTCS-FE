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
import {
  DownloadOutlined,
  FilterList,
  Search,
  AttachMoney,
} from "@mui/icons-material";
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
              <TableCell sx={{ fontWeight: 600, py: 2, textAlign: "center" }}>
                Tên Công Ty
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 2, textAlign: "center" }}>
                Tổng Doanh Thu
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 2, textAlign: "center" }}>
                Số Đơn Hoàn Thành
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 2, textAlign: "center" }}>
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
                    sx={{
                      fontWeight: 500,
                      py: 2,
                      textAlign: "center",
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
                      justifyContent="center"
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
                    >
                      {customer.totalRevenue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2, textAlign: "center" }}>
                    {customer.completedOrders}
                  </TableCell>
                  <TableCell sx={{ py: 2, textAlign: "center" }}>
                    <Box display="flex" justifyContent="center">
                      <Chip
                        label={`${customer.averageRevenuePerOrder.toLocaleString()}`}
                        size="small"
                        color={isTopThree ? "primary" : "default"}
                        variant={isTopThree ? "filled" : "outlined"}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
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
