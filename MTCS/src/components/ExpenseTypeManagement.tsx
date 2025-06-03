import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  useTheme,
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { ExpenseType } from "../types/expense-type";
import { expenseTypeApi } from "../services/expenseTypeApi";
import { formatDateString } from "../utils/dateUtils";
import ExpenseTypeModal from "./ExpenseTypeModal";

const ExpenseTypeManagement: React.FC = () => {
  const theme = useTheme();
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedExpenseType, setSelectedExpenseType] =
    useState<ExpenseType | null>(null);

  // Alert states
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchExpenseTypes();
  }, []);
  const fetchExpenseTypes = async () => {
    try {
      setLoading(true);
      const response = await expenseTypeApi.getAllExpenseTypes();
      setExpenseTypes(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching expense types:", error);
      setError("Không thể tải danh sách loại phí. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Modal handlers
  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedExpenseType(null);
    setModalOpen(true);
  };

  const handleEditClick = (expenseType: ExpenseType) => {
    setModalMode("edit");
    setSelectedExpenseType(expenseType);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedExpenseType(null);
  };

  const handleModalSuccess = () => {
    fetchExpenseTypes();
    setAlert({
      open: true,
      message:
        modalMode === "create"
          ? "Tạo loại phí thành công!"
          : "Cập nhật loại phí thành công!",
      severity: "success",
    });
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const getStatusChip = (isActive: number) => {
    return (
      <Chip
        label={isActive === 1 ? "Hoạt động" : "Không hoạt động"}
        color={isActive === 1 ? "success" : "default"}
        size="small"
        sx={{
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  const paginatedData = expenseTypes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          Quản lý loại phí
        </Typography>{" "}
        <Tooltip title="Thêm loại phí mới">
          <IconButton
            color="primary"
            onClick={handleCreateClick}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: theme.palette.grey[50],
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  Mã loại phí
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  Tên loại phí
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  Người tạo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  Ngày tạo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((expenseType) => (
                <TableRow
                  key={expenseType.reportTypeId}
                  sx={{
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 500,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {expenseType.reportTypeId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {expenseType.reportType}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(expenseType.isActive)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {expenseType.createdBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateString(expenseType.createdDate)}
                    </Typography>
                  </TableCell>{" "}
                  <TableCell>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(expenseType)}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.primary.main + "10",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={expenseTypes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.grey[50],
          }}
        />
      </Paper>

      {/* Expense Type Modal */}
      <ExpenseTypeModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        expenseType={selectedExpenseType}
        mode={modalMode}
      />

      {/* Success/Error Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExpenseTypeManagement;
