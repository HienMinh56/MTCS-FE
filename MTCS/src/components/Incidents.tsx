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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert,
  Fade,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import {
  getAllIncidentReports,
  getIncidentReportById,
  IncidentReports,
  toggleIsPay,
} from "../services/IncidentReportApi";
import ReplaceTripModal from "./ReplaceTripModal";
import TableSortLabel from "@mui/material/TableSortLabel";

// Remove TabPanel-related interface and component
// Keep only a11yProps function for accessibility
function a11yProps(index: number) {
  return {
    id: `incident-tab-${index}`,
    "aria-controls": `incident-tabpanel-${index}`,
  };
}

// Update the interface to match the API data structure
interface Incident extends IncidentReports {
  // Any additional fields not provided by the API can be added here
  images?: {
    incident: string[];
    invoice: string[];
    exchangePaper: string[];
  };
}

// Incident detail dialog component
const IncidentDetailDialog = ({
  open,
  incident,
  onClose,
  onImagePreview,
}: {
  open: boolean;
  incident: Incident | null;
  onClose: () => void;
  onImagePreview: (src: string, title: string) => void;
}) => {
  const [openReplaceTripModal, setOpenReplaceTripModal] = useState(false);
  const [createTripSuccess, setCreateTripSuccess] = useState(false);
  const [createTripError, setCreateTripError] = useState(false);
  const [tripReplaced, setTripReplaced] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false); // Add loading state for payment
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Add success state
  const navigate = useNavigate();

  // Add function to handle payment toggle
  const handleTogglePayment = async () => {
    if (!incident) return;

    try {
      setPaymentLoading(true);
      const response = await toggleIsPay(incident.reportId);

      if (response.status === 1) {
        setPaymentSuccess(true);
        // Update the incident object locally to reflect the change
        incident.isPay = incident.isPay === 1 ? 0 : 1;

        // Show success message briefly
        setTimeout(() => {
          setPaymentSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error toggling payment status:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!incident) return null;

  // Check if there's any replacement trip (a trip with status other than canceled/cancelled)
  const hasReplacementTrip = incident.order?.trips?.some(
    (trip) =>
      trip.status.toLowerCase() !== "canceled" &&
      trip.status.toLowerCase() !== "cancelled"
  );

  // Group files by type
  const incidentFiles =
    incident.incidentReportsFiles?.filter((file) => file.type === 1) || [];
  const invoiceFiles =
    incident.incidentReportsFiles?.filter((file) => file.type === 2) || [];
  const transferFiles =
    incident.incidentReportsFiles?.filter((file) => file.type === 3) || [];

  // Updated to handle both success and failure cases
  const handleReplaceTripSuccess = (success: boolean = true) => {
    if (success) {
      setCreateTripSuccess(true);
      setTripReplaced(true); // Set flag to indicate trip has been replaced
      // Reset success message after 3 seconds
      setTimeout(() => setCreateTripSuccess(false), 3000);
    } else {
      setCreateTripError(true);
      // Reset error message after 3 seconds
      setTimeout(() => setCreateTripError(false), 3000);
    }
  };

  // Handler for image clicks - use onImagePreview prop instead of direct link
  const handleImageClick = (fileUrl: string, fileTitle: string) => {
    onImagePreview(fileUrl, fileTitle);
  };

  // Handler for viewing order details
  const handleViewOrder = () => {
    if (incident.order?.orderId) {
      navigate(`/staff-menu/orders/${incident.order.orderId}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 2,
          }}
        >
          <Typography variant="h6">
            Chi tiết sự cố #{incident.reportId}
          </Typography>
          <Chip
            size="small"
            label={incident.status === "Handling" ? "Đang xử lý" : "Đã xử lý"}
            color={incident.status === "Handling" ? "info" : "success"}
            sx={{ ml: 2 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Success toast notification */}
        <Snackbar
          open={createTripSuccess}
          autoHideDuration={3000}
          onClose={() => setCreateTripSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ top: 24 }}
        >
          <Alert
            onClose={() => setCreateTripSuccess(false)}
            severity="success"
            variant="filled"
            elevation={6}
            sx={{ width: "100%" }}
          >
            Đã tạo chuyến thay thế thành công!
          </Alert>
        </Snackbar>

        {/* Error toast notification */}
        <Snackbar
          open={createTripError}
          autoHideDuration={3000}
          onClose={() => setCreateTripError(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ top: 24 }}
        >
          <Alert
            onClose={() => setCreateTripError(false)}
            severity="error"
            variant="filled"
            elevation={6}
            sx={{ width: "100%" }}
          >
            Không thể tạo chuyến thay thế. Vui lòng thử lại!
          </Alert>
        </Snackbar>

        {/* Main content structure */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Section: Basic Information */}
          <Paper
            variant="outlined"
            sx={{ p: 2, borderWidth: 2, borderColor: "rgba(0, 0, 0, 0.12)" }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 2, borderBottom: "2px solid #e0e0e0", pb: 1 }}
            >
              Thông tin cơ bản
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mã sự cố
                    </Typography>
                    <Typography variant="body1">{incident.reportId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mã vận đơn
                    </Typography>
                    <Box mt={0.5}>
                      <Typography
                        variant="body1"
                        component="span"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          position: "relative",
                          transition: "all 0.3s ease",
                          "&:after": {
                            content: '""',
                            position: "absolute",
                            width: "0%",
                            height: "2px",
                            bottom: 0,
                            left: 0,
                            backgroundColor: "primary.dark",
                            transition: "width 0.3s ease",
                          },
                          "&:hover": {
                            color: "primary.dark",
                            "&:after": {
                              width: "100%",
                            },
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/staff-menu/orders/${incident.order.orderId}`
                          );
                        }}
                      >
                        {incident.trackingCode}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Người báo cáo
                    </Typography>
                    <Typography variant="body1">
                      {incident.reportedBy}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Loại sự cố
                    </Typography>
                    <Typography variant="body1">
                      {incident.incidentType}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mô tả sự cố
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {incident.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Thời gian xảy ra
                    </Typography>
                    <Typography variant="body1">
                      {new Date(incident.incidentTime).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Vị trí
                    </Typography>
                    <Typography variant="body1">{incident.location}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {new Date(incident.createdDate).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Loại
                    </Typography>
                    <Typography variant="body1">
                      {incident.type === 1
                        ? "Có thể sửa"
                        : incident.type === 2
                        ? "Cần hỗ trợ loại 1"
                        : incident.type === 3
                        ? "Cần hỗ trợ loại 2"
                        : "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phương tiện hư hỏng
                    </Typography>
                    <Typography variant="body1">
                      {incident.vehicleType === 1
                        ? "Đầu kéo"
                        : incident.vehicleType === 2
                        ? "Rơ-moóc"
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Section: Status Information */}
          <Paper
            variant="outlined"
            sx={{ p: 2, borderWidth: 2, borderColor: "rgba(0, 0, 0, 0.12)" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "2px solid #e0e0e0",
                pb: 1,
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Thông tin xử lý
              </Typography>
              <Chip
                size="small"
                label={
                  incident.status === "Handling" ? "Đang xử lý" : "Đã xử lý"
                }
                color={incident.status === "Handling" ? "info" : "success"}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Chi tiết xử lý
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {incident.resolutionDetails}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Trạng thái thanh toán
                    </Typography>
                    <Typography variant="body1">
                      {incident.isPay == 1
                        ? "Đã Thanh toán"
                        : "Chưa thanh toán"}
                    </Typography>
                  </Box>

                  {incident.price != null && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Chi phí sửa chữa
                      </Typography>
                      <Typography variant="body1">
                        {incident.price.toLocaleString("vi-VN") + " VND"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {incident.handledBy && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Người xử lý
                      </Typography>
                      <Typography variant="body1">
                        {incident.handledBy}
                      </Typography>
                    </Box>
                  )}

                  {incident.handledTime && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Thời gian xử lý
                      </Typography>
                      <Typography variant="body1">
                        {new Date(incident.handledTime).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Section: Images - modified to use the image preview */}
          <Paper
            variant="outlined"
            sx={{ p: 2, borderWidth: 2, borderColor: "rgba(0, 0, 0, 0.12)" }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 2, borderBottom: "2px solid #e0e0e0", pb: 1 }}
            >
              Hình ảnh
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Incident Images */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Ảnh sự cố
                </Typography>
                {incidentFiles.length > 0 ? (
                  <ImageList cols={3} rowHeight={160} gap={8}>
                    {incidentFiles.map((file, index) => (
                      <ImageListItem
                        key={file.fileId}
                        sx={{
                          border: "2px solid #e0e0e0",
                          borderRadius: 1,
                          overflow: "hidden",
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={file.fileUrl}
                          alt={`Ảnh sự cố ${index + 1}`}
                          loading="lazy"
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                          onClick={() =>
                            handleImageClick(
                              file.fileUrl,
                              `Ảnh sự cố ${index + 1}`
                            )
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có ảnh
                  </Typography>
                )}
              </Box>

              {/* Invoice Images */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Ảnh hóa đơn
                </Typography>
                {invoiceFiles.length > 0 ? (
                  <ImageList cols={3} rowHeight={160} gap={8}>
                    {invoiceFiles.map((file, index) => (
                      <ImageListItem
                        key={file.fileId}
                        sx={{
                          border: "2px solid #e0e0e0",
                          borderRadius: 1,
                          overflow: "hidden",
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={file.fileUrl}
                          alt={`Ảnh hóa đơn ${index + 1}`}
                          loading="lazy"
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                          onClick={() =>
                            handleImageClick(
                              file.fileUrl,
                              `Ảnh hóa đơn ${index + 1}`
                            )
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có ảnh
                  </Typography>
                )}
              </Box>

              {/* Transfer Images */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Ảnh chuyển nhượng
                </Typography>
                {transferFiles.length > 0 ? (
                  <ImageList cols={3} rowHeight={160} gap={8}>
                    {transferFiles.map((file, index) => (
                      <ImageListItem
                        key={file.fileId}
                        sx={{
                          border: "2px solid #e0e0e0",
                          borderRadius: 1,
                          overflow: "hidden",
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={file.fileUrl}
                          alt={`Ảnh chuyển nhượng ${index + 1}`}
                          loading="lazy"
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                          onClick={() =>
                            handleImageClick(
                              file.fileUrl,
                              `Ảnh chuyển nhượng ${index + 1}`
                            )
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có ảnh
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          {/* You can add driver information section here if needed */}
        </Box>
      </DialogContent>
      <DialogActions>
        {/* Show payment button only if incident is not paid */}
        {incident.isPay === 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={handleTogglePayment}
            disabled={paymentLoading}
            startIcon={
              paymentLoading ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            {paymentLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </Button>
        )}

        {/* Payment success message */}
        {paymentSuccess && (
          <Alert severity="success" sx={{ mr: 2 }}>
            Đã cập nhật trạng thái thanh toán!
          </Alert>
        )}

        {/* Show button only if incident is not completed OR if incident cannot be repaired OR requires assistance */}
        {incident.status === "Handling" &&
          incident.type === 2 && ( // type === 1 và type === 3 không được tạo chuyến thay thế
            <>
              {hasReplacementTrip ? (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleViewOrder}
                  startIcon={<OpenInNewIcon />}
                >
                  Đã có chuyến thay thế, nhấn để xem
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenReplaceTripModal(true)}
                  disabled={tripReplaced}
                  sx={{
                    ...(tripReplaced && {
                      backgroundColor: "rgba(0, 0, 0, 0.12)",
                      color: "rgba(0, 0, 0, 0.26)",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.12)",
                        boxShadow: "none",
                      },
                    }),
                  }}
                >
                  {tripReplaced
                    ? "Đã tạo chuyến thay thế"
                    : "Tạo chuyến thay thế"}
                </Button>
              )}
            </>
          )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      {/* Update the ReplaceTripModal to handle both success and error cases */}
      <ReplaceTripModal
        open={openReplaceTripModal}
        onClose={() => setOpenReplaceTripModal(false)}
        tripId={incident.tripId}
        orderId={incident.order.orderId}
        vehicleType={incident.vehicleType}
        incidentTractorId={incident.trip?.tractorId}
        incidentTrailerId={incident.trip?.trailerId}
        onSuccess={() => handleReplaceTripSuccess(true)}
      />
    </Dialog>
  );
};

const IncidentManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  // Add these new states for better filtering like in TripTable
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Keep the existing sort config state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "createdDate",
    direction: null,
  });

  // Keep the image preview state
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });

  // Fetch incident reports from API - update to set all state values
  useEffect(() => {
    const fetchIncidentReports = async () => {
      setLoading(true);
      try {
        const data = await getAllIncidentReports();
        setIncidents(data);
        setAllIncidents(data); // Store all incidents for filtering
        setFilteredIncidents(data);
      } catch (error) {
        console.error("Error fetching incident reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentReports();
  }, []);

  // Add new effect for filtering when tab or search term changes
  useEffect(() => {
    if (!allIncidents.length) return;

    // Start with all incidents
    let filtered = [...allIncidents];

    // Apply search filter if there's a search term
    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((incident) => {
        // Search by multiple fields
        return (
          (incident.reportId &&
            incident.reportId.toLowerCase().includes(lowerSearchTerm)) ||
          (incident.trackingCode &&
            incident.trackingCode.toLowerCase().includes(lowerSearchTerm)) ||
          (incident.orderId &&
            incident.orderId.toLowerCase().includes(lowerSearchTerm)) ||
          (incident.incidentType &&
            incident.incidentType.toLowerCase().includes(lowerSearchTerm))
        );
      });
      setIsFiltering(true);
    } else {
      setIsFiltering(false);
    }

    // Apply tab filtering
    if (tabValue === 1) {
      // Handling
      filtered = filtered.filter((incident) => incident.status === "Handling");
    } else if (tabValue === 2) {
      // Completed/Resolved
      filtered = filtered.filter(
        (incident) =>
          incident.status === "Completed" ||
          incident.status === "Cancelled" ||
          incident.status === "Canceled" ||
          (incident.status !== "Handling" && incident.status !== "Pending")
      );
    }

    // Apply sorting if configured
    if (sortConfig.key === "createdDate" && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();

        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    setFilteredIncidents(filtered);
    // Reset page when filters change
    setPage(0);
  }, [tabValue, searchTerm, allIncidents, sortConfig]);

  // Handle view incident details with API data
  const handleViewIncident = async (reportId: string) => {
    try {
      setLoading(true);
      const incidentData = await getIncidentReportById(reportId);
      console.log(incidentData);
      setSelectedIncident(incidentData);
      setOpenDialog(true);
    } catch (error) {
      console.error(`Error fetching incident ${reportId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  // Add handler for card clicks
  const handleCardClick = (tabIndex: number) => {
    setTabValue(tabIndex);
    setPage(0); // Reset to first page when changing filter
  };

  // Thêm hàm xử lý sắp xếp theo thời gian báo cáo
  const handleRequestSort = () => {
    const isAsc =
      sortConfig.key === "createdDate" && sortConfig.direction === "asc";
    setSortConfig({
      key: "createdDate",
      direction: isAsc ? "desc" : "asc",
    });
    setPage(0); // Reset về trang đầu khi sắp xếp
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleOpenDialog = (incident: Incident) => {
    handleViewIncident(incident.reportId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  // Add functions to handle image preview
  const openImagePreview = (src: string, title: string = "Image Preview") => {
    setImagePreview({
      open: true,
      src,
      title,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      ...imagePreview,
      open: false,
    });
  };

  // Updated to properly count all non-handling statuses as "Đã xử lý"
  const getResolvedCount = () => {
    return incidents.filter(
      (incident) =>
        incident.status === "Completed" ||
        incident.status === "Cancelled" ||
        incident.status === "Canceled" ||
        (incident.status !== "Handling" && incident.status !== "Pending")
    ).length;
  };

  // Incident status options with Vietnamese labels - fixed count method
  const incidentStatusOptions = [
    {
      value: "all",
      label: "Tất cả",
      color: "default",
      count: incidents.length,
    },
    {
      value: "Handling",
      label: "Đang xử lý",
      color: "info",
      count: incidents.filter((incident) => incident.status === "Handling")
        .length,
    },
    {
      value: "Completed",
      label: "Đã xử lý",
      color: "success",
      // Use the helper function to get the correct count
      count: getResolvedCount(),
    },
  ];

  // Use this to get the current page items
  const getCurrentIncidents = () => {
    return filteredIncidents.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 0 ? "3px solid #1976d2" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(0)} // All incidents - index 0
          >
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
                    Tổng số sự cố
                  </Typography>
                  <Typography variant="h5" component="div">
                    {incidents.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <AssignmentIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 1 ? "3px solid #2196f3" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(1)} // Handling incidents - index 1
          >
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
                    Đang xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      incidents.filter(
                        (incident) => incident.status === "Handling"
                      ).length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(33, 150, 243, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <AccessTimeIcon color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: tabValue === 2 ? "3px solid #4caf50" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick(2)} // Completed incidents - index 2
          >
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
                    Đã xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {getResolvedCount()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <CheckCircleIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Incidents Table Section */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 250px)",
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
              Danh sách sự cố
              {isFiltering && (
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: "0.875rem" }}
                >
                  (Đã lọc: {filteredIncidents.length} kết quả)
                </Typography>
              )}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                size="small"
                placeholder="Tìm kiếm theo mã sự cố, mã chuyến, loại..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setSearchTerm("")}
                        aria-label="clear search"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { sm: 300 } }}
              />
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="incident status tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: "42px" }}
            >
              {incidentStatusOptions.map((status, index) => (
                <Tab
                  key={status.value}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography component="span" variant="body2">
                        {status.label}
                      </Typography>
                      <Chip
                        label={status.count}
                        size="small"
                        color="default"
                        sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  }
                  {...a11yProps(index)}
                  sx={{ py: 1, minHeight: "42px" }}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Modified table container that follows TripTable approach exactly */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  position: "relative",
                  border: "1px solid rgba(224, 224, 224, 1)",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    minWidth: 650,
                    "& .MuiTableHead-root": {
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                    },
                    "& .MuiTableCell-stickyHeader": {
                      backgroundColor: "background.paper",
                      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                  aria-label="incidents table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Mã sự cố</TableCell>
                      <TableCell align="center">Mã vận đơn</TableCell>
                      <TableCell align="center">Loại sự cố</TableCell>
                      <TableCell align="center">Loại</TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortConfig.key === "createdDate"}
                          direction={
                            sortConfig.direction === null
                              ? "asc"
                              : sortConfig.direction
                          }
                          onClick={handleRequestSort}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          Thời gian báo cáo
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Trạng thái thanh toán</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCurrentIncidents().length > 0 ? (
                      getCurrentIncidents().map((incident) => (
                        <TableRow
                          key={incident.reportId}
                          hover
                          onClick={() => handleOpenDialog(incident)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell align="center">
                            {incident.reportId}
                          </TableCell>
                          <TableCell align="center">
                            {incident.trackingCode}
                          </TableCell>
                          <TableCell align="center">
                            {incident.incidentType}
                          </TableCell>
                          <TableCell align="center">
                            {incident.type === 1
                              ? "Có thể sửa"
                              : incident.type === 2
                              ? "Cần hỗ trợ loại 1"
                              : incident.type === 3
                              ? "Cần hỗ trợ loại 2"
                              : incident.type}
                          </TableCell>
                          <TableCell align="center">
                            {incident.createdDate
                              ? `${new Date(
                                  incident.createdDate
                                ).toLocaleDateString("vi-VN")} ${new Date(
                                  incident.createdDate
                                ).toLocaleTimeString("vi-VN")}`
                              : ""}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={
                                incident.status === "Pending"
                                  ? "Chờ xử lý"
                                  : incident.status === "Handling"
                                  ? "Đang xử lý"
                                  : "Đã xử lý"
                              }
                              color={
                                incident.status === "Pending"
                                  ? "warning"
                                  : incident.status === "Handling"
                                  ? "info"
                                  : "success"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip                             
                              size="small"
                              label={
                                incident.isPay === 0
                                  ? "Chưa thanh toán"
                                  : incident.isPay === 1
                                  ? "Đã thanh toán"
                                  : "Không có"
                              }
                              color={
                                incident.isPay === 0
                                  ? "warning"
                                  : incident.isPay === 1
                                  ? "success"
                                  : "info"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            py={3}
                          >
                            {searchTerm
                              ? "Không tìm thấy sự cố phù hợp"
                              : "Không có dữ liệu"}
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
                count={filteredIncidents.length}
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
            </>
          )}
        </Box>
      </Paper>

      {/* Incident Detail Dialog Component */}
      <IncidentDetailDialog
        open={openDialog}
        incident={selectedIncident}
        onClose={handleCloseDialog}
        onImagePreview={openImagePreview} // Pass the open preview function
      />

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={closeImagePreview}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center" }}>
          <ImageIcon sx={{ mr: 1 }} color="primary" />
          {imagePreview.title}
          <IconButton
            onClick={closeImagePreview}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, textAlign: "center", bgcolor: "#f5f5f5" }}>
          <img
            src={imagePreview.src}
            alt={imagePreview.title}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              padding: 16,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            component="a"
            href={imagePreview.src}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            variant="outlined"
          >
            Mở trong cửa sổ mới
          </Button>
          <Button
            onClick={closeImagePreview}
            color="primary"
            variant="contained"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentManagement;
