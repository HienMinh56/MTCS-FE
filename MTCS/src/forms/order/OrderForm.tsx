import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker"; // Add TimePicker import
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormValues, orderSchema } from "./orderSchema";
import { ContainerType, ContainerSize, DeliveryType } from "../../types/order";
import { Customer } from "../../types/customer";
import { getCustomers } from "../../services/customerApi";
import dayjs from "dayjs";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

// Styled component for the file input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface OrderFormProps {
  onSubmit: (data: OrderFormValues & { files?: File[] }) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    register,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      companyName: initialValues?.companyName || "",
      temperature: initialValues?.temperature || 0,
      weight: initialValues?.weight || "", // Initialize as empty string instead of 0
      pickUpDate: initialValues?.pickUpDate || dayjs().add(1, "day").toDate(),
      deliveryDate: initialValues?.deliveryDate || dayjs().add(2, "day").toDate(),
      completionTime: initialValues?.completeTime || null, 
      note: initialValues?.note || "",
      containerType: initialValues?.containerType || ContainerType["Container Khô"],
      containerSize: initialValues?.containerSize || ContainerSize["Container 20 FEET"],
      deliveryType: initialValues?.deliveryType || DeliveryType.Import,
      pickUpLocation: initialValues?.pickUpLocation || "",
      deliveryLocation: initialValues?.deliveryLocation || "",
      conReturnLocation: initialValues?.conReturnLocation || "",
      price: initialValues?.price || "", // Initialize as empty string instead of 0
      contactPerson: initialValues?.contactPerson || "",
      contactPhone: initialValues?.contactPhone || "",
      distance: initialValues?.distance || null,
      orderPlacer: initialValues?.orderPlacer || "",
      containerNumber: initialValues?.containerNumber || "",
      description: [],
      notes: [],
    },
  });

  const containerType = watch("containerType");

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
        } else if (response && response.orders && Array.isArray(response.orders.items)) {
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

  // Rest of the file handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFilesArray = Array.from(event.target.files);
      const currentFiles = selectedFiles; // Store current files before updating
      
      // Update files array
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFilesArray]);
      
      // Add empty descriptions and notes for each new file
      setFileDescriptions(prev => {
        const result = [...prev];
        // Ensure we have a description for each file
        while (result.length < currentFiles.length + newFilesArray.length) {
          result.push('');
        }
        return result;
      });
      
      setFileNotes(prev => {
        const result = [...prev];
        // Ensure we have a note for each file
        while (result.length < currentFiles.length + newFilesArray.length) {
          result.push('');
        }
        return result;
      });
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFileDescriptions(prev => prev.filter((_, i) => i !== index));
    setFileNotes(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleFileDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...fileDescriptions];
    newDescriptions[index] = value;
    setFileDescriptions(newDescriptions);
  };
  
  const handleFileNoteChange = (index: number, value: string) => {
    const newNotes = [...fileNotes];
    newNotes[index] = value;
    setFileNotes(newNotes);
  };

  const onFormSubmit = (data: OrderFormValues) => {
    // Verify the arrays have the same length before submission
    const filesToSubmit = selectedFiles.length > 0 ? selectedFiles : null;
    let descriptionsToSubmit = [...fileDescriptions];
    let notesToSubmit = [...fileNotes];
    
    // Make sure descriptions and notes arrays have exactly the same length as files
    if (filesToSubmit) {
      // Ensure arrays match file count
      while (descriptionsToSubmit.length < filesToSubmit.length) {
        descriptionsToSubmit.push('');
      }
      
      while (notesToSubmit.length < filesToSubmit.length) {
        notesToSubmit.push('');
      }
      
      // Trim arrays to match file count
      descriptionsToSubmit = descriptionsToSubmit.slice(0, filesToSubmit.length);
      notesToSubmit = notesToSubmit.slice(0, filesToSubmit.length);
    }
    
    // Log counts to verify they match
    console.log("Files to submit:", filesToSubmit?.length || 0);
    console.log("Descriptions to submit:", descriptionsToSubmit.length);
    console.log("Notes to submit:", notesToSubmit.length);
    console.log("orderPlacer value:", data.orderPlacer); // Log orderPlacer value
    
    onSubmit({
      ...data,
      weight: data.weight !== "" ? Number(data.weight) : 0, // Convert to number if not empty
      price: data.price !== "" ? Number(data.price) : 0, // Convert to number if not empty
      files: filesToSubmit,
      fileDescriptions: descriptionsToSubmit,
      fileNotes: notesToSubmit
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
            {/* Chỉ giữ dropdown Autocomplete để chọn công ty và loại bỏ trường nhập tên công ty bên phải */}
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
                              {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
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
                name="contactPerson"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Người liên hệ"
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
                    label="Số điện thoại liên hệ"
                    fullWidth
                    error={!!errors.contactPhone}
                    helperText={errors.contactPhone?.message}
                    disabled={isSubmitting || isDisabled}
                    required
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
          </Grid>
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Thông tin vận chuyển
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="containerNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số container"
                    fullWidth
                    error={!!errors.containerNumber}
                    helperText={errors.containerNumber?.message || 'Ví dụ: SEGU5593802 (3 kí tự đầu công ty, U, 5 số, 1 số kiểm tra)'}
                    disabled={isSubmitting || isDisabled}
                    required
                    inputProps={{
                      maxLength: 10,
                      style: { textTransform: 'uppercase' }
                    }}
                    onChange={(e) => {
                      // Convert input to uppercase and format
                      const value = e.target.value.toUpperCase();
                      // Remove non-alphanumeric characters
                      const formatted = value.replace(/[^A-Z0-9]/g, '');
                      field.onChange(formatted);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="textSecondary">
                            XXX-U-YYYYY-Z
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="containerType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.containerType} required>
                    <InputLabel>Loại container</InputLabel>
                    <Select
                      {...field}
                      label="Loại container"
                      disabled={isSubmitting || isDisabled}
                    >
                      <MenuItem value={ContainerType["Container Khô"]}>
                        Container Khô
                      </MenuItem>
                      <MenuItem value={ContainerType["Container Lạnh"]}>
                        Container Lạnh
                      </MenuItem>
                    </Select>
                    {errors.containerType && (
                      <FormHelperText>
                        {errors.containerType.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="containerSize"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.containerSize} required>
                    <InputLabel>Kích thước container</InputLabel>
                    <Select
                      {...field}
                      label="Kích thước container"
                      disabled={isSubmitting || isDisabled}
                    >
                      <MenuItem value={ContainerSize["Container 20 FEET"]}>
                        Container 20 FEET
                      </MenuItem>
                      <MenuItem value={ContainerSize["Container 40 FEET"]}>
                        Container 40 FEET
                      </MenuItem>
                    </Select>
                    {errors.containerSize && (
                      <FormHelperText>
                        {errors.containerSize.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="deliveryType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.deliveryType} required>
                    <InputLabel>Loại vận chuyển</InputLabel>
                    <Select
                      {...field}
                      label="Loại vận chuyển"
                      disabled={isSubmitting || isDisabled}
                    >
                      <MenuItem value={DeliveryType.Import}>Nhập</MenuItem>
                      <MenuItem value={DeliveryType.Export}>Xuất</MenuItem>
                    </Select>
                    {errors.deliveryType && (
                      <FormHelperText>{errors.deliveryType.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Trọng lượng"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">tấn</InputAdornment>
                      ),
                    }}
                    value={field.value === 0 || field.value === "" ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : Number(value));
                    }}
                    fullWidth
                    error={!!errors.weight}
                    helperText={errors.weight?.message}
                    disabled={isSubmitting || isDisabled}
                    required
                  />
                )}
              />
            </Grid>
            
            {/* Temperature field - only show for Container Lạnh */}
            {containerType === ContainerType["Container Lạnh"] && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="temperature"
                  control={control}
                  render={({ field: { onChange, ...field } }) => (
                    <TextField
                      {...field}
                      label="Nhiệt độ"
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">°C</InputAdornment>
                        ),
                      }}
                      onChange={(e) => onChange(Number(e.target.value))}
                      fullWidth
                      error={!!errors.temperature}
                      helperText={errors.temperature?.message}
                      disabled={isSubmitting || isDisabled}
                      required
                    />
                  )}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Giá"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">VNĐ</InputAdornment>
                      ),
                    }}
                    value={field.value === 0 || field.value === "" ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : Number(value));
                    }}
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    disabled={isSubmitting || isDisabled}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="distance"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    label="Khoảng cách"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">km</InputAdornment>
                      ),
                    }}
                    onChange={(e) => 
                      onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    fullWidth
                    error={!!errors.distance}
                    helperText={errors.distance?.message}
                    disabled={isSubmitting || isDisabled}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Locations */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Địa điểm
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="pickUpLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Địa điểm lấy hàng"
                    fullWidth
                    error={!!errors.pickUpLocation}
                    helperText={errors.pickUpLocation?.message}
                    disabled={isSubmitting || isDisabled}
                    multiline
                    rows={2}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="deliveryLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Địa điểm giao hàng"
                    fullWidth
                    error={!!errors.deliveryLocation}
                    helperText={errors.deliveryLocation?.message}
                    disabled={isSubmitting || isDisabled}
                    multiline
                    rows={2}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="conReturnLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Địa điểm trả container"
                    fullWidth
                    error={!!errors.conReturnLocation}
                    helperText={errors.conReturnLocation?.message}
                    disabled={isSubmitting || isDisabled}
                    multiline
                    rows={2}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Dates */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Thời gian
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="pickUpDate"
                control={control}
                render={({ field: { value, onChange, ...restField } }) => (
                  <DatePicker
                    label="Ngày lấy hàng"
                    value={dayjs(value)}
                    onChange={(date) => onChange(date?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.pickUpDate,
                        helperText: errors.pickUpDate?.message,
                        disabled: isSubmitting || isDisabled,
                        required: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="deliveryDate"
                control={control}
                render={({ field: { value, onChange, ...restField } }) => (
                  <DatePicker
                    label="Ngày giao hàng"
                    value={dayjs(value)}
                    onChange={(date) => onChange(date?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.deliveryDate,
                        helperText: errors.deliveryDate?.message,
                        disabled: isSubmitting || isDisabled,
                        required: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="completeTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Thời Gian Ước tính hoàn thành vận chuyển"
                    value={field.value ? dayjs(field.value, "HH:mm") : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? dayjs(newValue).format("HH:mm") : null);
                    }}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        fullWidth: true,
                        error: !!errors.completeTime,
                        helperText: errors.completeTime?.message,
                        required: true, // Đánh dấu trường là bắt buộc
                        disabled: isSubmitting || isDisabled,
                      },
                    }}
                    ampm={false} // Use 24-hour format
                    views={['hours', 'minutes']} // Show only hours and minutes
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Thông tin bổ sung
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
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

            {/* File Upload Section - Show only in create mode or edit mode with specific conditions */}
            {!isEditMode && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Tệp đính kèm
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={isSubmitting || isDisabled}
                >
                  Chọn tệp
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSubmitting || isDisabled}
                  />
                </Button>
                {selectedFiles.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tệp đã chọn:
                    </Typography>
                    {selectedFiles.map((file, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 3, 
                          p: 2, 
                          border: '1px solid rgba(0, 0, 0, 0.12)',
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center', 
                          mb: 2 
                        }}>
                          <Typography variant="body2">{file.name}</Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleFileRemove(index)}
                            disabled={isSubmitting || isDisabled}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <TextField
                          label="Mô tả file"
                          value={fileDescriptions[index] || ''}
                          onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                          fullWidth
                          margin="normal"
                          size="small"
                          disabled={isSubmitting || isDisabled}
                        />
                        
                        <TextField
                          label="Ghi chú file"
                          value={fileNotes[index] || ''}
                          onChange={(e) => handleFileNoteChange(index, e.target.value)}
                          fullWidth
                          margin="normal"
                          size="small"
                          disabled={isSubmitting || isDisabled}
                        />
                      </Box>
                    ))}
                  </Paper>
                )}
              </Grid>
            )}
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
