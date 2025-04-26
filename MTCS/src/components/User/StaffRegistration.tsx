import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import UserRegistrationForm from "./UserRegistrationForm";
import { registerStaff } from "../../services/authApi";
import { RegisterUserDTO } from "../../types/auth";

const StaffRegistration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (data: RegisterUserDTO) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await registerStaff(data);
      setSuccess("Đăng ký tài khoản nhân viên thành công");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi khi đăng ký tài khoản");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Đăng Ký Tài Khoản Nhân Viên
        </Typography>
        <Typography color="textSecondary">
          Điền đầy đủ thông tin để tạo tài khoản nhân viên mới
        </Typography>
      </Box>

      <UserRegistrationForm
        onSubmit={handleSubmit}
        userType="staff"
        loading={loading}
        error={error}
        success={success}
      />
    </Container>
  );
};

export default StaffRegistration;
