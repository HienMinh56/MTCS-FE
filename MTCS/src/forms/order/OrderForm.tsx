import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormValues, orderSchema } from "./orderSchema";
import { getCustomers } from "../../services/customerApi";

interface OrderFormProps {
  onSubmit: (data: OrderFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialValues?: Partial<OrderFormValues>;
  isEditMode?: boolean;
  isDisabled?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialValues,
  isEditMode = false,
  isDisabled = false,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      companyName: initialValues?.companyName || "",
      note: initialValues?.note || "",
      totalAmount: initialValues?.totalAmount || 0,
      contactPerson: initialValues?.contactPerson || "",
      contactPhone: initialValues?.contactPhone || "",
      orderPlacer: initialValues?.orderPlacer || "",
    },
  });

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        // Trực tiếp lấy dữ liệu từ API
        const response = await getCustomers(1, 100);
        console.log("API response for customers:", response);

        // Xử lý phản hồi API
        let processedCustomers = [];

        if (Array.isArray(response)) {
          // Trường hợp API trả về array trực tiếp
          processedCustomers = response;
        } else if (response && Array.isArray(response.data)) {
          // Trường hợp API trả về dạng { status, message, data }
          processedCustomers = response.data;
        } else if (
          response &&
          response.orders &&
          Array.isArray(response.orders.items)
        ) {
          // Trường hợp API trả về dạng cũ { orders: { items: [] } }
          processedCustomers = response.orders.items;
        }

        console.log("Processed customers:", processedCustomers);
        setCustomers(processedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handler khi chọn khách hàng từ dropdown
  const handleCustomerSelect = (event: any, selectedCustomer: any) => {
    console.log("Selected customer:", selectedCustomer);
    if (selectedCustomer) {
      setValue("companyName", selectedCustomer.companyName || "");
      setValue("contactPerson", selectedCustomer.contactPerson || "");
      setValue("contactPhone", selectedCustomer.phoneNumber || "");
    }
  };

  const onFormSubmit = (data: OrderFormValues) => {
    onSubmit({
      ...data,
      totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Company and Contact Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Thông tin công ty và liên hệ
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => option.companyName || ""}
                    loading={loadingCustomers}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        // Cập nhật giá trị companyName và các trường liên quan
                        field.onChange(newValue.companyName);
                        setValue("contactPerson", newValue.contactPerson || "");
                        setValue("contactPhone", newValue.phoneNumber || "");
                      } else {
                        field.onChange("");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tên công ty"
                        variant="outlined"
                        fullWidth
                        error={!!errors.companyName}
                        helperText={errors.companyName?.message}
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCustomers ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                        disabled={isSubmitting || isDisabled}
                      />
                    )}
                    disabled={isSubmitting || isDisabled}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="orderPlacer"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Người đặt hàng"
                    fullWidth
                    error={!!errors.orderPlacer}
                    helperText={errors.orderPlacer?.message}
                    disabled={isSubmitting || isDisabled}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Người liên hệ nhận hàng"
                    fullWidth
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                    disabled={isSubmitting || isDisabled}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số điện thoại liên hệ người nhận"
                    fullWidth
                    error={!!errors.contactPhone}
                    helperText={errors.contactPhone?.message}
                    disabled={isSubmitting || isDisabled}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Order Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Thông tin đơn hàng
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="totalAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tổng giá"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">VNĐ</InputAdornment>
                      ),
                    }}
                    value={
                      field.value === 0 || field.value === "" ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : Number(value));
                    }}
                    fullWidth
                    error={!!errors.totalAmount}
                    helperText={errors.totalAmount?.message}
                    disabled={isSubmitting || isDisabled}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ghi chú"
                    fullWidth
                    error={!!errors.note}
                    helperText={errors.note?.message}
                    disabled={isSubmitting || isDisabled}
                    multiline
                    rows={3}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Form Actions */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting || isDisabled}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || isDisabled}
            >
              {isSubmitting ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Lưu"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default OrderForm;