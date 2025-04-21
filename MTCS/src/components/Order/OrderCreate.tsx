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
  const [isSuccess, setIsSuccess] = useState(false); // State to track successful submission
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
    duration: 5000,
  });

  const onSubmit = async (data: OrderFormValues & { files?: File[], fileDescriptions?: string[], fileNotes?: string[] }) => {
    // Prevent submission if already successful or submitting
    if (isSuccess || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formattedData = formatOrderFormForApi(data);
      console.log('===== ORDER CREATE REQUEST DATA =====');
      console.log('Form data:', data);
      console.log('Formatted data for API:', formattedData);
      console.log('Files:', data.files);
      
      // Get files and their metadata
      const files = data.files || [];
      const fileDescriptions = data.fileDescriptions || [];
      const fileNotes = data.fileNotes || [];
      
      // Ensure we have enough descriptions and notes for each file
      while (fileDescriptions.length < files.length) {
        fileDescriptions.push('');
      }
      
      while (fileNotes.length < files.length) {
        fileNotes.push('');
      }
      
      console.log('Files count:', files.length);
      console.log('Descriptions count:', fileDescriptions.length);
      console.log('Notes count:', fileNotes.length);
      console.log('Complete Time:', data.completeTime); // Log the time format
      
      // Map orderPlacer to OrderPlace as expected by the backend
      const response = await createOrder({
        ...formattedData,
        OrderPlace: data.orderPlacer || "", // Explicitly map to OrderPlace
        companyName: data.companyName, // Ensure companyName is passed
        CompletionTime: data.completeTime, // Pass time directly as HH:MM string
        containerNumber: data.containerNumber.toUpperCase().trim(), // Ensure proper formatting
        files: files.length > 0 ? files : null,
        description: fileDescriptions,
        notes: fileNotes,
      });
      
      console.log('===== ORDER CREATE RESPONSE =====');
      console.log('Response:', response);

      if (response.status == 1) {
        // Set success state to true to prevent additional submissions and disable the form
        setIsSuccess(true);
      
        // Handle success
        setSnackbar({
          open: true,
          message: "Tạo đơn hàng thành công!",
          severity: "success",
          duration: 3000,
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
        }, 4000);
      } else if (response.status == -1) {
        // Keep isSuccess as false to allow retrying
        setIsSuccess(false);
      
        // Show error message
        setSnackbar({
          open: true,
          message: `${response.message}`,
          severity: "error",
          duration: 3000,
        });
      }
      
      
    } catch (error: any) {
      console.error("===== ORDER CREATE ERROR =====");
      console.error("Error details:", error);

      setSnackbar({
        open: true,
        message: error,
        severity: "error",
        duration: 3000,
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
              isDisabled={isSuccess} // Pass the success state to disable the form
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
