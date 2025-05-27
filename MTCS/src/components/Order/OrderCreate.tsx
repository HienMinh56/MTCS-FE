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
import OrderForm from "../../forms/order/OrderForm";
import {
  OrderFormValues,
  formatOrderFormForApi,
} from "../../forms/order/orderSchema";

interface OrderCreateProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const OrderCreate: React.FC<OrderCreateProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormValues | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
    duration: 5000,
  });

  const handleFormSubmit = (data: OrderFormValues) => {
    // Store the form data and show confirmation dialog
    setOrderData(data);
    setConfirmDialogOpen(true);
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

      const response = await createOrder({
        companyName: formattedData.companyName,
        note: formattedData.note,
        totalAmount: formattedData.totalAmount,
        contactPerson: formattedData.contactPerson,
        contactPhone: formattedData.contactPhone,
        orderPlacer: formattedData.orderPlacer,
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
          message: `Tạo đơn hàng thất bại: ${response.message}`,
          severity: "error",
          duration: 1500,
        });
      }
    } catch (error: any) {
      console.error("===== ORDER CREATE ERROR =====");
      console.error("Error details:", error);

      setSnackbar({
        open: true,
        message: error.message || "Đã xảy ra lỗi khi tạo đơn hàng",
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
              isDisabled={isSuccess}
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
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tổng giá
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Intl.NumberFormat("vi-VN").format(
                          Number(orderData.totalAmount)
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