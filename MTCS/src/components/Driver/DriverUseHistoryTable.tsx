import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  CircularProgress,
  TablePagination,
  Tooltip,
  Link,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { DriverUseHistoryPagedData } from "../../types/driver";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface DriverUseHistoryTableProps {
  data: DriverUseHistoryPagedData | null;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface StatusDetails {
  label: string;
  color: "success" | "warning" | "error" | "info" | "primary" | "secondary";
  icon: React.ReactElement;
  description: string;
}

const getStatusDetails = (status: string): StatusDetails => {
  const statusMap: Record<string, StatusDetails> = {
    "Đang ở điểm giao": {
      label: "Đang ở điểm giao",
      color: "info",
      icon: <LocationOnIcon fontSize="small" />,
      description: "Xe đã đến điểm giao hàng và đang xử lý",
    },
    "Đã hủy chuyến": {
      label: "Đã hủy chuyến",
      color: "error",
      icon: <CancelIcon fontSize="small" />,
      description: "Chuyến hàng đã bị hủy",
    },
    "Đã hoàn thành": {
      label: "Đã hoàn thành",
      color: "success",
      icon: <CheckCircleIcon fontSize="small" />,
      description: "Chuyến hàng đã hoàn thành thành công",
    },
    "Đang delay": {
      label: "Đang delay",
      color: "warning",
      icon: <WarningAmberIcon fontSize="small" />,
      description: "Chuyến hàng đang bị trì hoãn",
    },
    "Đang đến cảng": {
      label: "Đang đến cảng",
      color: "primary",
      icon: <LocalShippingIcon fontSize="small" />,
      description: "Xe đang di chuyển đến cảng",
    },
    "Đang đến điểm giao/trả container": {
      label: "Đang đến điểm giao/trả",
      color: "primary",
      icon: <LocalShippingOutlinedIcon fontSize="small" />,
      description: "Xe đang di chuyển đến điểm giao hoặc trả container",
    },
    "Đang trên đường giao": {
      label: "Đang trên đường giao",
      color: "info",
      icon: <LocalShippingIcon fontSize="small" />,
      description: "Xe đang trên đường vận chuyển hàng",
    },
    "Chưa bắt đầu": {
      label: "Chưa bắt đầu",
      color: "secondary",
      icon: <ScheduleIcon fontSize="small" />,
      description: "Chuyến hàng chưa được bắt đầu",
    },
    "Đang lấy container": {
      label: "Đang lấy container",
      color: "primary",
      icon: <InventoryIcon fontSize="small" />,
      description: "Xe đang trong quá trình lấy container",
    },
  };

  // Return default value with blue color and no description for undefined status
  return (
    statusMap[status] || {
      label: status,
      color: "primary",
      icon: <ScheduleIcon fontSize="small" />,
      description: "",
    }
  );
};

const DriverUseHistoryTable: React.FC<DriverUseHistoryTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const { user } = useAuth();

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // +1 because API is 1-indexed but MUI is 0-indexed
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary">
          Không có lịch sử sử dụng phương tiện
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ my: 2, borderRadius: 1 }}>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Mã chuyến
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Đầu kéo
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Rơ moóc
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Thời gian ghép
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Thời gian bắt đầu
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Thời gian kết thúc
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Chi tiết
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((history) => {
              const statusDetails = getStatusDetails(history.status);

              return (
                <TableRow key={history.tripId} hover>
                  <TableCell>
                    <Typography variant="body2">{history.tripId}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <DirectionsCarIcon
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {history.tractorPlate}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {history.tractorId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LocalShippingIcon
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {history.trailerPlate}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {history.trailerId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={statusDetails.description}
                      arrow
                      placement="top"
                    >
                      <Chip
                        icon={statusDetails.icon}
                        label={statusDetails.label}
                        color={statusDetails.color}
                        size="small"
                        sx={{
                          minWidth: "130px",
                          "& .MuiChip-icon": { ml: 0.5 },
                          "& .MuiChip-label": { px: 0.5, fontWeight: 500 },
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`Ghép bởi: ${history.matchBy}`}>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="body2">
                          {formatDateTime(history.matchTime)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {history.matchBy === "System"
                            ? "Hệ thống"
                            : history.matchBy}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {history.startTime ? (
                      <Typography variant="body2">
                        {formatDateTime(history.startTime)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Chưa bắt đầu
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {history.endTime ? (
                      <Typography variant="body2">
                        {formatDateTime(history.endTime)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Chưa kết thúc
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`${
                        user?.role === "Admin" ? "/admin" : "/staff-menu"
                      }/trips/${history.tripId}`}
                      color="primary"
                      underline="hover"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      Xem chi tiết
                    </Link>
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
        count={data.totalCount}
        rowsPerPage={pageSize}
        page={page - 1} // API is 1-indexed, MUI is 0-indexed
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </>
  );
};

export default DriverUseHistoryTable;
