import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  onClose?: () => void;
  standalone?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  onClose,
  standalone = false,
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    createdDate: "",
    role: "",
  });

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setShowSuccessAlert(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccessAlert(true);
    // In a real app, here you would call an API to update the user data
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any changes made
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserData({
        ...userData,
        [field]: event.target.value,
      });
    };

  const handleBack = () => {
    if (standalone) {
      navigate(-1);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={500}>
          Hồ sơ người dùng
        </Typography>
      </Box>

      {showSuccessAlert && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setShowSuccessAlert(false)}
        >
          Thông tin cá nhân đã được cập nhật thành công!
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  alt={userData.fullName}
                  src="/static/avatar.jpg"
                  sx={{ width: 80, height: 80 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                    },
                    width: 28,
                    height: 28,
                  }}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">{userData.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData.role}
                </Typography>
              </Box>
            </Box>
            {!isEditing ? (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={handleToggleEdit}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Box>
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  Lưu
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Paper elevation={1} sx={{ borderRadius: 2, flexGrow: 1 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Thông tin cá nhân
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Họ và tên"
                fullWidth
                variant={isEditing ? "outlined" : "filled"}
                InputProps={{ readOnly: !isEditing }}
                value={userData.fullName}
                onChange={handleInputChange("fullName")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                fullWidth
                variant={isEditing ? "outlined" : "filled"}
                InputProps={{ readOnly: !isEditing }}
                value={userData.email}
                onChange={handleInputChange("email")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số điện thoại"
                fullWidth
                variant={isEditing ? "outlined" : "filled"}
                InputProps={{ readOnly: !isEditing }}
                value={userData.phoneNumber}
                onChange={handleInputChange("phoneNumber")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ngày tạo tài khoản"
                fullWidth
                variant="filled"
                InputProps={{ readOnly: true }}
                value={userData.createdDate}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Mật khẩu"
                fullWidth
                type={showPassword ? "text" : "password"}
                variant={isEditing ? "outlined" : "filled"}
                InputProps={{
                  readOnly: !isEditing,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={userData.password}
                onChange={handleInputChange("password")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Vai trò"
                fullWidth
                variant="filled"
                InputProps={{ readOnly: true }}
                value={userData.role}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserProfile;
