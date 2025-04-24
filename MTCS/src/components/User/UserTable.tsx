import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Avatar,
  Card,
  CardContent,
  Paper,
  Pagination,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { format } from "date-fns";
import { getUsers } from "../../services/authApi";
import { InternalUser, UserRole, PaginationParams } from "../../types/auth";
import UserEditModal from "./UserEditModal";

interface UserTableProps {
  searchTerm: string;
  role?: UserRole;
  refreshTrigger: number;
  onUpdateSummary?: (total: number, active: number, inactive: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  searchTerm,
  role,
  refreshTrigger,
  onUpdateSummary,
}) => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);

  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Edit modal state
  const [editModal, setEditModal] = useState({
    open: false,
    user: null as InternalUser | null,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const paginationParams: PaginationParams = {
        pageNumber: page,
        pageSize: rowsPerPage,
      };

      const response = await getUsers(
        paginationParams,
        searchTerm,
        role // Only filter by role
      );
      if (response.success && response.data) {
        setUsers(response.data.items);
        setTotal(response.data.totalCount);

        // Calculate summary statistics
        if (onUpdateSummary) {
          // Count active and inactive users based on status field
          const activeUsers = response.data.items.filter(
            (user) => user.status === 1
          ).length;
          const inactiveUsers = response.data.items.filter(
            (user) => user.status === 0
          ).length;
          onUpdateSummary(response.data.totalCount, activeUsers, inactiveUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAlert({
        open: true,
        message: "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, role, refreshTrigger]);

  const handleNextPage = () => {
    const lastPage = Math.ceil(total / rowsPerPage);
    if (page < lastPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function to get status label based on status field (1=active, 0=inactive)
  const getStatusLabel = (status: number): string => {
    return status === 1 ? "Đang hoạt động" : "Không hoạt động";
  };

  // Helper function to get status color based on status field
  const getStatusColor = (status: number): "success" | "error" => {
    return status === 1 ? "success" : "error";
  };

  const handleUserRowClick = (user: InternalUser) => {
    setEditModal({ open: true, user });
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, total);
  const hasNextPage = page < Math.ceil(total / rowsPerPage);
  const hasPrevPage = page > 1;

  return (
    <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: "calc(100vh - 300px)",
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.1)",
                  borderRadius: 4,
                },
              }}
            >
              <Table
                stickyHeader
                size="small"
                sx={{ minWidth: 650 }}
                aria-label="users table"
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "background.paper" }}>
                    <TableCell align="left" sx={{ fontWeight: 600 }}>
                      Họ và tên
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 600 }}>
                      Email
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Trạng thái
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Ngày tạo
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            p: 3,
                          }}
                        >
                          <CircularProgress size={28} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow
                        key={user.userId}
                        hover
                        onClick={() => handleUserRowClick(user)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                      >
                        <TableCell align="left">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor:
                                  user.status === 1
                                    ? "primary.main"
                                    : "grey.400",
                                fontSize: 14,
                                mr: 1.5,
                              }}
                            >
                              {user.fullName?.substring(0, 1).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">
                              {user.fullName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="left">{user.email}</TableCell>
                        <TableCell align="center">{user.phoneNumber}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={getStatusLabel(user.status)}
                            color={getStatusColor(user.status)}
                            sx={{
                              fontWeight: 500,
                              minWidth: "110px",
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(user.createdDate)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          py={4}
                        >
                          Không tìm thấy người dùng nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderTop: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {total > 0 ? `${from}-${to} trên ${total}` : "Không có dữ liệu"}
              </Typography>
              <Pagination
                count={Math.ceil(total / rowsPerPage)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                disabled={loading}
                size="small"
                color="primary"
                shape="rounded"
                siblingCount={1}
              />
            </Box>
          </Box>

          {/* Edit Modal */}
          {editModal.user && (
            <UserEditModal
              open={editModal.open}
              user={editModal.user}
              onClose={() => setEditModal({ open: false, user: null })}
              onSuccess={fetchUsers}
            />
          )}

          {/* Alert Snackbar */}
          <Snackbar
            open={alert.open}
            autoHideDuration={6000}
            onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
              severity={alert.severity}
              sx={{ width: "100%" }}
              variant="filled"
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserTable;
