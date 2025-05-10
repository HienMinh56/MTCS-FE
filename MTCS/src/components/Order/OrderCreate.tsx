import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { createOrder } from "../../services/orderApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OrderForm from "../../forms/order/OrderForm";
import {
  OrderFormValues,
  formatOrderFormForApi,
} from "../../forms/order/orderSchema";
import { formatApiError } from "../../utils/errorFormatting";
import dayjs from "dayjs";
import { ContainerType, DeliveryType } from "../../types/order";

interface OrderCreateProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const OrderCreate: React.FC<OrderCreateProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // State to track successful submission
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState<
    | (OrderFormValues & {
        files?: File[];
        fileDescriptions?: string[];
        fileNotes?: string[];
      })
    | null
  >(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
    duration: 5000,
  });

  const handleFormSubmit = (
    data: OrderFormValues & {
      files?: File[];
      fileDescriptions?: string[];
      fileNotes?: string[];
    }
  ) => {
    // Check if there are files but empty descriptions or notes
    const files = data.files || [];
    const descriptions = data.fileDescriptions || [];
    const notes = data.fileNotes || [];

    // Validate that all files have descriptions and notes
    let hasEmptyFields = false;
    for (let i = 0; i < files.length; i++) {
      if (!descriptions[i] || descriptions[i].trim() === "") {
        setSnackbar({
          open: true,
          message: `Vui lòng nhập mô tả cho tệp "${files[i].name}"`,
          severity: "error",
          duration: 5000,
        });
        hasEmptyFields = true;
        break;
      }

      if (!notes[i] || notes[i].trim() === "") {
        setSnackbar({
          open: true,
          message: `Vui lòng nhập ghi chú cho tệp "${files[i].name}"`,
          severity: "error",
          duration: 5000,
        });
        hasEmptyFields = true;
        break;
      }
    }

    // Only proceed if all files have descriptions and notes
    if (!hasEmptyFields) {
      // Store the form data and show confirmation dialog
      setOrderData(data);
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmOrder = async () => {
    // User confirmed, proceed with order creation
    setConfirmDialogOpen(false);

    if (!orderData || isSuccess || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedData = formatOrderFormForApi(orderData);
      console.log("===== ORDER CREATE REQUEST DATA =====");
      console.log("Form data:", orderData);
      console.log("Formatted data for API:", formattedData);
      console.log("Files:", orderData.files);

      // Get files and their metadata
      const files = orderData.files || [];
      const fileDescriptions = orderData.fileDescriptions || [];
      const fileNotes = orderData.fileNotes || [];

      // Ensure we have enough descriptions and notes for each file
      while (fileDescriptions.length < files.length) {
        fileDescriptions.push("");
      }

      while (fileNotes.length < files.length) {
        fileNotes.push("");
      }

      console.log("Files count:", files.length);
      console.log("Descriptions count:", fileDescriptions.length);
      console.log("Notes count:", fileNotes.length);
      console.log("Complete Time:", orderData.completeTime); // Log the time format

      // Map orderPlacer to OrderPlace as expected by the backend
      const response = await createOrder({
        ...formattedData,
        OrderPlace: orderData.orderPlacer || "", // Explicitly map to OrderPlace
        companyName: orderData.companyName, // Ensure companyName is passed
        CompletionTime: orderData.completeTime, // Pass time directly as HH:MM string
        containerNumber: orderData.containerNumber.toUpperCase().trim(), // Ensure proper formatting
        files: files.length > 0 ? files : null,
        description: fileDescriptions,
        notes: fileNotes,
      });

      console.log("===== ORDER CREATE RESPONSE =====");
      console.log("Response:", response);

      if (response.status == 1) {
        // Set success state to true to prevent additional submissions and disable the form
        setIsSuccess(true);

        // Handle success
        setSnackbar({
          open: true,
          message: "Tạo đơn hàng thành công!",
          severity: "success",
          duration: 1500,
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
        }, 2500);
      } else if (response.status == -1) {
        // Keep isSuccess as false to allow retrying
        setIsSuccess(false);

        setSnackbar({
          open: true,
          message: "Tạo đơn hàng thất bại!",
          severity: "error",
          duration: 1500,
        });

        // Show error message
        setSnackbar({
          open: true,
          message: `${response.message}`,
          severity: "error",
          duration: 1500,
        });
      }
    } catch (error: any) {
      console.error("===== ORDER CREATE ERROR =====");
      console.error("Error details:", error);

      setSnackbar({
        open: true,
        message: error,
        severity: "error",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    // Close the dialog without submitting
    setConfirmDialogOpen(false);
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

  // Helper function to format date for display
  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  // Helper function to get container type display
  const getContainerTypeDisplay = (type: ContainerType) => {
    return type === ContainerType["Container Khô"]
      ? "Container Khô"
      : "Container Lạnh";
  };

  // Helper function to get delivery type display
  const getDeliveryTypeDisplay = (type: DeliveryType) => {
    return type === DeliveryType.Import ? "Nhập" : "Xuất";
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
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              isDisabled={isSuccess} // Pass the success state to disable the form
            />
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCancelConfirmation}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 },
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Xác nhận thông tin đơn hàng
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            {orderData && (
              <Box sx={{ py: 1 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  fontWeight="medium"
                  color="primary"
                >
                  Vui lòng xác nhận thông tin đơn hàng trước khi tạo
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tên công ty
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {orderData.companyName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Người liên hệ nhận hàng
                      </Typography>
                      <Typography variant="body1">
                        {orderData.contactPerson}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Số điện thoại liên hệ người nhận
                      </Typography>
                      <Typography variant="body1">
                        {orderData.contactPhone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Người đặt
                      </Typography>
                      <Typography variant="body1">
                        {orderData.orderPlacer}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Loại container
                      </Typography>
                      <Typography variant="body1">
                        {getContainerTypeDisplay(orderData.containerType)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Kích thước
                      </Typography>
                      <Typography variant="body1">
                        {orderData.containerSize === 20
                          ? "Container 20 FEET"
                          : orderData.containerSize === 40
                          ? "Container 40 FEET"
                          : "Không tìm thấy"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Loại vận chuyển
                      </Typography>
                      <Typography variant="body1">
                        {getDeliveryTypeDisplay(orderData.deliveryType)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Số container
                      </Typography>
                      <Typography variant="body1">
                        {orderData.containerNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Trọng lượng
                      </Typography>
                      <Typography variant="body1">
                        {orderData.weight} tấn
                      </Typography>
                    </Grid>
                    {orderData.containerType ===
                      ContainerType["Container Lạnh"] && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Nhiệt độ
                        </Typography>
                        <Typography variant="body1">
                          {orderData.temperature}°C
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày lấy hàng
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(orderData.pickUpDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày giao hàng
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(orderData.deliveryDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Địa điểm lấy hàng
                      </Typography>
                      <Typography variant="body1">
                        {orderData.pickUpLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Địa điểm giao hàng
                      </Typography>
                      <Typography variant="body1">
                        {orderData.deliveryLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Địa điểm trả container
                      </Typography>
                      <Typography variant="body1">
                        {orderData.conReturnLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Khoảng cách
                      </Typography>
                      <Typography variant="body1">
                        {orderData.distance} km
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Giá
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Intl.NumberFormat("vi-VN").format(
                          Number(orderData.price)
                        )}{" "}
                        VNĐ
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Ghi chú
                      </Typography>
                      <Typography variant="body1">
                        {orderData.note || "Không có ghi chú"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {orderData.files && orderData.files.length > 0 && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, backgroundColor: "#f9f9f9" }}
                  >
                    <Typography
                      variant="body1"
                      gutterBottom
                      fontWeight="medium"
                    >
                      Tệp đính kèm
                    </Typography>
                    <Grid container spacing={1}>
                      {Array.from(orderData.files).map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2">
                              {index + 1}. {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              ({(file.size / 1024).toFixed(2)} KB)
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={handleCancelConfirmation}
              color="inherit"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmOrder}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận và tạo đơn hàng"}
            </Button>
          </DialogActions>
        </Dialog>

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
