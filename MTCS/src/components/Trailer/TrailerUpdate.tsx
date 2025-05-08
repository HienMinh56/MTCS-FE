import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Paper,
  InputAdornment,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

import { TrailerDetails, TrailerFileDTO } from "../../types/trailer";
import {
  updateTrailerWithFiles,
  updateTrailerFileDetails,
} from "../../services/trailerApi";

const FILE_CATEGORIES = ["Giấy Đăng ký", "Giấy Kiểm định", "Khác"];

interface TrailerUpdateProps {
  open: boolean;
  onClose: () => void;
  trailerDetails: TrailerDetails | null;
  onSuccess: () => void;
}

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
  } else {
    return <InsertDriveFileIcon color="action" />;
  }
};

const TrailerUpdate: React.FC<TrailerUpdateProps> = ({
  open,
  onClose,
  trailerDetails,
  onSuccess,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    manufactureYear: new Date().getFullYear(),
    maxLoadWeight: 0,
    lastMaintenanceDate: new Date().toISOString().split("T")[0],
    nextMaintenanceDate: new Date().toISOString().split("T")[0],
    registrationDate: new Date().toISOString().split("T")[0],
    registrationExpirationDate: new Date().toISOString().split("T")[0],
    containerSize: 20, // Set default to 20 which matches the MenuItem value
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Files state
  const [existingFiles, setExistingFiles] = useState<TrailerFileDTO[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<
    Array<{
      file: File;
      description: string;
      note?: string;
      preview?: string;
    }>
  >([]);
  const [newFileDescription, setNewFileDescription] = useState<string>(
    FILE_CATEGORIES[0]
  );
  const [newFileNote, setNewFileNote] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");

  // File editing state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [fileEditData, setFileEditData] = useState<{
    description: string;
    note: string;
  }>({ description: "", note: "" });
  const [fileEditLoading, setFileEditLoading] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Check if trailer has been used in trips
  const hasTrailerUseHistory = !!(
    trailerDetails?.orderCount && trailerDetails.orderCount > 0
  );

  // Initialize form with trailer details
  useEffect(() => {
    if (trailerDetails) {
      setFormData({
        licensePlate: trailerDetails.licensePlate,
        brand: trailerDetails.brand,
        manufactureYear: trailerDetails.manufactureYear,
        maxLoadWeight: trailerDetails.maxLoadWeight,
        lastMaintenanceDate:
          trailerDetails.lastMaintenanceDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        nextMaintenanceDate:
          trailerDetails.nextMaintenanceDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        registrationDate:
          trailerDetails.registrationDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        registrationExpirationDate:
          trailerDetails.registrationExpirationDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        // Fix the containerSize mapping - properly map from backend enum (1=20ft, 2=40ft) to UI values
        containerSize:
          trailerDetails.containerSize === 1
            ? 20
            : trailerDetails.containerSize === 2
            ? 40
            : 20,
      });

      setExistingFiles(trailerDetails.files || []);
      setFilesToRemove([]);
      setNewFiles([]);
      setCustomDescription("");
      setError(null);
      setSuccess(false);
    }
  }, [trailerDetails]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => {
          const updatedErrors = { ...prev };
          delete updatedErrors[name];
          return updatedErrors;
        });
      }
    }
  };

  // Add a specialized handler for Select components
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => {
          const updatedErrors = { ...prev };
          delete updatedErrors[name];
          return updatedErrors;
        });
      }
    }
  };

  // Handle date changes using standard input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  // Mark a file for removal
  const handleRemoveExistingFile = (fileId: string) => {
    setFilesToRemove((prev) => [...prev, fileId]);
  };

  // Undo remove marking
  const handleUndoRemoveFile = (fileId: string) => {
    setFilesToRemove((prev) => prev.filter((id) => id !== fileId));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileReader = new FileReader();

      const finalDescription =
        newFileDescription === "Khác" ? customDescription : newFileDescription;

      fileReader.onload = () => {
        setNewFiles((prev) => [
          ...prev,
          {
            file,
            description: finalDescription,
            note: newFileNote || undefined,
            preview: isImageFile(file.type)
              ? (fileReader.result as string)
              : undefined,
          },
        ]);
      };

      if (isImageFile(file.type)) {
        fileReader.readAsDataURL(file);
      } else {
        setNewFiles((prev) => [
          ...prev,
          {
            file,
            description: finalDescription,
            note: newFileNote || undefined,
          },
        ]);
      }

      setNewFileNote("");
      setCustomDescription("");
      e.target.value = "";
    }
  };

  // Remove a new file from the list
  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Start editing a file
  const handleStartEditFile = (file: TrailerFileDTO) => {
    setEditingFileId(file.fileId);
    setFileEditData({
      description: file.description || "",
      note: file.note || "",
    });
  };

  // Cancel editing a file
  const handleCancelEditFile = () => {
    setEditingFileId(null);
    setFileEditData({ description: "", note: "" });
  };

  // Save file edits
  const handleSaveFileEdit = async () => {
    if (!editingFileId) return;

    setFileEditLoading(true);
    try {
      const response = await updateTrailerFileDetails(
        editingFileId,
        fileEditData
      );

      if (response.success) {
        // Update the file in the existing files list
        setExistingFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.fileId === editingFileId
              ? {
                  ...file,
                  description: fileEditData.description,
                  note: fileEditData.note,
                }
              : file
          )
        );
        setEditingFileId(null);
      } else {
        setError(
          response.messageVN || "Có lỗi xảy ra khi cập nhật thông tin tài liệu"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.messageVN ||
        "Có lỗi xảy ra khi cập nhật thông tin tài liệu";
      setError(errorMessage);
    } finally {
      setFileEditLoading(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    // Set today to the start of the day for accurate comparison
    today.setHours(0, 0, 0, 0);

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "Biển số xe không được để trống";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Hãng sản xuất không được để trống";
    }

    if (
      !formData.manufactureYear ||
      formData.manufactureYear < 1900 ||
      formData.manufactureYear > new Date().getFullYear()
    ) {
      newErrors.manufactureYear = "Năm sản xuất không hợp lệ";
    }

    if (!formData.maxLoadWeight || formData.maxLoadWeight <= 0) {
      newErrors.maxLoadWeight = "Tải trọng tối đa phải lớn hơn 0";
    }

    if (!formData.containerSize || formData.containerSize <= 0) {
      newErrors.containerSize = "Kích thước container không hợp lệ";
    }

    // Prevent changing max load weight, container size and license plate if trailer has been used
    if (hasTrailerUseHistory && trailerDetails) {
      if (formData.licensePlate !== trailerDetails.licensePlate) {
        newErrors.licensePlate =
          "Không thể thay đổi biển số xe khi rơ moóc đã được sử dụng trong chuyến hàng";
      }

      if (formData.maxLoadWeight !== trailerDetails.maxLoadWeight) {
        newErrors.maxLoadWeight =
          "Không thể thay đổi tải trọng tối đa khi rơ moóc đã được sử dụng trong chuyến hàng";
      }

      // Convert containerSize back to database format (20->1, 40->2) for comparison
      const containerSizeForComparison =
        formData.containerSize === 20
          ? 1
          : formData.containerSize === 40
          ? 2
          : 0;
      if (containerSizeForComparison !== trailerDetails.containerSize) {
        newErrors.containerSize =
          "Không thể thay đổi kích thước container khi rơ moóc đã được sử dụng trong chuyến hàng";
      }
    }

    // Prepare dates for comparison by setting time to start of day
    const lastMaintenance = new Date(formData.lastMaintenanceDate);
    lastMaintenance.setHours(0, 0, 0, 0);

    const nextMaintenance = new Date(formData.nextMaintenanceDate);
    nextMaintenance.setHours(0, 0, 0, 0);

    const registration = new Date(formData.registrationDate);
    registration.setHours(0, 0, 0, 0);

    const registrationExpiration = new Date(
      formData.registrationExpirationDate
    );
    registrationExpiration.setHours(0, 0, 0, 0);

    // Validate next maintenance date is not in the past
    if (nextMaintenance < today) {
      newErrors.nextMaintenanceDate =
        "Ngày bảo dưỡng tiếp theo không thể là ngày trong quá khứ";
    }

    // Validate next maintenance date is after last maintenance date
    if (nextMaintenance <= lastMaintenance) {
      newErrors.nextMaintenanceDate =
        "Ngày bảo dưỡng tiếp theo phải sau ngày bảo dưỡng gần nhất";
    }

    if (registrationExpiration <= registration) {
      newErrors.registrationExpirationDate =
        "Ngày hết hạn đăng kiểm phải sau ngày đăng kiểm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!trailerDetails?.trailerId) {
      setError("Không tìm thấy ID của rơ moóc");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateTrailerWithFiles(
        trailerDetails.trailerId,
        formData,
        newFiles.map(({ file, description, note }) => ({
          file,
          description,
          note,
        })),
        filesToRemove
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(
          response.messageVN || "Có lỗi xảy ra khi cập nhật thông tin rơ moóc"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.messageVN ||
        "Có lỗi xảy ra khi cập nhật thông tin rơ moóc";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Cập nhật thông tin rơ-moóc
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 1 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
            Cập nhật thông tin rơ moóc thành công!
          </Alert>
        )}

        {hasTrailerUseHistory && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
            Rơ moóc-này đã lưu hành cho {trailerDetails?.orderCount} chuyến
            hàng. Không thể thay đổi biển số xe, tải trọng tối đa và kích thước
            container.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Trailer Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thông tin cơ bản
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Biển số xe"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    error={!!errors.licensePlate}
                    helperText={
                      errors.licensePlate ||
                      (hasTrailerUseHistory
                        ? "Không thể thay đổi khi đã lưu hành"
                        : "")
                    }
                    disabled={loading || hasTrailerUseHistory}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hãng sản xuất"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    error={!!errors.brand}
                    helperText={errors.brand}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Năm sản xuất"
                    name="manufactureYear"
                    type="number"
                    value={formData.manufactureYear}
                    onChange={handleInputChange}
                    error={!!errors.manufactureYear}
                    helperText={errors.manufactureYear}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                    InputProps={{
                      inputProps: {
                        min: 1900,
                        max: new Date().getFullYear(),
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tải trọng tối đa"
                    name="maxLoadWeight"
                    type="number"
                    value={formData.maxLoadWeight}
                    onChange={handleInputChange}
                    error={!!errors.maxLoadWeight}
                    helperText={
                      errors.maxLoadWeight ||
                      (hasTrailerUseHistory
                        ? "Không thể thay đổi khi đã lưu hành"
                        : "")
                    }
                    disabled={loading || hasTrailerUseHistory}
                    variant="outlined"
                    size="small"
                    required
                    InputProps={{
                      inputProps: { min: 0 },
                      endAdornment: (
                        <InputAdornment position="end">tấn</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    size="small"
                    disabled={loading || hasTrailerUseHistory}
                  >
                    <InputLabel>Kích thước container</InputLabel>
                    <Select
                      name="containerSize"
                      value={formData.containerSize}
                      onChange={handleSelectChange}
                      label="Kích thước container"
                    >
                      <MenuItem value={20}>20 feet</MenuItem>
                      <MenuItem value={40}>40 feet</MenuItem>
                    </Select>
                    {(errors.containerSize || hasTrailerUseHistory) && (
                      <Typography
                        variant="caption"
                        color={
                          errors.containerSize ? "error" : "text.secondary"
                        }
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.containerSize ||
                          (hasTrailerUseHistory
                            ? "Không thể thay đổi khi đã lưu hành"
                            : "")}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Maintenance and Registration Info */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thông tin bảo dưỡng & đăng kiểm
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày bảo dưỡng gần nhất"
                    name="lastMaintenanceDate"
                    type="date"
                    value={formData.lastMaintenanceDate}
                    onChange={handleDateChange}
                    error={!!errors.lastMaintenanceDate}
                    helperText={errors.lastMaintenanceDate}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày bảo dưỡng tiếp theo"
                    name="nextMaintenanceDate"
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={handleDateChange}
                    error={!!errors.nextMaintenanceDate}
                    helperText={errors.nextMaintenanceDate}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày đăng kiểm"
                    name="registrationDate"
                    type="date"
                    value={formData.registrationDate}
                    onChange={handleDateChange}
                    error={!!errors.registrationDate}
                    helperText={errors.registrationDate}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hạn đăng kiểm"
                    name="registrationExpirationDate"
                    type="date"
                    value={formData.registrationExpirationDate}
                    onChange={handleDateChange}
                    error={!!errors.registrationExpirationDate}
                    helperText={errors.registrationExpirationDate}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Existing Files Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                border: "1px solid #e0e0e0",
                minHeight: 350,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Tài liệu hiện tại
              </Typography>

              {existingFiles.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                    bgcolor: "#eee",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Không có tài liệu đính kèm
                  </Typography>
                </Box>
              ) : (
                <List>
                  {existingFiles.map((file) => {
                    const isMarkedForRemoval = filesToRemove.includes(
                      file.fileId
                    );
                    const isEditing = editingFileId === file.fileId;

                    return (
                      <ListItem
                        key={file.fileId}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: isMarkedForRemoval
                            ? "error.lighter"
                            : isEditing
                            ? "info.lighter"
                            : "background.paper",
                          textDecoration: isMarkedForRemoval
                            ? "line-through"
                            : "none",
                          opacity: isMarkedForRemoval ? 0.7 : 1,
                          position: "relative",
                          flexDirection: isEditing ? "column" : "row",
                          alignItems: isEditing ? "flex-start" : "center",
                          paddingRight: isEditing ? 2 : 7,
                        }}
                      >
                        {isEditing ? (
                          // Editing mode UI
                          <Box sx={{ width: "100%", mt: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Mô tả tài liệu"
                                  value={fileEditData.description}
                                  onChange={(e) =>
                                    setFileEditData({
                                      ...fileEditData,
                                      description: e.target.value,
                                    })
                                  }
                                  disabled={fileEditLoading}
                                  variant="outlined"
                                  size="small"
                                  required
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Ghi chú (tùy chọn)"
                                  value={fileEditData.note}
                                  onChange={(e) =>
                                    setFileEditData({
                                      ...fileEditData,
                                      note: e.target.value,
                                    })
                                  }
                                  disabled={fileEditLoading}
                                  variant="outlined"
                                  size="small"
                                  multiline
                                  rows={2}
                                />
                              </Grid>
                              <Grid item xs={12} sx={{ textAlign: "right" }}>
                                <Button
                                  startIcon={<CancelIcon />}
                                  onClick={handleCancelEditFile}
                                  disabled={fileEditLoading}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={
                                    fileEditLoading ? (
                                      <CircularProgress
                                        size={20}
                                        color="inherit"
                                      />
                                    ) : (
                                      <CheckIcon />
                                    )
                                  }
                                  onClick={handleSaveFileEdit}
                                  disabled={
                                    fileEditLoading ||
                                    !fileEditData.description.trim()
                                  }
                                  size="small"
                                >
                                  {fileEditLoading ? "Đang lưu..." : "Lưu"}
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        ) : (
                          // Normal view
                          <>
                            <ListItemAvatar>
                              <Avatar>{getFileIcon(file.fileType)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={file.fileName}
                              secondary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color: "primary.main",
                                      fontWeight: 500,
                                      backgroundColor:
                                        "rgba(25, 118, 210, 0.08)",
                                      px: 0.8,
                                      py: 0.2,
                                      borderRadius: 1,
                                      display: "inline-block",
                                      mb: 0.5,
                                    }}
                                  >
                                    {file.description}
                                  </Typography>
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
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              {isMarkedForRemoval ? (
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleUndoRemoveFile(file.fileId)
                                  }
                                  color="primary"
                                >
                                  Hoàn tác
                                </Button>
                              ) : (
                                <>
                                  <Tooltip title="Chỉnh sửa thông tin">
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleStartEditFile(file)}
                                      color="info"
                                      size="small"
                                      disabled={loading}
                                      sx={{ mr: 1 }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa tài liệu">
                                    <IconButton
                                      edge="end"
                                      onClick={() =>
                                        handleRemoveExistingFile(file.fileId)
                                      }
                                      color="error"
                                      size="small"
                                      disabled={loading}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </ListItemSecondaryAction>
                          </>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Grid>

          {/* New Files Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                border: "1px solid #e0e0e0",
                minHeight: 350,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thêm tài liệu mới
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" disabled={loading}>
                    <InputLabel>Loại tài liệu</InputLabel>
                    <Select
                      value={newFileDescription}
                      onChange={(e) =>
                        setNewFileDescription(e.target.value as string)
                      }
                      label="Loại tài liệu"
                    >
                      {FILE_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {newFileDescription === "Khác" ? (
                    <TextField
                      fullWidth
                      label="Nhập loại tài liệu"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      disabled={loading}
                      variant="outlined"
                      size="small"
                      required
                      error={!customDescription.trim()}
                      helperText={
                        !customDescription.trim()
                          ? "Vui lòng nhập loại tài liệu"
                          : ""
                      }
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Ghi chú (tùy chọn)"
                      value={newFileNote}
                      onChange={(e) => setNewFileNote(e.target.value)}
                      disabled={loading}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Grid>

                {newFileDescription === "Khác" && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú (tùy chọn)"
                      value={newFileNote}
                      onChange={(e) => setNewFileNote(e.target.value)}
                      disabled={loading}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: "primary.main",
                      borderRadius: 1,
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: "rgba(25, 118, 210, 0.04)",
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                      },
                      position: "relative",
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                      disabled={
                        loading ||
                        (newFileDescription === "Khác" &&
                          !customDescription.trim())
                      }
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <CloudUploadIcon
                        color="primary"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography
                        variant="body1"
                        color="primary.main"
                        fontWeight={500}
                      >
                        Tải lên tài liệu
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Kéo thả file vào đây hoặc click để chọn
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {newFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tài liệu mới ({newFiles.length})
                  </Typography>
                  <List>
                    {newFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: "background.paper",
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveNewFile(index)}
                            color="error"
                            size="small"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt="preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              getFileIcon(file.file.type)
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={file.file.name}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 500,
                                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: 1,
                                  display: "inline-block",
                                  mb: 0.5,
                                }}
                              >
                                {file.description}
                              </Typography>
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
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || success}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrailerUpdate;
