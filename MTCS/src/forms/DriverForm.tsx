import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  TextField,
  Grid,
  Button,
  FormHelperText,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DriverFormValues, driverSchema } from "./driver";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import dayjs from "dayjs";

interface DriverFormProps {
  onSubmit: (data: DriverFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DriverForm: React.FC<DriverFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: yupResolver(driverSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dateOfBirth: null,
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Họ tên"
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Số điện thoại"
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Ngày sinh"
                value={field.value}
                onChange={field.onChange}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth?.message,
                  },
                }}
                disableFuture
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.password}
                helperText={errors.password?.message}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang tạo..." : "Tạo tài xế"}
        </Button>
      </Box>
    </form>
  );
};

export default DriverForm;
