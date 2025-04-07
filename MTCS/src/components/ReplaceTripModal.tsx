import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { tripRelace } from "../types/trip";
import { createTripReplace } from "../services/tripApi";

interface ReplaceTripModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess?: () => void;
}

const ReplaceTripModal = ({ open, onClose, tripId, onSuccess }: ReplaceTripModalProps) => {
  const [formData, setFormData] = useState({
    driverId: "",
    tractorID: "",
    trailerId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      const tripReplaceData: tripRelace = {
        tripId,
        driverId: formData.driverId,
        tractorID: formData.tractorID,
        trailerId: formData.trailerId,
        status: "active", // Default status for replacement trip
      };

      await createTripReplace(tripReplaceData);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create replacement trip:", err);
      setError("Không thể tạo chuyến thay thế. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo chuyến đi thay thế</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Mã chuyến đi cần thay thế: {tripId}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="driverId"
              label="Mã tài xế"
              value={formData.driverId}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="tractorID"
              label="Mã đầu kéo"
              value={formData.tractorID}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="trailerId"
              label="Mã rơ moóc"
              value={formData.trailerId}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy bỏ
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading || !formData.driverId || !formData.tractorID || !formData.trailerId}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          {loading ? "Đang xử lý..." : "Tạo chuyến"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplaceTripModal;
