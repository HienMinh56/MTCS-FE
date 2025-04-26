import React, { useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Chip,
  Fade,
  Tooltip,
  useTheme,
  alpha,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  Close,
  CalendarMonth,
  Search,
  LocalShipping,
  Business,
  CreditCard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { OrderSummary } from "../../types/admin-finance";

interface OrdersListModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  orders: OrderSummary[];
  loading?: boolean;
}

const OrdersListModal: React.FC<OrdersListModalProps> = ({
  open,
  onClose,
  title,
  orders,
  loading = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredOrders, setFilteredOrders] = React.useState<OrderSummary[]>(
    []
  );

  // Filter orders when search term changes
  useEffect(() => {
    if (!orders) return;

    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = orders.filter(
      (order) =>
        order.trackingCode?.toLowerCase().includes(lowerSearchTerm) ||
        order.companyName?.toLowerCase().includes(lowerSearchTerm) ||
        order.status?.toLowerCase().includes(lowerSearchTerm)
    );

    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  // Reset search when modal opens/closes or orders change
  useEffect(() => {
    setSearchTerm("");
    setFilteredOrders(orders || []);
  }, [open, orders]);

  // Log props when they change
  useEffect(() => {
    if (open) {
      console.log("OrdersListModal opened with:", {
        title,
        ordersCount: orders?.length || 0,
      });
    }
  }, [open, title, orders]);

  // Format date safely handling potential invalid dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    try {
      const date = parseISO(dateString);
      return isValid(date)
        ? format(date, "dd MMM yyyy", { locale: vi })
        : "N/A";
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "N/A";
    }
  };

  const handleRowClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
    onClose();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";

    if (
      statusLower.includes("completed") ||
      statusLower.includes("hoàn thành")
    ) {
      return "success";
    }
    if (statusLower.includes("pending") || statusLower.includes("chờ")) {
      return "warning";
    }
    if (statusLower.includes("cancelled") || statusLower.includes("hủy")) {
      return "error";
    }
    return "default";
  };

  const translateStatus = (status: string): string => {
    if (!status) return "N/A";

    const statusLower = status.toLowerCase();

    if (statusLower.includes("completed")) {
      return "Đã hoàn thành";
    }
    if (statusLower.includes("pending")) {
      return "Đang chờ xử lý";
    }
    if (statusLower.includes("cancelled")) {
      return "Đã hủy";
    }
    if (statusLower.includes("processing")) {
      return "Đang xử lý";
    }
    if (statusLower.includes("shipping")) {
      return "Đang vận chuyển";
    }

    return status;
  };

  const isUnpaidOrdersList = React.useMemo(() => {
    return title.toLowerCase().includes("chưa thanh toán");
  }, [title]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby="orders-modal-title"
      aria-describedby="orders-modal-description"
      keepMounted={false}
      style={{ zIndex: 9999 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "85%", md: "80%" },
            maxHeight: "85vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            p: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                id="orders-modal-title"
                variant="h6"
                component="h2"
                sx={{ fontWeight: 500 }}
              >
                {title}
              </Typography>
              <Chip
                label={orders?.length || 0}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            </Box>
            <IconButton
              onClick={onClose}
              aria-label="close"
              sx={{
                color: "grey.500",
                "&:hover": {
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  color: "grey.700",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Search field */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo mã theo dõi, khách hàng, trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                gap: 2,
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Đang tải danh sách đơn hàng...
              </Typography>
            </Box>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: "calc(85vh - 200px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E0E0E0",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  borderRadius: "4px",
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              <Table stickyHeader aria-label="orders table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <LocalShipping fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          Mã theo dõi
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          Khách hàng
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          Ngày tạo
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          Ngày giao hàng
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          Giá (VNĐ)
                        </Typography>
                      </Box>
                    </TableCell>
                    {!isUnpaidOrdersList && (
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={500}>
                          Trạng thái
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.orderId}
                      hover
                      onClick={() => handleRowClick(order.orderId)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết đơn hàng">
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              textDecoration: "underline",
                              textUnderlineOffset: "2px",
                              textDecorationColor: alpha(
                                theme.palette.primary.main,
                                0.4
                              ),
                            }}
                          >
                            {order.trackingCode || "N/A"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {order.companyName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDate(order.createdDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDate(order.deliveryDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: order.price
                              ? theme.palette.success.dark
                              : "text.secondary",
                          }}
                        >
                          {order.price ? order.price.toLocaleString() : "N/A"}
                        </Typography>
                      </TableCell>
                      {!isUnpaidOrdersList && (
                        <TableCell align="center">
                          <Chip
                            label={translateStatus(order.status) || "N/A"}
                            size="small"
                            color={getStatusColor(order.status) as any}
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              minWidth: "90px",
                              justifyContent: "center",
                            }}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                py: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 2,
              }}
            >
              <LocalShipping
                sx={{
                  fontSize: 48,
                  color: alpha(theme.palette.text.secondary, 0.3),
                  mb: 2,
                }}
              />
              <Typography
                sx={{
                  textAlign: "center",
                  color: "text.secondary",
                  maxWidth: "80%",
                  mb: 1,
                }}
              >
                {searchTerm
                  ? "Không tìm thấy đơn hàng khớp với từ khóa tìm kiếm"
                  : "Không có đơn hàng nào."}
              </Typography>
              {searchTerm && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSearchTerm("")}
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </Box>
          )}

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-end",
              pt: 1,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              color="primary"
              size="medium"
              sx={{
                borderRadius: 2,
                px: 3,
              }}
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default OrdersListModal;
