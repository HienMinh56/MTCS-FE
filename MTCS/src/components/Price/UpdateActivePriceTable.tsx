import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  TextField,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  ContainerSizeMap,
  ContainerTypeMap,
  DeliveryTypeMap,
  PriceTable,
  StatusMap,
  UpdatePriceTableRequest,
} from "../../types/price-table";
import {
  getPriceTables,
  updatePriceTables,
} from "../../services/priceTableApi";
import useAuth from "../../hooks/useAuth";

const UpdateActivePriceTable: React.FC = () => {
  const { user } = useAuth();
  const [priceTables, setPriceTables] = useState<PriceTable[]>([]);
  const [activePrices, setActivePrices] = useState<PriceTable[]>([]);
  const [editedPrices, setEditedPrices] = useState<
    Record<string, { minPrice?: number; maxPrice?: number }>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { minPrice?: string; maxPrice?: string }>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  // Fetch active price tables
  const fetchActivePriceTables = async () => {
    try {
      setLoading(true);
      const response = await getPriceTables();

      if (response.success) {
        setPriceTables(response.data.priceTables);
        // Filter only active prices (status = 1)
        const active = response.data.priceTables.filter(
          (price) => price.status === 1
        );
        setActivePrices(active);
        setError(null);
      } else {
        setError(response.messageVN || response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải bảng giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePriceTables();
  }, []);

  // Handle price edit
  const handlePriceChange = (
    priceId: string,
    field: "minPrice" | "maxPrice",
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setEditedPrices((prev) => ({
      ...prev,
      [priceId]: {
        ...prev[priceId],
        [field]: numValue,
      },
    }));

    const minPrice =
      field === "minPrice" ? numValue : editedPrices[priceId]?.minPrice;
    const maxPrice =
      field === "maxPrice" ? numValue : editedPrices[priceId]?.maxPrice;

    validatePriceUpdate(priceId, minPrice, maxPrice);
  };

  // Validate price update
  const validatePriceUpdate = (
    priceId: string,
    minPrice?: number,
    maxPrice?: number
  ): boolean => {
    const errors: { minPrice?: string; maxPrice?: string } = {};

    if (minPrice !== undefined) {
      if (minPrice <= 0) {
        errors.minPrice = "Giá tối thiểu phải lớn hơn 0";
      }

      if (minPrice > 10000000) {
        errors.minPrice = "Giá tối thiểu không được lớn hơn 10,000,000";
      }
    }

    if (maxPrice !== undefined) {
      if (maxPrice <= 0) {
        errors.maxPrice = "Giá tối đa phải lớn hơn 0";
      }

      if (maxPrice > 10000000) {
        errors.maxPrice = "Giá tối đa không được lớn hơn 10,000,000";
      }
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      errors.minPrice = "Giá tối thiểu phải nhỏ hơn giá tối đa";
      errors.maxPrice = "Giá tối đa phải lớn hơn giá tối thiểu";
    }

    setValidationErrors((prev) => ({
      ...prev,
      [priceId]: errors,
    }));

    return Object.keys(errors).length === 0;
  };

  // Check if a price has been edited
  const isPriceEdited = (priceId: string) => {
    return !!editedPrices[priceId];
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setSuccess(null);
      setError(null);

      // Process each edited price with separate API calls
      const priceIds = Object.keys(editedPrices);
      const updatePromises = priceIds.map(async (priceId) => {
        const updateRequest = {
          priceId,
          minPricePerKm: editedPrices[priceId].minPrice,
          maxPricePerKm: editedPrices[priceId].maxPrice,
        };

        return updatePriceTables(updateRequest);
      });

      const results = await Promise.all(updatePromises);
      const hasError = results.some((result) => !result.success);

      if (!hasError) {
        setSuccess("Cập nhật bảng giá thành công");
        setEditedPrices({});
        fetchActivePriceTables();
        setConfirmOpen(false);
      } else {
        // Find the first error message
        const errorResult = results.find((result) => !result.success);
        setError(
          errorResult?.messageVN ||
            errorResult?.message ||
            "Không thể cập nhật bảng giá"
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi cập nhật bảng giá"
      );
    } finally {
      setSaving(false);
    }
  };

  // Group prices by container size
  const container20Prices = activePrices.filter(
    (price) => price.containerSize === 1
  );
  const container40Prices = activePrices.filter(
    (price) => price.containerSize === 2
  );

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // Render editable price table for a specific container size
  const renderPriceTable = (prices: PriceTable[], title: string) => {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 0,
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": { boxShadow: "0 6px 16px rgba(0,0,0,0.05)" },
        }}
      >
        <Box
          sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}
        >
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Khoảng cách (km)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Loại container
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Loại giao hàng
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Giá tối thiểu
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Giá tối đa
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Trạng thái
                </TableCell>
                {isAdmin && (
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Thao tác
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {prices.length > 0 ? (
                prices.map((price, index) => {
                  const isEdited = isPriceEdited(price.priceId);
                  return (
                    <TableRow
                      key={price.priceId}
                      sx={{
                        backgroundColor:
                          index % 2 === 0
                            ? "rgba(0, 0, 0, 0.02)"
                            : "transparent",
                        "&:hover": {
                          backgroundColor: "rgba(1, 70, 199, 0.05)",
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell align="center">{`${price.minKm} - ${price.maxKm}`}</TableCell>
                      <TableCell align="center">
                        {ContainerTypeMap[price.containerType] ||
                          "Không xác định"}
                      </TableCell>
                      <TableCell align="center">
                        {DeliveryTypeMap[price.deliveryType] ||
                          "Không xác định"}
                      </TableCell>
                      <TableCell align="center">
                        {isEdited ? (
                          <TextField
                            size="small"
                            value={
                              editedPrices[price.priceId]?.minPrice !==
                              undefined
                                ? editedPrices[price.priceId].minPrice
                                : price.minPricePerKm
                            }
                            onChange={(e) =>
                              handlePriceChange(
                                price.priceId,
                                "minPrice",
                                e.target.value
                              )
                            }
                            error={!!validationErrors[price.priceId]?.minPrice}
                            helperText={
                              validationErrors[price.priceId]?.minPrice
                            }
                            InputProps={{
                              inputProps: {
                                min: 0,
                                style: { textAlign: "center" },
                              },
                            }}
                            sx={{ width: "120px" }}
                          />
                        ) : (
                          formatCurrency(price.minPricePerKm)
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {isEdited ? (
                          <TextField
                            size="small"
                            value={
                              editedPrices[price.priceId]?.maxPrice !==
                              undefined
                                ? editedPrices[price.priceId].maxPrice
                                : price.maxPricePerKm
                            }
                            onChange={(e) =>
                              handlePriceChange(
                                price.priceId,
                                "maxPrice",
                                e.target.value
                              )
                            }
                            error={!!validationErrors[price.priceId]?.maxPrice}
                            helperText={
                              validationErrors[price.priceId]?.maxPrice
                            }
                            InputProps={{
                              inputProps: {
                                min: 0,
                                style: { textAlign: "center" },
                              },
                            }}
                            sx={{ width: "120px" }}
                          />
                        ) : (
                          formatCurrency(price.maxPricePerKm)
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={StatusMap[price.status] || "Không xác định"}
                          color={price.status === 1 ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 500, minWidth: 100 }}
                        />
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          {isEdited ? (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Hủy">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newEdited = { ...editedPrices };
                                    delete newEdited[price.priceId];
                                    setEditedPrices(newEdited);
                                    setValidationErrors((prev) => {
                                      const newErrors = { ...prev };
                                      delete newErrors[price.priceId];
                                      return newErrors;
                                    });
                                  }}
                                  color="error"
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title="Chỉnh sửa giá">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditedPrices({
                                    ...editedPrices,
                                    [price.priceId]: {
                                      minPrice: price.minPricePerKm,
                                      maxPrice: price.maxPricePerKm,
                                    },
                                  });
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có dữ liệu bảng giá hoạt động
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const hasEdits = Object.keys(editedPrices).length > 0;

  return (
    <Box sx={{ my: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          transition: "all 0.3s ease",
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
          <Typography variant="h5" fontWeight={600}>
            Cập nhật giá vận chuyển đang hoạt động
          </Typography>

          {isAdmin && hasEdits && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ mb: 3, "& .MuiAlert-icon": { alignItems: "center" } }}
          >
            {error}
          </Alert>
        ) : (
          <>
            {success && (
              <Alert
                severity="success"
                sx={{ mb: 3, "& .MuiAlert-icon": { alignItems: "center" } }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            )}

            {!isAdmin && (
              <Alert
                severity="info"
                sx={{ mb: 3, "& .MuiAlert-icon": { alignItems: "center" } }}
              >
                Chỉ quản trị viên mới có thể cập nhật giá vận chuyển
              </Alert>
            )}

            {renderPriceTable(container20Prices, "Container 20'")}
            {renderPriceTable(container40Prices, "Container 40'")}
          </>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận cập nhật bảng giá</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn cập nhật bảng giá cho{" "}
            {Object.keys(editedPrices).length} mục không? Hành động này sẽ thay
            đổi giá vận chuyển cho các đơn hàng mới.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={saving}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={saving}
            color="primary"
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
          >
            {saving ? "Đang lưu" : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpdateActivePriceTable;
