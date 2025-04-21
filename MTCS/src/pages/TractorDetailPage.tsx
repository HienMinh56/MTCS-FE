import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
  Fade,
  Breadcrumbs,
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VerifiedIcon from "@mui/icons-material/Verified";
import EditIcon from "@mui/icons-material/Edit";
import DirectionsIcon from "@mui/icons-material/Directions";
import HistoryIcon from "@mui/icons-material/History";
import TractorUpdate from "../components/Tractor/TractorUpdate";
import TractorUseHistoryTable from "../components/Tractor/TractorUseHistoryTable";
import TractorIncidentHistoryTable from "../components/Tractor/TractorIncidentHistoryTable";
import {
  getTractorDetails,
  deactivateTractor,
  activateTractor,
  getTractorUseHistory,
} from "../services/tractorApi";
import {
  TractorDetails as ITractorDetails,
  ContainerType,
  TractorStatus,
  TractorFileDTO,
  PaginationParams,
  TractorUseHistory,
} from "../types/tractor";

const FILE_CATEGORIES = ["Giấy Đăng ký", "Giấy Kiểm định", "Khác"];

const isImageFile = (fileType: string): boolean => {
  return (
    fileType.includes("image") ||
    ["jpg", "jpeg", "png", "gif"].some((ext) => fileType.includes(ext))
  );
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) {
    return <PictureAsPdfIcon color="error" />;
  } else if (isImageFile(fileType)) {
    return <ImageIcon color="primary" />;
  } else if (fileType.includes("word") || fileType.includes("doc")) {
    return <DescriptionIcon color="info" />;
  } else {
    return <InsertDriveFileIcon color="action" />;
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

const TractorDetailPage = () => {
  const { tractorId } = useParams<{ tractorId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [details, setDetails] = useState<ITractorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "deactivate">(
    "deactivate"
  );
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [tractorUseHistory, setTractorUseHistory] = useState<{
    items: TractorUseHistory[];
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyParams, setHistoryParams] = useState<PaginationParams>({
    pageNumber: 1,
    pageSize: 5,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!tractorId) return;
      try {
        setLoading(true);
        const response = await getTractorDetails(tractorId);
        if (response.success) {
          setDetails(response.data);
        } else {
          setAlert({
            open: true,
            message: "Không thể tải thông tin đầu kéo",
            severity: "error",
          });
        }
      } catch (error) {
        setAlert({
          open: true,
          message: "Đã có lỗi xảy ra khi tải thông tin đầu kéo",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [tractorId]);

  useEffect(() => {
    const fetchUseHistory = async () => {
      if (!tractorId) return;
      try {
        setHistoryLoading(true);
        const response = await getTractorUseHistory(tractorId);
        if (response.success) {
          setTractorUseHistory(response.data.tractorUseHistories);
        } else {
          setAlert({
            open: true,
            message: "Không thể tải lịch sử sử dụng đầu kéo",
            severity: "error",
          });
        }
      } catch (error) {
        setAlert({
          open: true,
          message: "Đã có lỗi xảy ra khi tải lịch sử sử dụng đầu kéo",
          severity: "error",
        });
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchUseHistory();
  }, [tractorId]);

  // Fetch tractor use history
  const fetchTractorUseHistory = async () => {
    if (!tractorId) return;
    try {
      setHistoryLoading(true);
      const response = await getTractorUseHistory(tractorId, historyParams);
      if (response.success) {
        setTractorUseHistory(response.data.tractorUseHistories);
      } else {
        setAlert({
          open: true,
          message: "Không thể tải lịch sử sử dụng đầu kéo",
          severity: "error",
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: "Đã có lỗi xảy ra khi tải lịch sử sử dụng đầu kéo",
        severity: "error",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle page change for history data
  const handleHistoryPageChange = (page: number) => {
    setHistoryParams({
      ...historyParams,
      pageNumber: page,
    });
  };

  // Handle page size change for history data
  const handleHistoryPageSizeChange = (pageSize: number) => {
    setHistoryParams({
      ...historyParams,
      pageSize: pageSize,
    });
  };

  // Fetch history data when tractorId or historyParams changes
  useEffect(() => {
    fetchTractorUseHistory();
  }, [tractorId, historyParams]);

  const handleActivateClick = () => {
    setActionType("activate");
    setErrorDetails(null);
    setConfirmDialog(true);
  };

  const handleDeactivateClick = () => {
    setActionType("deactivate");
    setErrorDetails(null);
    setConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!tractorId) return;

    setActionLoading(true);
    try {
      let response;

      if (actionType === "activate") {
        response = await activateTractor(tractorId);
      } else {
        response = await deactivateTractor(tractorId);
      }

      if (response.success) {
        setAlert({
          open: true,
          message:
            actionType === "activate"
              ? "Đầu kéo đã được kích hoạt thành công"
              : "Đầu kéo đã được vô hiệu hóa thành công",
          severity: "success",
        });

        // Refresh the details
        const updatedResponse = await getTractorDetails(tractorId);
        if (updatedResponse.success) {
          setDetails(updatedResponse.data);
        }

        setConfirmDialog(false);
      } else {
        // Check for detailed error message
        if (response.messageVN) {
          setErrorDetails(response.messageVN);

          // Keep the dialog open only for "tractor in use" errors
          if (!response.messageVN.includes("đang trong hành trình")) {
            setConfirmDialog(false);
          }
        } else {
          setConfirmDialog(false);
        }

        setAlert({
          open: true,
          message:
            response.messageVN ||
            (actionType === "activate"
              ? "Không thể kích hoạt đầu kéo"
              : "Không thể vô hiệu hóa đầu kéo"),
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error(`Error ${actionType} tractor:`, error);

      // Try to extract error message from the error object
      const errorMessage =
        error?.response?.data?.messageVN ||
        (actionType === "activate"
          ? "Đã xảy ra lỗi khi kích hoạt đầu kéo"
          : "Đã xảy ra lỗi khi vô hiệu hóa đầu kéo");

      setAlert({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setConfirmDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  const openImagePreview = (file: TractorFileDTO) => {
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

  const handleEditClick = () => {
    setUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = async () => {
    // Refresh the details after successful update
    if (tractorId) {
      try {
        setLoading(true);
        const response = await getTractorDetails(tractorId);
        if (response.success) {
          setDetails(response.data);
          setAlert({
            open: true,
            message: "Thông tin đầu kéo đã được cập nhật thành công",
            severity: "success",
          });
        }
      } catch (error) {
        setAlert({
          open: true,
          message: "Đã có lỗi xảy ra khi tải lại thông tin đầu kéo",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderFileItem = (file: TractorFileDTO) => {
    if (isImageFile(file.fileType)) {
      return (
        <Card
          key={file.fileId}
          sx={{
            mb: 2,
            maxWidth: 350,
            boxShadow: 2,
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
            {file.description !== "Giấy Đăng ký" &&
              file.description !== "Giấy Kiểm định" && (
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mt: 0.5 }}
                >
                  Loại: {file.description}
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
              {formatDate(file.uploadDate)}
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
        <ListItem
          key={file.fileId}
          alignItems="flex-start"
          secondaryAction={
            <Tooltip title="Mở tài liệu">
              <IconButton
                edge="end"
                component="a"
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemIcon>{getFileIcon(file.fileType)}</ListItemIcon>
          <ListItemText
            primary={
              <Link
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                {file.fileName}
              </Link>
            }
            secondary={
              <React.Fragment>
                {file.description !== "Giấy Đăng ký" &&
                  file.description !== "Giấy Kiểm định" && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: "block" }}
                    >
                      Loại: {file.description}
                    </Typography>
                  )}
                {file.note && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {file.note}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {formatDate(file.uploadDate)}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
      );
    }
  };

  // Check if a date is within 30 days
  const isDateSoonExpiring = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  // Check if a date is expired
  const isDateExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date < today;
  };

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
            onClick={() => navigate("/staff-menu/tractors")}
          >
            <LocalShippingIcon sx={{ mr: 0.5 }} fontSize="small" />
            Danh sách đầu kéo
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {loading ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              details?.licensePlate || "Chi tiết đầu kéo"
            )}
          </Typography>
        </Breadcrumbs>

        {loading ? (
          <Paper
            elevation={2}
            sx={{
              p: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body1" color="text.secondary">
                Đang tải thông tin đầu kéo...
              </Typography>
            </Stack>
          </Paper>
        ) : details ? (
          <>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                mb: 3,
                borderRadius: 2,
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url('/images/truck-bg.jpg')",
                backgroundSize: "cover",
                borderTop: `4px solid ${
                  details.status === TractorStatus.Active
                    ? theme.palette.success.main
                    : details.status === TractorStatus.OnDuty
                    ? theme.palette.primary.main
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
                        details.status === TractorStatus.Active
                          ? "success.main"
                          : details.status === TractorStatus.OnDuty
                          ? "primary.main"
                          : "error.main",
                      width: 60,
                      height: 60,
                    }}
                  >
                    <LocalShippingIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {details.licensePlate}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {details.brand} • {details.manufactureYear}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={
                    details.status === TractorStatus.Active
                      ? "Đang hoạt động"
                      : details.status === TractorStatus.OnDuty
                      ? "Đang vận chuyển"
                      : "Không hoạt động"
                  }
                  color={
                    details.status === TractorStatus.Active
                      ? "success"
                      : details.status === TractorStatus.OnDuty
                      ? "primary"
                      : "error"
                  }
                  icon={
                    details.status === TractorStatus.Active ? (
                      <VerifiedIcon />
                    ) : details.status === TractorStatus.OnDuty ? (
                      <DirectionsIcon />
                    ) : (
                      <WarningIcon />
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
                      Thông tin cơ bản
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Biển số xe",
                          value: details.licensePlate,
                          icon: <LocalShippingIcon color="primary" />,
                        },
                        {
                          label: "Hãng sản xuất",
                          value: details.brand,
                          icon: <VerifiedIcon color="primary" />,
                        },
                        {
                          label: "Năm sản xuất",
                          value: details.manufactureYear,
                          icon: <EventIcon color="primary" />,
                        },
                        {
                          label: "Tải trọng tối đa",
                          value: `${details.maxLoadWeight} tấn`,
                          icon: <WarningIcon color="primary" />,
                        },
                        {
                          label: "Loại container",
                          value:
                            details.containerType === ContainerType.DryContainer
                              ? "Khô"
                              : "Lạnh",
                          icon: <LocalShippingIcon color="primary" />,
                        },
                        {
                          label: "Số chuyến hàng đã hoàn thành",
                          value: details.orderCount,
                          icon: <CheckCircleIcon color="primary" />,
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
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
                      Lịch trình bảo dưỡng & đăng kiểm
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
                          backgroundColor: isDateExpired(
                            details.registrationExpirationDate
                          )
                            ? "error.light"
                            : isDateSoonExpiring(
                                details.registrationExpirationDate
                              )
                            ? "warning.light"
                            : "transparent",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="primary.main"
                          gutterBottom
                        >
                          <EventIcon
                            fontSize="small"
                            sx={{ verticalAlign: "middle", mr: 0.5 }}
                          />
                          Đăng kiểm
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={5}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày đăng kiểm:
                            </Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(details.registrationDate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body2" color="text.secondary">
                              Hạn đăng kiểm:
                            </Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  isDateExpired(
                                    details.registrationExpirationDate
                                  )
                                    ? "error.dark"
                                    : isDateSoonExpiring(
                                        details.registrationExpirationDate
                                      )
                                    ? "warning.dark"
                                    : "text.primary"
                                }
                              >
                                {formatDate(details.registrationExpirationDate)}
                              </Typography>
                              {isDateExpired(
                                details.registrationExpirationDate
                              ) && (
                                <Chip
                                  label="Quá hạn"
                                  color="error"
                                  size="small"
                                />
                              )}
                              {isDateSoonExpiring(
                                details.registrationExpirationDate
                              ) &&
                                !isDateExpired(
                                  details.registrationExpirationDate
                                ) && (
                                  <Chip
                                    label="Sắp tới"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: isDateExpired(
                            details.nextMaintenanceDate
                          )
                            ? "error.light"
                            : isDateSoonExpiring(details.nextMaintenanceDate)
                            ? "warning.light"
                            : "transparent",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="primary.main"
                          gutterBottom
                        >
                          <BuildIcon
                            fontSize="small"
                            sx={{ verticalAlign: "middle", mr: 0.5 }}
                          />
                          Bảo dưỡng
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={5}>
                            <Typography variant="body2" color="text.secondary">
                              Bảo dưỡng gần nhất:
                            </Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(details.lastMaintenanceDate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body2" color="text.secondary">
                              Bảo dưỡng tiếp theo:
                            </Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  isDateExpired(details.nextMaintenanceDate)
                                    ? "error.dark"
                                    : isDateSoonExpiring(
                                        details.nextMaintenanceDate
                                      )
                                    ? "warning.dark"
                                    : "text.primary"
                                }
                              >
                                {formatDate(details.nextMaintenanceDate)}
                              </Typography>
                              {isDateExpired(details.nextMaintenanceDate) && (
                                <Chip
                                  label="Quá hạn"
                                  color="error"
                                  size="small"
                                />
                              )}
                              {isDateSoonExpiring(
                                details.nextMaintenanceDate
                              ) &&
                                !isDateExpired(details.nextMaintenanceDate) && (
                                  <Chip
                                    label="Sắp tới"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Box mt={3} display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  size={isMobile ? "small" : "medium"}
                  sx={{ px: 3, py: 1 }}
                >
                  Chỉnh sửa thông tin
                </Button>

                {details.status === TractorStatus.Active ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeactivateClick}
                    size={isMobile ? "small" : "medium"}
                    sx={{ px: 3, py: 1 }}
                  >
                    Vô hiệu hóa đầu kéo
                  </Button>
                ) : details.status === TractorStatus.OnDuty ? (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled
                    startIcon={<DirectionsIcon />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ px: 3, py: 1 }}
                  >
                    Đang vận chuyển
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleActivateClick}
                    size={isMobile ? "small" : "medium"}
                    sx={{ px: 3, py: 1 }}
                  >
                    Kích hoạt đầu kéo
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Display tractor files by category */}
            {details.files && details.files.length > 0 && (
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

                <Grid container spacing={4}>
                  {/* Render Giấy Đăng ký files */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: 1,
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <DescriptionIcon />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          Giấy Đăng ký
                        </Typography>
                      </Paper>

                      {/* Images for Giấy Đăng ký */}
                      {details.files.filter(
                        (file) =>
                          file.description === "Giấy Đăng ký" &&
                          isImageFile(file.fileType)
                      ).length > 0 && (
                        <Grid container spacing={2}>
                          {details.files
                            .filter(
                              (file) =>
                                file.description === "Giấy Đăng ký" &&
                                isImageFile(file.fileType)
                            )
                            .map((file) => (
                              <Grid item xs={12} sm={6} key={file.fileId}>
                                {renderFileItem(file)}
                              </Grid>
                            ))}
                        </Grid>
                      )}

                      {/* Non-image files for Giấy Đăng ký */}
                      {details.files.filter(
                        (file) =>
                          file.description === "Giấy Đăng ký" &&
                          !isImageFile(file.fileType)
                      ).length > 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <List dense>
                            {details.files
                              .filter(
                                (file) =>
                                  file.description === "Giấy Đăng ký" &&
                                  !isImageFile(file.fileType)
                              )
                              .map((file) => renderFileItem(file))}
                          </List>
                        </Paper>
                      )}

                      {/* Show message if no files in this category */}
                      {details.files.filter(
                        (file) => file.description === "Giấy Đăng ký"
                      ).length === 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ py: 2 }}
                          >
                            Không có tài liệu
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Grid>

                  {/* Render Giấy Kiểm định files */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: 1,
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <VerifiedIcon />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          Giấy Kiểm định
                        </Typography>
                      </Paper>

                      {/* Images for Giấy Kiểm định */}
                      {details.files.filter(
                        (file) =>
                          file.description === "Giấy Kiểm định" &&
                          isImageFile(file.fileType)
                      ).length > 0 && (
                        <Grid container spacing={2}>
                          {details.files
                            .filter(
                              (file) =>
                                file.description === "Giấy Kiểm định" &&
                                isImageFile(file.fileType)
                            )
                            .map((file) => (
                              <Grid item xs={12} sm={6} key={file.fileId}>
                                {renderFileItem(file)}
                              </Grid>
                            ))}
                        </Grid>
                      )}

                      {/* Non-image files for Giấy Kiểm định */}
                      {details.files.filter(
                        (file) =>
                          file.description === "Giấy Kiểm định" &&
                          !isImageFile(file.fileType)
                      ).length > 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <List dense>
                            {details.files
                              .filter(
                                (file) =>
                                  file.description === "Giấy Kiểm định" &&
                                  !isImageFile(file.fileType)
                              )
                              .map((file) => renderFileItem(file))}
                          </List>
                        </Paper>
                      )}

                      {/* Show message if no files in this category */}
                      {details.files.filter(
                        (file) => file.description === "Giấy Kiểm định"
                      ).length === 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ py: 2 }}
                          >
                            Không có tài liệu
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Other documents */}
                {details.files.filter(
                  (file) =>
                    file.description !== "Giấy Đăng ký" &&
                    file.description !== "Giấy Kiểm định"
                ).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <InsertDriveFileIcon />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Tài liệu khác
                      </Typography>
                    </Paper>

                    {/* Images for Khác */}
                    {details.files.filter(
                      (file) =>
                        file.description !== "Giấy Đăng ký" &&
                        file.description !== "Giấy Kiểm định" &&
                        isImageFile(file.fileType)
                    ).length > 0 && (
                      <Grid container spacing={2}>
                        {details.files
                          .filter(
                            (file) =>
                              file.description !== "Giấy Đăng ký" &&
                              file.description !== "Giấy Kiểm định" &&
                              isImageFile(file.fileType)
                          )
                          .map((file) => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={isTablet ? 6 : 4}
                              key={file.fileId}
                            >
                              {renderFileItem(file)}
                            </Grid>
                          ))}
                      </Grid>
                    )}

                    {/* Non-image files for Khác */}
                    {details.files.filter(
                      (file) =>
                        file.description !== "Giấy Đăng ký" &&
                        file.description !== "Giấy Kiểm định" &&
                        !isImageFile(file.fileType)
                    ).length > 0 && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "background.paper",
                        }}
                      >
                        <List dense>
                          {details.files
                            .filter(
                              (file) =>
                                file.description !== "Giấy Đăng ký" &&
                                file.description !== "Giấy Kiểm định" &&
                                !isImageFile(file.fileType)
                            )
                            .map((file) => renderFileItem(file))}
                        </List>
                      </Paper>
                    )}
                  </Box>
                )}
              </Paper>
            )}

            {/* Tractor Use History */}
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                mt: 3,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Lịch sử sử dụng đầu kéo
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <TractorUseHistoryTable
                historyData={tractorUseHistory}
                loading={historyLoading}
                onPageChange={handleHistoryPageChange}
                onPageSizeChange={handleHistoryPageSizeChange}
              />
            </Paper>

            {/* Tractor Incident History */}
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                mt: 3,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <WarningIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Lịch sử sự cố
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {tractorId && (
                <TractorIncidentHistoryTable tractorId={tractorId} />
              )}
            </Paper>
          </>
        ) : (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box textAlign="center" py={3}>
              <WarningIcon
                color="error"
                sx={{ fontSize: 60, opacity: 0.6, mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Không tìm thấy thông tin đầu kéo
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Đầu kéo có thể đã bị xóa hoặc có lỗi trong quá trình tải thông
                tin
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/staff-menu/tractors")}
              >
                Quay lại danh sách
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {actionType === "activate" ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6">Xác nhận kích hoạt</Typography>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon color="error" />
              <Typography variant="h6">Xác nhận vô hiệu hóa</Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {errorDetails ? (
            <>
              <DialogContentText color="error" sx={{ mb: 2 }}>
                {actionType === "activate"
                  ? "Không thể kích hoạt đầu kéo"
                  : "Không thể vô hiệu hóa đầu kéo"}
              </DialogContentText>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "error.light",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  color="error.dark"
                  sx={{ fontWeight: 500 }}
                >
                  {errorDetails}
                </Typography>
              </Paper>
            </>
          ) : (
            <Box sx={{ color: "text.secondary" }}>
              {actionType === "activate" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography component="div">
                    Bạn có chắc chắn muốn kích hoạt đầu kéo này?
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography component="div">
                    Bạn có chắc chắn muốn vô hiệu hóa đầu kéo này?
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog(false)} color="inherit">
            Đóng
          </Button>
          {!errorDetails && (
            <Button
              onClick={handleConfirmAction}
              color={actionType === "activate" ? "success" : "error"}
              variant="contained"
              disabled={actionLoading}
              startIcon={
                actionLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : actionType === "activate" ? (
                  <CheckCircleIcon />
                ) : (
                  <DeleteIcon />
                )
              }
            >
              {actionLoading
                ? "Đang xử lý..."
                : actionType === "activate"
                ? "Kích hoạt"
                : "Vô hiệu hóa"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Tractor Update Dialog */}
      <TractorUpdate
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        tractorDetails={details}
        onSuccess={handleUpdateSuccess}
      />
    </Container>
  );
};

export default TractorDetailPage;
