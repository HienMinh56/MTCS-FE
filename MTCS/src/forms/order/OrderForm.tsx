import React, { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormValues, orderSchema } from "./orderSchema";
import { ContainerType, DeliveryType } from "../../types/order";
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
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialValues,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);
  
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
      weight: initialValues?.weight || 0,
      pickUpDate: initialValues?.pickUpDate || dayjs().add(1, "day").toDate(),
      deliveryDate: initialValues?.deliveryDate || dayjs().add(2, "day").toDate(),
      note: initialValues?.note || "",
      containerType: initialValues?.containerType || ContainerType.Container20,
      deliveryType: initialValues?.deliveryType || DeliveryType.Import,
      pickUpLocation: initialValues?.pickUpLocation || "",
      deliveryLocation: initialValues?.deliveryLocation || "",
      conReturnLocation: initialValues?.conReturnLocation || "",
      price: initialValues?.price || 0,
      contactPerson: initialValues?.contactPerson || "",
      contactPhone: initialValues?.contactPhone || "",
      distance: initialValues?.distance || null,
      orderPlacer: initialValues?.orderPlacer || "",
      containerNumber: initialValues?.containerNumber || "",
      description: initialValues?.description || [""],
      notes: initialValues?.notes || [""],
    },
  });

  // Using useFieldArray for dynamic arrays
  const { fields: descriptionFields, append: appendDescription, remove: removeDescription } = 
    useFieldArray({ control, name: "description" });
  
  const { fields: notesFields, append: appendNote, remove: removeNote } = 
    useFieldArray({ control, name: "notes" });

  const containerType = watch("containerType");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      
      // Add empty descriptions and notes for each new file
      setFileDescriptions(prev => [...prev, ...newFiles.map(() => '')]);
      setFileNotes(prev => [...prev, ...newFiles.map(() => '')]);
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
    onSubmit({
      ...data,
      files: selectedFiles.length > 0 ? selectedFiles : null,
      fileDescriptions: selectedFiles.length > 0 ? fileDescriptions : null,
      fileNotes: selectedFiles.length > 0 ? fileNotes : null
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
                  <TextField
                    {...field}
                    label="Tên công ty"
                    fullWidth
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    disabled={isSubmitting}
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
                    label="Người liên hệ"
                    fullWidth
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    helperText={errors.containerNumber?.message}
                    disabled={isSubmitting}
                    required
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
                      disabled={isSubmitting}
                    >
                      <MenuItem value={ContainerType.Container20}>
                        Container 20
                      </MenuItem>
                      <MenuItem value={ContainerType.Container40}>
                        Container 40
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
                name="deliveryType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.deliveryType} required>
                    <InputLabel>Loại vận chuyển</InputLabel>
                    <Select
                      {...field}
                      label="Loại vận chuyển"
                      disabled={isSubmitting}
                    >
                      <MenuItem value={DeliveryType.Import}>Nhập khẩu</MenuItem>
                      <MenuItem value={DeliveryType.Export}>Xuất khẩu</MenuItem>
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
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    label="Trọng lượng"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">tấn</InputAdornment>
                      ),
                    }}
                    onChange={(e) => onChange(Number(e.target.value))}
                    fullWidth
                    error={!!errors.weight}
                    helperText={errors.weight?.message}
                    disabled={isSubmitting}
                    required
                  />
                )}
              />
            </Grid>
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
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="price"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    label="Giá"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">VNĐ</InputAdornment>
                      ),
                    }}
                    onChange={(e) => onChange(Number(e.target.value))}
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                        disabled: isSubmitting,
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
                        disabled: isSubmitting,
                        required: true,
                      },
                    }}
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
                    disabled={isSubmitting}
                    multiline
                    rows={3}
                    required
                  />
                )}
              />
            </Grid>
            
            {/* Dynamic Description Fields */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Mô tả chi tiết
                </Typography>
                {descriptionFields.map((field, index) => (
                  <Box key={field.id} sx={{ display: "flex", mb: 1 }}>
                    <TextField
                      {...register(`description.${index}`)}
                      label={`Mô tả ${index + 1}`}
                      fullWidth
                      disabled={isSubmitting}
                      multiline
                      rows={2}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeDescription(index)}
                      disabled={descriptionFields.length <= 1 || isSubmitting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => appendDescription("")}
                  disabled={isSubmitting}
                >
                  Thêm mô tả
                </Button>
              </Box>
            </Grid>

            {/* Dynamic Notes Fields */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ghi chú bổ sung
                </Typography>
                {notesFields.map((field, index) => (
                  <Box key={field.id} sx={{ display: "flex", mb: 1 }}>
                    <TextField
                      {...register(`notes.${index}`)}
                      label={`Ghi chú ${index + 1}`}
                      fullWidth
                      disabled={isSubmitting}
                      multiline
                      rows={2}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeNote(index)}
                      disabled={notesFields.length <= 1 || isSubmitting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => appendNote("")}
                  disabled={isSubmitting}
                >
                  Thêm ghi chú
                </Button>
              </Box>
            </Grid>

            {/* File Upload Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tệp đính kèm
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
                disabled={isSubmitting}
              >
                Chọn tệp
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                      />
                      
                      <TextField
                        label="Ghi chú file"
                        value={fileNotes[index] || ''}
                        onChange={(e) => handleFileNoteChange(index, e.target.value)}
                        fullWidth
                        margin="normal"
                        size="small"
                      />
                    </Box>
                  ))}
                </Paper>
              )}
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
              {isSubmitting ? "Đang xử lý..." : "Lưu"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default OrderForm;
