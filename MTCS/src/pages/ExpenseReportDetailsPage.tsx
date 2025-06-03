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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import { getExpenseReportDetails } from "../services/expenseReportApi";
import { ExpenseReport, ExpenseReportFile } from "../types/expenseReport";
import { useAuth } from "../contexts/AuthContext";

const isImageFile = (fileType: string): boolean => {
  return (
    fileType.includes("image") ||
    ["jpg", "jpeg", "png", "gif", "webp"].some((ext) => fileType.includes(ext))
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
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ExpenseReportDetailsPage = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [details, setDetails] = useState<ExpenseReport | null>(null);
  const [loading, setLoading] = useState(true);
  const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!reportId) return;
      try {
        setLoading(true);
        const response = await getExpenseReportDetails(reportId);
        setDetails(response);
      } catch (error) {
        setAlert({
          open: true,
          message: "Không thể tải thông tin báo cáo chi phí",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [reportId]);

  const openImagePreview = (file: ExpenseReportFile) => {
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

  const renderFileItem = (file: ExpenseReportFile) => {
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
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Tải lên bởi: {file.uploadBy}
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
                  {formatDate(file.uploadDate)} • Tải lên bởi: {file.uploadBy}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
      );
    }
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
            onClick={() => navigate(`${prefix}/expense-reports`)}
          >
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="small" />
            Danh sách báo cáo chi phí
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {loading ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              details?.reportId || "Chi tiết báo cáo"
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
                Đang tải thông tin báo cáo chi phí...
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
                borderTop: `4px solid ${
                  details.isPay === 1
                    ? theme.palette.success.main
                    : theme.palette.warning.main
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
                        details.isPay === 1 ? "success.main" : "warning.main",
                      width: 60,
                      height: 60,
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {details.reportId}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {details.reportTypeName}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={
                    details.isPay === 1 ? "Đã thanh toán" : "Chưa thanh toán"
                  }
                  color={details.isPay === 1 ? "success" : "warning"}
                  icon={
                    details.isPay === 1 ? <CheckCircleIcon /> : <PendingIcon />
                  }
                  sx={{
                    px: 2,
                    py: 1,
                    "& .MuiChip-label": { fontSize: "1rem", fontWeight: 500 },
                  }}
                />
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
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
                      Thông tin báo cáo
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Mã báo cáo",
                          value: details.reportId,
                          icon: <ReceiptIcon color="primary" />,
                        },
                        {
                          label: "Loại chi phí",
                          value: details.reportTypeName,
                          icon: <DescriptionIcon color="primary" />,
                        },
                        {
                          label: "Số tiền",
                          value: formatCurrency(details.cost),
                          icon: <AttachMoneyIcon color="primary" />,
                        },
                        {
                          label: "Thời gian báo cáo",
                          value: formatDate(details.reportTime),
                          icon: <EventIcon color="primary" />,
                        },
                        {
                          label: "Người báo cáo",
                          value: details.reportBy,
                          icon: <PersonIcon color="primary" />,
                        },
                        {
                          label: "Trạng thái thanh toán",
                          value:
                            details.isPay === 1
                              ? "Đã thanh toán"
                              : "Chưa thanh toán",
                          icon:
                            details.isPay === 1 ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <PendingIcon color="warning" />
                            ),
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

                <Grid item xs={12} lg={6}>
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
                      Thông tin chuyến hàng
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Mã chuyến hàng",
                          value: details.tripId,
                          icon: <DriveEtaIcon color="primary" />,
                        },
                        {
                          label: "Mã theo dõi",
                          value: details.trackingCode,
                          icon: <DescriptionIcon color="primary" />,
                        },
                        {
                          label: "Tài xế",
                          value: `${details.driverName} (${details.driverId})`,
                          icon: <PersonIcon color="primary" />,
                        },
                        {
                          label: "Địa điểm",
                          value: details.location,
                          icon: <LocationOnIcon color="primary" />,
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} key={index}>
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
                            <Box sx={{ flex: 1 }}>
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
              </Grid>

              {details.description && (
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
                    Mô tả
                  </Typography>
                  <Typography variant="body1">{details.description}</Typography>
                </Paper>
              )}
            </Paper>

            {/* Display expense report files */}
            {details.expenseReportFiles &&
              details.expenseReportFiles.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ mb: 2 }}
                  >
                    <InsertDriveFileIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Tài liệu đính kèm
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  {/* Images */}
                  {details.expenseReportFiles.filter((file) =>
                    isImageFile(file.fileType)
                  ).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, fontWeight: 500, color: "primary.main" }}
                      >
                        Hình ảnh
                      </Typography>
                      <Grid container spacing={2}>
                        {details.expenseReportFiles
                          .filter((file) => isImageFile(file.fileType))
                          .map((file) => (
                            <Grid item xs={12} sm={6} md={4} key={file.fileId}>
                              {renderFileItem(file)}
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Non-image files */}
                  {details.expenseReportFiles.filter(
                    (file) => !isImageFile(file.fileType)
                  ).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, fontWeight: 500, color: "primary.main" }}
                      >
                        Tài liệu khác
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "background.paper",
                        }}
                      >
                        <List dense>
                          {details.expenseReportFiles
                            .filter((file) => !isImageFile(file.fileType))
                            .map((file) => renderFileItem(file))}
                        </List>
                      </Paper>
                    </Box>
                  )}
                </Paper>
              )}
          </>
        ) : (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box textAlign="center" py={3}>
              <WarningIcon
                color="error"
                sx={{ fontSize: 60, opacity: 0.6, mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Không tìm thấy thông tin báo cáo chi phí
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Báo cáo có thể đã bị xóa hoặc có lỗi trong quá trình tải thông
                tin
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`${prefix}/expense-reports`)}
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
          <Box
            component="img"
            src={imagePreview.src}
            alt={imagePreview.title}
            sx={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              p: 2,
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
    </Container>
  );
};

export default ExpenseReportDetailsPage;
