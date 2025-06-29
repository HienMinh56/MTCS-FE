import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { createContract } from "../../services/contractApi";
import { getCustomerById } from "../../services/customerApi";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { format } from "date-fns";
import axios from "axios";
import { formatApiError } from "../../utils/errorFormatting";
import { ContractStatus, OrderStatus } from "../../types/contract";

interface AddContractFileModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
  orderId: string;
}

const AddContractFileModal: React.FC<AddContractFileModalProps> = ({
  open,
  onClose,
  onSuccess,
  customerId,
  orderId,
}) => {
  const [summary, setSummary] = useState("");
  const [signedBy, setSignedBy] = useState("");
  const [signedDate, setSignedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [signedTime, setSignedTime] = useState<string>(
    format(new Date(), "HH:mm")
  );
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(
      new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      "yyyy-MM-dd"
    )
  );
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.Active);
  const [files, setFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerId: customerId,
    startDate: "",
    endDate: "",
    signedBy: "",
    status: 1,
    summary: "",
    contractFiles: [] as File[],
  });

  useEffect(() => {
    if (open && customerId) {
      const fetchCustomerDetails = async () => {
        try {
          const customerData = await getCustomerById(customerId);
          setCustomerDetails(customerData);
        } catch (error) {
          console.error("Error fetching customer details:", error);
        }
      };
      fetchCustomerDetails();
    }
  }, [open, customerId]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      customerId: customerId,
    }));
  }, [customerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setFileDescriptions((prev) => [...prev, ...newFiles.map(() => "")]);
      setFileNotes((prev) => [...prev, ...newFiles.map(() => "")]);
      setFileStatuses((prev) => [
        ...prev,
        ...newFiles.map(() => OrderStatus.Valid),
      ]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFileDescriptions((prev) => prev.filter((_, i) => i !== index));
    setFileNotes((prev) => prev.filter((_, i) => i !== index));
    setFileStatuses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...fileDescriptions];
    newDescriptions[index] = value;
    setFileDescriptions(newDescriptions);

    // Clear error when user starts typing
    if (value.trim() !== "") {
      setError("");
    }
  };

  const handleFileNoteChange = (index: number, value: string) => {
    const newNotes = [...fileNotes];
    newNotes[index] = value;
    setFileNotes(newNotes);

    // Clear error when user starts typing
    if (value.trim() !== "") {
      setError("");
    }
  };

  const handleFileStatusChange = (index: number, value: OrderStatus) => {
    const newStatuses = [...fileStatuses];
    newStatuses[index] = value;
    setFileStatuses(newStatuses);
  };

  const validateForm = () => {
    if (!summary.trim()) {
      setError("Vui lòng nhập Tóm tắt hợp đồng");
      return false;
    }

    if (!signedBy) {
      setError("Vui lòng chọn người ký hợp đồng");
      return false;
    }

    if (!signedDate.trim()) {
      setError("Vui lòng chọn ngày ký");
      return false;
    }

    if (!signedTime.trim()) {
      setError("Vui lòng chọn giờ ký");
      return false;
    }

    if (!startDate.trim()) {
      setError("Vui lòng chọn ngày bắt đầu");
      return false;
    }

    if (!endDate.trim()) {
      setError("Vui lòng chọn ngày kết thúc");
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(signedDate)) {
      setError("Định dạng ngày ký không hợp lệ");
      return false;
    }

    const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(signedTime)) {
      setError("Định dạng giờ ký không hợp lệ");
      return false;
    }

    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!datetimeRegex.test(startDate)) {
      setError("Định dạng ngày và giờ bắt đầu không hợp lệ");
      return false;
    }

    if (!datetimeRegex.test(endDate)) {
      setError("Định dạng ngày và giờ kết thúc không hợp lệ");
      return false;
    }

    const signedDateObj = new Date(signedDate);
    const startDateObj = new Date(startDate);
    if (startDateObj < signedDateObj) {
      setError("Ngày bắt đầu không được trước ngày ký");
      return false;
    }

    const endDateObj = new Date(endDate);
    if (endDateObj <= startDateObj) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }

    if (files.length === 0) {
      setError("Vui lòng thêm ít nhất một tệp đính kèm");
      return false;
    }

    // Check each file for missing descriptions or notes
    for (let i = 0; i < files.length; i++) {
      if (!fileDescriptions[i] || fileDescriptions[i].trim() === "") {
        setError(`Vui lòng nhập mô tả cho tệp "${files[i].name}"`);
        return false;
      }

      if (!fileNotes[i] || fileNotes[i].trim() === "") {
        setError(`Vui lòng nhập ghi chú cho tệp "${files[i].name}"`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setFormSubmitted(true);

      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const combinedDateTime = `${signedDate}T${signedTime}:00`;

      const contractData = {
        ...formData,
        customerId: customerId,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("summary", summary);
      formDataToSend.append("signedBy", signedBy);
      formDataToSend.append("signedDate", signedDate);
      formDataToSend.append("signedTime", combinedDateTime);
      formDataToSend.append("startDate", startDate);
      formDataToSend.append("endDate", endDate);
      formDataToSend.append("status", status.toString());
      formDataToSend.append("customerId", customerId);
      formDataToSend.append("orderId", orderId);

      files.forEach((file, index) => {
        formDataToSend.append("files", file);
        formDataToSend.append("descriptions", fileDescriptions[index]);
        formDataToSend.append("notes", fileNotes[index]);
        formDataToSend.append("fileStatuses", fileStatuses[index].toString());
      });

      const response = await createContract(formDataToSend);
      console.log("Response:", response);

      setSnackbar({
        open: true,
        message: "Tạo hợp đồng thành công!",
        severity: "success",
      });

      setTimeout(() => {
        setLoading(false);
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error details:", err);

      let errorMessage = "Không thể tạo hợp đồng. Vui lòng thử lại.";

      if (axios.isAxiosError(err)) {
        if (err.response?.data) {
          errorMessage = formatApiError(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    setSummary("");
    setSignedBy("");
    setSignedDate(format(new Date(), "yyyy-MM-dd"));
    setSignedTime(format(new Date(), "HH:mm"));
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setEndDate(
      format(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        "yyyy-MM-dd"
      )
    );
    setStatus(ContractStatus.Active);
    setFiles([]);
    setFileDescriptions([]);
    setFileNotes([]);
    setFileStatuses([]);
    setError("");
    setFormSubmitted(false);

    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Thêm tài liệu hợp đồng mới</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tóm tắt hợp đồng "
                fullWidth
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Người ký"
                fullWidth
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                required
                margin="normal"
                placeholder="Nhập tên người ký"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày ký"
                type="date"
                value={signedDate}
                onChange={(e) => setSignedDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Giờ ký"
                type="time"
                value={signedTime}
                onChange={(e) => setSignedTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày bắt đầu"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày kết thúc"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContractStatus)}
                  label="Trạng thái"
                >
                  <MenuItem value={ContractStatus.Active}>Hoạt động</MenuItem>
                  <MenuItem value={ContractStatus.Inactive}>
                    Không hoạt động
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Tải lên tài liệu
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />
              </Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tài liệu đã chọn ({files.length})
                </Typography>
                {files.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: 1,
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Xóa
                      </Button>
                    </Box>

                    <Grid container spacing={2}>
                      {/* <Grid item xs={12}>
                        <FormControl fullWidth margin="normal" required>
                          <InputLabel>Trạng thái tệp</InputLabel>
                          <Select
                            value={fileStatuses[index] || OrderStatus.Valid}
                            onChange={(e) => handleFileStatusChange(index, e.target.value as OrderStatus)}
                            label="Trạng thái tệp"
                          >
                            <MenuItem value={OrderStatus.Valid}>Hợp lệ</MenuItem>
                            <MenuItem value={OrderStatus.Invalid}>Không hợp lệ</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid> */}

                      <Grid item xs={12}>
                        <TextField
                          label="Mô tả tệp đính kèm"
                          fullWidth
                          required
                          margin="normal"
                          value={fileDescriptions[index] || ""}
                          onChange={(e) =>
                            handleFileDescriptionChange(index, e.target.value)
                          }
                          error={
                            formSubmitted && !fileDescriptions[index]?.trim()
                          }
                          helperText={
                            formSubmitted && !fileDescriptions[index]?.trim()
                              ? "Vui lòng nhập mô tả tệp đính kèm"
                              : ""
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Ghi chú tệp đính kèm"
                          fullWidth
                          required
                          margin="normal"
                          value={fileNotes[index] || ""}
                          onChange={(e) =>
                            handleFileNoteChange(index, e.target.value)
                          }
                          error={formSubmitted && !fileNotes[index]?.trim()}
                          helperText={
                            formSubmitted && !fileNotes[index]?.trim()
                              ? "Vui lòng nhập ghi chú tệp đính kèm"
                              : ""
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default AddContractFileModal;
