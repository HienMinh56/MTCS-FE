import { z } from 'zod';
import { ContainerType, ContainerSize, DeliveryType } from '../../types/order';
import dayjs from 'dayjs';

// Container number validation pattern:
// - First 3 characters: company code (letters)
// - 4th character: U (fixed)
// - Next 5 characters: container number (digits)
// - Last 1 character: check digit (digit)
const containerNumberPattern = /^[A-Z]{3}U\d{5}\d{1}$/;

export const orderSchema = z.object({
  companyName: z.string().min(1, 'Tên công ty là bắt buộc'),
  temperature: z.number()
    .min(-30, 'Nhiệt độ không được thấp hơn -30°C')
    .max(40, 'Nhiệt độ không được cao hơn 40°C')
    .nullable(),
  weight: z.number()
    .min(0.1, 'Trọng lượng phải lớn hơn 0')
    .max(100, 'Trọng lượng không được vượt quá 100 tấn'),
  pickUpDate: z.date().or(z.string()).nullable(),
  deliveryDate: z.date().or(z.string()).nullable(),
  completeTime: z.string().nullable(), // Giữ nguyên format HH:MM
  note: z.string()
    .min(1, 'Ghi chú là bắt buộc')
    .max(500, 'Ghi chú không được vượt quá 500 ký tự'),
  containerType: z.nativeEnum(ContainerType),
  containerSize: z.nativeEnum(ContainerSize),
  deliveryType: z.nativeEnum(DeliveryType),
  pickUpLocation: z.string()
    .min(1, 'Địa điểm lấy hàng là bắt buộc')
    .max(200, 'Địa điểm lấy hàng không được vượt quá 200 ký tự'),
  deliveryLocation: z.string()
    .min(1, 'Địa điểm giao hàng là bắt buộc')
    .max(200, 'Địa điểm giao hàng không được vượt quá 200 ký tự'),
  conReturnLocation: z.string()
    .min(1, 'Địa điểm trả container là bắt buộc')
    .max(200, 'Địa điểm trả container không được vượt quá 200 ký tự'),
  price: z.number()
    .min(0, 'Giá không được âm')
    .max(1000000000, 'Giá không được vượt quá 1 tỷ VND'),
  contactPerson: z.string()
    .min(1, 'Tên người liên hệ là bắt buộc')
    .max(50, 'Tên người liên hệ không được vượt quá 50 ký tự'),
  contactPhone: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được vượt quá 15 số')
    .regex(/^\d+$/, 'Số điện thoại chỉ được chứa các chữ số'),
  distance: z.number().nullable(),
  containerNumber: z.string()
    .min(1, 'Số container là bắt buộc')
    .max(20, 'Số container không được vượt quá 20 ký tự')
    .regex(containerNumberPattern, 'Số container phải có định dạng XXX-U-YYYYY-Z, trong đó XXX là mã công ty, U là ký hiệu cố định, YYYYY là mã số container, Z là số kiểm tra'),
  orderPlacer: z.string()
    .min(1, 'Người đặt hàng là bắt buộc')
    .max(50, 'Người đặt hàng không được vượt quá 50 ký tự'),
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
    temperature: data.containerType === ContainerType["Container Lạnh"] ? data.temperature : null,
    weight: data.weight,
    pickUpDate: data.pickUpDate ? dayjs(data.pickUpDate).format('YYYY-MM-DD') : '',
    deliveryDate: data.deliveryDate ? dayjs(data.deliveryDate).format('YYYY-MM-DD') : '',
    note: data.note || '',
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
    completeTime: data.completeTime || null, // Pass time as HH:MM string
    orderPlacer: data.orderPlacer,
  };
};

export const defaultValues: OrderFormValues = {
  companyName: '',
  temperature: null,
  weight: 0,
  pickUpDate: null,
  deliveryDate: null,
  note: '',
  containerType: ContainerType["Container Khô"],
  containerSize: ContainerSize["Container 20 FEET"],
  deliveryType: DeliveryType.Export,
  pickUpLocation: '',
  deliveryLocation: '',
  conReturnLocation: '',
  price: 0,
  contactPerson: '',
  contactPhone: '',
  distance: null,
  containerNumber: '',
  completeTime: null, // Default to null
  orderPlacer: '',
  files: [],
  fileDescriptions: [],
  fileNotes: [],
};
