import { ApiResponse } from "../types/api-types";
import axiosInstance from "../utils/axiosConfig";

export interface IncidentReportFile {
  fileId: string;
  reportId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploadBy: string;
  description: string | null;
  note: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
  fileUrl: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  type: number;
  report: any | null;
}

export interface TripDriver {
  driverId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: number;
  // Other properties can be added as needed
}

export interface Trip {
  tripId: string;
  orderId: string;
  driverId: string;
  tractorId: string;
  trailerId: string;
  startTime: string;
  endTime: string;
  status: string;
  driver: TripDriver;
  // Other properties can be added as needed
}

export interface IncidentReports {
  reportId: string;
  tripId: string;
  trackingCode: string;
  orderId: string;
  reportedBy: string;
  incidentType: string;
  description: string;
  incidentTime: string;
  location: string;
  type: number;
  vehicleType: number;
  status: string;
  resolutionDetails: string | null;
  handledBy: string | null;
  handledTime: string | null;
  createdDate: string;
  incidentReportsFiles: IncidentReportFile[];
  trip: Trip;
}

interface IncidentReportsResponse extends ApiResponse {
  data: IncidentReports[];
}

// Function to get all incident reports
export const getAllIncidentReports = async (): Promise<IncidentReports[]> => {
  try {
    const response = await axiosInstance.get<IncidentReportsResponse>(
      "/api/IncidentReport"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching incident reports:", error);
    throw error;
  }
};

// Function to get a specific incident report by ID
export const getIncidentReportById = async (
  reportId: string
): Promise<IncidentReports> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(
      `/api/IncidentReport?ReportId=${reportId}`
    );

    // Check if the response data is in expected format
    if (
      response.data.status === 1 &&
      response.data.data &&
      Array.isArray(response.data.data) &&
      response.data.data.length > 0
    ) {
      return response.data.data[0] as IncidentReports;
    } else {
      throw new Error("Invalid data format returned from API");
    }
  } catch (error) {
    console.error(`Error fetching incident report with ID ${reportId}:`, error);
    throw error;
  }
};
