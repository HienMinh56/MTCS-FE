import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PasswordField from "./PasswordVisibility";
import { register, RegisterRequest } from "../services/authApi";

interface RegisterProps {
  open: boolean;
  onClose: () => void;
}

const Register: React.FC<RegisterProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<
    RegisterRequest & { confirmPassword: string }
  >({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...registerData } = formData;
      const message = await register(registerData);
      setSnackbar({ open: true, message, severity: "success" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      let errorMessage = "Đăng ký thất bại";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Đăng ký</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Họ và tên"
              name="fullName"
              margin="normal"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phoneNumber"
              margin="normal"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              disabled={isLoading}
            />
            <PasswordField
              fullWidth
              label="Mật khẩu"
              name="password"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
            />
            <PasswordField
              fullWidth
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Đăng ký"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Register;
