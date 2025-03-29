import React from "react";
import {
  TextField,
  Button,
  Grid,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DATE_FORMAT } from "../../utils/dateConfig";
import {
  trailerSchema,
  TrailerFormValues,
  ContainerSize,
} from "./trailerSchema";

interface TrailerFormProps {
  onSubmit: SubmitHandler<TrailerFormValues>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialValues?: Partial<TrailerFormValues>;
}

const TrailerForm: React.FC<TrailerFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialValues,
}) => {
  const today = dayjs();

  const defaultValues: TrailerFormValues = {
    licensePlate: "",
    brand: "",
    manufactureYear: new Date().getFullYear(),
    maxLoadWeight: 0,
    lastMaintenanceDate: today.toDate(),
    nextMaintenanceDate: today.add(3, "month").toDate(),
    registrationDate: today.toDate(),
    registrationExpirationDate: today.add(1, "year").toDate(),
    containerSize: ContainerSize.Feet20,
    ...initialValues,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<TrailerFormValues>({
    resolver: zodResolver(trailerSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="licensePlate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Biển Số"
                fullWidth
                required
                error={!!errors.licensePlate}
                helperText={errors.licensePlate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Hãng rơ-moóc"
                fullWidth
                required
                error={!!errors.brand}
                helperText={errors.brand?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="manufactureYear"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Năm Sản Xuất"
                type="number"
                fullWidth
                required
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.manufactureYear}
                helperText={errors.manufactureYear?.message}
                inputProps={{
                  min: 1990,
                  max: 2025,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="maxLoadWeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Trọng Tải Tối Đa (tấn)"
                type="number"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.maxLoadWeight}
                helperText={errors.maxLoadWeight?.message}
                inputProps={{ min: 0, max: 100 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="containerSize"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.containerSize}>
                <InputLabel id="container-size-label">
                  Kích Thước Container
                </InputLabel>
                <Select
                  {...field}
                  labelId="container-size-label"
                  label="Kích Thước Container"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  <MenuItem value={ContainerSize.Feet20}>20'</MenuItem>
                  <MenuItem value={ContainerSize.Feet40}>40'</MenuItem>
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
            name="lastMaintenanceDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Ngày Bảo Dưỡng Cuối"
                value={dayjs(field.value)}
                onChange={(date) => field.onChange(date?.toDate() || null)}
                format={DATE_FORMAT}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.lastMaintenanceDate,
                    helperText: errors.lastMaintenanceDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="nextMaintenanceDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Ngày Bảo Dưỡng Tiếp Theo"
                value={dayjs(field.value)}
                onChange={(date) => field.onChange(date?.toDate() || null)}
                format={DATE_FORMAT}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.nextMaintenanceDate,
                    helperText: errors.nextMaintenanceDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="registrationDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Ngày Đăng Ký"
                value={dayjs(field.value)}
                onChange={(date) => field.onChange(date?.toDate() || null)}
                format={DATE_FORMAT}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.registrationDate,
                    helperText: errors.registrationDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="registrationExpirationDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Ngày Hết Hạn Đăng Ký"
                value={dayjs(field.value)}
                onChange={(date) => field.onChange(date?.toDate() || null)}
                format={DATE_FORMAT}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.registrationExpirationDate,
                    helperText: errors.registrationExpirationDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} className="flex justify-end mt-4 space-x-2">
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
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
            {isSubmitting ? "Đang xử lý..." : "Lưu"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default TrailerForm;
