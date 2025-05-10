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

import {
  ContainerType,
  TractorDetails,
  TractorFileDTO,
} from "../../types/tractor";
import {
  updateTractorWithFiles,
  updateTractorFileDetails,
} from "../../services/tractorApi";

const FILE_CATEGORIES = ["Giấy Đăng ký", "Giấy Kiểm định", "Khác"];

interface TractorUpdateProps {
  open: boolean;
  onClose: () => void;
  tractorDetails: TractorDetails | null;
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

const TractorUpdate: React.FC<TractorUpdateProps> = ({
  open,
  onClose,
  tractorDetails,
  onSuccess,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    manufactureYear: new Date().getFullYear(),
    maxLoadWeight: 0,
    lastMaintenanceDate: "",
    nextMaintenanceDate: new Date().toISOString().split("T")[0],
    registrationDate: new Date().toISOString().split("T")[0],
    registrationExpirationDate: new Date().toISOString().split("T")[0],
    containerType: ContainerType.DryContainer,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Files state
  const [existingFiles, setExistingFiles] = useState<TractorFileDTO[]>([]);
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

  // Check if tractor has been used in trips
  const hasTractorUseHistory = !!(
    tractorDetails?.orderCount && tractorDetails.orderCount > 0
  );

  // Initialize form with tractor details
  useEffect(() => {
    if (tractorDetails) {
      setFormData({
        licensePlate: tractorDetails.licensePlate,
        brand: tractorDetails.brand,
        manufactureYear: tractorDetails.manufactureYear,
        maxLoadWeight: tractorDetails.maxLoadWeight,
        lastMaintenanceDate:
          tractorDetails.lastMaintenanceDate?.split("T")[0] || "",
        nextMaintenanceDate:
          tractorDetails.nextMaintenanceDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        registrationDate:
          tractorDetails.registrationDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        registrationExpirationDate:
          tractorDetails.registrationExpirationDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        containerType: tractorDetails.containerType,
      });

      setExistingFiles(tractorDetails.files || []);
      setFilesToRemove([]);
      setNewFiles([]);
      setCustomDescription("");
      setError(null);
      setSuccess(false);
    }
  }, [tractorDetails]);

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
  const handleStartEditFile = (file: TractorFileDTO) => {
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
      const response = await updateTractorFileDetails(
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

    // Validate license plate format
    const licensePlateRegex = /^\d{2}[A-Z]([A-Z0-9])?-\d{4,5}$/;
    if (
      formData.licensePlate &&
      !licensePlateRegex.test(formData.licensePlate)
    ) {
      newErrors.licensePlate =
        "Biển số xe phải có định dạng ví dụ: 51A-1234, 51AB-1234, 51A8-1234, 17S3-50555";
    } else if (formData.licensePlate) {
      // Validate first two digits are between 11-99
      const firstTwoDigits = parseInt(formData.licensePlate.substring(0, 2));
      if (firstTwoDigits < 11 || firstTwoDigits > 99) {
        newErrors.licensePlate =
          "Hai chữ số đầu tiên của biển số xe phải từ 11 đến 99";
      }
    }

    if (formData.licensePlate.length < 8 || formData.licensePlate.length > 10) {
      newErrors.licensePlate = "Biển số xe phải có từ 8 đến 10 ký tự";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Hãng sản xuất không được để trống";
    }

    if (
      !formData.manufactureYear ||
      formData.manufactureYear < 1900 ||
      formData.manufactureYear > 2035
    ) {
      newErrors.manufactureYear = "Năm sản xuất không hợp lệ (1900-2035)";
    }

    if (!formData.maxLoadWeight || formData.maxLoadWeight <= 0) {
      newErrors.maxLoadWeight = "Tải trọng tối đa phải lớn hơn 0";
    }

    // Prevent changing max load weight, container type and license plate if tractor has been used
    if (hasTractorUseHistory && tractorDetails) {
      if (formData.maxLoadWeight !== tractorDetails.maxLoadWeight) {
        newErrors.maxLoadWeight =
          "Không thể thay đổi tải trọng tối đa khi đầu kéo đã được sử dụng trong chuyến hàng";
      }

      if (formData.containerType !== tractorDetails.containerType) {
        newErrors.containerType =
          "Không thể thay đổi loại container khi đầu kéo đã được sử dụng trong chuyến hàng";
      }

      if (formData.licensePlate !== tractorDetails.licensePlate) {
        newErrors.licensePlate =
          "Không thể thay đổi biển số xe khi đầu kéo đã được sử dụng trong chuyến hàng";
      }
    }

    // Define min and max date boundaries
    const minYear = 1990;
    const maxYear = 2035;
    const minDate = new Date(minYear, 0, 1);
    const maxDate = new Date(maxYear, 11, 31);

    // Validate required dates aren't null or empty
    if (!formData.nextMaintenanceDate) {
      newErrors.nextMaintenanceDate =
        "Ngày bảo dưỡng tiếp theo không được để trống";
    }

    if (!formData.registrationDate) {
      newErrors.registrationDate = "Ngày đăng kiểm không được để trống";
    }

    if (!formData.registrationExpirationDate) {
      newErrors.registrationExpirationDate =
        "Ngày hết hạn đăng kiểm không được để trống";
    }

    // Validate next maintenance date is not in the past
    const nextMaintenance = new Date(formData.nextMaintenanceDate);
    nextMaintenance.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    if (nextMaintenance < today) {
      newErrors.nextMaintenanceDate =
        "Ngày bảo dưỡng tiếp theo không thể trong quá khứ";
    }

    if (nextMaintenance < minDate || nextMaintenance > maxDate) {
      newErrors.nextMaintenanceDate = `Ngày bảo dưỡng tiếp theo phải từ năm ${minYear} đến năm ${maxYear}`;
    }

    // Only validate lastMaintenanceDate if it's provided
    if (formData.lastMaintenanceDate) {
      const lastMaintenance = new Date(formData.lastMaintenanceDate);
      lastMaintenance.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      if (nextMaintenance <= lastMaintenance) {
        newErrors.nextMaintenanceDate =
          "Ngày bảo dưỡng tiếp theo phải sau ngày bảo dưỡng gần nhất";
      }

      // Last maintenance date cannot be in the future
      if (lastMaintenance > today) {
        newErrors.lastMaintenanceDate =
          "Ngày bảo dưỡng gần nhất không thể là ngày trong tương lai";
      }

      if (lastMaintenance < minDate || lastMaintenance > maxDate) {
        newErrors.lastMaintenanceDate = `Ngày bảo dưỡng gần nhất phải từ năm ${minYear} đến năm ${maxYear}`;
      }
    }

    const registration = new Date(formData.registrationDate);
    registration.setHours(0, 0, 0, 0);

    const registrationExpiration = new Date(
      formData.registrationExpirationDate
    );
    registrationExpiration.setHours(0, 0, 0, 0);

    // Registration date cannot be in the future
    if (registration > today) {
      newErrors.registrationDate =
        "Ngày đăng kiểm không thể là ngày trong tương lai";
    }

    if (registration < minDate || registration > maxDate) {
      newErrors.registrationDate = `Ngày đăng kiểm phải từ năm ${minYear} đến năm ${maxYear}`;
    }

    if (registrationExpiration < minDate || registrationExpiration > maxDate) {
      newErrors.registrationExpirationDate = `Ngày hết hạn đăng kiểm phải từ năm ${minYear} đến năm ${maxYear}`;
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

    if (!tractorDetails?.tractorId) {
      setError("Không tìm thấy ID của đầu kéo");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateTractorWithFiles(
        tractorDetails.tractorId,
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
          response.messageVN || "Có lỗi xảy ra khi cập nhật thông tin đầu kéo"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.messageVN ||
        "Có lỗi xảy ra khi cập nhật thông tin đầu kéo";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
          Cập nhật thông tin đầu kéo
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
            Cập nhật thông tin đầu kéo thành công!
          </Alert>
        )}

        {hasTractorUseHistory && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
            Đầu kéo này đã lưu hành cho {tractorDetails?.orderCount} chuyến
            hàng. Không thể thay đổi tải trọng tối đa và loại container.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Tractor Information */}
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
                    helperText={errors.licensePlate}
                    disabled={loading || hasTractorUseHistory}
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
                        max: 2035,
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
                      (hasTractorUseHistory
                        ? "Không thể thay đổi khi đã lưu hành"
                        : "")
                    }
                    disabled={loading || hasTractorUseHistory}
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
                    disabled={loading || hasTractorUseHistory}
                    error={!!errors.containerType}
                  >
                    <InputLabel>Loại container</InputLabel>
                    <Select
                      name="containerType"
                      value={formData.containerType}
                      onChange={handleSelectChange}
                      label="Loại container"
                    >
                      <MenuItem value={ContainerType.DryContainer}>
                        Khô
                      </MenuItem>
                      <MenuItem value={ContainerType.ReeferContainer}>
                        Lạnh
                      </MenuItem>
                    </Select>
                    {(errors.containerType || hasTractorUseHistory) && (
                      <Typography
                        variant="caption"
                        color={
                          errors.containerType ? "error" : "text.secondary"
                        }
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.containerType ||
                          (hasTractorUseHistory
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
                    helperText={
                      errors.lastMaintenanceDate ||
                      "Để trống nếu chưa bảo dưỡng"
                    }
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: "1990-01-01",
                      max: "2035-12-31",
                    }}
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
                    inputProps={{
                      min: "1990-01-01",
                      max: "2035-12-31",
                    }}
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
                    inputProps={{
                      min: "1990-01-01",
                      max: "2035-12-31",
                    }}
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
                    inputProps={{
                      min: "1990-01-01",
                      max: "2035-12-31",
                    }}
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

export default TractorUpdate;
