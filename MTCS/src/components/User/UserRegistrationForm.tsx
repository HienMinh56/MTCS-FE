import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { format, isValid, subYears } from "date-fns";
import { RegisterUserDTO, Gender } from "../../types/auth";

interface UserRegistrationFormProps {
  onSubmit: (data: RegisterUserDTO) => Promise<void>;
  userType: "admin" | "staff";
  loading: boolean;
  error: string | null;
  success: string | null;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  onSubmit,
  userType,
  loading,
  error,
  success,
}) => {
  const defaultFormData: RegisterUserDTO = {
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: Gender.Male,
    birthDate: "",
  };

  const [formData, setFormData] = useState<RegisterUserDTO>(defaultFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Add a minimum age requirement for users (18 years)
  const maxDate = subYears(new Date(), 18);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate full name
    if (!formData.fullName) {
      errors.fullName = "Họ và tên không được để trống";
    } else if (formData.fullName.length > 25) {
      errors.fullName = "Họ và tên không được quá 25 ký tự";
    }

    // Validate email
    if (!formData.email) {
      errors.email = "Email không được để trống";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate phone number
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber =
        "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0";
    }

    // Validate birth date
    if (!formData.birthDate) {
      errors.birthDate = "Ngày sinh không được để trống";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      // Ensure date is in format yyyy-MM-dd with no time component
      const formattedDate = format(date, "yyyy-MM-dd");
      console.log("Formatted date:", formattedDate);
      setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setFormErrors({});
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        {userType === "admin"
          ? "Đăng ký tài khoản Quản trị viên"
          : "Đăng ký tài khoản Nhân viên"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="fullName"
              label="Họ và tên"
              fullWidth
              required
              value={formData.fullName}
              onChange={handleChange}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="password"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="phoneNumber"
              label="Số điện thoại"
              fullWidth
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!formErrors.phoneNumber}
              helperText={
                formErrors.phoneNumber ||
                "Số điện thoại phải có 10 số và bắt đầu bằng số 0"
              }
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Giới tính</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={formData.gender}
                label="Giới tính"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value={Gender.Male}>Nam</MenuItem>
                <MenuItem value={Gender.Female}>Nữ</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày sinh"
                value={formData.birthDate ? new Date(formData.birthDate) : null}
                onChange={handleDateChange}
                maxDate={maxDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.birthDate,
                    helperText: formErrors.birthDate,
                    disabled: loading,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button variant="outlined" onClick={resetForm} disabled={loading}>
              Nhập lại
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default UserRegistrationForm;
