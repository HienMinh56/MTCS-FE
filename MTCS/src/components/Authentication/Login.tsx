import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ForgotPassword from "../ForgotPassword";
import Register from "./Register";
import { login, LoginRequest } from "../../services/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "../../forms/LoginForm";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ open, onClose, onLoginSuccess }) => {
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
  const { setIsAuthenticated, setUser } = useAuth();

  const handleLoginSubmit = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setErrors({});

    try {
      await login(credentials);

      const token = Cookies.get("token");
      let roleFromToken: string | undefined;

      if (token) {
        try {
          const decoded = jwtDecode<any>(token);
          const userId =
            decoded.sub || decoded.userId || localStorage.getItem("userId");
          const msRole =
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          roleFromToken = decoded.role || msRole;

          if (userId && roleFromToken) {
            setUser({ id: userId, role: roleFromToken });
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      }

      // Show success toast before setting authentication state
      setSnackbar({
        open: true,
        message: "Đăng nhập thành công",
        severity: "success",
      });

      // Delay setting authentication state to allow toast to be seen
      setTimeout(() => {
        setIsAuthenticated(true);
        window.dispatchEvent(new Event("auth-changed"));

        // Only navigate after toast has been shown
        setTimeout(() => {
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            if (roleFromToken === "Staff") {
              navigate("/staff-menu/orders");
            } else {
              navigate(0);
            }
          }
        }, 1500);
      }, 500);
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
    onClose();
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordOpen(true);
    onClose();
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
          <LoginForm
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            onForgotPassword={handleForgotPasswordClick}
            generalError={errors.general}
          />
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
