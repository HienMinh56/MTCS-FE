import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from "@mui/material";

interface AddTripDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTrip: (trip: any) => void;
}

const AddTripDialog: React.FC<AddTripDialogProps> = ({ open, onClose, onAddTrip }) => {
  const [trip, setTrip] = useState({
    tripId: "",
    orderId: "",
    driverId: "",
    tractorId: "",
    trailerId: "",
    startTime: "",
    endTime: "",
    status: "",
    distance: "",
    matchType: "",
    matchBy: "",
    matchTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrip((prevTrip) => ({ ...prevTrip, [name]: value }));
  };

  const handleAdd = () => {
    onAddTrip(trip);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Trip</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Trip ID"
              name="tripId"
              value={trip.tripId}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Order ID"
              name="orderId"
              value={trip.orderId}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Driver ID"
              name="driverId"
              value={trip.driverId}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Tractor ID"
              name="tractorId"
              value={trip.tractorId}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Trailer ID"
              name="trailerId"
              value={trip.trailerId}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Time"
              name="startTime"
              value={trip.startTime}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="End Time"
              name="endTime"
              value={trip.endTime}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Status"
              name="status"
              value={trip.status}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Distance"
              name="distance"
              value={trip.distance}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Match Type"
              name="matchType"
              value={trip.matchType}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Match By"
              name="matchBy"
              value={trip.matchBy}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Match Time"
              name="matchTime"
              value={trip.matchTime}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAdd} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTripDialog;