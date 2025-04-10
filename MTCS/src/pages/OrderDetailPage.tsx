import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsIcon from '@mui/icons-material/Directions';
import {
  OrderDetails,
  ContainerType,
  ContainerSize,
  DeliveryType,
  OrderStatus,
  IsPay,
  OrderFile,
} from "../types/order";
import { getOrderDetails, updateOrder } from "../services/orderApi";
import { getContracts, createContract } from "../services/contractApi";
import { getTrip, manualCreateTrip } from "../services/tripApi";
import { trip } from "../types/trip";
import { ContractFile } from "../types/contract";
import { format } from "date-fns";
import AddContractFileModal from "../components/contract/AddContractFileModal";
import OrderForm from "../forms/order/OrderForm";
import { OrderFormValues } from "../forms/order/orderSchema";
import { formatTime } from "../utils/dateUtils";
import { getDriverList } from "../services/DriverApi";
import { getTractors } from "../services/tractorApi";
import { getTrailers } from "../services/trailerApi";
import { Driver } from "../types/driver";
import { Tractor } from "../types/tractor";
import { Trailer } from "../types/trailer";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [contractFiles, setContractFiles] = useState<ContractFile[] | null>(null);
  const [tripData, setTripData] = useState<trip[] | null>(null);
  const [tripLoading, setTripLoading] = useState<boolean>(false);
  const [tripError, setTripError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddContractModal, setOpenAddContractModal] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    note: "",
    price: 0,
    contactPerson: "",
    containerNumber: "",
    contactPhone: "",
    orderPlacer: "",
    isPay: IsPay.No,
    temperature: null as number | null,
    filesToRemove: [] as string[],
    filesToAdd: [] as File[],
    description: [""] as string[],
    notes: [""] as string[],
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);

  const [openCreateTripDialog, setOpenCreateTripDialog] = useState(false);
  const [createTripData, setCreateTripData] = useState({
    orderId: "",
    driverId: "",
    tractorId: "",
    TrailerId: "",
  });
  const [createTripLoading, setCreateTripLoading] = useState(false);
  const [createTripError, setCreateTripError] = useState<string | null>(null);
  const [createTripSuccess, setCreateTripSuccess] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(false);
  const [tractorMaxLoadWeight, setTractorMaxLoadWeight] = useState<number | null>(null);
  const [trailerMaxLoadWeight, setTrailerMaxLoadWeight] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      if (!orderId) {
        console.error("No orderId provided in URL params");
        setError("Không thể tải thông tin đơn hàng: Thiếu mã đơn hàng");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("Fetching order details for ID:", orderId);

      let orderData;
      try {
        orderData = await getOrderDetails(orderId);
        console.log("Order details received:", orderData);
        setOrderDetails(orderData);

        if (!orderData) {
          setError("Không tìm thấy thông tin đơn hàng");
          setLoading(false);
          return;
        }
      } catch (orderError) {
        console.error("Error fetching order details:", orderError);
        setError("Lỗi khi tải thông tin đơn hàng");
        setLoading(false);
        return;
      }

      try {
        setTripLoading(true);
        console.log("Fetching trip data for order:", orderId);
        const tripResponse = await getTrip(orderId);
        console.log("Trip data received:", tripResponse);
        setTripData(tripResponse);
        setTripLoading(false);
      } catch (tripError) {
        console.error("Error fetching trip data:", tripError);
        setTripError("Không thể tải thông tin chuyến đi");
        setTripLoading(false);
      }

      try {
        if (orderData && orderData.customerId) {
          console.log(
            "Fetching contracts for customer ID:",
            orderData.customerId
          );

          const contractsData = await getContracts(
            1,
            100,
            orderData.customerId
          );
          console.log("Contracts received:", contractsData);

          let extractedFiles: ContractFile[] = [];

          if (Array.isArray(contractsData) && contractsData.length > 0) {
            console.log(
              `Found ${contractsData.length} contracts for customer ID: ${orderData.customerId}`
            );

            for (const contract of contractsData) {
              if (
                contract.customerId === orderData.customerId &&
                contract.status === 1 &&
                contract.contractFiles?.length > 0
              ) {
                extractedFiles = [
                  ...extractedFiles,
                  ...contract.contractFiles,
                ];
              }
            }

            if (extractedFiles.length > 0) {
              console.log(
                `Found ${extractedFiles.length} contract files to display from active contracts`,
                extractedFiles
              );
              setContractFiles(extractedFiles);
            } else {
              console.log(
                "No contract files found for this customer in active contracts"
              );
              setContractFiles([]);
            }
          } else {
            console.log("No contracts found for this customer");
            setContractFiles([]);
          }
        } else {
          console.log("No customer ID available to fetch contract files");
          setContractFiles([]);
        }
      } catch (fileError) {
        console.error("Could not fetch contract files:", fileError);
        setContractFiles([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in data fetching process:", err);
      setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const getContainerTypeName = (type: ContainerType) => {
    switch (type) {
      case ContainerType["Container Khô"]:
        return "Container Khô";
      case ContainerType["Container Lạnh"]:
        return "Container Lạnh";
      default:
        return "Không xác định";
    }
  };

  const getContainerSizeName = (size: ContainerSize) => {
    switch (size) {
      case ContainerSize["Container 20 FEET"]:
        return "Container 20 FEET";
      case ContainerSize["Container 40 FEET"]:
        return "Container 40 FEET";
      default:
        return "Không xác định";
    }
  };

  const getDeliveryTypeName = (type: DeliveryType) => {
    switch (type) {
      case DeliveryType.Import:
        return "Nhập khẩu";
      case DeliveryType.Export:
        return "Xuất khẩu";
      default:
        return "Không xác định";
    }
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return { label: "Chờ xử lý", color: "warning" };
      case OrderStatus.Scheduled:
        return { label: "Đã lên lịch", color: "info" };
      case OrderStatus.Delivering:
        return { label: "Đang giao hàng", color: "info" };
      case OrderStatus.Shipped:
        return { label: "Đã giao hàng", color: "info" };
      case OrderStatus.Completed:
        return { label: "Hoàn thành", color: "success" };
      default:
        return { label: "Không xác định", color: "default" };
    }
  };

  const getPaymentStatusDisplay = (isPay: IsPay | null) => {
    switch (isPay) {
      case IsPay.Yes:
        return { label: "Đã thanh toán", color: "success" };
      case IsPay.No:
        return { label: "Chưa thanh toán", color: "warning" };
      default:
        return { label: "Không xác định", color: "default" };
    }
  };

  const handleBack = () => {
    navigate("/staff-menu/orders");
  };

  const handleOpenAddContractModal = () => {
    setOpenAddContractModal(true);
  };

  const handleCloseAddContractModal = () => {
    setOpenAddContractModal(false);
  };

  const handleOpenEditDialog = () => {
    if (orderDetails) {
      setEditFormData({
        note: orderDetails.note || "",
        price: orderDetails.price || 0,
        contactPerson: orderDetails.contactPerson || "",
        containerNumber: orderDetails.containerNumber || "",
        contactPhone: orderDetails.contactPhone || "",
        orderPlacer: orderDetails.orderPlacer || "",
        isPay: orderDetails.isPay || IsPay.No,
        temperature: orderDetails.temperature || null,
        filesToRemove: [],
        filesToAdd: [],
        description: [],
        notes: [],
      });
      
      setNewFiles([]);
      setFilesToDelete([]);
      setFileDescriptions([]);
      setFileNotes([]);
      
      setOpenEditDialog(true);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      isPay: e.target.checked ? IsPay.Yes : IsPay.No,
    });
  };

  const handleFileToggle = (fileUrl: string) => {
    if (filesToDelete.includes(fileUrl)) {
      setFilesToDelete(filesToDelete.filter(url => url !== fileUrl));
    } else {
      setFilesToDelete([...filesToDelete, fileUrl]);
    }
  };

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles([...newFiles, ...filesArray]);
      
      const newDescriptions = Array(filesArray.length).fill('');
      const newNotes = Array(filesArray.length).fill('');
      
      setFileDescriptions([...fileDescriptions, ...newDescriptions]);
      setFileNotes([...fileNotes, ...newNotes]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    const updatedFiles = [...newFiles];
    updatedFiles.splice(index, 1);
    setNewFiles(updatedFiles);
    
    const updatedDescriptions = [...fileDescriptions];
    updatedDescriptions.splice(index, 1);
    setFileDescriptions(updatedDescriptions);
    
    const updatedNotes = [...fileNotes];
    updatedNotes.splice(index, 1);
    setFileNotes(updatedNotes);
  };

  const handleFileDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...fileDescriptions];
    newDescriptions[index] = value;
    setFileDescriptions(newDescriptions);
  };

  const handleFileNoteChange = (index: number, value: string) => {
    const newNotes = [...fileNotes];
    newNotes[index] = value;
    setFileNotes(newNotes);
  };

  const handleUpdateOrder = async () => {
    if (!orderDetails || !orderId) return;
    
    setIsSubmitting(true);
    try {
      console.log("Current order details:", orderDetails);
      console.log("Current files to delete:", filesToDelete);
      console.log("Current new files:", newFiles);
      
      if (newFiles.length > 0) {
        while (fileDescriptions.length < newFiles.length) {
          fileDescriptions.push('');
        }
        
        while (fileNotes.length < newFiles.length) {
          fileNotes.push('');
        }
      }
      
      const updateData = {
        orderId: orderId,
        status: orderDetails.status,
        note: editFormData.note || "",
        price: editFormData.price,
        contactPerson: editFormData.contactPerson || "",
        containerNumber: editFormData.containerNumber || "",
        contactPhone: editFormData.contactPhone || "",
        orderPlacer: editFormData.orderPlacer || "",
        isPay: editFormData.isPay,
        temperature: orderDetails.containerType === ContainerType["Container Lạnh"] 
          ? editFormData.temperature 
          : null,
        description: newFiles.length > 0 ? fileDescriptions.slice(0, newFiles.length) : [],
        notes: newFiles.length > 0 ? fileNotes.slice(0, newFiles.length) : [],
        filesToRemove: filesToDelete.length > 0 ? filesToDelete : null,
        filesToAdd: newFiles.length > 0 ? newFiles : null,
      };
      
      console.log("Sending update data:", updateData);
      
      const result = await updateOrder(updateData);
      console.log("Order updated successfully:", result);
      
      setUpdateSuccess("Đơn hàng đã được cập nhật thành công");
      handleCloseEditDialog();
      fetchData();
      
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error updating order:", err);
      
      let errorMessage = "Không thể cập nhật đơn hàng. Vui lòng thử lại sau.";
      
      if (err.response) {
        console.error("API response error:", err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContractAdded = async () => {
    if (orderDetails && orderDetails.customerId) {
      try {
        const contractsData = await getContracts(
          1,
          100,
          orderDetails.customerId
        );

        let extractedFiles: ContractFile[] = [];

        if (Array.isArray(contractsData) && contractsData.length > 0) {
          for (const contract of contractsData) {
            if (
              contract.customerId === orderDetails.customerId &&
              contract.status === 1 &&
              contract.contractFiles?.length > 0
            ) {
              extractedFiles = [...extractedFiles, ...contract.contractFiles];
            }
          }

          if (extractedFiles.length > 0) {
            setContractFiles(extractedFiles);
          } else {
            setContractFiles([]);
          }
        } else {
          setContractFiles([]);
        }
      } catch (error) {
        console.error("Error refreshing contract files:", error);
      }
    }
  };

  const handleStatusUpdateOpen = () => {
    setNewStatus(orderDetails?.status || "");
    setStatusUpdateOpen(true);
  };

  const handleStatusUpdateClose = () => {
    setStatusUpdateOpen(false);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewStatus(event.target.value as OrderStatus);
  };

  const handleStatusUpdate = async () => {
    if (!orderDetails || !orderId || newStatus === "") return;
    
    setStatusUpdateLoading(true);
    try {
      const updateData = {
        orderId: orderId,
        status: newStatus as OrderStatus,
        note: orderDetails.note || "",
        price: orderDetails.price,
        contactPerson: orderDetails.contactPerson || "",
        containerNumber: orderDetails.containerNumber || "",
        contactPhone: orderDetails.contactPhone || "",
        orderPlacer: orderDetails.orderPlacer || "",
        isPay: orderDetails.isPay || IsPay.No,
        temperature: orderDetails.temperature,
        description: [],
        notes: [],
        filesToRemove: null,
        filesToAdd: null,
      };
      
      console.log("Updating order status with data:", updateData);
      const result = await updateOrder(updateData);
      console.log("Order status updated successfully:", result);
      
      setUpdateSuccess("Trạng thái đơn hàng đã được cập nhật thành công");
      handleStatusUpdateClose();
      fetchData();
      
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getTripStatusDisplay = (status: string | null) => {
    if (!status) return { label: "Không xác định", color: "default" };
    
    switch (status) {
      case "completed":
        return { label: "Hoàn thành", color: "success" };
      case "delaying":
        return { label: "Tạm dừng", color: "warning" };
      case "going_to_port":
        return { label: "Đang di chuyển đến cảng", color: "info" };
      case "0":
        return { label: "Chưa bắt đầu", color: "default" };
      case "1":
        return { label: "Đang di chuyển đến điểm lấy hàng", color: "info" };
      case "2":
        return { label: "Đã đến điểm lấy hàng", color: "info" };
      case "3":
        return { label: "Đang di chuyển đến điểm giao hàng", color: "info" };
      case "4":
        return { label: "Đã đến điểm giao hàng", color: "info" };
      case "5":
        return { label: "Đang di chuyển đến điểm trả container", color: "info" };
      case "6":
        return { label: "Đã đến điểm trả container", color: "success" };
      case "7":
        return { label: "Hoàn thành", color: "success" };
      default:
        return { label: status, color: "default" };
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "N/A";
    try {
      return format(new Date(dateTimeString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const handleOpenCreateTripDialog = async () => {
    if (orderId) {
      setCreateTripData({
        orderId: orderId,
        driverId: "",
        tractorId: "",
        TrailerId: "",
      });
      setCreateTripError(null);
      setOpenCreateTripDialog(true);
      
      try {
        await loadDrivers();
        
        try {
          await loadTractors();
        } catch (tractorError) {
          console.error("Tractor loading failed independently:", tractorError);
        }
        
        try {
          await loadTrailers();
        } catch (trailerError) {
          console.error("Trailer loading failed independently:", trailerError);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        setCreateTripError("Không thể tải đủ dữ liệu cho biểu mẫu. Một số tùy chọn có thể không khả dụng.");
      }
    }
  };
  
  const loadDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await getDriverList({
        pageNumber: 1,
        pageSize: 100,
        status: 1
      });
      
      if (response.success && response.data && response.data.items) {
        setDrivers(response.data.items);
      } else {
        throw new Error("Failed to load drivers");
      }
    } catch (error) {
      console.error("Error loading drivers:", error);
      throw error;
    } finally {
      setLoadingDrivers(false);
    }
  };
  
  const loadTractors = async () => {
    try {
      setLoadingTractors(true);
      
      // Thực hiện hai lần gọi API riêng biệt
      const activeResponse = await getTractors(1, 100, undefined, "Active");
      const onDutyResponse = await getTractors(1, 100, undefined, "OnDuty");
      
      console.log("Active tractors response:", activeResponse);
      console.log("OnDuty tractors response:", onDutyResponse);
      
      // Hàm trích xuất danh sách tractors từ response
      const extractTractors = (response: any): any[] => {
        if (!response) return [];
        
        if (response.data && response.data.tractors && response.data.tractors.items) {
          return response.data.tractors.items;
        } else if (Array.isArray(response)) {
          return response;
        } else if (response.tractors && Array.isArray(response.tractors)) {
          return response.tractors;
        } else if (response.tractors && response.tractors.items) {
          return response.tractors.items;
        }
        
        return [];
      };
      
      // Lấy danh sách tractors từ cả hai response
      const activeTractors = extractTractors(activeResponse);
      const onDutyTractors = extractTractors(onDutyResponse);
      
      // Kết hợp danh sách và loại bỏ trùng lặp dựa trên tractorId
      const combinedTractors = [
        ...activeTractors,
        ...onDutyTractors.filter(onDutyTractor => 
          !activeTractors.some(activeTractor => 
            activeTractor.tractorId === onDutyTractor.tractorId
          )
        )
      ];
      
      console.log("Combined tractors count:", combinedTractors.length);
      setTractors(combinedTractors);
      
    } catch (error) {
      console.error("Error loading tractors:", error);
      setCreateTripError("Không thể tải dữ liệu đầu kéo. Vui lòng thử lại.");
    } finally {
      setLoadingTractors(false);
    }
  };
  
  const loadTrailers = async () => {
    try {
      setLoadingTrailers(true);
      
      // Thực hiện hai lần gọi API riêng biệt
      const activeResponse = await getTrailers(1, 100, undefined, "Active");
      const onDutyResponse = await getTrailers(1, 100, undefined, "OnDuty");
      
      // Hàm trích xuất danh sách trailers từ response
      const extractTrailers = (response: any): any[] => {
        if (!response) return [];
        
        if (response.data && response.data.trailers && response.data.trailers.items) {
          return response.data.trailers.items;
        } else if (Array.isArray(response)) {
          return response;
        } else if (response.trailers && Array.isArray(response.trailers)) {
          return response.trailers;
        } else if (response.trailers && response.trailers.items) {
          return response.trailers.items;
        }
        
        return [];
      };
      
      // Lấy danh sách trailers từ cả hai response
      const activeTrailers = extractTrailers(activeResponse);
      const onDutyTrailers = extractTrailers(onDutyResponse);
      
      // Kết hợp danh sách và loại bỏ trùng lặp
      const combinedTrailers = [
        ...activeTrailers,
        ...onDutyTrailers.filter(onDutyTrailer => 
          !activeTrailers.some(activeTrailer => 
            activeTrailer.trailerId === onDutyTrailer.trailerId
          )
        )
      ];
      
      setTrailers(combinedTrailers);
      
    } catch (error) {
      console.error("Error loading trailers:", error);
      setCreateTripError("Không thể tải dữ liệu rơ moóc. Vui lòng thử lại.");
    } finally {
      setLoadingTrailers(false);
    }
  };

  const handleCloseCreateTripDialog = () => {
    setOpenCreateTripDialog(false);
  };

  const handleCreateTripChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target.name as string;
    const value = event.target.value as string;
    
    setCreateTripData({
      ...createTripData,
      [name]: value,
    });

    if (name === "tractorId") {
      const selectedTractor = tractors.find(tractor => tractor.tractorId === value);
      setTractorMaxLoadWeight(selectedTractor?.maxLoadWeight || null);
    }
    
    if (name === "TrailerId") {
      const selectedTrailer = trailers.find(trailer => trailer.trailerId === value);
      setTrailerMaxLoadWeight(selectedTrailer?.maxLoadWeight || null);
    }
  };

  const handleCreateTrip = async () => {
    setCreateTripLoading(true);
    setCreateTripError(null);

    try {
      if (!createTripData.orderId || !createTripData.driverId || 
          !createTripData.tractorId || !createTripData.TrailerId) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      console.log("Creating trip with data:", createTripData);
      await manualCreateTrip(createTripData);
      
      setCreateTripSuccess("Tạo chuyến đi thành công");
      setTimeout(() => {
        setCreateTripSuccess(null);
      }, 5000);
      
      handleCloseCreateTripDialog();
      fetchData();
    } catch (err: any) {
      console.error("Error creating trip:", err);
      
      let errorMessage = "Không thể tạo chuyến đi. Vui lòng thử lại sau.";
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setCreateTripError(errorMessage);
    } finally {
      setCreateTripLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách đơn hàng
        </Button>
        <Alert severity="error">
          {error}
          <Typography variant="caption" display="block" mt={1}>
            Order ID: {orderId}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!orderDetails) {
    return (
      <Box p={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách đơn hàng
        </Button>
        <Alert severity="warning">
          Không tìm thấy đơn hàng
          <Typography variant="caption" display="block" mt={1}>
            Order ID: {orderId}
          </Typography>
        </Alert>
      </Box>
    );
  }

  const initialFormValues: Partial<OrderFormValues> = {
    companyName: orderDetails.customerId || "",
    temperature: orderDetails.temperature || 0,
    weight: parseFloat(orderDetails.weight) || 0,
    pickUpDate: new Date(orderDetails.pickUpDate),
    deliveryDate: new Date(orderDetails.deliveryDate),
    completeTime: orderDetails.completeTime ? new Date(orderDetails.completeTime) : null,
    note: orderDetails.note || "",
    containerType: orderDetails.containerType,
    containerSize: orderDetails.containerSize || ContainerSize["Container 20 FEET"],
    deliveryType: orderDetails.deliveryType,
    pickUpLocation: orderDetails.pickUpLocation,
    deliveryLocation: orderDetails.deliveryLocation,
    conReturnLocation: orderDetails.conReturnLocation,
    price: orderDetails.price,
    contactPerson: orderDetails.contactPerson,
    contactPhone: orderDetails.contactPhone,
    distance: orderDetails.distance,
    containerNumber: orderDetails.containerNumber,
    description: [],
    notes: [],
  };

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Quay lại danh sách đơn hàng
      </Button>

      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {updateSuccess}
        </Alert>
      )}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">
          Chi tiết đơn hàng - {orderDetails.trackingCode}
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <Chip
            label={getStatusDisplay(orderDetails.status).label}
            color={getStatusDisplay(orderDetails.status).color as any}
          />
          {orderDetails.status === OrderStatus.Pending && (
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<EditIcon />}
              onClick={handleOpenEditDialog}
            >
              Cập nhật thông tin
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin chung
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{
                    fontWeight: "medium",
                    color:
                      orderDetails.status === OrderStatus.Completed
                        ? "success.main"
                        : orderDetails.status === OrderStatus.Scheduled
                        ? "info.main"
                        : "warning.main",
                  }}
                >
                  {getStatusDisplay(orderDetails.status).label}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái thanh toán
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={getPaymentStatusDisplay(orderDetails.isPay).label}
                    color={getPaymentStatusDisplay(orderDetails.isPay).color as any}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Giá
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Intl.NumberFormat("vi-VN").format(orderDetails.price)}{" "}
                  VNĐ
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Khách hàng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.customer || orderDetails.customerId || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số container
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.containerNumber || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loại container
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getContainerTypeName(orderDetails.containerType)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Kích thước container
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getContainerSizeName(orderDetails.containerSize || ContainerSize["Container 20 FEEET"])}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loại vận chuyển
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getDeliveryTypeName(orderDetails.deliveryType)}
                </Typography>
              </Grid>

              {orderDetails.containerType === ContainerType["Container Lạnh"] && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nhiệt độ
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {orderDetails.temperature !== null ? `${orderDetails.temperature}°C` : "N/A"}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trọng lượng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.weight} tấn
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày lấy hàng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(orderDetails.pickUpDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày giao hàng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(orderDetails.deliveryDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày tạo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(orderDetails.createdDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ước lượng thời gian giao
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.completionTime || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Người tạo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.createdBy || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ghi chú
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.note || "Không có ghi chú"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin địa điểm
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Địa điểm lấy hàng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.pickUpLocation}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Địa điểm giao hàng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.deliveryLocation}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Địa điểm trả container
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.conReturnLocation}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Khoảng cách
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.distance
                    ? `${orderDetails.distance} km`
                    : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin liên hệ
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Người liên hệ
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.contactPerson}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.contactPhone}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Người đặt hàng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.orderPlacer}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" gutterBottom>
                Tài liệu & Hồ sơ
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Tài liệu đơn hàng
              </Typography>
              {orderDetails.orderFiles && orderDetails.orderFiles.length > 0 ? (
                <Grid container spacing={2}>
                  {orderDetails.orderFiles.map((fileObj, index) => {
                    const fileUrl =
                      typeof fileObj === "string" ? fileObj : fileObj.fileUrl;
                    const fileName =
                      typeof fileObj === "string"
                        ? `Tài liệu ${index + 1}`
                        : fileObj.fileName;
                    const fileType =
                      typeof fileObj === "string" ? null : fileObj.fileType;

                    const isImage = fileType
                      ? fileType === "Image" ||
                        fileType.toLowerCase().includes("image/")
                      : /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileUrl);

                    const isDocument = fileType
                      ? fileType === "PDF Document" ||
                        fileType === "Word Document" ||
                        fileType === "Excel Spreadsheet" ||
                        fileType === "PowerPoint Presentation" ||
                        fileType === "Text Document" ||
                        fileType === "Archive"
                      : /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|7z)$/i.test(
                          fileUrl
                        );

                    return (
                      <Grid item xs={12} sm={6} key={`order-file-${index}`}>
                        <Card>
                          <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                            {isImage ? (
                              <>
                                <Box
                                  component="img"
                                  src={fileUrl}
                                  alt={fileName || `Order file ${index + 1}`}
                                  sx={{
                                    width: "100%",
                                    height: 100,
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    borderRadius: 1,
                                  }}
                                  onClick={() => window.open(fileUrl, "_blank")}
                                />
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                >
                                  {fileName || `Hình ảnh ${index + 1}`}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box component="span" mr={0.5}>
                                  {isDocument ? "📄" : "📎"}
                                </Box>
                                <a
                                  href={fileUrl}
                                  download={fileName || `file-${index + 1}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {fileName || `Tài liệu đơn hàng ${index + 1}`}
                                </a>
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có giấy tờ đặt hàng
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tài liệu hợp đồng
              </Typography>
              {contractFiles && contractFiles.length > 0 ? (
                <Grid container spacing={2}>
                  {contractFiles.map((file, index) => {
                    const isDocument =
                      file.fileType === "PDF Document" ||
                      file.fileType === "Word Document" ||
                      file.fileType === "Excel Spreadsheet" ||
                      file.fileType === "PowerPoint Presentation" ||
                      file.fileType === "Text Document" ||
                      file.fileType === "Archive";

                    const isImage =
                      file.fileType === "Image" ||
                      (file.fileType &&
                        file.fileType.toLowerCase().includes("image/"));

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        key={file.fileId || `contract-file-${index}`}
                      >
                        <Card>
                          <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                            {isImage ? (
                              <>
                                <Box
                                  component="img"
                                  src={file.fileUrl}
                                  alt={
                                    file.fileName || `Contract image ${index + 1}`
                                  }
                                  sx={{
                                    width: "100%",
                                    height: 100,
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    borderRadius: 1,
                                  }}
                                  onClick={() =>
                                    window.open(file.fileUrl, "_blank")
                                  }
                                />
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                >
                                  {file.fileName || `Hình ảnh ${index + 1}`}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box component="span" mr={0.5}>
                                  {isDocument ? "📄" : "📎"}
                                </Box>
                                <a
                                  href={file.fileUrl}
                                  download={file.fileName || `file-${index + 1}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {file.fileName ||
                                    `Tài liệu hợp đồng ${index + 1}`}
                                </a>
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có tài liệu hợp đồng
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" gutterBottom>
                Thông tin chuyến đi
              </Typography>
              <DirectionsIcon color="primary" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {createTripSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {createTripSuccess}
              </Alert>
            )}

            {tripLoading && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}

            {tripError && !tripLoading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {tripError}
              </Alert>
            )}

            {!tripLoading && !tripError && (!tripData || tripData.length === 0) && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Chưa có thông tin chuyến đi cho đơn hàng này
                </Alert>
                
                {orderDetails.orderFiles && 
                 orderDetails.orderFiles.length > 0 && 
                 contractFiles && 
                 contractFiles.length > 0 ? (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateTripDialog}
                    >
                      Tạo chuyến đi
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Cần có tài liệu đơn hàng và tài liệu hợp đồng để tạo chuyến đi
                  </Alert>
                )}
              </>
            )}

            {!tripLoading && !tripError && tripData && tripData.length > 0 && (
              tripData.map((trip, index) => (
                <Box 
                  key={trip.tripId || index}
                  sx={{
                    mb: index < tripData.length - 1 ? 3 : 0,
                    pb: index < tripData.length - 1 ? 3 : 0,
                    borderBottom: index < tripData.length - 1 ? '1px dashed rgba(0, 0, 0, 0.12)' : 'none'
                  }}
                >
                  {index > 0 && (
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom mt={2}>
                      Chuyến đi {index + 1}
                    </Typography>
                  )}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Trạng thái chuyến đi
                        </Typography>
                        <Chip
                          size="small"
                          label={getTripStatusDisplay(trip.status).label}
                          color={getTripStatusDisplay(trip.status).color as any}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mã chuyến đi
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {trip.tripId || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thời gian bắt đầu
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDateTime(trip.startTime)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thời gian kết thúc
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDateTime(trip.endTime)}
                      </Typography>
                    </Grid>

                    {trip.driverId && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mã tài xế
                        </Typography>
                        <Typography 
                          variant="body1" 
                          gutterBottom
                          sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            '&:hover': {
                              color: 'primary.dark'
                            },
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          onClick={() => navigate(`/drivers/${trip.driverId}`)}
                        >
                          {trip.driverId}
                        </Typography>
                      </Grid>
                    )}

                    {trip.tripId && (
                      <Grid item xs={12}>
                        <Box mt={1}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<DirectionsIcon />}
                            onClick={() => navigate(`/staff-menu/trips/${trip.tripId}`)}
                          >
                            Chi tiết chuyến đi
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {orderDetails && (
        <AddContractFileModal
          open={openAddContractModal}
          onClose={handleCloseAddContractModal}
          onSuccess={handleContractAdded}
          customerId={orderDetails.customerId}
          orderId={orderId || ""}
        />
      )}

      <Dialog
        open={statusUpdateOpen}
        onClose={handleStatusUpdateClose}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Cập nhật trạng thái đơn hàng
        </DialogTitle>
        <DialogContent sx={{ pt: 1, width: 300 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-select-label">Trạng thái</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              onChange={handleStatusChange}
              label="Trạng thái"
            >
              <MenuItem value={OrderStatus.Pending}>
                {getStatusDisplay(OrderStatus.Pending).label}
              </MenuItem>
              <MenuItem value={OrderStatus.Scheduled}>
                {getStatusDisplay(OrderStatus.Scheduled).label}
              </MenuItem>
              <MenuItem value={OrderStatus.Delivering}>
                {getStatusDisplay(OrderStatus.Delivering).label}
              </MenuItem>
              <MenuItem value={OrderStatus.Shipped}>
                {getStatusDisplay(OrderStatus.Shipped).label}
              </MenuItem>
              <MenuItem value={OrderStatus.Completed}>
                {getStatusDisplay(OrderStatus.Completed).label}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleStatusUpdateClose}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStatusUpdate}
            disabled={statusUpdateLoading || newStatus === orderDetails?.status}
          >
            {statusUpdateLoading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          Cập nhật đơn hàng - {orderDetails?.trackingCode}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Người liên hệ"
                  name="contactPerson"
                  value={editFormData.contactPerson}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại liên hệ"
                  name="contactPhone"
                  value={editFormData.contactPhone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số container"
                  name="containerNumber"
                  value={editFormData.containerNumber}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Giá (VNĐ)"
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                {orderDetails?.containerType === ContainerType["Container Lạnh"] && (
                  <TextField
                    fullWidth
                    label="Nhiệt độ (°C)"
                    type="number"
                    name="temperature"
                    value={editFormData.temperature || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Người đặt hàng"
                  name="orderPlacer"
                  value={editFormData.orderPlacer}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú"
                  name="note"
                  multiline
                  rows={3}
                  value={editFormData.note}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.isPay === IsPay.Yes}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Đã thanh toán"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Quản lý tài liệu đơn hàng
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {orderDetails?.orderFiles && orderDetails.orderFiles.length > 0 ? (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tài liệu hiện tại
                    </Typography>
                    <List>
                      {orderDetails.orderFiles.map((fileObj, index) => {
                        const fileUrl = typeof fileObj === "string" ? fileObj : fileObj.fileUrl;
                        const fileName = typeof fileObj === "string" 
                          ? `Tài liệu ${index + 1}` 
                          : fileObj.fileName || `Tài liệu ${index + 1}`;
                          
                        return (
                          <ListItem key={index} dense>
                            <ListItemText 
                              primary={fileName} 
                              secondary={filesToDelete.includes(fileUrl) ? "Sẽ bị xóa" : ""}
                            />
                            <ListItemSecondaryAction>
                              <Checkbox
                                edge="end"
                                onChange={() => handleFileToggle(fileUrl)}
                                checked={filesToDelete.includes(fileUrl)}
                                color="error"
                              />
                              <IconButton 
                                size="small" 
                                href={fileUrl} 
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <AttachFileIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có tài liệu hiện tại
                  </Typography>
                )}

                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Thêm tài liệu mới
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ mb: 2 }}
                  >
                    Chọn tệp
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleNewFileChange}
                    />
                  </Button>

                  {newFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <List>
                        {newFiles.map((file, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              mb: 3, 
                              p: 2, 
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              borderRadius: 1
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center', 
                              mb: 2 
                            }}>
                              <Typography variant="body2">{file.name}</Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveNewFile(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <TextField
                              label="Mô tả file"
                              value={fileDescriptions[index] || ''}
                              onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                              fullWidth
                              margin="normal"
                              size="small"
                            />
                            
                            <TextField
                              label="Ghi chú file"
                              value={fileNotes[index] || ''}
                              onChange={(e) => handleFileNoteChange(index, e.target.value)}
                              fullWidth
                              margin="normal"
                              size="small"
                            />
                          </Box>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEditDialog}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreateTripDialog}
        onClose={handleCloseCreateTripDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Tạo chuyến đi mới
        </DialogTitle>
        <DialogContent sx={{ pt: 1, width: 500 }}>
          {createTripError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {createTripError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            margin="normal"
            label="Mã đơn hàng"
            name="orderId"
            value={createTripData.orderId}
            disabled
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="driver-select-label">Tài xế</InputLabel>
            <Select
              labelId="driver-select-label"
              id="driver-select"
              name="driverId"
              value={createTripData.driverId}
              onChange={handleCreateTripChange}
              label="Tài xế"
              disabled={loadingDrivers}
            >
              {loadingDrivers ? (
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                  </Box>
                </MenuItem>
              ) : drivers.length === 0 ? (
                <MenuItem value="" disabled>
                  Không tìm thấy tài xế
                </MenuItem>
              ) : (
                drivers.map((driver) => (
                  <MenuItem key={driver.driverId} value={driver.driverId}>
                    {driver.fullName} - {driver.phoneNumber || 'Không có SĐT'}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="tractor-select-label">Đầu kéo</InputLabel>
                <Select
                  labelId="tractor-select-label"
                  id="tractor-select"
                  name="tractorId"
                  value={createTripData.tractorId}
                  onChange={handleCreateTripChange}
                  label="Đầu kéo"
                  disabled={loadingTractors}
                >
                  {loadingTractors ? (
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                      </Box>
                    </MenuItem>
                  ) : tractors.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không tìm thấy đầu kéo
                    </MenuItem>
                  ) : (
                    tractors.map((tractor) => (
                      <MenuItem key={tractor.tractorId} value={tractor.tractorId}>
                        {tractor.licensePlate} - {tractor.brand || 'Không rõ hãng'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Trọng tải tối đa"
                variant="outlined"
                size="small"
                fullWidth
                value={tractorMaxLoadWeight !== null ? `${tractorMaxLoadWeight} tấn` : ''}
                InputProps={{ readOnly: true }}
                sx={{
                  mt: 2,
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                  }
                }}
              />
            </Grid>
          </Grid>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="trailer-select-label">Rơ moóc</InputLabel>
                <Select
                  labelId="trailer-select-label"
                  id="trailer-select"
                  name="TrailerId"
                  value={createTripData.TrailerId}
                  onChange={handleCreateTripChange}
                  label="Rơ moóc"
                  disabled={loadingTrailers}
                >
                  {loadingTrailers ? (
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                      </Box>
                    </MenuItem>
                  ) : trailers.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không tìm thấy rơ moóc
                    </MenuItem>
                  ) : (
                    trailers.map((trailer) => (
                      <MenuItem key={trailer.trailerId} value={trailer.trailerId}>
                        {trailer.licensePlate} - {trailer.brand || 'Không rõ hãng'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Trọng tải tối đa"
                variant="outlined"
                size="small"
                fullWidth
                value={trailerMaxLoadWeight !== null ? `${trailerMaxLoadWeight} tấn` : ''}
                InputProps={{ readOnly: true }}
                sx={{
                  mt: 2,
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCreateTripDialog}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTrip}
            disabled={createTripLoading || !createTripData.driverId || !createTripData.tractorId || !createTripData.TrailerId}
          >
            {createTripLoading ? "Đang tạo..." : "Tạo chuyến đi"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetailPage;
