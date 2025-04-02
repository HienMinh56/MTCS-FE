import { ContractFile } from "../types/contract";
import axiosInstance from "../utils/axiosConfig";

// Updated Contract interface to match API response
interface Contract {
  contractId: string;
  customerId: string;
  orderId?: string;
  startDate: string;
  endDate: string;
  status: number;
  createdDate: string;
  createdBy: string;
  summary: string;
  signedTime: string;
  signedBy: string;
  contractFiles: ContractFile[]; // This is the primary property based on API response
  customer: any;
}

export const getContracts = async (
  page: number,
  pageSize: number,
  customerId?: string
) => {
  const params = new URLSearchParams();

  params.append("pageNumber", page.toString());
  params.append("pageSize", pageSize.toString());

  if (customerId) {
    params.append("customerId", customerId);
  }

  try {
    const response = await axiosInstance.get<{
      status: number;
      message: string;
      data: Contract[];
    }>(`api/contract`, { params });
    return response.data.data; // Extract the actual contracts array from the response
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};

export const getContractFiles = async (contractId: string) => {
  const response = await axiosInstance.get<ContractFile>(
    `/api/contract/${contractId}/contract-file`
  );
  return response.data;
};

export const createContract = async (formData: FormData) => {
  // Enhanced logging to help debug the API request
  console.log("===== CONTRACT API REQUEST DATA =====");
  console.log("FormData keys:", [...formData.keys()]);

  // Check required fields
  console.log("Has signedTime:", formData.has("signedTime"));
  console.log("Has startDate:", formData.has("startDate"));
  console.log("Has endDate:", formData.has("endDate"));
  console.log("Has customerId:", formData.has("customerId"));
  console.log("SignedTime value:", formData.get("signedTime"));

  // Make the API call with the FormData
  const response = await axiosInstance.post("/api/contract", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
