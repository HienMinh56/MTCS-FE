import { z } from "zod";
import { ContainerType, ContainerSize, DeliveryType } from "../../types/order";
import dayjs from "dayjs";

// Container number validation pattern:
// - First 3 characters: company code (letters)
// - 4th character: U, J or Z (indicator of container type)
// - Next 6 characters: serial number (digits)
// - Last 1 character: check digit (digit)
const containerNumberPattern = /^[A-Z]{3}[UJZ]\d{6}\d{1}$/;

// Custom string validator for no leading/trailing spaces and no consecutive spaces
const validateStringFormat = (errorMessage: string) => {
  return (val: string) => {
    if (/^\s/.test(val) || /\s$/.test(val)) {
      return {
        message: `${errorMessage} không được bắt đầu hoặc kết thúc bằng dấu cách`,
      };
    }
    if (/\s{2,}/.test(val)) {
      return {
        message: `${errorMessage} không được chứa nhiều hơn một dấu cách giữa các từ`,
      };
    }
    return { message: "" };
  };
};

export const orderSchema = z
  .object({
    companyName: z.string().min(1, "Tên công ty là bắt buộc"),
    temperature: z
      .number()
      .min(-30, "Nhiệt độ không được thấp hơn -30°C")
      .max(40, "Nhiệt độ không được cao hơn 40°C")
      .nullable(),
    weight: z
      .number()
      .min(0.1, "Trọng lượng phải lớn hơn 0 tấn")
      .max(100, "Trọng lượng không được vượt quá 100 tấn"),
    pickUpDate: z.date().or(z.string()).nullable(),
    deliveryDate: z.date().or(z.string()).nullable(),
    note: z
      .string()
      .min(1, "Ghi chú là bắt buộc")
      .max(500, "Ghi chú không được vượt quá 500 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message: "Ghi chú không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message: "Ghi chú không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
    containerType: z.nativeEnum(ContainerType),
    containerSize: z.nativeEnum(ContainerSize),
    deliveryType: z.nativeEnum(DeliveryType),
    pickUpLocation: z
      .string()
      .min(1, "Địa điểm lấy hàng là bắt buộc")
      .max(200, "Địa điểm lấy hàng không được vượt quá 200 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Địa điểm lấy hàng không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message:
          "Địa điểm lấy hàng không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
    deliveryLocation: z
      .string()
      .min(1, "Địa điểm giao hàng là bắt buộc")
      .max(200, "Địa điểm giao hàng không được vượt quá 200 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Địa điểm giao hàng không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message:
          "Địa điểm giao hàng không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
    conReturnLocation: z
      .string()
      .min(1, "Địa điểm trả container là bắt buộc")
      .max(200, "Địa điểm trả container không được vượt quá 200 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Địa điểm trả container không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message:
          "Địa điểm trả container không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
    price: z
      .number()
      .min(1000, "Giá tối thiểu phải là 1,000 VNĐ")
      .max(1000000000, "Giá không được vượt quá 1 tỷ VNĐ"),
    contactPerson: z
      .string()
      .min(1, "Tên người liên hệ là bắt buộc")
      .max(50, "Tên người liên hệ không được vượt quá 50 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Tên người liên hệ không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message:
          "Tên người liên hệ không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
    contactPhone: z
      .string()
      .length(10, "Số điện thoại phải có đúng 10 số")
      .regex(/^\d+$/, "Số điện thoại chỉ được chứa các chữ số"),
    distance: z.number().nullable(),
    containerNumber: z
      .string()
      .min(1, "Số container là bắt buộc")
      .max(20, "Số container không được vượt quá 20 ký tự")
      .regex(
        containerNumberPattern,
        "Số container phải có định dạng XXX-U-YYYYYY-Z, trong đó XXX là mã công ty, U là ký hiệu loại hàng hóa, YYYYYY là mã số container, Z là số kiểm tra"
      ),
    completeTime: z
      .string()
      .min(1, "Thời gian ước tính hoàn thành vận chuyển là bắt buộc")
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Định dạng thời gian phải là HH:MM (giờ:phút"
      ),
    orderPlacer: z
      .string()
      .min(1, "Người đặt hàng là bắt buộc")
      .max(50, "Người đặt hàng không được vượt quá 50 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Người đặt hàng không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message:
          "Người đặt hàng không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
  })
  .refine(
    (data) => {
      // Validate that deliveryDate is after pickUpDate
      if (data.pickUpDate && data.deliveryDate) {
        const pickUp = dayjs(data.pickUpDate);
        const delivery = dayjs(data.deliveryDate);
        return delivery.isAfter(pickUp) || delivery.isSame(pickUp);
      }
      return true; // Skip validation if either date is null
    },
    {
      message: "Ngày giao hàng phải sau ngày lấy hàng",
      path: ["deliveryDate"], // This will show the error on the deliveryDate field
    }
  );

// Cập nhật kiểu dữ liệu từ schema
export type OrderFormValues = z.infer<typeof orderSchema> & {
  files?: File[];
  fileDescriptions?: string[];
  fileNotes?: string[];
};

export const formatOrderFormForApi = (data: OrderFormValues) => {
  return {
    companyName: data.companyName,
    temperature:
      data.containerType === ContainerType["Container Lạnh"]
        ? data.temperature
        : null,
    weight: data.weight,
    pickUpDate: data.pickUpDate
      ? dayjs(data.pickUpDate).format("YYYY-MM-DD")
      : "",
    deliveryDate: data.deliveryDate
      ? dayjs(data.deliveryDate).format("YYYY-MM-DD")
      : "",
    note: data.note || "",
    containerType: data.containerType,
    containerSize: data.containerSize,
    deliveryType: data.deliveryType,
    pickUpLocation: data.pickUpLocation,
    deliveryLocation: data.deliveryLocation,
    conReturnLocation: data.conReturnLocation,
    price: data.price,
    contactPerson: data.contactPerson,
    contactPhone: data.contactPhone,
    distance: data.distance,
    containerNumber: data.containerNumber,
    completeTime: data.completeTime, // Pass time as HH:MM string
    orderPlacer: data.orderPlacer,
  };
};

export const defaultValues: OrderFormValues = {
  companyName: "",
  temperature: null,
  weight: 0,
  pickUpDate: null,
  deliveryDate: null,
  note: "",
  containerType: ContainerType["Container Khô"],
  containerSize: ContainerSize["Container 20 FEET"],
  deliveryType: DeliveryType.Export,
  pickUpLocation: "",
  deliveryLocation: "",
  conReturnLocation: "",
  price: 0,
  contactPerson: "",
  contactPhone: "",
  distance: null,
  containerNumber: "",
  completeTime: null, // Default to null
  orderPlacer: "",
  files: [],
  fileDescriptions: [],
  fileNotes: [],
};
