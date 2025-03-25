import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Typography,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { createTractor } from "../../services/tractorApi";
import { useNavigate } from "react-router-dom";
import {
  DATE_FORMAT,
  getCurrentISODate,
  getCurrentISODateTime,
} from "../../utils/dateConfig";
import { ApiResponse } from "../../types/api-types";

enum ContainerType {
  TwentyFeet = 1,
  FortyFeet = 2,
}

interface TractorCreateProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const TractorCreate: React.FC<TractorCreateProps> = ({
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    manufactureYear: new Date().getFullYear(),
    maxLoadWeight: 0,
    lastMaintenanceDate: getCurrentISODateTime(),
    nextMaintenanceDate: getCurrentISODateTime(),
    registrationDate: getCurrentISODate(),
    registrationExpirationDate: getCurrentISODate(),
    containerType: ContainerType.TwentyFeet,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : Number(value);
    setFormData((prev) => ({ ...prev, [name]: numValue }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (name: string, date: dayjs.Dayjs | null) => {
    if (date) {
      if (
        name === "registrationDate" ||
        name === "registrationExpirationDate"
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: date.format("YYYY-MM-DD"),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: date.toISOString(),
        }));
      }

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "Biển số xe là bắt buộc";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Hãng xe là bắt buộc";
    }

    if (
      formData.manufactureYear < 1900 ||
      formData.manufactureYear > new Date().getFullYear() + 1
    ) {
      newErrors.manufactureYear = "Nhập năm sản xuất hợp lệ";
    }

    if (formData.maxLoadWeight <= 0) {
      newErrors.maxLoadWeight = "Trọng tải tối đa phải lớn hơn 0";
    }

    // Add date validation
    const regDate = dayjs(formData.registrationDate);
    const regExpDate = dayjs(formData.registrationExpirationDate);
    if (regExpDate.isBefore(regDate)) {
      newErrors.registrationExpirationDate =
        "Ngày hết hạn đăng ký phải sau ngày đăng ký";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;

    if (error?.errors) {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }

    return "Có lỗi xảy ra";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createTractor(formData);

      if (response.data?.success) {
        setSnackbar({
          open: true,
          message: "Tạo xe đầu kéo thành công!",
          severity: "success",
        });

        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.data?.errors || response.data?.message);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo xe đầu kéo. Vui lòng thử lại.";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardContent>
            <Typography
              variant="h5"
              component="h2"
              className="mb-6 text-center font-bold"
            >
              Tạo Xe Đầu Kéo
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="licensePlate"
                    label="Biển Số Xe"
                    value={formData.licensePlate}
                    onChange={handleTextChange}
                    fullWidth
                    required
                    error={!!errors.licensePlate}
                    helperText={errors.licensePlate}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="brand"
                    label="Hãng Xe"
                    value={formData.brand}
                    onChange={handleTextChange}
                    fullWidth
                    required
                    error={!!errors.brand}
                    helperText={errors.brand}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="manufactureYear"
                    label="Năm Sản Xuất"
                    type="number"
                    value={formData.manufactureYear}
                    onChange={handleNumberChange}
                    fullWidth
                    required
                    error={!!errors.manufactureYear}
                    helperText={errors.manufactureYear}
                    inputProps={{
                      min: 1900,
                      max: new Date().getFullYear() + 1,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="maxLoadWeight"
                    label="Trọng Tải Tối Đa (kg)"
                    type="number"
                    value={formData.maxLoadWeight}
                    onChange={handleNumberChange}
                    fullWidth
                    required
                    error={!!errors.maxLoadWeight}
                    helperText={errors.maxLoadWeight}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại Container</InputLabel>
                    <Select
                      name="containerType"
                      value={formData.containerType}
                      onChange={handleSelectChange}
                      label="Loại Container"
                    >
                      <MenuItem value={ContainerType.TwentyFeet}>
                        20 Feet
                      </MenuItem>
                      <MenuItem value={ContainerType.FortyFeet}>
                        40 Feet
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày Bảo Dưỡng Cuối"
                    value={dayjs(formData.lastMaintenanceDate)}
                    onChange={(date) =>
                      handleDateChange("lastMaintenanceDate", date)
                    }
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.lastMaintenanceDate,
                        helperText: errors.lastMaintenanceDate,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày Bảo Dưỡng Tiếp Theo"
                    value={dayjs(formData.nextMaintenanceDate)}
                    onChange={(date) =>
                      handleDateChange("nextMaintenanceDate", date)
                    }
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.nextMaintenanceDate,
                        helperText: errors.nextMaintenanceDate,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày Đăng Ký"
                    value={dayjs(formData.registrationDate)}
                    onChange={(date) =>
                      handleDateChange("registrationDate", date)
                    }
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.registrationDate,
                        helperText: errors.registrationDate,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày Hết Hạn Đăng Ký"
                    value={dayjs(formData.registrationExpirationDate)}
                    onChange={(date) =>
                      handleDateChange("registrationExpirationDate", date)
                    }
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.registrationExpirationDate,
                        helperText: errors.registrationExpirationDate,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} className="flex justify-end mt-4 space-x-2">
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={
                      onClose || (() => navigate("/staff-menu/tractors"))
                    }
                    className="mr-2"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang tạo..." : "Tạo Xe Đầu Kéo"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default TractorCreate;
