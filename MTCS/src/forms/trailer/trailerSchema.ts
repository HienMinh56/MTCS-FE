import { z } from "zod";

export enum ContainerSize {
  Feet20 = 1,
  Feet40 = 2,
}

export const trailerSchema = z
  .object({
    licensePlate: z
      .string()
      .min(8, "Biển số xe phải có ít nhất 8 ký tự")
      .max(10, "Biển số xe không được vượt quá 10 ký tự")
      .nonempty("Biển số xe là bắt buộc")
      .refine((value) => {
        // Match format: 11-99 + Letter(+Letter/Digit) + "-" + 4-5 digits
        if (!/^\d{2}[A-Z]([A-Z0-9])?-\d{4,5}$/.test(value)) {
          return false;
        }

        const firstTwoDigits = parseInt(value.substring(0, 2));
        return firstTwoDigits >= 11 && firstTwoDigits <= 99;
      }, "Biển số xe phải có định dạng ví dụ: 51A-1234, 51AB-1234, 51A8-1234, 17S3-50555"),
    brand: z
      .string()
      .min(1, "Hãng xe phải có ít nhất 1 ký tự")
      .max(20, "Hãng xe không được vượt quá 20 ký tự")
      .nonempty("Hãng xe là bắt buộc"),
    manufactureYear: z
      .number()
      .int()
      .min(1990, "Năm sản xuất phải từ 1990 trở lên")
      .max(2025, "Năm sản xuất không được vượt quá 2025"),
    maxLoadWeight: z
      .number()
      .min(0.1, "Trọng tải tối đa phải lớn hơn 0")
      .max(100, "Trọng tải tối đa không được vượt quá 100"),
    lastMaintenanceDate: z.date().refine((date) => date <= new Date(), {
      message: "Ngày bảo dưỡng cuối không được trong tương lai",
    }),
    nextMaintenanceDate: z.date(),
    registrationDate: z.date().refine((date) => date <= new Date(), {
      message: "Ngày đăng ký không được trong tương lai",
    }),
    registrationExpirationDate: z.date(),
    containerSize: z
      .number()
      .refine(
        (value) =>
          value === ContainerSize.Feet20 || value === ContainerSize.Feet40,
        {
          message: "Kích thước container chỉ có thể là 20 feet hoặc 40 feet",
        }
      ),
  })
  .refine(
    (data) => {
      return data.registrationExpirationDate > data.registrationDate;
    },
    {
      message: "Ngày hết hạn đăng ký phải sau ngày đăng ký",
      path: ["registrationExpirationDate"],
    }
  );

export type TrailerFormValues = z.infer<typeof trailerSchema>;

export const formatTrailerFormForApi = (data: TrailerFormValues) => {
  return {
    ...data,
    lastMaintenanceDate: data.lastMaintenanceDate.toISOString(),
    nextMaintenanceDate: data.nextMaintenanceDate.toISOString(),
    registrationDate: new Date(data.registrationDate)
      .toISOString()
      .split("T")[0],
    registrationExpirationDate: new Date(data.registrationExpirationDate)
      .toISOString()
      .split("T")[0],
  };
};

export const handleServerValidationErrors = (
  errors: Record<string, any>,
  setError: (
    field: keyof TrailerFormValues,
    error: { type: string; message: string }
  ) => void
) => {
  Object.entries(errors).forEach(([key, value]) => {
    // Convert backend field name to frontend field name (e.g., LicensePlate -> licensePlate)
    const fieldName = (key.charAt(0).toLowerCase() +
      key.slice(1)) as keyof TrailerFormValues;
    if (typeof value === "string") {
      setError(fieldName, { type: "server", message: value });
    } else if (Array.isArray(value) && value.length > 0) {
      setError(fieldName, { type: "server", message: value[0] });
    }
  });
};
