import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Stack,
  Typography,
  InputAdornment,
  IconButton,
  Backdrop,
  Paper,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { profileSchema, ProfileFormValues } from "./profileSchema";

interface ProfileFormProps {
  initialValues: ProfileFormValues;
  onSubmit: (data: ProfileFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Export gender options to ensure consistency across components
export const genderOptions = [
  { value: "Nam", label: "Nam", apiValue: "Male" },
  { value: "Nữ", label: "Nữ", apiValue: "Female" },
];

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    getValues,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const emailValue = watch("email");

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    if (isEditingEmail && emailValue !== initialValues.email) {
      setValue("email", emailValue);
    }
  }, [emailValue, initialValues.email, isEditingEmail, setValue]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleEmailEdit = () => {
    setIsEditingEmail(!isEditingEmail);
    if (!isEditingEmail) {
      // Reset email to initial value when starting to edit
      setValue("email", initialValues.email);
    } else {
      // If canceling email edit, reset the password field
      setCurrentPassword("");
      setValue("currentPassword", "");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setValue("currentPassword", e.target.value);
  };

  const handleFormSubmit = (data: ProfileFormValues) => {
    const mappedData = { ...data };

    // Convert gender to API value (Male/Female)
    if (data.gender) {
      const genderOption = genderOptions.find(
        (option) => option.value === data.gender
      );
      if (genderOption) {
        mappedData.gender = genderOption.apiValue;
      }
    }

    onSubmit(mappedData);
  };

  const handleEmailSubmit = async () => {
    try {
      setIsSubmittingEmail(true);

      const currentFormValues = getValues();
      const emailData = {
        ...currentFormValues,
        // Make sure to include only email and password for email change
        email: currentFormValues.email,
        currentPassword: currentFormValues.currentPassword,
      };

      // Convert gender to API format if it exists
      if (emailData.gender) {
        const genderOption = genderOptions.find(
          (option) => option.value === emailData.gender
        );
        if (genderOption) {
          emailData.gender = genderOption.apiValue;
        }
      }

      await onSubmit(emailData);

      // Close the email editing interface
      setIsEditingEmail(false);
      setCurrentPassword("");
      setValue("currentPassword", "");
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack spacing={3} sx={{ mt: 2, position: "relative" }}>
          {/* Email edit overlay */}
          {isEditingEmail && (
            <Backdrop
              open={isEditingEmail}
              sx={{
                position: "absolute",
                zIndex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                borderRadius: 1,
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  width: "100%",
                  maxWidth: 500,
                  mx: "auto",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Thay đổi email
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Email mới
                    </Typography>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          variant="outlined"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          size="small"
                          autoFocus
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Mật khẩu hiện tại
                    </Typography>
                    <TextField
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      variant="outlined"
                      size="small"
                      required
                      error={!!errors.currentPassword}
                      helperText={
                        errors.currentPassword?.message ||
                        "Cần xác nhận mật khẩu hiện tại để thay đổi email"
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOffIcon fontSize="small" />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleToggleEmailEdit}
                      size="small"
                      disabled={isSubmittingEmail}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleEmailSubmit}
                      size="small"
                      disabled={
                        !currentPassword || !emailValue || isSubmittingEmail
                      }
                    >
                      {isSubmittingEmail ? "Đang xử lý..." : "Xác nhận"}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Backdrop>
          )}

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" gutterBottom>
                Họ và tên
              </Typography>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    size="small"
                    disabled={isEditingEmail}
                  />
                )}
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" gutterBottom>
                Email
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      size="small"
                      disabled={!isEditingEmail}
                      InputProps={{
                        readOnly: !isEditingEmail,
                        style: { backgroundColor: "#f5f5f5" },
                        endAdornment: !isEditingEmail && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleToggleEmailEdit}
                              disabled={isLoading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" gutterBottom>
                Số điện thoại
              </Typography>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    size="small"
                    disabled={isEditingEmail}
                  />
                )}
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" gutterBottom>
                Giới tính
              </Typography>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    variant="outlined"
                    error={!!errors.gender}
                    helperText={errors.gender?.message}
                    size="small"
                    disabled={isEditingEmail}
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Stack>

          <Box sx={{ width: "100%" }}>
            <Typography variant="body2" gutterBottom>
              Ngày sinh
            </Typography>
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.birthday}
                  helperText={errors.birthday?.message}
                  size="small"
                  disabled={isEditingEmail}
                />
              )}
            />
          </Box>

          {/* Hidden field for currentPassword */}
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />
        </Stack>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
            startIcon={<CancelIcon />}
            disabled={isLoading || isEditingEmail}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isLoading || isEditingEmail}
          >
            {isLoading ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default ProfileForm;
