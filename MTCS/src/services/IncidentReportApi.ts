import axios from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "../types/api-types";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  createdDate: string; // Changed from createdTime to match API
  incidentReportsFiles: {
    $values: IncidentReportFile[];
  };
}

interface IncidentReportsResponse extends ApiResponse {
  data: {
    $id: string;
    $values: IncidentReports[];
  }
}

// Function to get all incident reports
export const getAllIncidentReports = async (): Promise<IncidentReports[]> => {
  try {
    const response = await api.get<IncidentReportsResponse>('/IncidentReport');
    return response.data.data.$values;
  } catch (error) {
    console.error('Error fetching incident reports:', error);
    throw error;
  }
};

// Function to get a specific incident report by ID
export const getIncidentReportById = async (reportId: string): Promise<IncidentReports> => {
  try {
    const response = await api.get<ApiResponse>(`/IncidentReport/report/${reportId}`);
    return response.data.data as IncidentReports;
  } catch (error) {
    console.error(`Error fetching incident report with ID ${reportId}:`, error);
    throw error;
  }
};

