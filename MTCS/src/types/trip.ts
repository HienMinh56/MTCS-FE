export enum matchBy {
  System = 1,
  Staff = 2,
}

export interface tripRelace {
  tripId: string;
  driverId: string | null;
  tractorId: string | null;
  trailerId: string | null;
}

export interface tripStatusHistory {
  historyId: string | null;
  tripId: string | null;
  statusId: string | null;
  startTime: string | null;
}

export interface incidentReports {
  reportId: string;
  tripId: string;
  reportedBy: string | null;
  incidentType: string | null;
  description: string | null;
  incidentTime: string | null;
  location: string | null;
  type: number | null;
  status: string | null;
  resolutionDetails: string | null;
  handledBy: string | null;
  handledTime: string | null;
  createdDate: string | null;
}

export interface trip {
  tripId: string | null;
  orderId: string | null;
  containerNumber: string;
  driverId: string | null;
  tractorId: string | null;
  trailerId: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string | null;
  matchType: string | null;
  matchBy: matchBy | null;
  matchTime: string | null;
  deliveryReports: null;
  fuelReports: null;
  incidentReports: incidentReports[] | null;
  inspectionLogs: null;
  tripStatusHistories: tripStatusHistory[] | null;
}

export interface TripTimeTableItem {
  tripId: string;
  trackingCode: string;
  pickUpLocation: string;
  deliveryLocation: string;
  deliveryDate: string;
  conReturnLocation: string;
  orderDetailId: string;
  driverId: string;
  driverName: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
}

export interface TripTimeTableResponse {
  success: boolean;
  data: {
    trips: TripTimeTableItem[];
    totalCount: number;
    completedCount: number;
    deliveringCount: number;
    delayingCount: number;
    canceledCount: number;
    notStartedCount: number;
  };
  message: string;
  messageVN: string;
  errors: null | any;
}

// export interface fuelReports {
//   reportId: string,
//   tripId: string,
//   refuelAmount: number,
//   fuelCost": 1000000,
//           "location": "101 Đường Hàng Tre, Hồ Chí Minh",
//           "reportTime": "2025-04-11T01:54:36.57",
//           "reportBy": "Nguyễn Đức Linh",
//           "licensePlate": null,
//           "fuelReportFiles": [],
//           "trip": null
// }
