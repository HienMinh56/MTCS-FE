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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import {
  OrderDetails,
  ContainerType,
  DeliveryType,
  OrderStatus,
} from "../types/order";
import { getOrderDetails } from "../services/orderApi";
import { getContracts, createContract } from "../services/contractApi";
import { ContractFile } from "../types/contract";
import { format } from "date-fns";
import AddContractFileModal from "../components/contract/AddContractFileModal";

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

  useEffect(() => {
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
      case ContainerType.Container20:
        return "Container 20 FT";
      case ContainerType.Container40:
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
      case OrderStatus.InProgress:
        return { label: "Đang xử lý", color: "info" };
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

  const handleContractAdded = async () => {
    // Refresh contract files after a new one is added
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

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Quay lại danh sách đơn hàng
      </Button>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">
          Chi tiết đơn hàng - {orderDetails.trackingCode}
        </Typography>
        <Chip
          label={getStatusDisplay(orderDetails.status).label}
          color={getStatusDisplay(orderDetails.status).color as any}
        />
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
                  {orderDetails.temperature}°C
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
    </Box>
  );
};

export default OrderDetailPage;
