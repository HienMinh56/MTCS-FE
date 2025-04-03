import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Grid,
  Typography,
  IconButton,
  Box,
  Paper,
  Fade,
  Button,
  DialogActions,
  Snackbar,
  Alert,
  DialogContentText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Link,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import {
  getTractorDetails,
  deactivateTractor,
  activateTractor,
} from "../../services/tractorApi";
import {
  TractorDetails as ITractorDetails,
  ContainerType,
  TractorStatus,
  TractorFileDTO,
} from "../../types/tractor";

interface Props {
  open: boolean;
  tractorId: string | null | undefined;
  onClose: () => void;
  onDelete?: () => void;
}

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

const TractorDetails = ({ open, tractorId, onClose, onDelete }: Props) => {
  const [details, setDetails] = useState<ITractorDetails | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [statusChanged, setStatusChanged] = useState(false);
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
    if (tractorId) {
      fetchDetails();
    } else {
      setDetails(null);
    }
  }, [tractorId]);

  const fetchDetails = async () => {
    if (!tractorId) return;
    try {
      setLoading(true);
      const response = await getTractorDetails(tractorId);
      if (response.success) {
        setDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching tractor details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tractorId) {
      fetchDetails();
    }
  }, [tractorId, open]);

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

        // Immediately trigger the refresh callback
        if (onDelete) {
          onDelete();
        }

        setStatusChanged(true);
        setConfirmDialog(false);
        onClose();
      } else {
        // Check for detailed error message in messageVN for both activate and deactivate
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

  const handleClose = () => {
    // One more check to ensure refresh happens
    if (statusChanged && onDelete) {
      onDelete();
      setStatusChanged(false);
    }
    onClose();
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

  const groupFilesByCategory = (files: TractorFileDTO[]) => {
    const grouped: Record<string, TractorFileDTO[]> = {};

    // Initialize all categories with empty arrays
    FILE_CATEGORIES.forEach((category) => {
      grouped[category] = [];
    });

    // Group files by their description
    files.forEach((file) => {
      const category =
        file.description && FILE_CATEGORIES.includes(file.description)
          ? file.description
          : "Khác";

      grouped[category].push(file);
    });

    return grouped;
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

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          Chi tiết đầu kéo
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1.5, bgcolor: "#f5f5f5" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : details ? (
            <>
              <Grid container spacing={1}>
                {[
                  { label: "Biển số xe", value: details.licensePlate },
                  { label: "Hãng sản xuất", value: details.brand },
                  { label: "Năm sản xuất", value: details.manufactureYear },
                  {
                    label: "Tải trọng tối đa",
                    value: `${details.maxLoadWeight} tấn`,
                  },
                  {
                    label: "Loại container",
                    value:
                      details.containerType === ContainerType.DryContainer
                        ? "Khô"
                        : "Lạnh",
                  },
                  {
                    label: "Số chuyến hàng đã hoàn thành",
                    value: details.orderCount,
                  },
                ].map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        height: "100%",
                        backgroundColor: "white",
                        borderRadius: 2,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 0.25, fontWeight: 500 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {item.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}

                {[
                  {
                    label: "Bảo dưỡng gần nhất",
                    value: formatDate(details.lastMaintenanceDate),
                  },
                  {
                    label: "Bảo dưỡng tiếp theo",
                    value: formatDate(details.nextMaintenanceDate),
                  },
                  {
                    label: "Ngày đăng kiểm",
                    value: formatDate(details.registrationDate),
                  },
                  {
                    label: "Hạn đăng kiểm",
                    value: formatDate(details.registrationExpirationDate),
                  },
                ].map((item, index) => (
                  <Grid item xs={6} key={`date-${index}`}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        height: "100%",
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        borderRadius: 2,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mb: 0.25, fontWeight: 500 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "primary.dark" }}
                      >
                        {item.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Display tractor files by category */}
              {details.files && details.files.length > 0 && (
                <Box mt={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "white",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Tài liệu đính kèm
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Layout the documents horizontally */}
                    <Box sx={{ width: "100%" }}>
                      <Grid container spacing={2}>
                        {/* Render Giấy Đăng ký files */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 500,
                                mb: 1,
                                color: "primary.main",
                                borderBottom: "1px dashed #ccc",
                                pb: 0.5,
                              }}
                            >
                              Giấy Đăng ký
                            </Typography>

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
                              <List dense>
                                {details.files
                                  .filter(
                                    (file) =>
                                      file.description === "Giấy Đăng ký" &&
                                      !isImageFile(file.fileType)
                                  )
                                  .map((file) => renderFileItem(file))}
                              </List>
                            )}

                            {/* Show message if no files in this category */}
                            {details.files.filter(
                              (file) => file.description === "Giấy Đăng ký"
                            ).length === 0 && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ py: 1 }}
                              >
                                Không có tài liệu
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        {/* Render Giấy Kiểm định files */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 500,
                                mb: 1,
                                color: "primary.main",
                                borderBottom: "1px dashed #ccc",
                                pb: 0.5,
                              }}
                            >
                              Giấy Kiểm định
                            </Typography>

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
                              <List dense>
                                {details.files
                                  .filter(
                                    (file) =>
                                      file.description === "Giấy Kiểm định" &&
                                      !isImageFile(file.fileType)
                                  )
                                  .map((file) => renderFileItem(file))}
                              </List>
                            )}

                            {/* Show message if no files in this category */}
                            {details.files.filter(
                              (file) => file.description === "Giấy Kiểm định"
                            ).length === 0 && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ py: 1 }}
                              >
                                Không có tài liệu
                              </Typography>
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
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 500,
                              mb: 1,
                              color: "primary.main",
                              borderBottom: "1px dashed #ccc",
                              pb: 0.5,
                            }}
                          >
                            Khác
                          </Typography>

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
                                    md={4}
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
                          )}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Không có thông tin chi tiết.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Đóng
          </Button>
          {onDelete &&
            details &&
            (details.status === TractorStatus.Active ? (
              <Button
                onClick={handleDeactivateClick}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Vô hiệu hóa
              </Button>
            ) : (
              <Button
                onClick={handleActivateClick}
                color="success"
                startIcon={<CheckCircleIcon />}
              >
                Kích hoạt
              </Button>
            ))}
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={closeImagePreview}
        maxWidth="lg"
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ pb: 1 }}>
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
        <DialogContent sx={{ p: 0, textAlign: "center" }}>
          <img
            src={imagePreview.src}
            alt={imagePreview.title}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            component="a"
            href={imagePreview.src}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở trong cửa sổ mới
          </Button>
          <Button onClick={closeImagePreview} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {actionType === "activate"
            ? "Xác nhận kích hoạt"
            : "Xác nhận vô hiệu hóa"}
        </DialogTitle>
        <DialogContent>
          {errorDetails ? (
            <>
              <DialogContentText color="error" sx={{ mb: 2 }}>
                {actionType === "activate"
                  ? "Không thể kích hoạt đầu kéo"
                  : "Không thể vô hiệu hóa đầu kéo"}
              </DialogContentText>
              <Typography
                variant="body2"
                color="error"
                sx={{ fontWeight: 500 }}
              >
                {errorDetails}
              </Typography>
            </>
          ) : (
            <DialogContentText>
              {actionType === "activate"
                ? "Bạn có chắc chắn muốn kích hoạt đầu kéo này?"
                : "Bạn có chắc chắn muốn vô hiệu hóa đầu kéo này?"}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="primary">
            Đóng
          </Button>
          {!errorDetails && (
            <Button
              onClick={handleConfirmAction}
              color={actionType === "activate" ? "success" : "secondary"}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Xác nhận"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TractorDetails;
