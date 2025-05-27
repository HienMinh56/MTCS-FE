export enum matchBy {
  System = 1,
  Staff = 2
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