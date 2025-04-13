import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { createTractorWithFiles } from "../../services/tractorApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TractorForm,
  TractorFormValues,
  formatTractorFormForApi,
} from "../../forms/tractor";
import { formatApiError } from "../../utils/errorFormatting";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface TractorCreateProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const FILE_DESCRIPTION_OPTIONS = ["Giấy Đăng ký", "Giấy Kiểm định", "Khác"];

interface FileUpload {
  file: File;
  description: string;
  note?: string;
  customDescription?: string;
}

const TractorCreate: React.FC<TractorCreateProps> = ({
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const isImageFile = (fileType: string): boolean => {
    return (
      fileType.includes("image") ||
      ["jpg", "jpeg", "png", "gif"].some((ext) => fileType.includes(ext))
    );
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
      return <PictureAsPdfIcon color="error" />;
    } else if (
      isImageFile(fileType) ||
      /\.(jpg|jpeg|png|gif)$/i.test(fileName)
    ) {
      return <ImageIcon color="primary" />;
    } else if (
      fileType.includes("word") ||
      fileType.includes("doc") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx")
    ) {
      return <DescriptionIcon color="info" />;
    } else {
      return <InsertDriveFileIcon color="action" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      setFileUploads([
        ...fileUploads,
        {
          file: newFile,
          description: FILE_DESCRIPTION_OPTIONS[0],
          note: "",
          customDescription: "",
        },
      ]);
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newFileUploads = [...fileUploads];
    newFileUploads[index].description = value;
    setFileUploads(newFileUploads);
  };

  const handleCustomDescriptionChange = (index: number, value: string) => {
    const newFileUploads = [...fileUploads];
    newFileUploads[index].customDescription = value;
    setFileUploads(newFileUploads);
  };

  const handleNoteChange = (index: number, value: string) => {
    const newFileUploads = [...fileUploads];
    newFileUploads[index].note = value;
    setFileUploads(newFileUploads);
  };

  const handleRemoveFile = (index: number) => {
    const newFileUploads = [...fileUploads];
    newFileUploads.splice(index, 1);
    setFileUploads(newFileUploads);
  };

  const onSubmit = async (data: TractorFormValues) => {
    setIsSubmitting(true);

    try {
      const formattedData = formatTractorFormForApi(data);

      const formattedFileUploads = fileUploads.map((upload) => ({
        file: upload.file,
        description:
          upload.description === "Khác" && upload.customDescription
            ? upload.customDescription
            : upload.description,
        note: upload.note,
      }));

      const response = await createTractorWithFiles(
        formattedData,
        formattedFileUploads
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.messageVN || "Tạo xe đầu kéo thành công!",
          severity: "success",
        });

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          if (onClose) {
            onClose();
          }
        }, 1500);
      } else {
        // API returned success:false
        const errorMessage = formatApiError(response.data);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating tractor:", error);

      let errorMessage = "Không thể tạo xe đầu kéo. Vui lòng thử lại.";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 200) {
          const data = error.response.data;
          if (data?.success) {
            setSnackbar({
              open: true,
              message: data.messageVN || "Tạo xe đầu kéo thành công!",
              severity: "success",
            });

            setTimeout(() => {
              if (onSuccess) {
                onSuccess();
              }
              if (onClose) {
                onClose();
              }
            }, 1500);

            setIsSubmitting(false);
            return;
          } else {
            errorMessage = formatApiError(data);
          }
        } else if (error.response?.data) {
          errorMessage = formatApiError(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/staff-menu/tractors");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="shadow-lg">
          <CardContent>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                mb: 4,
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60px",
                  height: "3px",
                  backgroundColor: "primary.main",
                  borderRadius: "3px",
                },
              }}
            >
              Tạo Xe Đầu Kéo
            </Typography>

            <Grid container spacing={3}>
              {/* Main form section */}
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ mb: 3, borderBottom: "1px dashed #ccc", pb: 1 }}
                  >
                    Thông tin đầu kéo
                  </Typography>

                  <TractorForm
                    onSubmit={onSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                  />
                </Paper>
              </Grid>

              {/* File upload section */}
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    height: "100%",
                    bgcolor: "#fafafa",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ mb: 3, borderBottom: "1px dashed #ccc", pb: 1 }}
                  >
                    Tài liệu đính kèm
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<FileUploadIcon />}
                        sx={{ minWidth: 150 }}
                      >
                        Thêm tài liệu
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </Button>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                        Hỗ trợ PDF, Word, và hình ảnh
                      </Typography>
                    </Stack>

                    {fileUploads.length === 0 && (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 6,
                          px: 2,
                          border: "1px dashed #ccc",
                          borderRadius: 1,
                          bgcolor: "white",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Chưa có tài liệu nào được tải lên
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Nhấn "Thêm tài liệu" để tải lên
                        </Typography>
                      </Box>
                    )}

                    {fileUploads.length > 0 && (
                      <List
                        sx={{
                          bgcolor: "white",
                          borderRadius: 1,
                          border: "1px solid #eee",
                        }}
                      >
                        {fileUploads.map((upload, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem
                              alignItems="flex-start"
                              sx={{
                                flexDirection: "column",
                                gap: 1,
                                py: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                {getFileIcon(upload.file)}
                                <ListItemText
                                  primary={upload.file.name}
                                  secondary={`${(
                                    upload.file.size /
                                    (1024 * 1024)
                                  ).toFixed(2)} MB`}
                                  sx={{ mr: 6 }}
                                />
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => handleRemoveFile(index)}
                                  color="error"
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 12,
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>

                              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                <Grid item xs={12}>
                                  <FormControl size="small" fullWidth>
                                    <InputLabel>Loại tài liệu</InputLabel>
                                    <Select
                                      value={upload.description}
                                      onChange={(e) =>
                                        handleDescriptionChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      label="Loại tài liệu"
                                    >
                                      {FILE_DESCRIPTION_OPTIONS.map(
                                        (option) => (
                                          <MenuItem key={option} value={option}>
                                            {option}
                                          </MenuItem>
                                        )
                                      )}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                {upload.description === "Khác" && (
                                  <Grid item xs={12}>
                                    <TextField
                                      label="Mô tả loại tài liệu"
                                      size="small"
                                      fullWidth
                                      value={upload.customDescription || ""}
                                      onChange={(e) =>
                                        handleCustomDescriptionChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Nhập loại tài liệu"
                                      required
                                    />
                                  </Grid>
                                )}

                                <Grid item xs={12}>
                                  <TextField
                                    label="Ghi chú (tùy chọn)"
                                    size="small"
                                    fullWidth
                                    value={upload.note || ""}
                                    onChange={(e) =>
                                      handleNoteChange(index, e.target.value)
                                    }
                                    multiline
                                    rows={2}
                                  />
                                </Grid>
                              </Grid>
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>

                  {fileUploads.length > 0 && (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Tài liệu đã tải lên: {fileUploads.length}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        flexWrap="wrap"
                      >
                        {FILE_DESCRIPTION_OPTIONS.map((category) => {
                          const count = fileUploads.filter(
                            (file) => file.description === category
                          ).length;
                          if (count > 0) {
                            return (
                              <Chip
                                key={category}
                                label={`${category}: ${count}`}
                                size="small"
                                variant="outlined"
                                color={
                                  category === "Giấy Đăng ký" ||
                                  category === "Giấy Kiểm định"
                                    ? "primary"
                                    : "default"
                                }
                              />
                            );
                          }
                          return null;
                        })}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default TractorCreate;
