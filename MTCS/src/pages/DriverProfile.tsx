import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Link,
  Avatar,
  Stack,
  Breadcrumbs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
  CardMedia,
  DialogContentText,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import WorkIcon from "@mui/icons-material/Work";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import BuildIcon from "@mui/icons-material/Build";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HistoryIcon from "@mui/icons-material/History";
import { useAuth } from "../contexts/AuthContext";
import {
  getDriverById,
  activateDriver,
  deactivateDriver,
  getDriverUsageHistory,
} from "../services/DriverApi";
import {
  Driver,
  getDriverStatusColor,
  DriverStatus,
  DriverFile,
  DriverUseHistoryPagedData,
} from "../types/driver";
import DriverUpdate from "../components/Driver/DriverUpdate";
import DriverUseHistoryTable from "../components/Driver/DriverUseHistoryTable";

const DriverProfile: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null
  );
  const [historyData, setHistoryData] =
    useState<DriverUseHistoryPagedData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);

  const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";

  const fetchDriverProfile = async () => {
    if (!driverId) {
      setError("Driver ID is missing");
      setLoading(false);
      return;
    }

    try {
      const driverData = await getDriverById(driverId);
      setDriver(driverData);
      setLoading(false);
    } catch (err) {
      setError("Failed to load driver profile");
      setLoading(false);
      console.error(err);
    }
  };

  const fetchDriverUsageHistory = async () => {
    if (!driverId) return;

    setHistoryLoading(true);
    try {
      const result = await getDriverUsageHistory(
        driverId,
        historyPage,
        historyPageSize
      );
      setHistoryData(result);
    } catch (error) {
      console.error("Failed to fetch driver usage history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverProfile();
  }, [driverId]);

  useEffect(() => {
    if (driverId) {
      fetchDriverUsageHistory();
    }
  }, [driverId, historyPage, historyPageSize]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenUpdateDialog = () => {
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchDriverProfile();
  };

  const handleStatusChange = (action: "activate" | "deactivate") => {
    setStatusAction(action);
    setStatusUpdateError(null);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!driverId || !statusAction || !driver) return;

    setStatusUpdateLoading(true);
    setStatusUpdateError(null);

    try {
      let response;
      if (statusAction === "activate") {
        response = await activateDriver(driverId);
      } else {
        response = await deactivateDriver(driverId);
      }

      if (response.success) {
        setStatusDialogOpen(false);
        fetchDriverProfile();
      } else {
        setStatusUpdateError(response.messageVN || response.message);
      }
    } catch (error) {
      console.error(`Failed to ${statusAction} driver:`, error);
      setStatusUpdateError(
        `Không thể ${
          statusAction === "activate" ? "kích hoạt" : "vô hiệu hóa"
        } tài xế. Vui lòng thử lại sau.`
      );
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCloseStatusDialog = () => {
    if (!statusUpdateLoading) {
      setStatusDialogOpen(false);
      setStatusAction(null);
      setStatusUpdateError(null);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };
  const getStatusText = (status: DriverStatus): string => {
    switch (status) {
      case DriverStatus.Active:
        return "Đang hoạt động";
      case DriverStatus.Inactive:
        return "Không hoạt động";
      case DriverStatus.OnDuty:
        return "Đang vận chuyển";
      case DriverStatus.OnFixing:
        return "Đang khắc phục sự cố";
      default:
        return "Không xác định";
    }
  };

  const isImageFile = (fileType: string): boolean => {
    return (
      fileType.toLowerCase().includes("image") ||
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileType.toLowerCase())
    );
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return <PictureAsPdfIcon color="error" />;
    } else if (isImageFile(type)) {
      return <ImageIcon color="primary" />;
    } else if (type.includes("doc") || type.includes("word")) {
      return <DescriptionIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };

  const openImagePreview = (file: DriverFile) => {
    setImagePreview({
      open: true,
      src: file.fileUrl,
      title: file.fileName,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      ...imagePreview,
      open: false,
    });
  };

  const renderFileItem = (file: DriverFile) => {
    if (isImageFile(file.fileType)) {
      return (
        <Card
          key={file.fileId}
          sx={{
            mb: 2,
            maxWidth: 350,
            boxShadow: 2,
            borderRadius: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          <CardMedia
            component="img"
            height="180"
            image={file.fileUrl}
            alt={file.fileName}
            sx={{
              objectFit: "contain",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
            }}
            onClick={() => openImagePreview(file)}
          />
          <CardContent sx={{ py: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {file.fileName}
            </Typography>
            {file.description && (
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                {file.description}
              </Typography>
            )}
            {file.note && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {file.note}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {new Date(file.uploadDate).toLocaleDateString("vi-VN")}
            </Typography>
          </CardContent>
          <CardActions sx={{ pt: 0 }}>
            <Tooltip title="Xem ảnh">
              <IconButton size="small" onClick={() => openImagePreview(file)}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mở trong cửa sổ mới">
              <IconButton
                size="small"
                component="a"
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      );
    } else {
      return (
        <Box
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.02)",
            },
          }}
        >
          <Box mr={2}>{getFileIcon(file.fileType)}</Box>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={500}>
              {file.fileName}
            </Typography>
            {file.description && (
              <Typography variant="body2" color="text.secondary">
                {file.description}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {new Date(file.uploadDate).toLocaleDateString("vi-VN")}
            </Typography>
          </Box>
          <Box>
            <Button
              size="small"
              color="primary"
              startIcon={<GetAppIcon />}
              component={Link}
              href={file.fileUrl}
              target="_blank"
              download
              sx={{ mr: 1 }}
            >
              Tải xuống
            </Button>
          </Box>
        </Box>
      );
    }
  };

  const handleHistoryPageChange = (page: number) => {
    setHistoryPage(page);
  };

  const handleHistoryPageSizeChange = (pageSize: number) => {
    setHistoryPageSize(pageSize);
    setHistoryPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !driver) {
    return (
      <Container>
        <Typography variant="h6" color="error" sx={{ mt: 4 }}>
          {error || "Không tìm thấy tài xế"}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            onClick={() => navigate(`${prefix}/drivers`)}
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
            Danh sách tài xế
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {driver.fullName || "Chi tiết tài xế"}
          </Typography>
        </Breadcrumbs>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 2,
            background:
              "linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url('/images/driver-bg.jpg')",
            backgroundSize: "cover",
            borderTop: `4px solid ${
              driver.status === DriverStatus.Active
                ? theme.palette.success.main
                : driver.status === DriverStatus.OnDuty
                ? theme.palette.primary.main
                : driver.status === DriverStatus.OnFixing
                ? theme.palette.warning.main
                : theme.palette.error.main
            }`,
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={3}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor:
                    driver.status === DriverStatus.Active
                      ? "success.main"
                      : driver.status === DriverStatus.OnDuty
                      ? "primary.main"
                      : "error.main",
                  width: 60,
                  height: 60,
                }}
              >
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ lineHeight: 1.2 }}
                >
                  {driver.fullName}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Tài xế • ID: {driverId}
                </Typography>
              </Box>
            </Box>{" "}
            <Chip
              label={getStatusText(driver.status)}
              color={getDriverStatusColor(driver.status) as any}
              icon={
                driver.status === DriverStatus.Active ? (
                  <VerifiedIcon />
                ) : driver.status === DriverStatus.OnDuty ? (
                  <LocalShippingIcon />
                ) : driver.status === DriverStatus.OnFixing ? (
                  <BuildIcon />
                ) : (
                  <CloseIcon />
                )
              }
              sx={{
                px: 2,
                py: 1,
                "& .MuiChip-label": { fontSize: "1rem", fontWeight: 500 },
              }}
            />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} lg={7}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                >
                  Thông tin cá nhân
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Họ và tên",
                      value: driver.fullName || "N/A",
                      icon: <PersonIcon color="primary" />,
                    },
                    {
                      label: "Email",
                      value: driver.email || "N/A",
                      icon: <EmailIcon color="primary" />,
                    },
                    {
                      label: "Số điện thoại",
                      value: driver.phoneNumber || "N/A",
                      icon: <PhoneIcon color="primary" />,
                    },
                    {
                      label: "Ngày sinh",
                      value: formatDate(driver.dateOfBirth),
                      icon: <EventIcon color="primary" />,
                    },
                    {
                      label: "Ngày tạo",
                      value: formatDate(driver.createdDate),
                      icon: <EventIcon color="primary" />,
                    },
                    {
                      label: "Cập nhật lần cuối",
                      value: formatDate(driver.modifiedDate),
                      icon: <EditIcon color="primary" />,
                    },
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            p: 1,
                            borderRadius: "50%",
                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                >
                  Thông tin công việc
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary.main"
                      gutterBottom
                    >
                      <WorkIcon
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      Giờ làm việc tuần này
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        color={
                          driver.currentWeekWorkingTime &&
                          parseInt(
                            driver.currentWeekWorkingTime.split(":")[0]
                          ) > 40
                            ? "warning.dark"
                            : "text.primary"
                        }
                      >
                        {driver.currentWeekWorkingTime || "00:00"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary.main"
                      gutterBottom
                    >
                      <WorkIcon
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      Giờ làm việc hôm nay
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        color={
                          driver.dailyWorkingTime &&
                          parseInt(driver.dailyWorkingTime.split(":")[0]) > 8
                            ? "warning.dark"
                            : "text.primary"
                        }
                      >
                        {driver.dailyWorkingTime || "00:00"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary.main"
                      gutterBottom
                    >
                      <LocalShippingIcon
                        fontSize="small"
                        sx={{ verticalAlign: "middle", mr: 0.5 }}
                      />
                      Tổng số đơn hàng
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="h5" fontWeight={600}>
                        {driver.totalOrder || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        đơn
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="space-between">
            {!isAdmin && (
              <>
                <Box>
                  {driver.status === DriverStatus.Active ||
                  driver.status === DriverStatus.OnDuty ? (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<BlockIcon />}
                      onClick={() => handleStatusChange("deactivate")}
                      size={isMobile ? "small" : "medium"}
                      sx={{ px: 3, py: 1 }}
                    >
                      Vô hiệu hóa
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleStatusChange("activate")}
                      size={isMobile ? "small" : "medium"}
                      sx={{ px: 3, py: 1 }}
                    >
                      Kích hoạt
                    </Button>
                  )}
                </Box>

                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleOpenUpdateDialog}
                    size={isMobile ? "small" : "medium"}
                    sx={{ px: 3, py: 1 }}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>

        {driver.files && driver.files.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <InsertDriveFileIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tài liệu đính kèm
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {driver.files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.fileId}>
                  {renderFileItem(file)}
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            mt: 3,
            borderRadius: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Lịch sử sử dụng xe
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <DriverUseHistoryTable
            data={historyData}
            loading={historyLoading}
            page={historyPage}
            pageSize={historyPageSize}
            onPageChange={handleHistoryPageChange}
            onPageSizeChange={handleHistoryPageSizeChange}
          />
        </Paper>
      </Box>

      {!isAdmin && (
        <>
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
            <DialogContent
              sx={{ p: 0, textAlign: "center", bgcolor: "#f5f5f5" }}
            >
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

          <Dialog
            open={statusDialogOpen}
            onClose={handleCloseStatusDialog}
            aria-labelledby="status-dialog-title"
          >
            <DialogTitle id="status-dialog-title">
              {statusAction === "activate"
                ? "Kích hoạt tài xế?"
                : "Vô hiệu hóa tài xế?"}
            </DialogTitle>
            <DialogContent>
              {statusUpdateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {statusUpdateError}
                </Alert>
              )}
              <DialogContentText>
                {statusAction === "activate"
                  ? "Tài xế này sẽ được kích hoạt và có thể nhận chuyến. Bạn chắc chắn muốn tiếp tục?"
                  : "Tài xế này sẽ bị vô hiệu hóa và không thể nhận chuyến. Bạn chắc chắn muốn tiếp tục?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseStatusDialog}
                disabled={statusUpdateLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmStatusChange}
                color={statusAction === "activate" ? "success" : "error"}
                variant="contained"
                disabled={statusUpdateLoading}
                startIcon={
                  statusUpdateLoading ? <CircularProgress size={20} /> : null
                }
              >
                {statusUpdateLoading
                  ? "Đang xử lý..."
                  : statusAction === "activate"
                  ? "Kích hoạt"
                  : "Vô hiệu hóa"}
              </Button>
            </DialogActions>
          </Dialog>

          <DriverUpdate
            open={updateDialogOpen}
            onClose={handleCloseUpdateDialog}
            driverDetails={driver}
            onSuccess={handleUpdateSuccess}
          />
        </>
      )}
    </Container>
  );
};

export default DriverProfile;
