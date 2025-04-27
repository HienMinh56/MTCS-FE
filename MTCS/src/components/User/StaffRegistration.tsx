import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import UserRegistrationForm from "./UserRegistrationForm";
import { registerStaff } from "../../services/authApi";
import { RegisterUserDTO } from "../../types/auth";

interface StaffRegistrationProps {
  onClose?: () => void;
}

const StaffRegistration: React.FC<StaffRegistrationProps> = ({ onClose }) => {
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

      // After successful registration, wait briefly and then close the dialog
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1000);
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
