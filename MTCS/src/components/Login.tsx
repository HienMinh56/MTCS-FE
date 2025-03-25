import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PasswordField from "./PasswordVisibility";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";
import { login, LoginRequest } from "../services/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ open, onClose, onLoginSuccess }) => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!credentials.email) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!credentials.password) {
      newErrors.password = "Mật khẩu không được để trống";
      isValid = false;
    } else if (credentials.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const tokenData = await login(credentials);

      setIsAuthenticated(true);

      window.dispatchEvent(new Event("auth-changed"));

      setSnackbar({
        open: true,
        message: "Đăng nhập thành công",
        severity: "success",
      });

      const userRole = localStorage.getItem("userRole");

      setTimeout(() => {
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          if (userRole === "Staff") {
            navigate("/staff-menu");
          } else {
            window.location.reload();
          }
        }
      }, 1000);
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại";

      if (
        axios.isAxiosError(error) &&
        error.response?.headers?.["token-expired"] === "true"
      ) {
        errorMessage = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    setRegisterOpen(true);
    onClose(); // Close login dialog when opening register
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordOpen(true);
    onClose(); // Close login dialog when opening forgot password
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
            <Typography variant="h6">Đăng nhập ngay</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              margin="normal"
              value={credentials.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
            />
            <PasswordField
              fullWidth
              label="Mật khẩu"
              name="password"
              margin="normal"
              value={credentials.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPasswordClick}
                disabled={isLoading}
              >
                Quên mật khẩu?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Chưa có tài khoản?
              </Typography>
              <Button
                variant="text"
                onClick={handleRegisterClick}
                sx={{ textTransform: "none" }}
                disabled={isLoading}
              >
                Đăng ký ngay
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {forgotPasswordOpen && (
        <ForgotPassword
          open={forgotPasswordOpen}
          onClose={() => setForgotPasswordOpen(false)}
        />
      )}

      {registerOpen && (
        <Register open={registerOpen} onClose={() => setRegisterOpen(false)} />
      )}
    </>
  );
};

export default Login;
