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
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";
import { tripRelace } from "../types/trip";
import { createTripReplace } from "../services/tripApi";
import { getDriverList } from "../services/DriverApi";
import { getTractors, getTractorDetails } from "../services/tractorApi";
import { getTrailers, getTrailerDetails } from "../services/trailerApi";
import { getOrderDetails } from "../services/orderApi";
import { TractorStatus } from "../types/tractor";
import { TrailerStatus } from "../types/trailer";

interface ReplaceTripModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  orderId?: string; // Add orderId prop to get order details
  onSuccess?: () => void;
  vehicleType?: number; // Thêm prop vehicleType để xác định loại phương tiện hư hỏng
  incidentTractorId?: string;
  incidentTrailerId?: string;
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
  maxLoadWeight: number | null; // always present
  containerType?: number;
}

// Trailer option interface
interface TrailerOption {
  id: string;
  licensePlate: string;
  brand: string;
  maxLoadWeight: number | null; // always present
}

const ReplaceTripModal = ({ open, onClose, tripId, orderId, onSuccess, vehicleType, incidentTractorId, incidentTrailerId }: ReplaceTripModalProps) => {
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
  const [incidentTractorMaxLoadWeight, setIncidentTractorMaxLoadWeight] = useState<number | null>(null);
  const [incidentTrailerMaxLoadWeight, setIncidentTrailerMaxLoadWeight] = useState<number | null>(null);

  // Kiểm tra xem có nên hiển thị phần chọn trailer hay không
  const shouldShowTrailer = vehicleType === 2 || vehicleType === undefined;

  // Fetch order details if orderId is provided
  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails(orderId);
    }
  }, [open, orderId]);

  // Fetch incident tractor/trailer maxLoadWeight on open
  useEffect(() => {
    const fetchIncidentVehicleWeights = async () => {
      if (open && incidentTractorId) {
        try {
          const tractorDetails = await getTractorDetails(incidentTractorId);
          setIncidentTractorMaxLoadWeight(tractorDetails?.data?.maxLoadWeight || null);
        } catch {
          setIncidentTractorMaxLoadWeight(null);
        }
      }
      if (open && shouldShowTrailer && incidentTrailerId) {
        try {
          const trailerDetails = await getTrailerDetails(incidentTrailerId);
          setIncidentTrailerMaxLoadWeight(trailerDetails?.data?.maxLoadWeight || null);
        } catch {
          setIncidentTrailerMaxLoadWeight(null);
        }
      }
    };
    fetchIncidentVehicleWeights();
  }, [open, incidentTractorId, incidentTrailerId, shouldShowTrailer]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchDrivers();
    }
  }, [open]);

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

  // Refetch tractors/trailers when incident maxLoadWeight changes (after async fetch)
  useEffect(() => {
    if (open) {
      // Inline fetchTractors
      (async () => {
        setLoadingTractors(true);
        try {
          const response = await getTractors(1, 100, undefined, TractorStatus.Active);
          if (response && response.data && response.data.tractors) {
            let tractorOptions = response.data.tractors.items.map(tractor => ({
              id: tractor.tractorId,
              licensePlate: tractor.licensePlate,
              brand: tractor.brand || "",
              maxLoadWeight: (tractor as unknown as { maxLoadWeight?: number }).maxLoadWeight ?? null,
              containerType: tractor.containerType,
            }));
            if (incidentTractorMaxLoadWeight !== null) {
              tractorOptions = tractorOptions.filter(t => t.maxLoadWeight !== null && t.maxLoadWeight > incidentTractorMaxLoadWeight);
            }
            setTractors(tractorOptions);
            setFilteredTractors(tractorOptions);
          }
        } catch (err: unknown) {
          console.error("Error fetching tractors:", err);
          setError("Không thể tải danh sách đầu kéo");
        } finally {
          setLoadingTractors(false);
        }
      })();
      // Inline fetchTrailers
      if (shouldShowTrailer) {
        (async () => {
          setLoadingTrailers(true);
          try {
            const response = await getTrailers(1, 100, undefined, TrailerStatus.Active);
            if (response && response.data && response.data.trailers) {
              let trailerOptions = response.data.trailers.items.map(trailer => ({
                id: trailer.trailerId,
                licensePlate: trailer.licensePlate,
                brand: trailer.brand || "",
                maxLoadWeight: (trailer as unknown as { maxLoadWeight?: number }).maxLoadWeight ?? null,
              }));
              if (incidentTrailerMaxLoadWeight !== null) {
                trailerOptions = trailerOptions.filter(t => t.maxLoadWeight !== null && t.maxLoadWeight > incidentTrailerMaxLoadWeight);
              }
              setTrailers(trailerOptions);
            }
          } catch (err: unknown) {
            console.error("Error fetching trailers:", err);
            setError("Không thể tải danh sách moóc");
          } finally {
            setLoadingTrailers(false);
          }
        })();
      }
    }
  }, [incidentTractorMaxLoadWeight, incidentTrailerMaxLoadWeight, open, shouldShowTrailer]);

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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      console.error("Error fetching drivers:", err);
      setError("Không thể tải danh sách tài xế");
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fix handler types
  const handleTractorChange = (_: React.SyntheticEvent, newValue: TractorOption | null) => {
    handleChange("tractorId", newValue?.id || "");
    if (newValue) {
      setTractorMaxLoadWeight(newValue.maxLoadWeight || null);
    } else {
      setTractorMaxLoadWeight(null);
    }
  };

  const handleTrailerChange = (_: React.SyntheticEvent, newValue: TrailerOption | null) => {
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
    } catch (err: unknown) {
      let errorMessage = 'Không thể tạo chuyến thay thế. Vui lòng thử lại sau.';
      if (typeof err === 'object' && err !== null) {
        const e = err as { response?: { data?: { message?: string } }, message?: string };
        errorMessage = e.response?.data?.message || `Không thể tạo chuyến thay thế. Lỗi: ${e.message || 'Vui lòng thử lại sau.'}`;
      }
      setError(errorMessage);
      console.error('Failed to create replacement trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loadingDrivers || loadingTractors || loadingTrailers || loadingOrder;

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
                value={tractorMaxLoadWeight !== null ? `${tractorMaxLoadWeight} Tấn` : ''}
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
                    value={trailerMaxLoadWeight !== null ? `${trailerMaxLoadWeight} Tấn` : ''}
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
