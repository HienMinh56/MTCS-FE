import React, { useState } from "react";
import { Card, CardContent, Typography, Snackbar, Alert } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { createTrailer } from "../../services/trailerApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TrailerForm,
  TrailerFormValues,
  formatTrailerFormForApi,
  handleServerValidationErrors,
} from "../../forms/trailer";
import { formatApiError } from "../../utils/errorFormatting";

interface TrailerCreateProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const TrailerCreate: React.FC<TrailerCreateProps> = ({
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

  const onSubmit = async (data: TrailerFormValues) => {
    setIsSubmitting(true);

    try {
      const formattedData = formatTrailerFormForApi(data);
      const response = await createTrailer(formattedData);

      // Handle success response
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.messageVN || "Tạo rơ mooc thành công!",
          severity: "success",
        });

        // Delay navigation to allow the toast to be visible
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          if (onClose) {
            onClose();
          }
        }, 1500);
      } else {
        // API returned success:false
        const errorMessage = formatApiError(response.data);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating trailer:", error);

      let errorMessage = "Không thể tạo rơ mooc. Vui lòng thử lại.";

      // Handle Axios error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 200) {
          // Some APIs might return 200 status but still contain error info
          const data = error.response.data;
          if (data?.success) {
            // This is actually a success despite being caught
            setSnackbar({
              open: true,
              message: data.messageVN || "Tạo rơ mooc thành công!",
              severity: "success",
            });

            // Delay navigation to allow the toast to be visible
            setTimeout(() => {
              if (onSuccess) {
                onSuccess();
              }
              if (onClose) {
                onClose();
              }
            }, 1500);

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
      navigate("/staff-menu/trailers");
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
              Tạo Rơ Mooc
            </Typography>

            <TrailerForm
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

export default TrailerCreate;
