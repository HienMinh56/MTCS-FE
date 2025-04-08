import { z } from "zod";
import dayjs from "dayjs";

// Helper to normalize Vietnamese text to ensure proper encoding
const normalizeVietnameseText = (text: string): string => {
  return text.normalize("NFC");
};

export const driverSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .max(25, "Họ tên không được vượt quá 25 ký tự")
      .transform(normalizeVietnameseText),
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    dateOfBirth: z
      .date()
      .nullable()
      .refine((date) => !date || date < dayjs().subtract(18, "year").toDate(), {
        message: "Tài xế phải từ 18 tuổi trở lên",
      }),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    phoneNumber: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(/^0\d{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng số 0"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không trùng khớp",
    path: ["confirmPassword"],
  });

export type DriverFormValues = z.infer<typeof driverSchema>;

export const formatDriverFormForApi = (data: DriverFormValues) => {
  const formattedData: Record<string, any> = {
    fullName: normalizeVietnameseText(data.fullName),
    email: data.email,
    password: data.password,
    phoneNumber: data.phoneNumber,
  };

  if (data.dateOfBirth) {
    formattedData.dateOfBirth = dayjs(data.dateOfBirth).format("YYYY-MM-DD");
  }

  return formattedData;
};

export const handleServerValidationErrors = (
  errors: Record<string, any>,
  setError: (
    field: keyof DriverFormValues,
    error: { type: string; message: string }
  ) => void
) => {
  Object.entries(errors).forEach(([key, value]) => {
    // Convert backend field name to frontend field name (e.g., FullName -> fullName)
    const fieldName = (key.charAt(0).toLowerCase() +
      key.slice(1)) as keyof DriverFormValues;
    if (typeof value === "string") {
      setError(fieldName, { type: "server", message: value });
    } else if (Array.isArray(value) && value.length > 0) {
      setError(fieldName, { type: "server", message: value[0] });
    }
  });
};
