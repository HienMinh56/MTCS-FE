import { z } from "zod";
import { ContainerType, DeliveryType } from "../../types/order";

// Zod schema matching BE validation
export const orderSchema = z
  .object({
    companyName: z
      .string()
      .min(1, "Tên công ty là bắt buộc")
      .max(100, "Tên công ty không được vượt quá 100 ký tự")
      .nonempty("Tên công ty là bắt buộc"),
    temperature: z
      .number()
      .min(-30, "Nhiệt độ không được thấp hơn -30°C")
      .max(40, "Nhiệt độ không được cao hơn 40°C")
      .optional(),
    weight: z
      .number()
      .min(0.1, "Trọng lượng phải lớn hơn 0")
      .max(100, "Trọng lượng không được vượt quá 100 tấn"),
    pickUpDate: z.date().refine((date) => date >= new Date(), {
      message: "Ngày lấy hàng phải trong tương lai",
    }),
    deliveryDate: z.date().refine((date) => date >= new Date(), {
      message: "Ngày giao hàng phải trong tương lai",
    }),
    note: z
      .string()
      .min(1, "Ghi chú là bắt buộc")
      .max(500, "Ghi chú không được vượt quá 500 ký tự")
      .nonempty("Ghi chú là bắt buộc"),
    containerType: z.nativeEnum(ContainerType),
    deliveryType: z.nativeEnum(DeliveryType),
    pickUpLocation: z
      .string()
      .min(1, "Địa điểm lấy hàng là bắt buộc")
      .max(200, "Địa điểm lấy hàng không được vượt quá 200 ký tự")
      .nonempty("Địa điểm lấy hàng là bắt buộc"),
    deliveryLocation: z
      .string()
      .min(1, "Địa điểm giao hàng là bắt buộc")
      .max(200, "Địa điểm giao hàng không được vượt quá 200 ký tự")
      .nonempty("Địa điểm giao hàng là bắt buộc"),
    conReturnLocation: z
      .string()
      .min(1, "Địa điểm trả container là bắt buộc")
      .max(200, "Địa điểm trả container không được vượt quá 200 ký tự")
      .nonempty("Địa điểm trả container là bắt buộc"),
    price: z
      .number()
      .min(0, "Giá không được âm")
      .max(1000000000, "Giá không được vượt quá 1 tỷ VND"),
    contactPerson: z
      .string()
      .min(1, "Tên người liên hệ là bắt buộc")
      .max(50, "Tên người liên hệ không được vượt quá 50 ký tự")
      .nonempty("Tên người liên hệ là bắt buộc"),
    contactPhone: z
      .string()
      .min(10, "Số điện thoại phải có ít nhất 10 số")
      .max(15, "Số điện thoại không được vượt quá 15 số")
      .refine((value) => /^\d+$/.test(value), {
        message: "Số điện thoại chỉ được chứa các chữ số",
      }),
    distance: z.number().nullable(),
    orderPlacer: z
      .string()
      .min(1, "Tên người đặt hàng là bắt buộc")
      .max(50, "Tên người đặt hàng không được vượt quá 50 ký tự")
      .nonempty("Tên người đặt hàng là bắt buộc"),
    containerNumber: z
      .string()
      .min(1, "Số container là bắt buộc")
      .max(20, "Số container không được vượt quá 20 ký tự")
      .nonempty("Số container là bắt buộc"),
    description: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      return data.deliveryDate > data.pickUpDate;
    },
    {
      message: "Ngày giao hàng phải sau ngày lấy hàng",
      path: ["deliveryDate"],
    }
  );

export type OrderFormValues = z.infer<typeof orderSchema>;

// Add more detailed logging to see exactly what's being submitted

export const formatOrderFormForApi = (data: OrderFormValues) => {
  const formattedData = {
    ...data,
    pickUpDate: data.pickUpDate.toISOString().split("T")[0],
    deliveryDate: data.deliveryDate.toISOString().split("T")[0],
    description: data.description || [],
    notes: data.notes || [],
  };
  
  console.log('Field by field validation check:');
  console.log('companyName:', formattedData.companyName ? '✓' : '✗');
  console.log('temperature:', formattedData.temperature !== undefined ? '✓' : '✗');
  console.log('weight:', formattedData.weight ? '✓' : '✗');
  console.log('pickUpDate:', formattedData.pickUpDate ? '✓' : '✗');
  console.log('deliveryDate:', formattedData.deliveryDate ? '✓' : '✗');
  console.log('note:', formattedData.note ? '✓' : '✗');
  console.log('containerType:', formattedData.containerType ? '✓' : '✗');
  console.log('deliveryType:', formattedData.deliveryType ? '✓' : '✗');
  console.log('pickUpLocation:', formattedData.pickUpLocation ? '✓' : '✗');
  console.log('deliveryLocation:', formattedData.deliveryLocation ? '✓' : '✗');
  console.log('conReturnLocation:', formattedData.conReturnLocation ? '✓' : '✗');
  console.log('price:', formattedData.price ? '✓' : '✗');
  console.log('contactPerson:', formattedData.contactPerson ? '✓' : '✗');
  console.log('contactPhone:', formattedData.contactPhone ? '✓' : '✗');
  console.log('distance:', formattedData.distance !== null ? '✓' : '✗');
  console.log('orderPlacer:', formattedData.orderPlacer ? '✓' : '✗');
  console.log('containerNumber:', formattedData.containerNumber ? '✓' : '✗');
  
  return formattedData;
};

export const handleServerValidationErrors = (
  errors: Record<string, any>,
  setError: (
    field: keyof OrderFormValues,
    error: { type: string; message: string }
  ) => void
) => {
  Object.entries(errors).forEach(([key, value]) => {
    // Convert backend field name to frontend field name (e.g., CompanyName -> companyName)
    const fieldName = (key.charAt(0).toLowerCase() +
      key.slice(1)) as keyof OrderFormValues;
    if (typeof value === "string") {
      setError(fieldName, { type: "server", message: value });
    } else if (Array.isArray(value) && value.length > 0) {
      setError(fieldName, { type: "server", message: value[0] });
    }
  });
};
