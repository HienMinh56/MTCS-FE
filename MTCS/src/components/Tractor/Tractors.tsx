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
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import { getTractors } from "../../services/tractorApi";
import { Tractor, TractorStatus, ContainerType } from "../../types/tractor";
import TractorDetails from "./TractorDetails";
import TractorCreate from "./TractorCreate";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Tractors = () => {
  const navigate = useNavigate();
  const { tractorId } = useParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    repair: 0,
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: "" });

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);

  const fetchTractors = async () => {
    try {
      setLoading(true);
      const result = await getTractors(page, rowsPerPage);

      if (result.success) {
        setTractors(result.data.tractors.items);
        setTotalCount(result.data.tractors.totalCount);
        setSummary({
          total: result.data.allCount,
          active: result.data.activeCount,
          maintenance: result.data.maintenanceDueCount,
          repair: result.data.registrationExpiryDueCount,
        });
      } else {
        console.error("API Error:", result.message);
        setTractors([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching tractors:", error);
      setTractors([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTractors();
  }, [page, rowsPerPage]);

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
  };

  const handleEdit = (tractorId: string) => {
    console.log(`Edit tractor with ID: ${tractorId}`);
  };

  const handleDelete = (tractorId: string) => {
    setDeleteDialog({ open: true, id: tractorId });
  };

  const handleConfirmDelete = async () => {
    try {
      // Add your delete API call here
      console.log(`Deleting tractor with ID: ${deleteDialog.id}`);
      setDeleteDialog({ open: false, id: "" });
    } catch (error) {
      console.error("Error deleting tractor:", error);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/staff-menu/tractors/${id}`);
  };

  // Filtered tractors based on search term
  const filteredTractors = tractors.filter((tractor) =>
    tractor.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: "active", label: "Đang hoạt động", color: "success" },
    { value: "maintenance", label: "Bảo dưỡng", color: "warning" },
    { value: "repair", label: "Đang sửa chữa", color: "error" },
    { value: "inactive", label: "Không hoạt động", color: "default" },
  ];

  // Status chip component
  const getStatusChip = (status: TractorStatus) => {
    switch (status) {
      case TractorStatus.Active:
        return <Chip label="Đang hoạt động" color="success" size="small" />;
      case TractorStatus.Inactive:
        return <Chip label="Không hoạt động" color="error" size="small" />;
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  const getContainerTypeText = (type: ContainerType) => {
    switch (type) {
      case ContainerType.Feet20:
        return "20'";
      case ContainerType.Feet40:
        return "40'";
      default:
        return "Không xác định";
    }
  };

  const handleCreateSuccess = () => {
    fetchTractors(); // Call the existing fetchTractors function
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
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
                    Tổng số đầu kéo
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <LocalShippingIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.active}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <LocalShippingIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                    Cần đăng kiểm
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.repair}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <EventIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                    Cần bảo dưỡng
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.maintenance}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <BuildIcon color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tractors Table Section */}
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
              Danh sách đầu kéo
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                size="small"
              >
                Thêm mới
              </Button>
              <TextField
                size="small"
                placeholder="Tìm kiếm đầu kéo..."
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
              aria-label="tractors table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">Biển số xe</TableCell>
                  <TableCell align="center">Hãng sản xuất</TableCell>
                  <TableCell align="center">Loại container</TableCell>
                  <TableCell align="center">Hạn đăng kiểm</TableCell>
                  <TableCell align="center">Bảo dưỡng tiếp theo</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredTractors.length > 0 ? (
                  filteredTractors.map((tractor) => (
                    <TableRow
                      key={tractor.tractorId}
                      hover
                      onClick={() => handleRowClick(tractor.tractorId)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell align="center">
                        {tractor.licensePlate}
                      </TableCell>
                      <TableCell align="center">{tractor.brand}</TableCell>
                      <TableCell align="center">
                        {getContainerTypeText(tractor.containerType)}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(
                          tractor.registrationExpirationDate
                        ).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(
                          tractor.nextMaintenanceDate
                        ).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(tractor.status)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(tractor.tractorId)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(tractor.tractorId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
            count={totalCount}
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
        <Modal
          open={openCreate}
          onClose={handleCloseCreate}
          aria-labelledby="create-tractor-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: 800,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TractorCreate
                onClose={handleCloseCreate}
                onSuccess={handleCreateSuccess}
              />
            </LocalizationProvider>
          </Box>
        </Modal>

        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, id: "" })}
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>Bạn có chắc chắn muốn xóa đầu kéo này?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: "" })}>
              Hủy
            </Button>
            <Button onClick={handleConfirmDelete} color="error">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <TractorDetails
        open={!!tractorId}
        tractorId={tractorId || null}
        onClose={() => navigate("/staff-menu/tractors")}
      />
    </Box>
  );
};

export default Tractors;
