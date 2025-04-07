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
import { ContractFile } from "../types/contract";
import { format } from "date-fns";
import AddContractFileModal from "../components/contract/AddContractFileModal";
import OrderForm from "../forms/order/OrderForm";
import { OrderFormValues } from "../forms/order/orderSchema";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [contractFiles, setContractFiles] = useState<ContractFile[] | null>(
    null
  );
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

      // Fetch order details
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

      // Try to fetch contract files using getContracts
      try {
        if (orderData && orderData.customerId) {
          console.log(
            "Fetching contracts for customer ID:",
            orderData.customerId
          );

          // Get all contracts for this customer
          const contractsData = await getContracts(
            1,
            100,
            orderData.customerId
          );
          console.log("Contracts received:", contractsData);

          let extractedFiles: ContractFile[] = [];

          // Process all contracts for this customer to find related files
          if (Array.isArray(contractsData) && contractsData.length > 0) {
            console.log(
              `Found ${contractsData.length} contracts for customer ID: ${orderData.customerId}`
            );

            // For each contract with matching customerId AND status=1, extract contract files
            for (const contract of contractsData) {
              if (
                contract.customerId === orderData.customerId &&
                contract.status === 1 && // Only show files from active contracts
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
      case ContainerSize["Container 20 FT"]:
        return "Container 20 FT";
      case ContainerSize["Container 40 FT"]:
        return "Container 40 FT";
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
      case OrderStatus.Complete:
        return { label: "Hoàn thành", color: "success" };
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
      // Populate the edit form with current values
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
      
      // Reset file selections
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
      
      // Add empty descriptions and notes for each new file
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
      // Log values before update for debugging
      console.log("Current order details:", orderDetails);
      console.log("Updating with values:", {
        contactPhone: editFormData.contactPhone,
        contactPerson: editFormData.contactPerson,
        // other fields...
      });
      
      // Prepare update data - make sure to explicitly include every field
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
        description: fileDescriptions, // Field name for backend: descriptions
        notes: fileNotes, // Field name for backend: notes
        // Field name for backend: fileIdsToRemove
        filesToRemove: filesToDelete.length > 0 ? filesToDelete : null,
        // Field name for backend: addedFiles
        filesToAdd: newFiles.length > 0 ? newFiles : null,
      };
      
      console.log("Sending update data:", updateData);
      
      // Check if we're adding new files
      if (newFiles.length > 0) {
        console.log("Adding new files:", newFiles.map(f => f.name));
        
        // Ensure we have descriptions and notes for each file
        if (fileDescriptions.length < newFiles.length) {
          console.log("Adding missing descriptions");
          while (fileDescriptions.length < newFiles.length) {
            fileDescriptions.push('');
          }
        }
        
        if (fileNotes.length < newFiles.length) {
          console.log("Adding missing notes");
          while (fileNotes.length < newFiles.length) {
            fileNotes.push('');
          }
        }
      }
      
      const result = await updateOrder(updateData);
      console.log("Order updated successfully:", result);
      
      setUpdateSuccess("Đơn hàng đã được cập nhật thành công");
      handleCloseEditDialog();
      fetchData(); // Refresh data
      
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error updating order:", err);
      
      // Add more detailed error handling
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
    // Existing code for contract handling
    if (orderDetails && orderDetails.customerId) {
      try {
        // Get all contracts for this customer
        const contractsData = await getContracts(
          1,
          100,
          orderDetails.customerId
        );

        let extractedFiles: ContractFile[] = [];

        if (Array.isArray(contractsData) && contractsData.length > 0) {
          // For each contract with matching customerId AND status=1, extract contract files
          for (const contract of contractsData) {
            if (
              contract.customerId === orderDetails.customerId &&
              contract.status === 1 && // Only show files from active contracts
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
      // Prepare update data with just the status change
      const updateData = {
        orderId: orderId,
        status: newStatus as OrderStatus,
        // Keep all existing values from orderDetails to ensure nothing gets reset
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
      fetchData(); // Refresh data
      
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

  // Prepare initial form values for the edit dialog
  const initialFormValues: Partial<OrderFormValues> = {
    companyName: orderDetails.customerId || "",
    temperature: orderDetails.temperature || 0,
    weight: parseFloat(orderDetails.weight) || 0,
    pickUpDate: new Date(orderDetails.pickUpDate),
    deliveryDate: new Date(orderDetails.deliveryDate),
    completeTime: orderDetails.completeTime ? new Date(orderDetails.completeTime) : null,
    note: orderDetails.note || "",
    containerType: orderDetails.containerType,
    containerSize: orderDetails.containerSize || ContainerSize["Container 20 FT"],
    deliveryType: orderDetails.deliveryType,
    pickUpLocation: orderDetails.pickUpLocation,
    deliveryLocation: orderDetails.deliveryLocation,
    conReturnLocation: orderDetails.conReturnLocation,
    price: orderDetails.price,
    contactPerson: orderDetails.contactPerson,
    contactPhone: orderDetails.contactPhone,
    distance: orderDetails.distance,
    containerNumber: orderDetails.containerNumber,
    description: [], // We'll set these later if needed
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
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<EditIcon />}
            onClick={handleOpenEditDialog}
          >
            Cập nhật thông tin
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
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
                      orderDetails.status === OrderStatus.Complete
                        ? "success.main"
                        : orderDetails.status === OrderStatus.InProgress
                        ? "info.main"
                        : "warning.main",
                  }}
                >
                  {getStatusDisplay(orderDetails.status).label}
                </Typography>
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
                  {getContainerSizeName(orderDetails.containerSize || ContainerSize["Container 20 FT"])}
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

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nhiệt độ
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.temperature !== null ? `${orderDetails.temperature}°C` : "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trọng lượng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {orderDetails.weight} kg
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

        {/* Contact and Files */}
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

            {/* Order Files section - Keep this intact */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Tài liệu đơn hàng
              </Typography>
              {orderDetails.orderFiles && orderDetails.orderFiles.length > 0 ? (
                <Grid container spacing={2}>
                  {orderDetails.orderFiles.map((fileObj, index) => {
                    // Handle both string URLs and OrderFile objects
                    const fileUrl =
                      typeof fileObj === "string" ? fileObj : fileObj.fileUrl;
                    const fileName =
                      typeof fileObj === "string"
                        ? `Tài liệu ${index + 1}`
                        : fileObj.fileName;
                    const fileType =
                      typeof fileObj === "string" ? null : fileObj.fileType;

                    // Check for image types - for string URLs we'll have to guess from the extension
                    const isImage = fileType
                      ? fileType === "Image" ||
                        fileType.toLowerCase().includes("image/")
                      : /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileUrl);

                    // Check for document types
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

            {/* Contract Files section with Add button */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              <Typography variant="subtitle1" gutterBottom>
                Tài liệu hợp đồng
              </Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                variant="outlined"
                onClick={handleOpenAddContractModal}
              >
                Thêm mới
              </Button>
            </Box>
            {contractFiles && contractFiles.length > 0 ? (
              <Grid container spacing={2}>
                {contractFiles.map((file, index) => {
                  // Check if the file type is document-like (for download) or image (for display)
                  const isDocument =
                    file.fileType === "PDF Document" ||
                    file.fileType === "Word Document" ||
                    file.fileType === "Excel Spreadsheet" ||
                    file.fileType === "PowerPoint Presentation" ||
                    file.fileType === "Text Document" ||
                    file.fileType === "Archive";

                  // Check if it's an image type
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
          </Paper>
        </Grid>
      </Grid>

      {/* Add Contract File Modal */}
      {orderDetails && (
        <AddContractFileModal
          open={openAddContractModal}
          onClose={handleCloseAddContractModal}
          onSuccess={handleContractAdded}
          customerId={orderDetails.customerId}
          orderId={orderId || ""}
        />
      )}

      {/* Status Update Dialog */}
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
              <MenuItem value={OrderStatus.Complete}>
                {getStatusDisplay(OrderStatus.Complete).label}
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

      {/* Edit Order Dialog */}
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

              {/* File management section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Quản lý tài liệu đơn hàng
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Existing files list with checkboxes for deletion */}
                {orderDetails?.orderFiles && orderDetails.orderFiles.length > 0 ? (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tài liệu hiện tại
                    </Typography>
                    <List>
                      {orderDetails.orderFiles.map((fileObj, index) => {
                        // Handle both string URLs and OrderFile objects
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

                {/* Upload new files section */}
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

                  {/* Show new files that will be added */}
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

      {/* ...other existing dialogs... */}
    </Box>
  );
};

export default OrderDetailPage;
