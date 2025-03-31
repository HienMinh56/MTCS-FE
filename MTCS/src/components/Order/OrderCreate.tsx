import React, { useState } from "react";
import { Card, CardContent, Typography, Snackbar, Alert } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { createOrder } from "../../services/orderApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OrderForm from "../../forms/order/OrderForm";
import { OrderFormValues, formatOrderFormForApi } from "../../forms/order/orderSchema";
import { formatApiError } from "../../utils/errorFormatting";

interface OrderCreateProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const OrderCreate: React.FC<OrderCreateProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const onSubmit = async (data: OrderFormValues & { files?: File[], fileDescriptions?: string[], fileNotes?: string[] }) => {
    setIsSubmitting(true);

    try {
      const formattedData = formatOrderFormForApi(data);
      console.log('===== ORDER CREATE REQUEST DATA =====');
      console.log('Form data:', data);
      console.log('Formatted data for API:', formattedData);
      console.log('Files:', data.files);
      
      // Create a new array for file descriptions and notes that matches the length of files
      const fileDescriptions = data.fileDescriptions || [];
      const fileNotes = data.fileNotes || [];
      
      // Ensure we're passing the files and related metadata to the API call
      const response = await createOrder({
        ...formattedData,
        files: data.files || null,
        // Use the first description/note as general values if available,
        // or use the specific ones for each file
        description: fileDescriptions.length > 0 ? fileDescriptions : (data.description || []),
        notes: fileNotes.length > 0 ? fileNotes : (data.notes || []),
      });
      
      console.log('===== ORDER CREATE RESPONSE =====');
      console.log('Response:', response);

      // Handle success
      setSnackbar({
        open: true,
        message: "Tạo đơn hàng thành công!",
        severity: "success",
      });

      // Delay navigation to allow the toast to be visible
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        } else {
          navigate("/staff-menu/orders");
        }
      }, 1500);
      
    } catch (error: any) {
      console.error("===== ORDER CREATE ERROR =====");
      console.error("Error details:", error);

      let errorMessage = "Không thể tạo đơn hàng. Vui lòng thử lại.";

      // Handle Axios error
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
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
      navigate("/staff-menu/orders");
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
              Tạo Đơn Hàng Mới
            </Typography>

            <OrderForm
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

export default OrderCreate;
