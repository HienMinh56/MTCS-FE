import { z } from "zod";

export const profileSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Họ và tên không được để trống")
      .max(25, "Họ và tên không được vượt quá 25 ký tự"),
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    phoneNumber: z
      .string()
      .regex(/^0\d{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng số 0"),
    gender: z.string().optional(),
    birthday: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true; // Optional field

        // Validate date format first
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateFormatRegex.test(value)) {
          return false;
        }

        const [year, month, day] = value.split("-").map(Number);

        if (year < 1900 || year > new Date().getFullYear()) {
          return false;
        }

        const birthDate = new Date(year, month - 1, day);
        if (
          birthDate.getFullYear() !== year ||
          birthDate.getMonth() !== month - 1 ||
          birthDate.getDate() !== day
        ) {
          return false;
        }

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 18;
      }, "Người dùng phải đủ 18 tuổi trở lên và ngày sinh phải hợp lệ"),
    currentPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      return true;
    },
    {
      message: "Mật khẩu hiện tại là bắt buộc khi thay đổi email",
      path: ["currentPassword"],
    }
  );

export type ProfileFormValues = z.infer<typeof profileSchema>;
