import React from "react";
import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material";

interface TripProps {
  trip: {
    tripId: string;
    orderId: string;
    driverId: string;
    tractorId: string;
    trailerId: string;
    startTime: string;
    endTime?: string;
    status: string;
    distance?: number;
    matchType?: number;
    matchBy?: string;
    matchTime?: string;
    deliveryReports?: any[];
    driver?: any;
    fuelReports?: any[];
    incidentReports?: any[];
    inspectionLogs?: any[];
    order?: any;
    tractor?: any;
    trailer?: any;
    tripStatusHistories?: any[];
  };
  onOpenIncidentReport: (incidentReport: any) => void;
}

const TripManagement: React.FC<TripProps> = ({ trip, onOpenIncidentReport }) => {
  return (
    <Card sx={{ mb: 2, maxHeight: 400, overflow: "auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trip ID: {trip.tripId}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Order ID: {trip.orderId}</Typography>
            <Typography variant="body1">Driver ID: {trip.driverId}</Typography>
            <Typography variant="body1">Tractor ID: {trip.tractorId}</Typography>
            <Typography variant="body1">Trailer ID: {trip.trailerId}</Typography>
            <Typography variant="body1">Start Time: {trip.startTime}</Typography>
            <Typography variant="body1">End Time: {trip.endTime || "N/A"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Status: {trip.status}</Typography>
            <Typography variant="body1">Distance: {trip.distance || "N/A"}</Typography>
            <Typography variant="body1">Match Type: {trip.matchType || "N/A"}</Typography>
            <Typography variant="body1">Match By: {trip.matchBy || "N/A"}</Typography>
            <Typography variant="body1">Match Time: {trip.matchTime || "N/A"}</Typography>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="h6">Additional Information</Typography>
          <Typography variant="body2">Delivery Reports: {trip.deliveryReports?.length || 0}</Typography>
          <Typography variant="body2">Fuel Reports: {trip.fuelReports?.length || 0}</Typography>
          <Typography variant="body2">Incident Reports: {trip.incidentReports?.length || 0}</Typography>
          <Typography variant="body2">Inspection Logs: {trip.inspectionLogs?.length || 0}</Typography>
          <Typography variant="body2">Trip Status Histories: {trip.tripStatusHistories?.length || 0}</Typography>
        </Box>
        {trip.incidentReports && trip.incidentReports.length > 0 && (
          <Box mt={2}>
            <Button variant="outlined" onClick={() => onOpenIncidentReport(trip.incidentReports[0])}>
              Xem Incident Report
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TripManagement;