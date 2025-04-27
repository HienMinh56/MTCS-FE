import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  Paper,
  FormHelperText,
  Snackbar,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parse, differenceInYears, subYears } from "date-fns";
import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
import { InternalUser, AdminUpdateUserDTO, UserStatus } from "../../types/auth";
import { adminUpdateUser, changeUserStatus } from "../../services/authApi";

interface UserEditModalProps {
  open: boolean;
  user: InternalUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  open,
  user,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminUpdateUserDTO>({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "Male", // Default to Male
    birthday: "",
    newPassword: "",
  });

  // For active status toggle
  const [isActive, setIsActive] = useState(false);

  // For password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Status change confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    newStatus: false,
  });

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form validation
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    newPassword?: string;
  }>({});

  // Date validation error
  const [birthdayError, setBirthdayError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "Male", // Default to Male if no gender is set
        birthday: user.birthday || "",
        newPassword: "", // Always start with empty password
      });
      setIsActive(user.status === 1);
      setFormErrors({});
      setError(null);
      setSuccessMessage(null);
    }
  }, [user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Add full name validation - no special characters
  const validateFullName = (name: string) => {
    // Check if the name contains any common special characters
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return !specialCharsRegex.test(name);
  };

  const validateForm = () => {
    const errors: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      newPassword?: string;
    } = {};

    if (formData.fullName && formData.fullName.length > 25) {
      errors.fullName = "Họ và tên không được quá 25 ký tự";
    }

    if (formData.fullName && !validateFullName(formData.fullName)) {
      errors.fullName = "Họ và tên không được chứa ký tự đặc biệt";
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber =
        "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0";
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Check birthday validation
    if (birthdayError) {
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Check if user is at least 18 years old
      const today = new Date();
      const age = differenceInYears(today, date);

      if (age < 18) {
        setBirthdayError("Người dùng phải ít nhất 18 tuổi");
      } else {
        setBirthdayError(null);
        const formattedDate = format(date, "yyyy-MM-dd");
        setFormData((prev) => ({ ...prev, birthday: formattedDate }));
      }
    } else {
      setBirthdayError(null);
      setFormData((prev) => ({ ...prev, birthday: "" }));
    }
  };

  // Open confirmation dialog before changing status
  const handleStatusToggle = () => {
    setConfirmDialog({
      open: true,
      newStatus: !isActive,
    });
  };

  // Actual status change function after confirmation
  const handleStatusChange = async () => {
    if (!user) return;

    setStatusLoading(true);
    setError(null);
    setConfirmDialog({ open: false, newStatus: false });

    try {
      const newStatus = isActive ? UserStatus.Inactive : UserStatus.Active;
      const response = await changeUserStatus(user.userId, newStatus);

      if (response.success) {
        setIsActive(!isActive);
        onSuccess(); // Refresh the user list
      } else {
        setError(
          response.messageVN ||
            response.message ||
            "Thay đổi trạng thái thất bại"
        );
      }
    } catch (err) {
      console.error("Error changing user status:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Thay đổi trạng thái thất bại");
      }
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    // Only include fields that have been changed
    const updateData: AdminUpdateUserDTO = {};
    if (formData.fullName !== user.fullName)
      updateData.fullName = formData.fullName;
    if (formData.email !== user.email) updateData.email = formData.email;
    if (formData.phoneNumber !== user.phoneNumber)
      updateData.phoneNumber = formData.phoneNumber;
    if (formData.gender !== user.gender) updateData.gender = formData.gender;
    if (formData.birthday !== user.birthday)
      updateData.birthday = formData.birthday;
    if (formData.newPassword) updateData.newPassword = formData.newPassword;

    // If no changes, just close dialog
    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await adminUpdateUser(user.userId, updateData);
      if (response.success) {
        setSuccessMessage("Cập nhật thông tin thành công");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500); // Close after 1.5 seconds to show success message
      } else {
        setError(response.messageVN || response.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Cập nhật thông tin thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const parseBirthdayToDate = (birthdayStr: string | undefined) => {
    if (!birthdayStr) return null;

    try {
      return parse(birthdayStr, "yyyy-MM-dd", new Date());
    } catch (error) {
      console.error("Error parsing birthday:", error);
      return null;
    }
  };

  const maxDate = subYears(new Date(), 18); // Date 18 years ago from today

  return (
    <Dialog
      open={open}
      onClose={loading || statusLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="user-edit-dialog-title"
    >
      <DialogTitle id="user-edit-dialog-title">
        Cập nhật thông tin người dùng
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Status section */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: isActive
                ? "rgba(46, 125, 50, 0.04)"
                : "rgba(211, 47, 47, 0.04)",
              borderColor: isActive ? "success.light" : "error.light",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Trạng thái tài khoản
                </Typography>
                <Chip
                  size="small"
                  label={isActive ? "Đang hoạt động" : "Không hoạt động"}
                  color={isActive ? "success" : "error"}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Button
                variant="outlined"
                color={isActive ? "error" : "success"}
                onClick={handleStatusToggle}
                disabled={statusLoading}
                startIcon={
                  statusLoading ? <CircularProgress size={20} /> : null
                }
              >
                {statusLoading
                  ? "Đang xử lý..."
                  : isActive
                  ? "Vô hiệu hóa"
                  : "Kích hoạt"}
              </Button>
            </Box>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="fullName"
                label="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary">👤</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary">✉️</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary">📱</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="gender-label">Giới tính</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender-select"
                  name="gender"
                  value={formData.gender || "Male"}
                  onChange={handleChange}
                  label="Giới tính"
                  disabled={loading}
                >
                  <MenuItem value="Male">Nam</MenuItem>
                  <MenuItem value="Female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày sinh"
                  value={parseBirthdayToDate(formData.birthday)}
                  onChange={handleDateChange}
                  maxDate={maxDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      disabled: loading,
                      error: !!birthdayError,
                      helperText: birthdayError,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mb: 1, mt: 1 }}>
                <Chip
                  label="Đổi mật khẩu"
                  size="small"
                  icon={<LockReset fontSize="small" />}
                />
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="newPassword"
                label="Mật khẩu mới (để trống nếu không thay đổi)"
                value={formData.newPassword}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                error={!!formErrors.newPassword}
                helperText={formErrors.newPassword}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>

      {/* Status change confirmation dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        aria-labelledby="status-change-dialog-title"
      >
        <DialogTitle id="status-change-dialog-title">
          {confirmDialog.newStatus
            ? "Kích hoạt tài khoản"
            : "Vô hiệu hóa tài khoản"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.newStatus
              ? "Kích hoạt sẽ cho phép tài khoản này đăng nhập và sử dụng hệ thống. Bạn có chắc chắn muốn kích hoạt tài khoản này?"
              : "Vô hiệu hóa sẽ ngăn tài khoản này đăng nhập và sử dụng hệ thống. Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
            disabled={statusLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleStatusChange}
            color={confirmDialog.newStatus ? "success" : "error"}
            variant="contained"
            disabled={statusLoading}
            autoFocus
          >
            {confirmDialog.newStatus ? "Kích hoạt" : "Vô hiệu hóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default UserEditModal;
