import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
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
import { Driver, DriverFile } from "../../types/driver";
import {
  updateDriverWithFiles,
  updateDriverFileDetails,
  FileDetailsDTO,
} from "../../services/DriverApi";
import { DATE_FORMAT } from "../../utils/dateConfig";

const FILE_DESCRIPTION_OPTIONS = [
  "CCCD - Mặt trước",
  "CCCD - Mặt sau",
  "Giấy phép lái xe",
  "Hợp đồng lao động",
  "Khác",
];

const getDocumentParameter = (description: string): string => {
  switch (description) {
    case "CCCD - Mặt trước":
      return "CCCD_Front";
    case "CCCD - Mặt sau":
      return "CCCD_Back";
    case "Giấy phép lái xe":
      return "Driver_License";
    case "Hợp đồng lao động":
      return "Work_Contract";
    default:
      return description;
  }
};

interface DriverUpdateProps {
  open: boolean;
  onClose: () => void;
  driverDetails: Driver | null;
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

const DriverUpdate: React.FC<DriverUpdateProps> = ({
  open,
  onClose,
  driverDetails,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: null as Date | null,
    password: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingFiles, setExistingFiles] = useState<DriverFile[]>([]);
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
    FILE_DESCRIPTION_OPTIONS[0]
  );
  const [newFileNote, setNewFileNote] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [fileEditData, setFileEditData] = useState<{
    description: string;
    note: string;
  }>({ description: "", note: "" });
  const [fileEditCustomDescription, setFileEditCustomDescription] =
    useState<string>("");
  const [fileEditLoading, setFileEditLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (driverDetails) {
      setFormData({
        fullName: driverDetails.fullName || "",
        email: driverDetails.email || "",
        phoneNumber: driverDetails.phoneNumber || "",
        dateOfBirth: driverDetails.dateOfBirth
          ? new Date(driverDetails.dateOfBirth)
          : null,
        password: null,
      });

      setExistingFiles(driverDetails.files || []);
      setFilesToRemove([]);
      setNewFiles([]);
      setCustomDescription("");
      setError(null);
      setSuccess(false);
    }
  }, [driverDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "password") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.trim() === "" ? null : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date,
    }));

    if (errors.dateOfBirth) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors.dateOfBirth;
        return updatedErrors;
      });
    }
  };

  const handleRemoveExistingFile = (fileId: string) => {
    setFilesToRemove((prev) => [...prev, fileId]);
  };

  const handleUndoRemoveFile = (fileId: string) => {
    setFilesToRemove((prev) => prev.filter((id) => id !== fileId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileReader = new FileReader();

      let finalDescription = "";
      if (newFileDescription === "Khác") {
        finalDescription = customDescription;
      } else {
        finalDescription = getDocumentParameter(newFileDescription);
      }

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

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEditFile = (file: DriverFile) => {
    setEditingFileId(file.fileId);

    const isStandardDescription = FILE_DESCRIPTION_OPTIONS.includes(
      file.description || ""
    );

    setFileEditData({
      description: isStandardDescription ? file.description || "" : "Khác",
      note: file.note || "",
    });

    if (!isStandardDescription && file.description) {
      setFileEditCustomDescription(file.description);
    } else {
      setFileEditCustomDescription("");
    }
  };

  const handleCancelEditFile = () => {
    setEditingFileId(null);
    setFileEditData({ description: "", note: "" });
    setFileEditCustomDescription("");
  };

  const handleEditDescriptionChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setFileEditData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleSaveFileEdit = async () => {
    if (!editingFileId) return;

    setFileEditLoading(true);
    try {
      const finalDescription =
        fileEditData.description === "Khác"
          ? fileEditCustomDescription
          : fileEditData.description;

      const fileUpdateData: FileDetailsDTO = {
        description: finalDescription,
        note: fileEditData.note || undefined,
      };

      const response = await updateDriverFileDetails(
        editingFileId,
        fileUpdateData
      );

      if (response.success) {
        setExistingFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.fileId === editingFileId
              ? {
                  ...file,
                  description: finalDescription,
                  note: fileEditData.note,
                }
              : file
          )
        );
        setEditingFileId(null);
        setFileEditCustomDescription("");
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số";
    }

    if (formData.password !== null && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!driverDetails?.driverId) {
      setError("Không tìm thấy ID của tài xế");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth
          ? formData.dateOfBirth.toISOString().split("T")[0]
          : null,
        password: formData.password || "",
      };

      const formattedNewFiles = newFiles.map(({ file, description, note }) => ({
        file,
        description,
        note: note || "",
      }));

      const response = await updateDriverWithFiles(
        driverDetails.driverId,
        updateData,
        formattedNewFiles,
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
          response.messageVN || "Có lỗi xảy ra khi cập nhật thông tin tài xế"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.messageVN ||
        "Có lỗi xảy ra khi cập nhật thông tin tài xế";
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
          Cập nhật thông tin tài xế
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
            Cập nhật thông tin tài xế thành công!
          </Alert>
        )}

        <Grid container spacing={3}>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới (để trống nếu không đổi)"
                    name="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    autoComplete="new-password"
                    inputProps={{
                      autoComplete: "new-password",
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <DatePicker
                    label="Ngày sinh"
                    value={
                      formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null
                    }
                    onChange={(date) =>
                      handleDateChange(date?.toDate() || null)
                    }
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth,
                        disabled: loading,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

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
                          <Box sx={{ width: "100%", mt: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <FormControl
                                  fullWidth
                                  size="small"
                                  disabled={fileEditLoading}
                                >
                                  <InputLabel>Loại tài liệu</InputLabel>
                                  <Select
                                    value={fileEditData.description}
                                    onChange={handleEditDescriptionChange}
                                    label="Loại tài liệu"
                                  >
                                    {FILE_DESCRIPTION_OPTIONS.map(
                                      (category) => (
                                        <MenuItem
                                          key={category}
                                          value={category}
                                        >
                                          {category}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                </FormControl>
                              </Grid>

                              {fileEditData.description === "Khác" && (
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Nhập loại tài liệu"
                                    value={fileEditCustomDescription}
                                    onChange={(e) =>
                                      setFileEditCustomDescription(
                                        e.target.value
                                      )
                                    }
                                    disabled={fileEditLoading}
                                    variant="outlined"
                                    size="small"
                                    required
                                    error={!fileEditCustomDescription.trim()}
                                    helperText={
                                      !fileEditCustomDescription.trim()
                                        ? "Vui lòng nhập loại tài liệu"
                                        : ""
                                    }
                                  />
                                </Grid>
                              )}

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
                                    (fileEditData.description === "Khác" &&
                                      !fileEditCustomDescription.trim()) ||
                                    (fileEditData.description !== "Khác" &&
                                      !fileEditData.description.trim())
                                  }
                                  size="small"
                                >
                                  {fileEditLoading ? "Đang lưu..." : "Lưu"}
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        ) : (
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
                      {FILE_DESCRIPTION_OPTIONS.map((category) => (
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

export default DriverUpdate;
