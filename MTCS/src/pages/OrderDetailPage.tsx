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
  Snackbar,
  Fade,
  Slide,
  SlideProps,
  ButtonGroup,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsIcon from "@mui/icons-material/Directions";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FolderIcon from "@mui/icons-material/Folder";
import ContactsIcon from "@mui/icons-material/Contacts";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import DescriptionIcon from "@mui/icons-material/Description";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  OrderDetails,
  ContainerType,
  ContainerSize,
  DeliveryType,
  OrderStatus,
  IsPay,
  OrderFile,
} from "../types/order";
import {
  getOrderDetails,
  updateOrder,
  updatePaymentStatus,
  cancelOrder,
} from "../services/orderApi";
import { getContracts, createContract } from "../services/contractApi";
import {
  getTrip,
  manualCreateTrip,
  autoScheduleTrip,
} from "../services/tripApi";
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
import { getDeliveryStatus } from "../services/deliveryStatus";
import { useAuth } from "../contexts/AuthContext"; // Thêm import useAuth

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user từ useAuth hook
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [contractFiles, setContractFiles] = useState<ContractFile[] | null>(
    null
  );
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
  const [autoScheduleLoading, setAutoScheduleLoading] = useState(false);
  const [autoScheduleError, setAutoScheduleError] = useState<string | null>(
    null
  );
  const [autoScheduleSuccess, setAutoScheduleSuccess] = useState<string | null>(
    null
  );
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
  const [statusesLoaded, setStatusesLoaded] = useState<boolean>(false);
  const [deliveryStatuses, setDeliveryStatuses] = useState<{
    [key: string]: { statusName: string; color: string };
  } | null>(null);
  const [openCreateTripDialog, setOpenCreateTripDialog] = useState(false);
  const [createTripData, setCreateTripData] = useState({
    orderId: "",
    driverId: "",
    tractorId: "",
    TrailerId: "",
  });
  const [createTripLoading, setCreateTripLoading] = useState(false);
  const [createTripError, setCreateTripError] = useState<string | null>(null);
  const [createTripSuccess, setCreateTripSuccess] = useState<string | null>(
    null
  );
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(false);
  const [tractorMaxLoadWeight, setTractorMaxLoadWeight] = useState<
    number | null
  >(null);
  const [trailerMaxLoadWeight, setTrailerMaxLoadWeight] = useState<
    number | null
  >(null);
  const [loadingSnackbar, setLoadingSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: "success" | "error" | "info" | "warning";
    autoHideDuration?: number | null;
  }>({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 3000,
  });
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
  const [confirmCheckbox1, setConfirmCheckbox1] = useState(false);
  const [confirmCheckbox2, setConfirmCheckbox2] = useState(false);
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });
  const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";

  // State để hiển thị document preview
  const [documentPreview, setDocumentPreview] = useState<{
    open: boolean;
    src: string;
    title: string;
    fileType: string;
  }>({
    open: false,
    src: "",
    title: "",
    fileType: "",
  });

  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
  const [cancelOrderLoading, setCancelOrderLoading] = useState(false);
  const [cancelFinalConfirmDialogOpen, setCancelFinalConfirmDialogOpen] =
    useState(false);

  // Close loading snackbar
  const handleCloseLoadingSnackbar = () => {
    setLoadingSnackbar({
      ...loadingSnackbar,
      open: false,
    });
  };

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
                extractedFiles = [...extractedFiles, ...contract.contractFiles];
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
        return "Nhập";
      case DeliveryType.Export:
        return "Xuất";
      default:
        return "Không xác định";
    }
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Canceled:
        return { label: "Đã hủy", color: "error" };
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

  // Navigate back
  const handleBack = () => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/orders`);
  };

  const handleOpenAddContractModal = () => {
    setOpenAddContractModal(true);
  };

  const handleCloseAddContractModal = () => {
    setOpenAddContractModal(false);
  };

  // Define a more specific validation schema for the edit form
  const editOrderSchema = zod.object({
    note: zod
      .string()
      .min(1, "Ghi chú là bắt buộc")
      .max(500, "Ghi chú không được vượt quá 500 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message: "Ghi chú không được bắt đầu hoặc kết thúc bằng dấu cách",
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message: "Ghi chú không được chứa nhiều hơn một dấu cách giữa các từ",
      }),
    price: zod
      .number()
      .min(0, "Giá không được âm")
      .max(1000000000, "Giá không được vượt quá 1 tỷ VND"),
    contactPerson: zod
      .string()
      .min(1, "Tên người liên hệ là bắt buộc")
      .max(50, "Tên người liên hệ không được vượt quá 50 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Tên người liên hệ không được bắt đầu hoặc kết thúc bằng dấu cách",
      }),
    containerNumber: zod
      .string()
      .min(1, "Số container là bắt buộc")
      .max(20, "Số container không được vượt quá 20 ký tự")
      .regex(
        /^[A-Z]{3}[UJZ]\d{7}$/,
        "Số container phải có định dạng hợp lệ (ví dụ: SEGU5593802)"
      ),
    contactPhone: zod
      .string()
      .length(10, "Số điện thoại phải có đúng 10 số")
      .regex(/^\d+$/, "Số điện thoại chỉ được chứa các chữ số"),
    orderPlacer: zod
      .string()
      .min(1, "Người đặt hàng là bắt buộc")
      .max(50, "Người đặt hàng không được vượt quá 50 ký tự")
      .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
        message:
          "Người đặt hàng không được bắt đầu hoặc kết thúc bằng dấu cách",
      }),
    temperature: zod
      .number()
      .min(-30, "Nhiệt độ không được thấp hơn -30°C")
      .max(40, "Nhiệt độ không được cao hơn 40°C")
      .nullable(),
  });

  // Define the type for our form
  type EditOrderFormValues = zod.infer<typeof editOrderSchema>;

  // Setup form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditOrderFormValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: {
      note: "",
      price: 0,
      contactPerson: "",
      containerNumber: "",
      contactPhone: "",
      orderPlacer: "",
      temperature: null,
    },
  });

  const handleOpenEditDialog = () => {
    if (orderDetails) {
      // Reset form with current order details
      reset({
        note: orderDetails.note || "",
        price: orderDetails.price || 0,
        contactPerson: orderDetails.contactPerson || "",
        containerNumber: orderDetails.containerNumber || "",
        contactPhone: orderDetails.contactPhone || "",
        orderPlacer: orderDetails.orderPlacer || "",
        temperature: orderDetails.temperature || null,
      });

      // Set the state for payment status which is handled separately
      setEditFormData({
        ...editFormData,
        isPay: orderDetails.isPay || IsPay.No,
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
      setFilesToDelete(filesToDelete.filter((url) => url !== fileUrl));
    } else {
      setFilesToDelete([...filesToDelete, fileUrl]);
    }
  };

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles([...newFiles, ...filesArray]);

      const newDescriptions = Array(filesArray.length).fill("");
      const newNotes = Array(filesArray.length).fill("");

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

  const onSubmitEditForm = (data: EditOrderFormValues) => {
    if (!orderDetails || !orderId) return;

    setIsSubmitting(true);
    try {
      console.log("Current order details:", orderDetails);
      console.log("Current files to delete:", filesToDelete);
      console.log("Current new files:", newFiles);

      // Process files and their metadata
      if (newFiles.length > 0) {
        while (fileDescriptions.length < newFiles.length) {
          fileDescriptions.push("");
        }

        while (fileNotes.length < newFiles.length) {
          fileNotes.push("");
        }
      }

      const updateData = {
        orderId: orderId,
        status: orderDetails.status,
        note: data.note || "",
        price: data.price,
        contactPerson: data.contactPerson || "",
        containerNumber: data.containerNumber || "",
        contactPhone: data.contactPhone || "",
        orderPlacer: data.orderPlacer || "",
        isPay: editFormData.isPay,
        temperature:
          orderDetails.containerType === ContainerType["Container Lạnh"]
            ? data.temperature
            : null,
        description:
          newFiles.length > 0 ? fileDescriptions.slice(0, newFiles.length) : [],
        notes: newFiles.length > 0 ? fileNotes.slice(0, newFiles.length) : [],
        filesToRemove: filesToDelete.length > 0 ? filesToDelete : null,
        filesToAdd: newFiles.length > 0 ? newFiles : null,
      };

      console.log("Sending update data:", updateData);

      // Call the update API
      updateOrder(updateData)
        .then((result) => {
          console.log("Order updated successfully:", result);
          setUpdateSuccess("Đơn hàng đã được cập nhật thành công");
          handleCloseEditDialog();
          fetchData();

          setTimeout(() => {
            setUpdateSuccess(null);
          }, 5000);
        })
        .catch((err) => {
          console.error("Error updating order:", err);
          let errorMessage =
            "Không thể cập nhật đơn hàng. Vui lòng thử lại sau.";
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          }
          setError(errorMessage);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (err) {
      console.error("Error in update process:", err);
      setError("Không thể cập nhật đơn hàng. Vui lòng thử lại sau.");
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

  // Fetch delivery statuses
  useEffect(() => {
    const fetchDeliveryStatuses = async () => {
      try {
        setLoading(true); // Show loading state while fetching both resources
        const statusData = await getDeliveryStatus();

        // Convert to a lookup map for easier use
        const statusMap: {
          [key: string]: { statusName: string; color: string };
        } = {};

        if (Array.isArray(statusData)) {
          statusData.forEach((status) => {
            // Use status.statusId as key and provide statusName with default color of "default"
            // You can modify this to map different colors based on status if needed
            statusMap[status.statusId] = {
              statusName: status.statusName,
              color: getStatusColor(status.statusId),
            };
          });
        } else if (statusData && typeof statusData === "object") {
          // Handle if response is an object with a data property
          const dataArray = statusData.data || [];
          dataArray.forEach((status) => {
            statusMap[status.statusId] = {
              statusName: status.statusName,
              color: getStatusColor(status.statusId),
            };
          });
        }

        setDeliveryStatuses(statusMap);
        setStatusesLoaded(true);
      } catch (error) {
        console.error("Failed to fetch delivery statuses:", error);
        // Continue without delivery statuses - will fall back to hardcoded values
        setStatusesLoaded(true);
      }
    };

    fetchDeliveryStatuses();
  }, []);

  // Helper function to assign color based on status
  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "not_started":
        return "default";
      case "going_to_port":
      case "pick_up_container":
      case "is_delivering":
      case "at_delivery_point":
      case "going_to_port/depot":
        return "info";
      case "completed":
        return "success";
      case "delaying":
        return "warning";
      default:
        return "default";
    }
  };

  const getTripStatusDisplay = (status: string | null) => {
    if (!status) return { label: "Không xác định", color: "default" };

    // Check if we have dynamic statuses from API and if this status exists in our map
    if (deliveryStatuses && deliveryStatuses[status]) {
      return {
        label: deliveryStatuses[status].statusName,
        color: deliveryStatuses[status].color,
      };
    }

    // Fallback if status is not found in deliveryStatuses
    return { label: status, color: "default" };
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
        setCreateTripError(
          "Không thể tải đủ dữ liệu cho biểu mẫu. Một số tùy chọn có thể không khả dụng."
        );
      }
    }
  };

  const loadDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await getDriverList({
        pageNumber: 1,
        pageSize: 100,
        status: 1,
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

        if (
          response.data &&
          response.data.tractors &&
          response.data.tractors.items
        ) {
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
      let combinedTractors = [
        ...activeTractors,
        ...onDutyTractors.filter(
          (onDutyTractor) =>
            !activeTractors.some(
              (activeTractor) =>
                activeTractor.tractorId === onDutyTractor.tractorId
            )
        ),
      ];

      // Lọc tractors dựa trên containerType của đơn hàng
      if (orderDetails && orderDetails.containerType) {
        if (orderDetails.containerType === ContainerType["Container Lạnh"]) {
          // Nếu là container lạnh (type 2), chỉ lấy những tractor có containerType là 2
          combinedTractors = combinedTractors.filter(
            (tractor) => tractor.containerType === 2
          );
        } else if (
          orderDetails.containerType === ContainerType["Container Khô"]
        ) {
          // Nếu là container khô (type 1), lấy cả tractor loại 1 và loại 2
          // Không cần lọc gì thêm vì đã lấy tất cả
        }
      }

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

        if (
          response.data &&
          response.data.trailers &&
          response.data.trailers.items
        ) {
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
        ...onDutyTrailers.filter(
          (onDutyTrailer) =>
            !activeTrailers.some(
              (activeTrailer) =>
                activeTrailer.trailerId === onDutyTrailer.trailerId
            )
        ),
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

  const handleCreateTripChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as string;
    const value = event.target.value as string;

    setCreateTripData({
      ...createTripData,
      [name]: value,
    });

    if (name === "tractorId") {
      const selectedTractor = tractors.find(
        (tractor) => tractor.tractorId === value
      );
      setTractorMaxLoadWeight(selectedTractor?.maxLoadWeight || null);
    }

    if (name === "TrailerId") {
      const selectedTrailer = trailers.find(
        (trailer) => trailer.trailerId === value
      );
      setTrailerMaxLoadWeight(selectedTrailer?.maxLoadWeight || null);
    }
  };

  const handleCreateTrip = async () => {
    setCreateTripLoading(true);

    try {
      if (
        !createTripData.orderId ||
        !createTripData.driverId ||
        !createTripData.tractorId ||
        !createTripData.TrailerId
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      const successMessage = "Tạo chuyến đi thành công";

      console.log("Creating trip with data:", createTripData);
      await manualCreateTrip(createTripData);

      setCreateTripSuccess(successMessage);

      setLoadingSnackbar({
        open: true,
        message: "Đã xếp chuyến đi cho đơn hàng.",
        severity: "success",
        autoHideDuration: 3000,
      });

      setTimeout(() => {
        setCreateTripSuccess(null);
      }, 5000);

      handleCloseCreateTripDialog();

      setTimeout(() => {
        fetchData(); // Refresh trip data
      }, 4000);
    } catch (err: any) {
      console.error("Error creating trip:", err);

      const errorMessage = "Không thể tạo chuyến đi. Vui lòng thử lại sau.";

      setCreateTripError(errorMessage);

      setLoadingSnackbar({
        open: true,
        message:
          "Đã có lỗi xảy ra khi tạo chuyến cho đơn hàng. Vui lòng thử lại!",
        severity: "error",
        autoHideDuration: 3000,
      });

      setTimeout(() => {
        setCreateTripError(null);
      }, 5000);
    } finally {
      setCreateTripLoading(false);
    }
  };

  const handleAutoScheduleTrip = async () => {
    // Hiển thị thông báo đang xử lý và không tự động đóng
    setLoadingSnackbar({
      open: true,
      message: "Đang xếp chuyến tự động...",
      severity: "info",
      autoHideDuration: null, // Không tự động đóng
    });

    try {
      if (!orderId) {
        throw new Error("Không tìm thấy mã đơn hàng");
      }

      console.log("Auto scheduling trip for order:", orderId);
      const result = await autoScheduleTrip(orderId);
      console.log("Auto scheduling result:", result);

      if (result.status == 1) {
        // Cập nhật state thành công
        setAutoScheduleSuccess("Đã tạo chuyến cho đơn hàng!");

        // Cập nhật snackbar hiện tại thành thông báo thành công
        setLoadingSnackbar({
          open: true,
          message: "Đã xếp chuyến thành công cho đơn hàng!",
          severity: "success",
          autoHideDuration: 3000,
        });

        // Wait for the success notification to complete before refreshing data
        setTimeout(() => {
          fetchData(); // Refresh trip data
        }, 4000);

        setTimeout(() => {
          setAutoScheduleSuccess(null);
        }, 5000);
      } else if (result.status == -1) {
        // Use the message from API response for error message
        setAutoScheduleError(
          "Không tìm thấy tài xế, đầu kéo hoặc rơ-moóc phù hợp!"
        );

        // Cập nhật snackbar hiện tại thành thông báo lỗi
        setLoadingSnackbar({
          open: true,
          message: "Không tìm thấy tài xế, đầu kéo hoặc rơ-moóc phù hợp!",
          severity: "error",
          autoHideDuration: 3000,
        });

        setTimeout(() => {
          setAutoScheduleError(null);
        }, 5000);
      }
    } catch (error: any) {
      setAutoScheduleError(
        error?.message || "Có lỗi xảy ra khi xếp chuyến tự động"
      );

      // Cập nhật snackbar hiện tại thành thông báo lỗi
      setLoadingSnackbar({
        open: true,
        message: `${
          error?.message || error || "Có lỗi xảy ra"
        } Vui lòng tạo chuyến thủ công.`,
        severity: "error",
        autoHideDuration: 5000,
      });

      setTimeout(() => {
        setAutoScheduleError(null);
      }, 5000);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!orderDetails || !orderId) return;

    setIsSubmitting(true);
    // Clear any existing error first
    setError(null);

    try {
      console.log("Updating payment status for order:", orderId);
      const result = await updatePaymentStatus(orderId);
      console.log("Payment status updated successfully:", result);

      const statusText =
        orderDetails.isPay === IsPay.Yes ? "Chưa thanh toán" : "Đã thanh toán";
      setUpdateSuccess(
        `Trạng thái thanh toán đã được cập nhật thành công: ${statusText}`
      );
      fetchData();

      // Close the confirmation dialog after successful update
      setPaymentConfirmationOpen(false);

      // Reset checkbox states for next time
      setConfirmCheckbox1(false);
      setConfirmCheckbox2(false);

      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError(
        "Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImagePreview = (src: string, title: string = "Image Preview") => {
    setImagePreview({
      open: true,
      src,
      title,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      ...imagePreview,
      open: false,
    });
  };

  // Hàm phát hiện loại file và hiển thị phù hợp
  const handleFileClick = (
    fileUrl: string,
    fileName: string,
    fileType: string | null
  ) => {
    // Kiểm tra loại file dựa trên phần mở rộng
    const fileExtension = fileUrl.split(".").pop()?.toLowerCase();

    // Phát hiện loại file
    const isPdf =
      fileExtension === "pdf" ||
      fileType === "PDF Document" ||
      (fileType && fileType.toLowerCase().includes("pdf"));
    const isDocx =
      fileExtension === "doc" ||
      fileExtension === "docx" ||
      fileType === "Word Document" ||
      (fileType && fileType.toLowerCase().includes("word"));
    const isXlsx =
      fileExtension === "xls" ||
      fileExtension === "xlsx" ||
      fileType === "Excel Spreadsheet" ||
      (fileType && fileType.toLowerCase().includes("excel"));
    const isPptx =
      fileExtension === "ppt" ||
      fileExtension === "pptx" ||
      fileType === "PowerPoint Presentation" ||
      (fileType && fileType.toLowerCase().includes("powerpoint"));
    const isOfficeFile = isDocx || isXlsx || isPptx;

    // Xác định nếu là ảnh
    const isImage = fileType
      ? fileType === "Image" || fileType.toLowerCase().includes("image/")
      : /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileUrl);

    // Hiển thị file theo loại phù hợp
    if (isImage) {
      // Nếu là ảnh, hiển thị trong image preview
      openImagePreview(fileUrl, fileName);
    } else if (isPdf) {
      // Nếu là PDF, hiển thị trong Document Preview
      setDocumentPreview({
        open: true,
        src: fileUrl,
        title: fileName,
        fileType: "pdf",
      });
    } else {
      // Các loại file khác (bao gồm Office files), mở trong tab mới để tải xuống
      window.open(
        `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`,
        "_blank"
      );
    }
  };

  const handleCancelOrderDialogOpen = () => {
    setCancelOrderDialogOpen(true);
  };

  const handleCancelOrderDialogClose = () => {
    setCancelOrderDialogOpen(false);
  };

  const handleCancelFinalConfirmOpen = () => {
    handleCancelOrderDialogClose();
    setCancelFinalConfirmDialogOpen(true);
  };

  const handleCancelFinalConfirmClose = () => {
    setCancelFinalConfirmDialogOpen(false);
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setCancelOrderLoading(true);
    setError(null);

    try {
      await cancelOrder(orderId);

      // Hiển thị thông báo thành công bằng snackbar
      setLoadingSnackbar({
        open: true,
        message: "Đơn hàng đã được hủy thành công!",
        severity: "success",
        autoHideDuration: 3000,
      });

      handleCancelFinalConfirmClose();

      // Force reload the page after a short delay
      setTimeout(() => {
        fetchData();
      }, 4000);
    } catch (err: any) {
      console.error("Error cancelling order:", err);

      // Handle specific error for invalid order status
      if (err.message === "ORDER_STATUS_INVALID_FOR_CANCEL") {
        setLoadingSnackbar({
          open: true,
          message:
            "Chỉ có thể hủy đơn hàng khi trạng thái là Đang xử lý hoặc Đã lên lịch.",
          severity: "error",
          autoHideDuration: 5000,
        });
      } else {
        setLoadingSnackbar({
          open: true,
          message: "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
          severity: "error",
          autoHideDuration: 5000,
        });
      }
    } finally {
      setCancelOrderLoading(false);
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
    completeTime: orderDetails.completeTime
      ? new Date(orderDetails.completeTime)
      : null,
    note: orderDetails.note || "",
    containerType: orderDetails.containerType,
    containerSize:
      orderDetails.containerSize || ContainerSize["Container 20 FEET"],
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
          {/* Show update info button only for Pending orders and Staff role */}
          {orderDetails.status === OrderStatus.Pending &&
            user?.role === "Staff" && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleOpenEditDialog}
              >
                Cập nhật thông tin
              </Button>
            )}
          {/* Show payment status button for all orders except those already paid */}
          {orderDetails.isPay !== IsPay.Yes && user?.role === "Staff" && (
            <Button
              variant="outlined"
              color={orderDetails.isPay === IsPay.Yes ? "success" : "warning"}
              startIcon={
                orderDetails.isPay === IsPay.Yes ? (
                  <CheckCircleIcon />
                ) : (
                  <PaymentIcon />
                )
              }
              onClick={() => setPaymentConfirmationOpen(true)}
            >
              Cập nhật Thanh Toán
            </Button>
          )}
          {/* Add cancel button for Staff users when order is in Pending or Scheduled state */}
          {(orderDetails.status === OrderStatus.Pending ||
            orderDetails.status === OrderStatus.Scheduled) &&
            user?.role === "Staff" && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleCancelOrderDialogOpen}
              >
                Hủy đơn hàng
              </Button>
            )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                background: "linear-gradient(90deg, #1976d2 0%, #2196f3 100%)",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3, // Negative margin to extend to the edges
                mt: -3, // Negative margin to remove top padding
                px: 3, // Add padding on sides to match parent padding
                pt: 1.5, // Add padding on top to match parent padding
                pb: 1.5, // Keep the original padding-bottom
              }}
            >
              <InfoIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin chung
              </Typography>
            </Box>

            {/* <Divider sx={{ mb: 0 }} /> */}

            <Box mt={3}>
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
                      color={
                        getPaymentStatusDisplay(orderDetails.isPay).color as any
                      }
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
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                      color: "primary.main",
                      cursor: "pointer",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      position: "relative",
                      transition: "all 0.3s ease",
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        width: "0%",
                        height: "2px",
                        bottom: 0,
                        left: 0,
                        backgroundColor: "primary.dark",
                        transition: "width 0.3s ease",
                      },
                      "&:hover": {
                        color: "primary.dark",
                        "&:after": {
                          width: "100%",
                        },
                      },
                    }}
                    onClick={() =>
                      orderDetails.customerId &&
                      navigate(`${prefix}/customers/${orderDetails.customerId}`)
                    }
                  >
                    {orderDetails.companyName || "N/A"}
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
                    {getContainerSizeName(
                      orderDetails.containerSize ||
                        ContainerSize["Container 20 FEET"]
                    )}
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

                {orderDetails.containerType ===
                  ContainerType["Container Lạnh"] && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nhiệt độ
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {orderDetails.temperature !== null
                        ? `${orderDetails.temperature}°C`
                        : "N/A"}
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
                    Ước lượng thời gian tài xế chạy
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {orderDetails.completionTime || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDateTime(orderDetails.createdDate)}
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

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày chỉnh sửa
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDateTime(orderDetails.modifiedDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người chỉnh sửa
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {orderDetails.modifiedBy || "N/A"}
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
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3,
                mt: -3,
                px: 3,
                pt: 1.5,
                pb: 1.5,
              }}
            >
              <LocationOnIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin địa điểm
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 2 }} /> */}

            <Box mt={3}>
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
                    Tổng quãng đường
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {orderDetails.distance
                      ? `${orderDetails.distance} km`
                      : "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3,
                mt: -3,
                px: 3,
                pt: 1.5,
                pb: 1.5,
              }}
            >
              <ContactsIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin liên hệ
              </Typography>
            </Box>

            {/* <Divider sx={{ mb: 2 }} /> */}

            <Box mt={3}>
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
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              display="flex"
              // justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3,
                mt: -3,
                px: 3,
                pt: 1.5,
                pb: 1.5,
              }}
            >
              <FolderIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Tài liệu hồ sơ
              </Typography>
            </Box>
            {/* <Divider sx={{ mb: 2 }} /> */}

            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Tài liệu đơn hàng
              </Typography>
              {orderDetails.orderFiles && orderDetails.orderFiles.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                    gridAutoFlow: "dense",
                  }}
                >
                  {orderDetails.orderFiles.map((fileObj, index) => {
                    const fileUrl =
                      typeof fileObj === "string" ? fileObj : fileObj.fileUrl;
                    const fileName =
                      typeof fileObj === "string"
                        ? `Tài liệu ${index + 1}`
                        : fileObj.fileName;
                    const fileType =
                      typeof fileObj === "string" ? null : fileObj.fileType;
                    const description =
                      typeof fileObj === "string" ? null : fileObj.description;
                    const notes =
                      typeof fileObj === "string" ? null : fileObj.note;

                    const isImage = fileType
                      ? fileType === "Image" ||
                        fileType.toLowerCase().includes("image/")
                      : /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileUrl);

                    const isPdf =
                      fileType === "PDF Document" ||
                      (fileType && fileType.toLowerCase().includes("pdf")) ||
                      fileUrl.toLowerCase().endsWith(".pdf");

                    const isXlsx =
                      fileType === "Excel Spreadsheet" ||
                      (fileType && fileType.toLowerCase().includes("excel")) ||
                      fileUrl.toLowerCase().endsWith(".xls") ||
                      fileUrl.toLowerCase().endsWith(".xlsx");

                    const isDocx =
                      fileType === "Word Document" ||
                      (fileType && fileType.toLowerCase().includes("word")) ||
                      fileUrl.toLowerCase().endsWith(".doc") ||
                      fileUrl.toLowerCase().endsWith(".docx");

                    const isPptx =
                      fileType === "PowerPoint Presentation" ||
                      (fileType &&
                        fileType.toLowerCase().includes("powerpoint")) ||
                      fileUrl.toLowerCase().endsWith(".ppt") ||
                      fileUrl.toLowerCase().endsWith(".pptx");

                    return (
                      <Card
                        key={`order-file-${index}`}
                        sx={{
                          gridColumn: "span 1",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          height: 180, // Tăng chiều cao để hiển thị đủ mô tả và ghi chú
                          width: "100%",
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 1,
                            "&:last-child": { pb: 1 },
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            overflow: "hidden",
                          }}
                        >
                          {isImage ? (
                            <>
                              <Box
                                component="img"
                                src={fileUrl}
                                alt={fileName || `Order file ${index + 1}`}
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                }}
                                onClick={() =>
                                  openImagePreview(fileUrl, fileName)
                                }
                              />
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={fileName || `Hình ảnh ${index + 1}`}
                                >
                                  {fileName || `Hình ảnh ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isPdf ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    fileUrl,
                                    fileName || `file-${index + 1}`,
                                    fileType
                                  )
                                }
                              >
                                <PictureAsPdfIcon
                                  sx={{ fontSize: 40, color: "#f44336" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem PDF
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #f44336 0%, #ff9800 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    fileName || `PDF Document ${index + 1}`
                                  }
                                >
                                  {fileName || `PDF Document ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isXlsx ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    fileUrl,
                                    fileName || `file-${index + 1}`,
                                    fileType
                                  )
                                }
                              >
                                <ArticleIcon
                                  sx={{ fontSize: 40, color: "#4caf50" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem Excel
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={fileName || `Excel File ${index + 1}`}
                                >
                                  {fileName || `Excel File ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isDocx ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    fileUrl,
                                    fileName || `file-${index + 1}`,
                                    fileType
                                  )
                                }
                              >
                                <DescriptionIcon
                                  sx={{ fontSize: 40, color: "#1976d2" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem Word
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    fileName || `Word Document ${index + 1}`
                                  }
                                >
                                  {fileName || `Word Document ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isPptx ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    fileUrl,
                                    fileName || `file-${index + 1}`,
                                    fileType
                                  )
                                }
                              >
                                <ArticleIcon
                                  sx={{ fontSize: 40, color: "#ff9800" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem PowerPoint
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    fileName || `PowerPoint File ${index + 1}`
                                  }
                                >
                                  {fileName || `PowerPoint File ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    fileUrl,
                                    fileName || `file-${index + 1}`,
                                    fileType
                                  )
                                }
                              >
                                <AttachFileIcon
                                  sx={{ fontSize: 40, color: "#757575" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem tài liệu
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #757575 0%, #bdbdbd 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={fileName || `File ${index + 1}`}
                                >
                                  {fileName || `File ${index + 1}`}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {(description || notes) && (
                            <Box
                              sx={{
                                borderTop: "1px dashed rgba(0, 0, 0, 0.12)",
                                mt: 1,
                                pt: 0.5,
                                overflow: "hidden",
                                flex: 1,
                                maxHeight: 60, // Tăng maxHeight để hiển thị đủ nội dung
                              }}
                            >
                              {description && (
                                <Box
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    component="span"
                                    sx={{ fontWeight: "medium" }}
                                  >
                                    Mô tả:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{ ml: 0.5 }}
                                    noWrap={false}
                                    title={description}
                                  >
                                    {description}
                                  </Typography>
                                </Box>
                              )}

                              {notes && (
                                <Box
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    component="span"
                                    sx={{ fontWeight: "medium" }}
                                  >
                                    Ghi chú:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{ ml: 0.5 }}
                                    noWrap={false}
                                    title={notes}
                                  >
                                    {notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
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
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                    gridAutoFlow: "dense",
                  }}
                >
                  {contractFiles.map((file, index) => {
                    const isPdf =
                      file.fileType === "PDF Document" ||
                      (file.fileType &&
                        file.fileType.toLowerCase().includes("pdf")) ||
                      file.fileUrl.toLowerCase().endsWith(".pdf");

                    const isDocx =
                      file.fileType === "Word Document" ||
                      (file.fileType &&
                        file.fileType.toLowerCase().includes("word")) ||
                      file.fileUrl.toLowerCase().endsWith(".doc") ||
                      file.fileUrl.toLowerCase().endsWith(".docx");

                    const isXlsx =
                      file.fileType === "Excel Spreadsheet" ||
                      (file.fileType &&
                        file.fileType.toLowerCase().includes("excel")) ||
                      file.fileUrl.toLowerCase().endsWith(".xls") ||
                      file.fileUrl.toLowerCase().endsWith(".xlsx");

                    const isPptx =
                      file.fileType === "PowerPoint Presentation" ||
                      (file.fileType &&
                        file.fileType.toLowerCase().includes("powerpoint")) ||
                      file.fileUrl.toLowerCase().endsWith(".ppt") ||
                      file.fileUrl.toLowerCase().endsWith(".pptx");

                    const isOfficeFile = isDocx || isXlsx || isPptx;

                    const isImage =
                      file.fileType === "Image" ||
                      (file.fileType &&
                        file.fileType.toLowerCase().includes("image/")) ||
                      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.fileUrl);

                    const description =
                      typeof file === "string" ? null : file.description;
                    const notes = typeof file === "string" ? null : file.note;

                    return (
                      <Card
                        key={file.fileId || `contract-file-${index}`}
                        sx={{
                          gridColumn: "span 1",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          height: 180, // Tăng chiều cao để hiển thị đủ mô tả và ghi chú
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 1,
                            "&:last-child": { pb: 1 },
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            overflow: "hidden",
                          }}
                        >
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
                                  height: 80,
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                }}
                                onClick={() =>
                                  openImagePreview(
                                    file.fileUrl,
                                    file.fileName ||
                                      `Contract image ${index + 1}`
                                  )
                                }
                              />
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    file.fileName || `Hình ảnh ${index + 1}`
                                  }
                                >
                                  {file.fileName || `Hình ảnh ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isPdf ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    file.fileUrl,
                                    file.fileName ||
                                      `contract-file-${index + 1}`,
                                    file.fileType
                                  )
                                }
                              >
                                <PictureAsPdfIcon
                                  sx={{ fontSize: 40, color: "#f44336" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem PDF
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #f44336 0%, #ff9800 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    file.fileName || `PDF Document ${index + 1}`
                                  }
                                >
                                  {file.fileName || `PDF Document ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isXlsx ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    file.fileUrl,
                                    file.fileName ||
                                      `contract-file-${index + 1}`,
                                    file.fileType
                                  )
                                }
                              >
                                <ArticleIcon
                                  sx={{ fontSize: 40, color: "#4caf50" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem Excel
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    file.fileName || `Excel File ${index + 1}`
                                  }
                                >
                                  {file.fileName || `Excel File ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isDocx ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    file.fileUrl,
                                    file.fileName ||
                                      `contract-file-${index + 1}`,
                                    file.fileType
                                  )
                                }
                              >
                                <DescriptionIcon
                                  sx={{ fontSize: 40, color: "#1976d2" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem Word
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    file.fileName ||
                                    `Word Document ${index + 1}`
                                  }
                                >
                                  {file.fileName ||
                                    `Word Document ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : isPptx ? (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    file.fileUrl,
                                    file.fileName ||
                                      `contract-file-${index + 1}`,
                                    file.fileType
                                  )
                                }
                              >
                                <ArticleIcon
                                  sx={{ fontSize: 40, color: "#ff9800" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem PowerPoint
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    file.fileName ||
                                    `PowerPoint File ${index + 1}`
                                  }
                                >
                                  {file.fileName ||
                                    `PowerPoint File ${index + 1}`}
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "#f5f5f5",
                                  cursor: "pointer",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                onClick={() =>
                                  handleFileClick(
                                    file.fileUrl,
                                    file.fileName ||
                                      `contract-file-${index + 1}`,
                                    file.fileType
                                  )
                                }
                              >
                                <AttachFileIcon
                                  sx={{ fontSize: 40, color: "#757575" }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                  Xem tài liệu
                                </Typography>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4px",
                                    background:
                                      "linear-gradient(90deg, #757575 0%, #bdbdbd 100%)",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  mt={0.5}
                                  noWrap
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                  title={
                                    file.fileName ||
                                    `Tài liệu hợp đồng ${index + 1}`
                                  }
                                >
                                  {file.fileName ||
                                    `Tài liệu hợp đồng ${index + 1}`}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {(description || notes) && (
                            <Box
                              sx={{
                                borderTop: "1px dashed rgba(0, 0, 0, 0.12)",
                                mt: 1,
                                pt: 0.5,
                                overflow: "hidden",
                                flex: 1,
                                maxHeight: 60, // Tăng maxHeight để hiển thị đủ nội dung
                              }}
                            >
                              {description && (
                                <Box
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    component="span"
                                    sx={{ fontWeight: "medium" }}
                                  >
                                    Mô tả:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{ ml: 0.5 }}
                                    noWrap={false}
                                    title={description}
                                  >
                                    {description}
                                  </Typography>
                                </Box>
                              )}

                              {notes && (
                                <Box
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    component="span"
                                    sx={{ fontWeight: "medium" }}
                                  >
                                    Ghi chú:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{ ml: 0.5 }}
                                    noWrap={false}
                                    title={notes}
                                  >
                                    {notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
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
              // justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: -3,
                mt: -3,
                px: 3,
                pt: 1.5,
                pb: 1.5,
              }}
            >
              <DirectionsIcon sx={{ color: "inherit" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Thông tin chuyến đi
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {createTripSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {createTripSuccess}
              </Alert>
            )}

            {autoScheduleSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {autoScheduleSuccess}
              </Alert>
            )}

            {autoScheduleError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {autoScheduleError}
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

            {!tripLoading && !tripError && (
              <>
                {/* Case 1: No trips exist */}
                {(!tripData || tripData.length === 0) && (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Chưa có thông tin chuyến đi cho đơn hàng này
                    </Alert>

                    {orderDetails.orderFiles &&
                    orderDetails.orderFiles.length > 0 &&
                    contractFiles &&
                    contractFiles.length > 0 ? (
                      <Box display="flex" justifyContent="space-between">
                        {user?.role === "Staff" && (
                          <>
                            <Box display="flex" justifyContent="center" mt={2}>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAutoScheduleTrip}
                                disabled={autoScheduleLoading}
                              >
                                {autoScheduleLoading
                                  ? "Đang xếp chuyến..."
                                  : "Hệ thống xếp chuyến"}
                              </Button>
                            </Box>

                            <Box display="flex" justifyContent="center" mt={2}>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreateTripDialog}
                              >
                                Tạo chuyến thủ công
                              </Button>
                            </Box>
                          </>
                        )}
                      </Box>
                    ) : (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Cần có tài liệu đơn hàng và tài liệu hợp đồng để tạo
                        chuyến đi
                      </Alert>
                    )}
                  </>
                )}

                {/* Case 2: Trips exist */}
                {tripData && tripData.length > 0 && (
                  <>
                    {/* Check if all trips are canceled to show create buttons */}
                    {tripData.every((trip) => trip.status === "canceled") &&
                      orderDetails.orderFiles &&
                      orderDetails.orderFiles.length > 0 &&
                      contractFiles &&
                      contractFiles.length > 0 &&
                      user?.role === "Staff" && (
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Box display="flex" justifyContent="center" mt={2}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={handleAutoScheduleTrip}
                              disabled={autoScheduleLoading}
                            >
                              {autoScheduleLoading
                                ? "Đang xếp chuyến..."
                                : "Hệ thống xếp chuyến"}
                            </Button>
                          </Box>

                          <Box display="flex" justifyContent="center" mt={2}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={handleOpenCreateTripDialog}
                            >
                              Tạo chuyến thủ công
                            </Button>
                          </Box>
                        </Box>
                      )}

                    {/* Display trips */}
                    {tripData.map((trip, index) => (
                      <Box
                        key={trip.tripId || index}
                        sx={{
                          mb: index < tripData.length - 1 ? 3 : 0,
                          pb: index < tripData.length - 1 ? 3 : 0,
                          borderBottom:
                            index < tripData.length - 1
                              ? "1px dashed rgba(0, 0, 0, 0.12)"
                              : "none",
                        }}
                      >
                        {index > 0 && (
                          <Typography
                            variant="subtitle1"
                            fontWeight="medium"
                            gutterBottom
                            mt={2}
                          >
                            Chuyến đi {index + 1}
                          </Typography>
                        )}
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={1}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Trạng thái chuyến đi
                              </Typography>
                              <Chip
                                size="small"
                                label={getTripStatusDisplay(trip.status).label}
                                color={
                                  getTripStatusDisplay(trip.status).color as any
                                }
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Mã chuyến đi
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {trip.tripId || "N/A"}
                            </Typography>
                          </Grid>

                          {trip.driverId && (
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Mã tài xế
                              </Typography>
                              <Typography
                                variant="body1"
                                gutterBottom
                                sx={{
                                  color: "primary.main",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  position: "relative",
                                  transition: "all 0.3s ease",
                                  "&:after": {
                                    content: '""',
                                    position: "absolute",
                                    width: "0%",
                                    height: "2px",
                                    bottom: 0,
                                    left: 0,
                                    backgroundColor: "primary.dark",
                                    transition: "width 0.3s ease",
                                  },
                                  "&:hover": {
                                    color: "primary.dark",
                                    "&:after": {
                                      width: "100%",
                                    },
                                  },
                                }}
                                onClick={() =>
                                  navigate(`${prefix}/drivers/${trip.driverId}`)
                                }
                              >
                                <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />{" "}
                                {trip.driverName}
                              </Typography>
                            </Grid>
                          )}

                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Thời gian bắt đầu
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {formatDateTime(trip.startTime)}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Thời gian kết thúc
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {formatDateTime(trip.endTime)}
                            </Typography>
                          </Grid>

                          {trip.tripId && (
                            <Grid item xs={12}>
                              <Box mt={1}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<DirectionsIcon />}
                                  onClick={() =>
                                    navigate(`${prefix}/trips/${trip.tripId}`)
                                  }
                                >
                                  Chi tiết chuyến đi
                                </Button>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    ))}
                  </>
                )}
              </>
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
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
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
          <Button onClick={handleStatusUpdateClose}>Hủy</Button>
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
          sx: { borderRadius: 2, maxHeight: "90vh" },
        }}
      >
        <DialogTitle>
          Cập nhật đơn hàng - {orderDetails?.trackingCode}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <form onSubmit={handleSubmit(onSubmitEditForm)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Người liên hệ"
                    {...register("contactPerson")}
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                    margin="normal"
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại liên hệ"
                    {...register("contactPhone")}
                    error={!!errors.contactPhone}
                    helperText={errors.contactPhone?.message}
                    margin="normal"
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số container"
                    {...register("containerNumber")}
                    error={!!errors.containerNumber}
                    helperText={errors.containerNumber?.message}
                    margin="normal"
                    required
                    disabled={isSubmitting}
                    inputProps={{
                      style: { textTransform: "uppercase" },
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      const formatted = value.replace(/[^A-Z0-9]/g, "");
                      setValue("containerNumber", formatted, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá (VNĐ)"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    margin="normal"
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  {orderDetails?.containerType ===
                    ContainerType["Container Lạnh"] && (
                    <TextField
                      fullWidth
                      label="Nhiệt độ (°C)"
                      type="number"
                      {...register("temperature", { valueAsNumber: true })}
                      error={!!errors.temperature}
                      helperText={errors.temperature?.message}
                      margin="normal"
                      required={
                        orderDetails?.containerType ===
                        ContainerType["Container Lạnh"]
                      }
                      disabled={isSubmitting}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Người đặt hàng"
                    {...register("orderPlacer")}
                    error={!!errors.orderPlacer}
                    helperText={errors.orderPlacer?.message}
                    margin="normal"
                    required
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    {...register("note")}
                    error={!!errors.note}
                    helperText={errors.note?.message}
                    multiline
                    rows={3}
                    margin="normal"
                    disabled={isSubmitting}
                  />
                </Grid>
                {/* <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editFormData.isPay === IsPay.Yes}
                        onChange={handleSwitchChange}
                        color="primary"
                      />
                    }
                    label="Đã thanh toán"
                    disabled={isSubmitting}
                  />
                </Grid> */}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Quản lý tài liệu đơn hàng
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {orderDetails?.orderFiles &&
                  orderDetails.orderFiles.length > 0 ? (
                    <Box mb={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tài liệu hiện tại
                      </Typography>
                      <List>
                        {orderDetails.orderFiles.map((fileObj, index) => {
                          const fileUrl =
                            typeof fileObj === "string"
                              ? fileObj
                              : fileObj.fileUrl;
                          const fileName =
                            typeof fileObj === "string"
                              ? `Tài liệu ${index + 1}`
                              : fileObj.fileName || `Tài liệu ${index + 1}`;

                          return (
                            <ListItem key={index} dense>
                              <ListItemText
                                primary={fileName}
                                secondary={
                                  filesToDelete.includes(fileUrl)
                                    ? "Sẽ bị xóa"
                                    : ""
                                }
                              />
                              <ListItemSecondaryAction>
                                <Checkbox
                                  edge="end"
                                  onChange={() => handleFileToggle(fileUrl)}
                                  checked={filesToDelete.includes(fileUrl)}
                                  color="error"
                                  disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    >
                      Chọn tệp
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleNewFileChange}
                        disabled={isSubmitting}
                      />
                    </Button>

                    {newFiles.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tệp đã chọn:
                        </Typography>
                        {newFiles.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              mb: 3,
                              p: 2,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography variant="body2">
                                {file.name}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveNewFile(index)}
                                disabled={isSubmitting}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <TextField
                              label="Mô tả file"
                              value={fileDescriptions[index] || ""}
                              onChange={(e) =>
                                handleFileDescriptionChange(
                                  index,
                                  e.target.value
                                )
                              }
                              fullWidth
                              margin="normal"
                              size="small"
                              disabled={isSubmitting}
                            />

                            <TextField
                              label="Ghi chú file"
                              value={fileNotes[index] || ""}
                              onChange={(e) =>
                                handleFileNoteChange(index, e.target.value)
                              }
                              fullWidth
                              margin="normal"
                              size="small"
                              disabled={isSubmitting}
                            />
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Buttons for submission and cancel */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 3,
                  gap: 2,
                }}
              >
                <Button onClick={handleCloseEditDialog}>Hủy</Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
                </Button>
              </Box>
            </form>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openCreateTripDialog}
        onClose={handleCloseCreateTripDialog}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Tạo chuyến đi mới</DialogTitle>
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
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
                    {driver.fullName} - {driver.phoneNumber || "Không có SĐT"}
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
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang
                        tải...
                      </Box>
                    </MenuItem>
                  ) : tractors.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không tìm thấy đầu kéo
                    </MenuItem>
                  ) : (
                    tractors.map((tractor) => (
                      <MenuItem
                        key={tractor.tractorId}
                        value={tractor.tractorId}
                      >
                        {tractor.licensePlate} -{" "}
                        {tractor.brand || "Không rõ hãng"}
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
                value={
                  tractorMaxLoadWeight !== null
                    ? `${tractorMaxLoadWeight} tấn`
                    : ""
                }
                InputProps={{ readOnly: true }}
                sx={{
                  mt: 2,
                  "& .MuiInputBase-input": {
                    color: "text.secondary",
                    bgcolor: "action.hover",
                  },
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
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang
                        tải...
                      </Box>
                    </MenuItem>
                  ) : trailers.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không tìm thấy rơ moóc
                    </MenuItem>
                  ) : (
                    trailers.map((trailer) => (
                      <MenuItem
                        key={trailer.trailerId}
                        value={trailer.trailerId}
                      >
                        {trailer.licensePlate} -{" "}
                        {trailer.brand || "Không rõ hãng"}
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
                value={
                  trailerMaxLoadWeight !== null
                    ? `${trailerMaxLoadWeight} tấn`
                    : ""
                }
                InputProps={{ readOnly: true }}
                sx={{
                  mt: 2,
                  "& .MuiInputBase-input": {
                    color: "text.secondary",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCreateTripDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreateTrip}
            disabled={
              createTripLoading ||
              !createTripData.driverId ||
              !createTripData.tractorId ||
              !createTripData.TrailerId
            }
          >
            {createTripLoading ? "Đang tạo..." : "Tạo chuyến đi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={paymentConfirmationOpen}
        onClose={() => setPaymentConfirmationOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Xác nhận cập nhật trạng thái thanh toán</DialogTitle>
        <DialogContent sx={{ pt: 1, width: 400 }}>
          <Typography variant="body2" gutterBottom>
            Vui lòng xác nhận các điều kiện sau trước khi cập nhật trạng thái
            thanh toán:
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCheckbox1}
                onChange={(e) => setConfirmCheckbox1(e.target.checked)}
              />
            }
            label="Tôi đã kiểm tra và xác nhận thông tin thanh toán là chính xác."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCheckbox2}
                onChange={(e) => setConfirmCheckbox2(e.target.checked)}
              />
            }
            label="Tôi hiểu rằng việc cập nhật trạng thái thanh toán là không thể hoàn tác."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPaymentConfirmationOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleUpdatePaymentStatus}
            disabled={!confirmCheckbox1 || !confirmCheckbox2 || isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={imagePreview.open}
        onClose={closeImagePreview}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center" }}>
          <ImageIcon sx={{ mr: 1 }} color="primary" />
          {imagePreview.title}
          <IconButton
            onClick={closeImagePreview}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, textAlign: "center", bgcolor: "#f5f5f5" }}>
          <img
            src={imagePreview.src}
            alt={imagePreview.title}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              padding: 16,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            component="a"
            href={imagePreview.src}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            variant="outlined"
          >
            Mở trong cửa sổ mới
          </Button>
          <Button
            onClick={closeImagePreview}
            color="primary"
            variant="contained"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={documentPreview.open}
        onClose={() => setDocumentPreview({ ...documentPreview, open: false })}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 2, height: "80vh" } }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center" }}>
          {documentPreview.fileType === "pdf" && (
            <PictureAsPdfIcon sx={{ mr: 1 }} color="error" />
          )}
          {documentPreview.fileType === "docx" && (
            <DescriptionIcon sx={{ mr: 1 }} color="primary" />
          )}
          {documentPreview.fileType === "xlsx" && (
            <ArticleIcon sx={{ mr: 1 }} color="success" />
          )}
          {documentPreview.fileType === "pptx" && (
            <ArticleIcon sx={{ mr: 1 }} color="warning" />
          )}
          {documentPreview.title}
          <IconButton
            onClick={() =>
              setDocumentPreview({ ...documentPreview, open: false })
            }
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            textAlign: "center",
            bgcolor: "#f5f5f5",
            height: "calc(100% - 64px)",
          }}
        >
          <iframe
            src={
              documentPreview.fileType === "pdf"
                ? documentPreview.src
                : `https://view.officeapps.live.com/op/embed.aspx?src=${documentPreview.src}`
            }
            width="100%"
            height="100%"
            frameBorder="0"
            title={documentPreview.title}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {/* <Button
            component="a"
            href={documentPreview.src}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            variant="outlined"
            download
          >
            Tải xuống
          </Button> */}
          <Button
            onClick={() =>
              setDocumentPreview({ ...documentPreview, open: false })
            }
            color="primary"
            variant="contained"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelOrderDialogOpen}
        onClose={handleCancelOrderDialogClose}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
        <DialogContent sx={{ pt: 1, width: 400 }}>
          <Typography variant="body2" gutterBottom>
            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn
            tác.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Chỉ có thể hủy đơn hàng khi trạng thái là Pending hoặc Scheduled.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelOrderDialogClose}>Đóng</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelFinalConfirmOpen}
            disabled={cancelOrderLoading}
          >
            {cancelOrderLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelFinalConfirmDialogOpen}
        onClose={handleCancelFinalConfirmClose}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Xác nhận lần cuối</DialogTitle>
        <DialogContent sx={{ pt: 1, width: 400 }}>
          <Typography variant="body2" gutterBottom>
            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn
            tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelFinalConfirmClose}>Đóng</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelOrder}
            disabled={cancelOrderLoading}
          >
            {cancelOrderLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={loadingSnackbar.open}
        autoHideDuration={loadingSnackbar.autoHideDuration}
        onClose={handleCloseLoadingSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
      >
        <Alert
          severity={loadingSnackbar.severity}
          onClose={handleCloseLoadingSnackbar}
          sx={{
            width: "100%",
            boxShadow: 3,
            border:
              loadingSnackbar.severity === "success"
                ? "1px solid #4caf50"
                : loadingSnackbar.severity === "error"
                ? "1px solid #f44336"
                : loadingSnackbar.severity === "warning"
                ? "1px solid #ff9800"
                : "1px solid #2196f3",
            "& .MuiAlert-icon": {
              fontSize: "1.25rem",
            },
            "& .MuiAlert-message": {
              fontSize: "0.95rem",
              fontWeight: 500,
            },
            animation: "fadeIn 0.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: "scale(0.9)",
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          {loadingSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetailPage;
