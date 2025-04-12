import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import PasswordField from "../components/PasswordVisibility";
import { LoginRequest } from "../services/authApi";

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading: boolean;
  onForgotPassword: () => void;
  generalError?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  onForgotPassword,
  generalError,
}) => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

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

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(credentials);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    onForgotPassword();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}
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
          onClick={handleForgotPassword}
          disabled={isLoading}
          tabIndex={-1} // Ngăn nút này nhận focus khi nhấn Tab
          type="button" // Xác định rõ đây không phải nút submit
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
    </Box>
  );
};

export default LoginForm;
