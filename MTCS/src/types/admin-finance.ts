export interface OrderSummary {
  orderId: string;
  trackingCode: string;
  customerId: string;
  companyName: string;
  deliveryDate?: string;
  price?: number;
  status: string;
  createdDate?: string;
}

export interface PeriodicRevenueItem {
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  completedOrders: number;
  averageRevenuePerOrder: number;
  paidRevenue: number;
  unpaidRevenue: number;
  paidOrders: number;
  unpaidOrders: number;
}

export interface AdminRevenueAnalytics {
  totalRevenue: number;
  completedOrders: number;
  averageRevenuePerOrder: number;
  period: string;
  paidRevenue: number;
  unpaidRevenue: number;
  paidOrders: number;
  unpaidOrders: number;
  paidOrdersList?: OrderSummary[];
  unpaidOrdersList?: OrderSummary[];
  periodicData?: PeriodicRevenueItem[];
}

export interface AdminCustomerRevenue {
  customerId: string;
  companyName: string;
  totalRevenue: number;
  completedOrders: number;
  averageRevenuePerOrder: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PagedCustomerRevenue {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: AdminCustomerRevenue[];
}

export interface AdminTripFinancial {
  tripId: string;
  orderId: string;
  trackingCode: string;
  customerName: string;
  revenue: number;
  fuelCost: number;
  profitMargin: number;
  profitMarginPercentage: number;

  // Additional frontend-only properties
  id?: string;
  tripCode?: string;
  completionDate?: string;
  profit?: number;
}

export interface AdminProfitAnalytics {
  totalRevenue: number;
  totalFuelCost: number;
  netProfit: number;
  profitMarginPercentage: number;
  period: string;
  totalOrders: number;
}

export enum AdminRevenuePeriodType {
  Monthly = "Monthly",
  Yearly = "Yearly",
  Custom = "Custom",
}

export interface DriverTripDTO {
  driverId: string;
  driverName: string;
  completedTrips: number;
  totalDistance: number;
  onTimeDeliveries: number;
  onTimePercentage: number;
  incidentsCount: number;
  incidentRate: number;
}

export interface DriverHoursDTO {
  driverId: string;
  driverName: string;
  totalHours: number;
  daysWorked: number;
  dailyAverageHours: number;
}

export interface TripPerformanceDTO {
  period: string;

  // Volume metrics
  totalTrips: number;

  // Revenue metrics
  totalRevenue: number;
  averageRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  paidOrders: number;
  unpaidOrders: number;

  // Distance metrics
  totalDistance: number;
  averageDistance: number;

  // Fuel metrics
  totalFuelCost: number;
  averageFuelCost: number;
  fuelCostPerDistance: number;

  // Performance metrics
  incidentRate: number;
  onTimeDeliveryRate: number;

  // Driver metrics
  driversWithMostTrips: DriverTripDTO[];
  driversWithMostHours: DriverHoursDTO[];
}
