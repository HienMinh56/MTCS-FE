import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  FormHelperText,
  Autocomplete,
  TextField,
} from "@mui/material";
import { tripRelace } from "../types/trip";
import { createTripReplace } from "../services/tripApi";
import { getDriverList } from "../services/DriverApi";
import { getTractors } from "../services/tractorApi";
import { getTrailers } from "../services/trailerApi";
import { getOrderDetails } from "../services/orderApi";
import { ContainerType } from "../types/order";

interface ReplaceTripModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  orderId?: string; // Add orderId prop to get order details
  onSuccess?: () => void;
  vehicleType?: number; // Thêm prop vehicleType để xác định loại phương tiện hư hỏng
}

// Driver option interface
interface DriverOption {
  id: string;
  fullName: string;
  phoneNumber: string;
}

// Tractor option interface
interface TractorOption {
  id: string;
  licensePlate: string;
  brand: string;
  maxLoadWeight?: number;
  containerType?: number;
}

// Trailer option interface
interface TrailerOption {
  id: string;
  licensePlate: string;
  brand: string;
  maxLoadWeight?: number;
}

const ReplaceTripModal = ({ open, onClose, tripId, orderId, onSuccess, vehicleType }: ReplaceTripModalProps) => {
  const [formData, setFormData] = useState({
    driverId: "",
    tractorId: "",
    trailerId: "",
  });
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  
  // Options for dropdown selects
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [tractors, setTractors] = useState<TractorOption[]>([]);
  const [filteredTractors, setFilteredTractors] = useState<TractorOption[]>([]);
  const [trailers, setTrailers] = useState<TrailerOption[]>([]);
  const [orderContainerType, setOrderContainerType] = useState<number | null>(null);
  
  const [error, setError] = useState("");
  
  // Add state variables for maxLoadWeight
  const [tractorMaxLoadWeight, setTractorMaxLoadWeight] = useState<number | null>(null);
  const [trailerMaxLoadWeight, setTrailerMaxLoadWeight] = useState<number | null>(null);

  // Kiểm tra xem có nên hiển thị phần chọn trailer hay không
  const shouldShowTrailer = vehicleType === 2 || vehicleType === undefined;

  // Fetch order details if orderId is provided
  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails(orderId);
    }
  }, [open, orderId]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchDrivers();
      fetchTractors();
      // Chỉ tải dữ liệu trailer nếu cần hiển thị phần chọn trailer
      if (shouldShowTrailer) {
        fetchTrailers();
      }
    }
  }, [open, shouldShowTrailer]);

  // Effect to filter tractors based on order containerType
  useEffect(() => {
    if (tractors.length > 0 && orderContainerType !== null) {
      let filtered = [...tractors];
      
      // Nếu container type là 2 (container lạnh), chỉ hiển thị đầu kéo loại 2
      if (orderContainerType === 2) {
        filtered = tractors.filter(tractor => tractor.containerType === 2);
        console.log("Filtering for refrigerated container, found:", filtered.length, "tractors");
      }
      // Nếu container type là 1 (container khô), hiển thị tất cả đầu kéo (loại 1 và 2)
      
      setFilteredTractors(filtered);
    } else {
      setFilteredTractors(tractors);
    }
  }, [tractors, orderContainerType]);

  // Fetch order details to get containerType
  const fetchOrderDetails = async (orderId: string) => {
    setLoadingOrder(true);
    try {
      const orderDetails = await getOrderDetails(orderId);
      if (orderDetails) {
        // Set container type
        setOrderContainerType(orderDetails.containerType);
        console.log("Order container type:", orderDetails.containerType);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Không thể tải thông tin đơn hàng");
    } finally {
      setLoadingOrder(false);
    }
  };

  // Fetch drivers from API
  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await getDriverList({ status: 1 }); // Active drivers (1), not Inactive (0)
      if (response.success && response.data) {
        const driverOptions = response.data.items.map(driver => ({
          id: driver.driverId,
          fullName: driver.fullName,
          phoneNumber: driver.phoneNumber || "",
        }));
        setDrivers(driverOptions);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Không thể tải danh sách tài xế");
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Fetch tractors from API
  const fetchTractors = async () => {
    setLoadingTractors(true);
    try {
      const response = await getTractors(1, 100, undefined, 1); // Active tractors
      if (response && response.data && response.data.tractors) {
        const tractorOptions = response.data.tractors.items.map(tractor => ({
          id: tractor.tractorId,
          licensePlate: tractor.licensePlate,
          brand: tractor.brand || "",
          maxLoadWeight: tractor.maxLoadWeight || null,
          containerType: tractor.containerType,
        }));
        setTractors(tractorOptions);
        console.log("Fetched total tractors:", tractorOptions.length);
      }
    } catch (err) {
      console.error("Error fetching tractors:", err);
      setError("Không thể tải danh sách đầu kéo");
    } finally {
      setLoadingTractors(false);
    }
  };

  // Fetch trailers from API
  const fetchTrailers = async () => {
    setLoadingTrailers(true);
    try {
      const response = await getTrailers(1, 100, undefined, 1); // Active trailers
      if (response && response.data && response.data.trailers) {
        const trailerOptions = response.data.trailers.items.map(trailer => ({
          id: trailer.trailerId,
          licensePlate: trailer.licensePlate,
          brand: trailer.brand || "",
          maxLoadWeight: trailer.maxLoadWeight || null,
        }));
        setTrailers(trailerOptions);
      }
    } catch (err) {
      console.error("Error fetching trailers:", err);
      setError("Không thể tải danh sách moóc");
    } finally {
      setLoadingTrailers(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update handleTractorChange to also get maxLoadWeight
  const handleTractorChange = (_: any, newValue: TractorOption | null) => {
    handleChange("tractorId", newValue?.id || "");
    if (newValue) {
      setTractorMaxLoadWeight(newValue.maxLoadWeight || null);
    } else {
      setTractorMaxLoadWeight(null);
    }
  };

  // Update handleTrailerChange to also get maxLoadWeight
  const handleTrailerChange = (_: any, newValue: TrailerOption | null) => {
    handleChange("trailerId", newValue?.id || "");
    if (newValue) {
      setTrailerMaxLoadWeight(newValue.maxLoadWeight || null);
    } else {
      setTrailerMaxLoadWeight(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Create trip replacement data
      const tripReplaceData: tripRelace = {
        tripId,
        driverId: formData.driverId || null,
        tractorId: formData.tractorId || null,
        trailerId: formData.trailerId || null // Có thể được điền hoặc không tùy vào việc hiển thị
      };

      await createTripReplace(tripReplaceData);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Failed to create replacement trip:", err);
      setError(
        err.response?.data?.message || 
        `Không thể tạo chuyến thay thế. Lỗi: ${err.message || 'Vui lòng thử lại sau.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loadingDrivers || loadingTractors || loadingTrailers || loadingOrder;

  // Trả về tên loại container dựa trên giá trị
  const getContainerTypeText = (type: number | null) => {
    if (type === 1) return "Container Khô";
    if (type === 2) return "Container Lạnh";
    return "Không xác định";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo chuyến đi thay thế</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Mã chuyến đi cần thay thế: {tripId}
              </Typography>
              {/* {vehicleType && (
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Phương tiện hư hỏng: {vehicleType === 1 ? "Đầu kéo" : vehicleType === 2 ? "Rơ-moóc" : "Không xác định"}
                </Typography>
              )}
              {orderContainerType !== null && (
                <Typography variant="subtitle2" color="secondary" gutterBottom>
                  Loại container: {getContainerTypeText(orderContainerType)}
                  {orderContainerType === 2 && (
                    <span> (Chỉ hiển thị đầu kéo container lạnh)</span>
                  )}
                </Typography>
              )} */}
            </Grid>
            
            {/* Driver Dropdown */}
            <Grid item xs={12}>
              <Autocomplete
                options={drivers}
                getOptionLabel={(option) => `${option.fullName} (${option.phoneNumber})`}
                loading={loadingDrivers}
                onChange={(_, newValue) => handleChange("driverId", newValue?.id || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tài xế"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingDrivers ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Tractor Dropdown */}
            <Grid item xs={12} md={9}>
              <Autocomplete
                options={filteredTractors}
                getOptionLabel={(option) => `${option.licensePlate} (${option.brand})`}
                loading={loadingTractors}
                onChange={handleTractorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Đầu kéo"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTractors ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Trọng tải tối đa"
                variant="outlined"
                size="small"
                fullWidth
                value={tractorMaxLoadWeight !== null ? `${tractorMaxLoadWeight} kg` : ''}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                  }
                }}
              />
            </Grid>
            
            {/* Trailer Dropdown (Optional) - Chỉ hiển thị khi vehicleType = 2 hoặc không xác định */}
            {shouldShowTrailer && (
              <>
                <Grid item xs={12} md={9}>
                  <Autocomplete
                    options={trailers}
                    getOptionLabel={(option) => `${option.licensePlate} (${option.brand})`}
                    loading={loadingTrailers}
                    onChange={handleTrailerChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Rơ moóc"                        
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingTrailers ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Trọng tải tối đa"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={trailerMaxLoadWeight !== null ? `${trailerMaxLoadWeight} kg` : ''}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'text.secondary',
                        bgcolor: 'action.hover',
                      }
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy bỏ
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading || isLoading || !formData.driverId || !formData.tractorId}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          {loading ? "Đang xử lý..." : "Tạo chuyến"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplaceTripModal;
