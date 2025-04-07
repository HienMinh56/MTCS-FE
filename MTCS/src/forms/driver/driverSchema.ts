import { z } from "zod";
import dayjs from "dayjs";

// Zod schema matching BE validation
export const driverSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Họ tên là bắt buộc")
      .max(25, "Họ tên không được vượt quá 25 ký tự"),
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
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
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .min(1, "Số điện thoại là bắt buộc")
      .regex(/^0\d{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng số 0"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type DriverFormValues = z.infer<typeof driverSchema>;

export const formatDriverFormForApi = (data: DriverFormValues) => {
  const formattedData: Record<string, any> = {
    fullName: data.fullName,
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
