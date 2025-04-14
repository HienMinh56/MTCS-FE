export interface AdminRevenueAnalytics {
  totalRevenue: number;
  completedOrders: number;
  averageRevenuePerOrder: number;
  period: string;
}

export interface AdminCustomerRevenue {
  customerId: string;
  companyName: string;
  totalRevenue: number;
  completedOrders: number;
  averageRevenuePerOrder: number;
}

export interface AdminTripFinancial {
  tripId: string;
  orderId: string;
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
}

export enum AdminRevenuePeriodType {
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
  Custom = "Custom",
}
