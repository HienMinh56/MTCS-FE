import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  List,
  Checkbox,
  TablePagination,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditOutlinedIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteOutlinedIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Description as DescriptionIcon,
  Article as ArticleIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../services/customerApi";
import { OrderStatus } from "../types/order";
import { updateContract } from "../services/contractApi";
import { CustomerDetail } from "../types/customer";
import AddContractFileModal from "../components/contract/AddContractFileModal";
import { useAuth } from "../contexts/AuthContext"; // Thêm import useAuth hook

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerDetailPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user từ useAuth hook

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Edit form state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cusId: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    taxNumber: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    taxNumber: "",
    address: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Add state for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);

  // Add state for contract file modal
  const [openAddContractModal, setOpenAddContractModal] = useState(false);

  // Add state for edit contract dialog
  const [openEditContractDialog, setOpenEditContractDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [editContractForm, setEditContractForm] = useState({
    Summary: "",
    ContractId: "",
    StartDate: "",
    EndDate: "",
    Status: 1,
    CreatedBy: "",
    CreatedDate: "",
    SignedTime: "",
    SignedBy: "",
    FileIdsToRemove: [] as string[],
    AddedFiles: null as File[] | null,
  });
  const [editContractErrors, setEditContractErrors] = useState({
    StartDate: "",
    EndDate: "",
    Status: "",
  });
  const [editingContract, setEditingContract] = useState(false);

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Add state for orders pagination
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersRowsPerPage, setOrdersRowsPerPage] = useState(5);

  // Add state for contracts pagination
  const [contractsPage, setContractsPage] = useState(0);
  const [contractsRowsPerPage, setContractsRowsPerPage] = useState(5);

  // State để hiển thị image preview
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });

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

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;

      setLoading(true);
      try {
        const customerData = await getCustomerById(customerId);
        setCustomer(customerData);
        // Initialize form data with customer data
        setFormData({
          cusId: customerData.customerId,
          companyName: customerData.companyName || "",
          email: customerData.email || "",
          phoneNumber: customerData.phoneNumber || "",
          taxNumber: customerData.taxNumber || "",
          address: customerData.address || "",
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching customer details:", err);
        setError("Không thể tải thông tin khách hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/customers`);
  };

  const handleEdit = () => {
    // Open edit dialog
    setOpenEditDialog(true);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Add handlers for contract modal
  const handleOpenAddContractModal = () => {
    setOpenAddContractModal(true);
  };

  const handleCloseAddContractModal = () => {
    setOpenAddContractModal(false);
  };

  const handleContractAdded = async () => {
    if (customerId) {
      try {
        // Reload customer data to get the updated contracts
        const updatedCustomer = await getCustomerById(customerId);
        setCustomer(updatedCustomer);

        // Show success message
        setSnackbar({
          open: true,
          message: "Hợp đồng đã được thêm thành công",
          severity: "success",
        });
      } catch (error) {
        console.error(
          "Error refreshing customer data after adding contract:",
          error
        );
        setSnackbar({
          open: true,
          message:
            "Đã thêm hợp đồng nhưng không thể cập nhật dữ liệu. Vui lòng làm mới trang.",
          severity: "warning",
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerId) return;

    setDeletingCustomer(true);
    try {
      await deleteCustomer(customerId);

      setSnackbar({
        open: true,
        message: "Xóa khách hàng thành công!",
        severity: "success",
      });

      // Navigate back to customer list after successful deletion
      setTimeout(() => {
        navigate("/staff-menu/customers");
      }, 1500);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi xóa khách hàng. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setDeletingCustomer(false);
      handleCloseDeleteDialog();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    // Validate company name
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Tên công ty là bắt buộc";
      isValid = false;
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Tên công ty phải có ít nhất 2 ký tự";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]+$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại chỉ được chứa số";
      isValid = false;
    } else if (
      formData.phoneNumber.length < 10 ||
      formData.phoneNumber.length > 15
    ) {
      newErrors.phoneNumber = "Số điện thoại phải từ 10 đến 15 số";
      isValid = false;
    }

    // Validate tax number
    if (!formData.taxNumber.trim()) {
      newErrors.taxNumber = "Mã số thuế là bắt buộc";
      isValid = false;
    } else if (!phoneRegex.test(formData.taxNumber)) {
      newErrors.taxNumber = "Mã số thuế chỉ được chứa số";
      isValid = false;
    } else if (formData.taxNumber.length < 10) {
      newErrors.taxNumber = "Mã số thuế phải có ít nhất 10 số";
      isValid = false;
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
      isValid = false;
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    let success = false; // Flag to track if operation was successful

    try {
      console.log("Submitting form data:", formData);

      // Make the API request and store the response
      const response = await updateCustomer(formData);
      
      // Check if the response indicates an error (similar to createCustomer)
      if (response && typeof response === "object" && 
          (response.status === 400 || response.status === 0)) {
        // This is an error response from the server
        const errorMessage = response.message || "Lỗi dữ liệu không hợp lệ";
        throw new Error(errorMessage);
      }

      // If we get here, it was successful
      success = true;

      // Close dialog and show success message
      setSnackbar({
        open: true,
        message: "Cập nhật thông tin khách hàng thành công!",
        severity: "success",
      });

      // Reload customer data
      if (customerId) {
        const updatedCustomer = await getCustomerById(customerId);
        setCustomer(updatedCustomer);
      }
    } catch (error: any) {
      success = false; // Ensure the success flag is false
      console.error("Error updating customer:", error);

      // Handle specific validation errors from backend
      const errorMessage =
        error.message || "Lỗi khi cập nhật thông tin. Vui lòng thử lại sau.";

      // Set specific field errors based on backend validation messages - check for Vietnamese error messages
      if (errorMessage.includes("Email đã được sử dụng") || 
          errorMessage.toLowerCase().includes("email already exists")) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email đã được sử dụng bởi khách hàng khác",
        }));
      } else if (errorMessage.includes("Số điện thoại đã được sử dụng") || 
                errorMessage.toLowerCase().includes("phone number already exists")) {
        setFormErrors((prev) => ({
          ...prev,
          phoneNumber: "Số điện thoại đã được sử dụng bởi khách hàng khác",
        }));
      } else if (errorMessage.includes("Mã số thuế đã được sử dụng") || 
                errorMessage.toLowerCase().includes("tax number already exists")) {
        setFormErrors((prev) => ({
          ...prev,
          taxNumber: "Mã số thuế đã được sử dụng bởi khách hàng khác",
        }));
      }

      // Show general error message in snackbar
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      // Only close the dialog if the operation was successful
      if (success) {
        handleCloseEditDialog();
      }
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add a new function to navigate to order details
  const handleViewOrderDetail = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/orders/${orderId}`);
  };

  // Hàm xem file hợp đồng với popup preview
  const handleViewContractFile = (e: React.MouseEvent, contract: any) => {
    e.stopPropagation(); // Prevent event bubbling

    // Check if contract is an object and has contractFiles
    if (
      typeof contract === "object" &&
      contract !== null &&
      contract.contractFiles &&
      contract.contractFiles.length > 0
    ) {
      // Get the file URL from the first file in the contract
      const fileUrl = contract.contractFiles[0].fileUrl;
      const fileName =
        contract.contractFiles[0].fileName || `Contract_${contract.contractId}`;
      const fileType = contract.contractFiles[0].fileType || null;

      if (fileUrl) {
        // Sử dụng handleFileClick để mở file phù hợp với loại file
        handleFileClick(fileUrl, fileName, fileType);
      } else {
        // Show snackbar if no file URL is available
        setSnackbar({
          open: true,
          message: "Không tìm thấy URL file hợp đồng",
          severity: "error",
        });
      }
    } else {
      // Show snackbar if no contract files are available
      setSnackbar({
        open: true,
        message: "Không có file hợp đồng để xem",
        severity: "info",
      });
    }
  };

  // Replace the contract handler with a function to download file from Firebase URL
  const handleEditContractClick = (contract: any) => {
    setSelectedContract(contract);

    // Format dates for input type="datetime-local" (YYYY-MM-DDThh:mm)
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return "";
      // Make sure the date is treated as UTC to prevent timezone offsets
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    // Ensure the contract status is correctly retrieved
    // Default to 1 (active) if status is undefined/null, otherwise use the actual status
    const contractStatus =
      contract.status !== undefined && contract.status !== null
        ? Number(contract.status)
        : 1;

    setEditContractForm({
      ContractId: contract.contractId,
      StartDate: formatDateForInput(contract.startDate),
      EndDate: formatDateForInput(contract.endDate),
      Status: contractStatus,
      CreatedBy: contract.createdBy || "",
      CreatedDate: formatDateForInput(contract.createdDate) || "",
      SignedTime: formatDateForInput(contract.signedTime) || "",
      SignedBy: contract.signedBy || "",
      Summary: contract.summary || "",
      FileIdsToRemove: [],
      AddedFiles: null,
    });

    // Reset file-related states
    setFilesToRemove([]);
    setSelectedFiles([]);

    setOpenEditContractDialog(true);
  };

  const handleCloseEditContractDialog = () => {
    setOpenEditContractDialog(false);
    setSelectedContract(null);
    setEditContractErrors({
      StartDate: "",
      EndDate: "",
      Status: "",
    });
  };

  const handleContractInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditContractForm({
      ...editContractForm,
      [name]: value,
    });

    // Clear error when typing
    if (editContractErrors[name as keyof typeof editContractErrors]) {
      setEditContractErrors({
        ...editContractErrors,
        [name]: "",
      });
    }
  };

  const handleContractSelectChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = e.target.name as string;
    const value = e.target.value as number;

    console.log(`Setting ${name} to:`, value);

    setEditContractForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const handleToggleRemoveExistingFile = (fileId: string) => {
    if (filesToRemove.includes(fileId)) {
      setFilesToRemove(filesToRemove.filter((id) => id !== fileId));
    } else {
      setFilesToRemove([...filesToRemove, fileId]);
    }
  };

  const handleNewFileDescriptionChange = (index: number, value: string) => {
    const updatedFiles = [...selectedFiles];
    (updatedFiles[index] as any).description = value;
    setSelectedFiles(updatedFiles);
  };

  const handleNewFileNoteChange = (index: number, value: string) => {
    const updatedFiles = [...selectedFiles];
    (updatedFiles[index] as any).note = value;
    setSelectedFiles(updatedFiles);
  };

  const validateContractForm = () => {
    let isValid = true;
    const newErrors = { ...editContractErrors };

    if (!editContractForm.StartDate) {
      newErrors.StartDate = "Ngày bắt đầu là bắt buộc";
      isValid = false;
    }

    if (!editContractForm.EndDate) {
      newErrors.EndDate = "Ngày kết thúc là bắt buộc";
      isValid = false;
    } else if (
      new Date(editContractForm.StartDate) > new Date(editContractForm.EndDate)
    ) {
      newErrors.EndDate = "Ngày kết thúc phải sau ngày bắt đầu";
      isValid = false;
    }

    setEditContractErrors(newErrors);
    return isValid;
  };

  const handleUpdateContract = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateContractForm()) {
      return;
    }

    setEditingContract(true);
    try {
      const updateData = {
        ContractId: editContractForm.ContractId,
        StartDate: new Date(editContractForm.StartDate).toISOString(),
        EndDate: new Date(editContractForm.EndDate).toISOString(),
        Status: editContractForm.Status,
        FileIdsToRemove: filesToRemove.length > 0 ? filesToRemove : null,
        AddedFiles: selectedFiles.length > 0 ? selectedFiles : null,
      };

      console.log("Sending contract update data:", updateData);

      await updateContract(updateData);

      handleCloseEditContractDialog();
      setSnackbar({
        open: true,
        message: "Cập nhật hợp đồng thành công!",
        severity: "success",
      });

      if (customerId) {
        const updatedCustomer = await getCustomerById(customerId);
        setCustomer(updatedCustomer);
      }
    } catch (error: any) {
      console.error("Error updating contract:", error);

      setSnackbar({
        open: true,
        message:
          error.message || "Lỗi khi cập nhật hợp đồng. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setEditingContract(false);
    }
  };

  const handleOrdersChangePage = (event: unknown, newPage: number) => {
    setOrdersPage(newPage);
  };

  const handleOrdersChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOrdersRowsPerPage(parseInt(event.target.value, 10));
    setOrdersPage(0);
  };

  const handleContractsChangePage = (event: unknown, newPage: number) => {
    setContractsPage(newPage);
  };

  const handleContractsChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContractsRowsPerPage(parseInt(event.target.value, 10));
    setContractsPage(0);
  };

  const renderContractsTab = () => (
    <TabPanel value={tabValue} index={2}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Danh sách hợp đồng</Typography>
        {user?.role === "Staff" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="small"
            onClick={handleOpenAddContractModal}
          >
            Thêm hợp đồng
          </Button>
        )}
      </Box>

      {customer.contracts && customer.contracts.length > 0 ? (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Mã hợp đồng</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(customer.contracts) &&
                  customer.contracts
                    .slice(
                      contractsPage * contractsRowsPerPage,
                      contractsPage * contractsRowsPerPage +
                        contractsRowsPerPage
                    )
                    .map((contract, index) => {
                      const contractId =
                        typeof contract === "object" && contract !== null
                          ? contract.contractId
                          : contract;
                      const startDate =
                        typeof contract === "object" &&
                        contract !== null &&
                        contract.startDate
                          ? new Date(contract.startDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-";
                      const endDate =
                        typeof contract === "object" &&
                        contract !== null &&
                        contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-";
                      const status =
                        typeof contract === "object" && contract !== null
                          ? contract.status === 1
                            ? "Hoạt động"
                            : "Không hoạt động"
                          : "-";

                      const hasFiles =
                        typeof contract === "object" &&
                        contract !== null &&
                        contract.contractFiles &&
                        contract.contractFiles.length > 0;

                      return (
                        <TableRow key={index} hover>
                          <TableCell>{contractId}</TableCell>
                          <TableCell>{startDate}</TableCell>
                          <TableCell>{endDate}</TableCell>
                          <TableCell>
                            <Chip
                              label={status}
                              color={
                                status === "Hoạt động" ? "success" : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleViewContractFile(e, contract)
                              }
                              disabled={!hasFiles}
                              title={
                                hasFiles
                                  ? "Xem file hợp đồng"
                                  : "Không có file hợp đồng"
                              }
                              color={hasFiles ? "primary" : "default"}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {user?.role === "Staff" && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleEditContractClick(contract)
                                }
                                title="Chỉnh sửa hợp đồng"
                                color="info"
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customer.contracts.length}
            rowsPerPage={contractsRowsPerPage}
            page={contractsPage}
            onPageChange={handleContractsChangePage}
            onRowsPerPageChange={handleContractsChangeRowsPerPage}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
          />
        </Box>
      ) : (
        <Alert severity="info">Khách hàng chưa có hợp đồng nào</Alert>
      )}
    </TabPanel>
  );

  const renderOrdersTab = () => (
    <TabPanel value={tabValue} index={1}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Danh sách đơn hàng</Typography>
      </Box>

      {customer.orders && customer.orders.length > 0 ? (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Mã đơn hàng</TableCell>
                  <TableCell align="center">Ngày tạo</TableCell>
                  <TableCell align="right">Tổng giá trị</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(customer.orders) &&
                  customer.orders
                    .slice(
                      ordersPage * ordersRowsPerPage,
                      ordersPage * ordersRowsPerPage + ordersRowsPerPage
                    )
                    .map((order, index) => {
                      const orderId =
                        typeof order === "object" && order !== null
                          ? order.orderId
                          : order;
                      const createdDate =
                        typeof order === "object" &&
                        order !== null &&
                        order.createdDate
                          ? new Date(order.createdDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-";
                      const price =
                        typeof order === "object" &&
                        order !== null &&
                        order.price
                          ? order.price.toLocaleString("vi-VN") + " đ"
                          : "-";
                      const status =
                        typeof order === "object" && order !== null
                          ? order.status
                          : "-";
                      return (
                        <TableRow key={index} hover>
                          <TableCell>{orderId}</TableCell>
                          <TableCell>{createdDate}</TableCell>
                          <TableCell align="right">{price}</TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "medium",
                              color:
                                order.status === OrderStatus.Completed
                                  ? "success.main"
                                  : order.status === OrderStatus.Scheduled
                                  ? "info.main"
                                  : "warning.main",
                            }}
                          >
                            {getStatusDisplay(order.status).label}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleViewOrderDetail(e, orderId)}
                              title="Xem chi tiết đơn hàng"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customer.orders.length}
            rowsPerPage={ordersRowsPerPage}
            page={ordersPage}
            onPageChange={handleOrdersChangePage}
            onRowsPerPageChange={handleOrdersChangeRowsPerPage}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
          />
        </Box>
      ) : (
        <Alert severity="info">Khách hàng chưa có đơn hàng nào</Alert>
      )}
    </TabPanel>
  );

  // Hàm mở image preview
  const openImagePreview = (src: string, title: string = "Image Preview") => {
    setImagePreview({
      open: true,
      src,
      title,
    });
  };

  // Hàm đóng image preview
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
      // Các loại file khác (bao gồm Office files), mở trong tab mới với Office Online Viewer
      window.open(
        `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          fileUrl
        )}`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" onClick={handleBack} sx={{ cursor: "pointer" }}>
            Danh sách khách hàng
          </Link>
          <Typography color="text.primary">
            <Skeleton width={150} />
          </Typography>
        </Breadcrumbs>

        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ mb: 2, borderRadius: 1 }}
              />
              <Skeleton height={30} sx={{ mb: 1 }} />
              <Skeleton height={25} sx={{ mb: 1 }} />
              <Skeleton height={25} sx={{ mb: 1 }} />
              <Skeleton height={25} sx={{ mb: 1 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Skeleton height={40} width="80%" />
              </Box>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Alert severity="info">Không tìm thấy thông tin khách hàng</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          onClick={handleBack}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: "0.8rem" }} />
          Danh sách khách hàng
        </Link>
        <Typography color="text.primary">{customer.companyName}</Typography>
      </Breadcrumbs>

      {/* Header with Actions */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="500">
          Chi tiết khách hàng
        </Typography>
        {user?.role === "Staff" && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              Chỉnh sửa
            </Button>
            {/* Commented out delete button
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Xóa
            </Button>
            */}
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Grid container>
          {/* Customer Info Card */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ borderRight: { md: "1px solid #e0e0e0" } }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 70,
                    height: 70,
                    fontSize: "2rem",
                  }}
                >
                  {customer.companyName && customer.companyName.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6" fontWeight="500">
                    {customer.companyName || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MST: {customer.taxNumber || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Thông tin liên hệ
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                <EmailIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {customer.email || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                <PhoneIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {customer.phoneNumber || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", my: 1 }}>
                <BusinessIcon
                  fontSize="small"
                  color="primary"
                  sx={{ mr: 1, mt: 0.3 }}
                />
                <Typography variant="body2">
                  {customer.address || "N/A"}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo:
                </Typography>
                <Typography variant="body2">
                  {formatDate(customer.createdDate)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Người tạo:
                </Typography>
                <Typography variant="body2">
                  {customer.createdBy || "N/A"}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  my: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Lần cập nhật cuối:
                </Typography>
                <Typography variant="body2">
                  {formatDate(customer.modifiedDate)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Chip
                  icon={<AssignmentIcon />}
                  label={`${customer.contracts?.length || 0} Hợp đồng`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  color="primary"
                />
                <Chip
                  icon={<LocalShippingIcon />}
                  label={`${customer.orders?.length || 0} Đơn hàng`}
                  variant="outlined"
                  size="small"
                  color="primary"
                />
              </Box>
            </Box>
          </Grid>

          {/* Tabs Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="customer details tabs"
                >
                  <Tab label="Tổng quan" />
                  <Tab label="Đơn hàng" />
                  <Tab label="Hợp đồng" />
                </Tabs>
              </Box>

              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Thông tin chi tiết
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Tên công ty
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.companyName}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.email}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.phoneNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Mã số thuế
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.taxNumber || "N/A"}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Địa chỉ
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {customer.address || "N/A"}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            Trạng thái
                          </Typography>
                          <Chip
                            label={
                              customer.deletedDate ? "Đã xóa" : "Đang hoạt động"
                            }
                            color={customer.deletedDate ? "error" : "success"}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            Hợp đồng gần nhất
                          </Typography>
                        </Box>
                        {customer.contracts && customer.contracts.length > 0 ? (
                          <Typography>
                            {/* Display latest contract information */}
                            Có {customer.contracts.length} hợp đồng
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">
                            Chưa có hợp đồng nào
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            Đơn hàng gần nhất
                          </Typography>
                        </Box>
                        {customer.orders && customer.orders.length > 0 ? (
                          <Typography>
                            {/* Display latest order information */}
                            Có {customer.orders.length} đơn hàng
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">
                            Chưa có đơn hàng nào
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Orders Tab */}
              {renderOrdersTab()}

              {/* Contracts Tab */}
              {renderContractsTab()}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Edit Customer Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
        <form onSubmit={handleUpdateCustomer}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="companyName"
                  label="Tên công ty"
                  fullWidth
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  error={!!formErrors.companyName}
                  helperText={formErrors.companyName}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="phoneNumber"
                  label="Số điện thoại"
                  fullWidth
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="taxNumber"
                  label="Mã số thuế"
                  fullWidth
                  required
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  error={!!formErrors.taxNumber}
                  helperText={formErrors.taxNumber}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Địa chỉ"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  margin="dense"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseEditDialog} variant="outlined">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa khách hàng
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa khách hàng{" "}
            <strong>{customer?.companyName}</strong>? Hành động này không thể
            hoàn tác.
          </Typography>
          {customer?.orders && customer.orders.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Khách hàng này có {customer.orders.length} đơn hàng. Xóa khách
              hàng có thể ảnh hưởng đến các đơn hàng liên quan.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deletingCustomer}
            startIcon={deletingCustomer ? <CircularProgress size={20} /> : null}
          >
            {deletingCustomer ? "Đang xóa..." : "Xóa khách hàng"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Contract File Modal */}
      {customerId && (
        <AddContractFileModal
          open={openAddContractModal}
          onClose={handleCloseAddContractModal}
          onSuccess={handleContractAdded}
          customerId={customerId}
          orderId=""
        />
      )}

      {/* Add Edit Contract Dialog */}
      <Dialog
        open={openEditContractDialog}
        onClose={handleCloseEditContractDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: "90vh" },
        }}
      >
        <DialogTitle>Chỉnh sửa hợp đồng</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <TextField
                  name="Summary"
                  label="Tóm tắt hợp đồng"
                  fullWidth
                  value={editContractForm.Summary}
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="SignedTime"
                  label="Ngày ký"
                  type="date"
                  fullWidth
                  value={
                    editContractForm.SignedTime
                      ? editContractForm.SignedTime.substring(0, 10)
                      : ""
                  }
                  margin="dense"
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="SignedBy"
                  label="Người ký"
                  fullWidth
                  value={editContractForm.SignedBy}
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="CreatedBy"
                  label="Người tạo"
                  fullWidth
                  value={editContractForm.CreatedBy}
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="CreatedDate"
                  label="Ngày tạo"
                  type="datetime-local"
                  fullWidth
                  value={editContractForm.CreatedDate}
                  margin="dense"
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="StartDate"
                  label="Ngày bắt đầu"
                  type="datetime-local"
                  fullWidth
                  required
                  value={editContractForm.StartDate}
                  onChange={handleContractInputChange}
                  error={!!editContractErrors.StartDate}
                  helperText={editContractErrors.StartDate}
                  margin="dense"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="EndDate"
                  label="Ngày kết thúc"
                  type="datetime-local"
                  fullWidth
                  required
                  value={editContractForm.EndDate}
                  onChange={handleContractInputChange}
                  error={!!editContractErrors.EndDate}
                  helperText={editContractErrors.EndDate}
                  margin="dense"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="status-label">Trạng thái</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status-select"
                    name="Status"
                    value={editContractForm.Status}
                    label="Trạng thái"
                    onChange={(e) =>
                      handleContractSelectChange(
                        e as React.ChangeEvent<{
                          name?: string;
                          value: unknown;
                        }>
                      )
                    }
                    error={!!editContractErrors.Status}
                  >
                    <MenuItem value={1}>Hoạt động</MenuItem>
                    <MenuItem value={0}>Không hoạt động</MenuItem>
                  </Select>
                  {editContractErrors.Status && (
                    <FormHelperText error>
                      {editContractErrors.Status}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* File management section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Quản lý file hợp đồng
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Existing files list with checkboxes for deletion */}
                {selectedContract &&
                selectedContract.contractFiles &&
                selectedContract.contractFiles.length > 0 ? (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      File hợp đồng hiện có
                    </Typography>
                    <List>
                      {selectedContract.contractFiles.map(
                        (file: any, index: number) => {
                          // Check if file is marked for removal
                          const isMarkedForRemoval = filesToRemove.includes(
                            file.fileId
                          );

                          return (
                            <Box
                              key={file.fileId}
                              sx={{
                                mb: 2,
                                p: 2,
                                border: "1px solid rgba(0, 0, 0, 0.12)",
                                borderRadius: 1,
                                bgcolor: isMarkedForRemoval
                                  ? "rgba(0, 0, 0, 0.04)"
                                  : "transparent",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Box>
                                  <Typography variant="body2" fontWeight="500">
                                    {file.fileName || `File ${index + 1}`}
                                  </Typography>

                                  {/* Display Description */}
                                  <Box sx={{ mt: 1 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      <strong>Mô tả:</strong>{" "}
                                      {file.description || "Không có mô tả"}
                                    </Typography>
                                  </Box>

                                  {/* Display Note */}
                                  <Box sx={{ mt: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      <strong>Ghi chú:</strong>{" "}
                                      {file.note || "Không có ghi chú"}
                                    </Typography>
                                  </Box>

                                  {isMarkedForRemoval && (
                                    <Typography variant="caption" color="error">
                                      Đánh dấu để xóa
                                    </Typography>
                                  )}
                                </Box>

                                <Box>
                                  <IconButton
                                    component="a"
                                    size="small"
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <AttachFileIcon fontSize="small" />
                                  </IconButton>
                                  <Checkbox
                                    size="small"
                                    onChange={() =>
                                      handleToggleRemoveExistingFile(
                                        file.fileId
                                      )
                                    }
                                    checked={isMarkedForRemoval}
                                    color="error"
                                  />
                                </Box>
                              </Box>
                            </Box>
                          );
                        }
                      )}
                    </List>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Không có file hợp đồng hiện tại
                  </Typography>
                )}

                {/* Upload new files section */}
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Thêm file mới
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ mb: 2 }}
                  >
                    Chọn file
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </Button>

                  {/* Show new files that will be added with descriptions/notes */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <List>
                        {selectedFiles.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              mb: 2,
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
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2">
                                {file.name}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <TextField
                              label="Mô tả file"
                              fullWidth
                              multiline
                              rows={2}
                              value={(file as any).description || ""}
                              onChange={(e) =>
                                handleNewFileDescriptionChange(
                                  index,
                                  e.target.value
                                )
                              }
                              margin="dense"
                              size="small"
                            />
                            <TextField
                              label="Ghi chú"
                              fullWidth
                              multiline
                              rows={2}
                              value={(file as any).note || ""}
                              onChange={(e) =>
                                handleNewFileNoteChange(index, e.target.value)
                              }
                              margin="dense"
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
          <Button onClick={handleCloseEditContractDialog} variant="outlined">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={editingContract}
            startIcon={editingContract ? <CircularProgress size={20} /> : null}
            onClick={handleUpdateContract}
          >
            {editingContract ? "Đang cập nhật..." : "Cập nhật hợp đồng"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Preview Dialog */}
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

      {/* Document Preview Dialog */}
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
                : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    documentPreview.src
                  )}`
            }
            width="100%"
            height="100%"
            frameBorder="0"
            title={documentPreview.title}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            component="a"
            href={documentPreview.src}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            variant="outlined"
          >
            Mở trong cửa số mới
          </Button>
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
    </Box>
  );
};

export default CustomerDetailPage;
