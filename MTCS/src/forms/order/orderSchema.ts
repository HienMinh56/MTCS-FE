import { z } from "zod";
import { ContainerType, ContainerSize, DeliveryType } from "../../types/order";
import dayjs from "dayjs";

// Container number validation pattern:
// - First 3 characters: company code (letters)
// - 4th character: U, J or Z (indicator of container type)
// - Next 6 characters: serial number (digits)
// - Last 1 character: check digit (digit)
const containerNumberPattern = /^[A-Z]{3}[URJZ]\d{6}\d{1}$/;

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

const currentYear = dayjs().year();

function isValidDateObject(val: Date) {
  if (!(val instanceof Date) || isNaN(val.getTime())) return false;
  const year = val.getFullYear();
  const month = val.getMonth() + 1; // getMonth() trả về 0-11
  const day = val.getDate();

  if (year !== currentYear) return false;
  if (month < 1 || month > 12) return false;

  // Kiểm tra số ngày hợp lệ theo tháng
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) return false;

  return true;
}

export const orderSchema = z.object({
  companyName: z.string().min(1, 'Tên công ty là bắt buộc'),
  temperature: z.number()
    .min(-30, 'Nhiệt độ không được thấp hơn -30°C')
    .max(10, 'Nhiệt độ không được cao hơn 40°C'),
  weight: z.coerce.number({ invalid_type_error: 'Trọng lượng phải là một số' })
    .min(0.1, 'Trọng lượng phải lớn hơn 0 tấn')
    .max(100, 'Trọng lượng không được vượt quá 100 tấn'),
  pickUpDate: z.any().superRefine((val, ctx) => {
  if (val === null || val === undefined || val === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày lấy hàng là bắt buộc",
    });
    return;
  }
  if (!(val instanceof Date) || isNaN(val.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày lấy hàng không hợp lệ",
    });
    return;
  }
  if (!isValidDateObject(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Ngày lấy hàng phải hợp lệ và năm phải là ${currentYear}`,
    });
  }
}),
deliveryDate: z.any().superRefine((val, ctx) => {
  if (val === null || val === undefined || val === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày giao hàng là bắt buộc",
    });
    return;
  }
  if (!(val instanceof Date) || isNaN(val.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày giao hàng không hợp lệ",
    });
    return;
  }
  if (!isValidDateObject(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Ngày giao hàng phải hợp lệ và năm phải là ${currentYear}`,
    });
  }
}),
  note: z.string()
    .min(1, 'Ghi chú là bắt buộc')
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Ghi chú không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Ghi chú không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
  containerType: z.nativeEnum(ContainerType),
  containerSize: z.nativeEnum(ContainerSize),
  deliveryType: z.nativeEnum(DeliveryType),
  pickUpLocation: z.string()
    .min(1, 'Địa điểm lấy hàng là bắt buộc')
    .max(200, 'Địa điểm lấy hàng không được vượt quá 200 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Địa điểm lấy hàng không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Địa điểm lấy hàng không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
  deliveryLocation: z.string()
    .min(1, 'Địa điểm giao hàng là bắt buộc')
    .max(200, 'Địa điểm giao hàng không được vượt quá 200 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Địa điểm giao hàng không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Địa điểm giao hàng không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
  conReturnLocation: z.string()
    .min(1, 'Địa điểm trả container là bắt buộc')
    .max(200, 'Địa điểm trả container không được vượt quá 200 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Địa điểm trả container không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Địa điểm trả container không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
  price: z.coerce.number({ invalid_type_error: 'Giá phải là một số' })
    .min(1000, 'Giá tối thiểu phải là 1,000 VNĐ')
    .max(1000000000, 'Giá không được vượt quá 1 tỷ VNĐ'),
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
  distance: z.coerce.number({ invalid_type_error: 'Khoảng cách phải là một số' })
    .min(1, 'Khoảng cách tối thiểu 1 KM')
    .max(300, 'Khoảng tối đa 300 KM'),
  containerNumber: z.string()
    .min(1, 'Số container là bắt buộc')
    .max(20, 'Số container không được vượt quá 20 ký tự')
    .regex(containerNumberPattern, 'Số container phải có định dạng XXX-U-YYYYYY-Z, trong đó XXX là mã công ty, U là ký hiệu loại hàng hóa, YYYYYY là mã số container, Z là số kiểm tra'),
  completeTime: z.string({ required_error: 'Thời gian ước tính hoàn thành là bắt buộc' })
    .min(1, 'Thời gian ước tính hoàn thành vận chuyển là bắt buộc')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng thời gian phải là HH:MM (giờ:phút)')
    .refine(val => {
      const [hours, minutes] = val.split(':').map(Number);
      return hours > 0 || minutes >= 1; // Thời gian phải lớn hơn hoặc bằng 1 phút
    }, { message: 'Thời gian ước tính phải lớn hơn hoặc bằng 1 phút' }),
  orderPlacer: z.string()
    .min(1, 'Người đặt hàng là bắt buộc')
    .max(50, 'Người đặt hàng không được vượt quá 50 ký tự')
    .refine(val => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Người đặt hàng không được bắt đầu hoặc kết thúc bằng dấu cách',
    })
    .refine(val => !/\s{2,}/.test(val), {
      message: 'Người đặt hàng không được chứa nhiều hơn một dấu cách giữa các từ',
    }),
}).refine(data => {
  // Validate that deliveryDate is after pickUpDate
  if (data.pickUpDate && data.deliveryDate) {
    const pickUp = dayjs(data.pickUpDate);
    const delivery = dayjs(data.deliveryDate);
    return delivery.isAfter(pickUp) || delivery.isSame(pickUp);
  }
  return true; // Skip validation if either date is null
}, {
  message: 'Ngày giao hàng phải sau ngày lấy hàng',
  path: ['deliveryDate'], // This will show the error on the deliveryDate field
}).refine(data => {
  // Make temperature required when containerType is Container Lạnh
  if (data.containerType === ContainerType["Container Lạnh"]) {
    return data.temperature !== undefined;
  }
  return true; // Skip validation for other container types
}, {
  message: 'Nhiệt độ là bắt buộc đối với Container Lạnh',
  path: ['temperature'], // This will show the error on the temperature field
});

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
        ? data.temperature ?? 0
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
  temperature: 0,
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
  contactPerson: '',  contactPhone: '',
  distance: null,
  containerNumber: '',
  completeTime: null, // Empty string instead of null
  orderPlacer: '',
  files: [],
  fileDescriptions: [],
  fileNotes: [],
};
