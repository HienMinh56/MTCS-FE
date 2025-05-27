import { z } from "zod";

export const orderSchema = z.object({
  companyName: z.string().min(1, 'Tên công ty là bắt buộc'),
  note: z.string()
    .min(1, 'Ghi chú là bắt buộc')
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Ghi chú không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Ghi chú không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
  totalAmount: z.coerce.number({ invalid_type_error: 'Tổng giá phải là một số' })
    .min(1000, 'Tổng giá tối thiểu phải là 1,000 VNĐ')
    .max(1000000000, 'Tổng giá không được vượt quá 1 tỷ VNĐ'),
  contactPerson: z.string()
    .min(1, 'Tên người liên hệ là bắt buộc')
    .max(50, 'Tên người liên hệ không được vượt quá 50 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Tên người liên hệ không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Tên người liên hệ không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
  contactPhone: z.string()
      .length(10, "Số điện thoại phải có đúng 10 số")
      .regex(/^\d+$/, "Số điện thoại chỉ được chứa các chữ số"),
  orderPlacer: z.string()
    .min(1, 'Người đặt hàng là bắt buộc')
    .max(50, 'Người đặt hàng không được vượt quá 50 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Người đặt hàng không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Người đặt hàng không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
});

// Cập nhật kiểu dữ liệu từ schema
export type OrderFormValues = z.infer<typeof orderSchema>;

export const formatOrderFormForApi = (data: OrderFormValues) => {
  return {
    companyName: data.companyName,
    note: data.note || "",
    totalAmount: data.totalAmount,
    contactPerson: data.contactPerson,
    contactPhone: data.contactPhone,
    orderPlacer: data.orderPlacer,
  };
};

export const defaultValues: OrderFormValues = {
  companyName: "",
  note: "",
  totalAmount: 0,
  contactPerson: '',
  contactPhone: '',
  orderPlacer: '',
};