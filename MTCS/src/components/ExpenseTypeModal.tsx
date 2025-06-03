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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { ExpenseType } from "../types/expense-type";
import {
  expenseTypeApi,
  CreateExpenseReportTypeRequest,
  UpdateExpenseReportTypeRequest,
} from "../services/expenseTypeApi";

interface ExpenseTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseType?: ExpenseType | null;
  mode: "create" | "edit";
}

const ExpenseTypeModal: React.FC<ExpenseTypeModalProps> = ({
  open,
  onClose,
  onSuccess,
  expenseType,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reportTypeId: "",
    reportType: "",
    isActive: 1,
  });
  const [formErrors, setFormErrors] = useState({
    reportTypeId: "",
    reportType: "",
  });

  // Initialize form data when modal opens or expense type changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && expenseType) {
        setFormData({
          reportTypeId: expenseType.reportTypeId,
          reportType: expenseType.reportType,
          isActive: expenseType.isActive,
        });
      } else {
        setFormData({
          reportTypeId: "",
          reportType: "",
          isActive: 1,
        });
      }
      setError(null);
      setFormErrors({
        reportTypeId: "",
        reportType: "",
      });
    }
  }, [open, mode, expenseType]);

  const validateForm = (): boolean => {
    const errors = {
      reportTypeId: "",
      reportType: "",
    };

    if (!formData.reportTypeId.trim()) {
      errors.reportTypeId = "Mã loại phí là bắt buộc";
    }

    if (!formData.reportType.trim()) {
      errors.reportType = "Tên loại phí là bắt buộc";
    }

    setFormErrors(errors);
    return !errors.reportTypeId && !errors.reportType;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (event: any) => {
    setFormData((prev) => ({
      ...prev,
      isActive: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        reportTypeId: formData.reportTypeId.trim(),
        reportType: formData.reportType.trim(),
        isActive: formData.isActive,
      };

      if (mode === "create") {
        await expenseTypeApi.createExpenseType(
          requestData as CreateExpenseReportTypeRequest
        );
      } else {
        await expenseTypeApi.updateExpenseType(
          requestData as UpdateExpenseReportTypeRequest
        );
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${mode}ing expense type:`, error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Không thể ${
          mode === "create" ? "tạo" : "cập nhật"
        } loại phí. Vui lòng thử lại.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="expense-type-modal-title"
    >
      <DialogTitle
        id="expense-type-modal-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {mode === "create" ? "Thêm loại phí mới" : "Chỉnh sửa loại phí"}
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{ color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="reportTypeId"
              label="Mã loại phí"
              value={formData.reportTypeId}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading || mode === "edit"} // Disable ID editing in edit mode
              error={!!formErrors.reportTypeId}
              helperText={
                formErrors.reportTypeId ||
                (mode === "edit" && "Mã loại phí không thể thay đổi")
              }
              placeholder="Ví dụ: fuel_report, toll, maintenance..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="reportType"
              label="Tên loại phí"
              value={formData.reportType}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
              error={!!formErrors.reportType}
              helperText={formErrors.reportType}
              placeholder="Ví dụ: Tiền nhiên liệu, Phí cầu đường..."
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select
                labelId="status-label"
                value={formData.isActive}
                onChange={handleSelectChange}
                label="Trạng thái"
              >
                <MenuItem value={1}>Hoạt động</MenuItem>
                <MenuItem value={0}>Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
          sx={{ mr: 1 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{ minWidth: 120 }}
        >
          {loading
            ? "Đang xử lý..."
            : mode === "create"
            ? "Tạo mới"
            : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseTypeModal;
