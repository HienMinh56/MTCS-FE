import { ApiResponse } from "../types/api-types";
import axiosInstance from "../utils/axiosConfig";

export interface IncidentReportFile {
  fileId: string;
  fileUrl: string;
  type: number;
}

export interface IncidentReports {
  reportId: string;
  tripId: string;
  reportedBy: string;
  incidentType: string;
  description: string;
  incidentTime: string;
  location: string;
  type: number;
  status: string;
  resolutionDetails: string | null;
  handledBy: string | null;
  handledTime: string | null;
  createdDate: string;
  incidentReportsFiles: {
    $values: IncidentReportFile[];
  };
}

interface IncidentReportsResponse extends ApiResponse {
  data: {
    $id: string;
    $values: IncidentReports[];
  };
}

// Function to get all incident reports
export const getAllIncidentReports = async (): Promise<IncidentReports[]> => {
  try {
    const response = await axiosInstance.get<IncidentReportsResponse>(
      "/api/IncidentReport"
    );
    return response.data.data.$values;
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
      `/api/IncidentReport/report/${reportId}`
    );
    return response.data.data as IncidentReports;
  } catch (error) {
    console.error(`Error fetching incident report with ID ${reportId}:`, error);
    throw error;
  }
};
