import React, { useState } from "react";
import { Card, CardContent, Typography, Snackbar, Alert } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { createTractor } from "../../services/tractorApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TractorForm,
  TractorFormValues,
  formatTractorFormForApi,
  handleServerValidationErrors,
} from "../../forms/tractor";
import { formatApiError } from "../../utils/errorFormatting";

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

  const onSubmit = async (data: TractorFormValues) => {
    setIsSubmitting(true);

    try {
      const formattedData = formatTractorFormForApi(data);
      const response = await createTractor(formattedData);

      // Handle success response
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.messageVN || "Tạo xe đầu kéo thành công!",
          severity: "success",
        });

        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      } else {
        // API returned success:false
        const errorMessage = formatApiError(response.data);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating tractor:", error);

      let errorMessage = "Không thể tạo xe đầu kéo. Vui lòng thử lại.";

      // Handle Axios error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 200) {
          // Some APIs might return 200 status but still contain error info
          const data = error.response.data;
          if (data?.success) {
            // This is actually a success despite being caught
            setSnackbar({
              open: true,
              message: data.messageVN || "Tạo xe đầu kéo thành công!",
              severity: "success",
            });

            if (onSuccess) {
              onSuccess();
            }
            if (onClose) {
              onClose();
            }
            setIsSubmitting(false);
            return;
          } else {
            errorMessage = formatApiError(data);
          }
        } else if (error.response?.data) {
          errorMessage = formatApiError(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

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

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/staff-menu/tractors");
    }
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

            <TractorForm
              onSubmit={onSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
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
