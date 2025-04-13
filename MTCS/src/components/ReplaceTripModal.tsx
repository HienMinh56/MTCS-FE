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

interface ReplaceTripModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess?: () => void;
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
}

// Trailer option interface
interface TrailerOption {
  id: string;
  licensePlate: string;
  brand: string;
  maxLoadWeight?: number;
}

const ReplaceTripModal = ({ open, onClose, tripId, onSuccess }: ReplaceTripModalProps) => {
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
  
  // Options for dropdown selects
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [tractors, setTractors] = useState<TractorOption[]>([]);
  const [trailers, setTrailers] = useState<TrailerOption[]>([]);
  
  const [error, setError] = useState("");
  
  // Add state variables for maxLoadWeight
  const [tractorMaxLoadWeight, setTractorMaxLoadWeight] = useState<number | null>(null);
  const [trailerMaxLoadWeight, setTrailerMaxLoadWeight] = useState<number | null>(null);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchDrivers();
      fetchTractors();
      fetchTrailers();
    }
  }, [open]);

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
        console.log(driverOptions);
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
        }));
        setTractors(tractorOptions);
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
        trailerId: formData.trailerId || null // This can be null
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

  const isLoading = loadingDrivers || loadingTractors || loadingTrailers;

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
                options={tractors}
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
            
            {/* Trailer Dropdown (Optional) */}
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
                    helperText="Trường này có thể để trống nếu không cần rơ moóc"
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
