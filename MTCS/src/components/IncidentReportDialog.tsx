import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, ImageList, ImageListItem } from "@mui/material";

interface IncidentReportDialogProps {
  incidentReport: {
    reportId: string;
    reportBy: string;
    incidentType: string;
    description: string;
    incidentTime: string;
    location: string;
    type: string;
    status: string;
    resolutionDetails: string;
    handleBy: string;
    handleTime: string;
    createdDate: string;
    incidentImages: string[];
    invoiceImages: string[];
    transferImages: string[];
  };
  onClose: () => void;
}

const IncidentReportDialog: React.FC<IncidentReportDialogProps> = ({ incidentReport, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Incident Report Details</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">Report ID: {incidentReport.reportId}</Typography>
        <Typography variant="body1">Report By: {incidentReport.reportBy}</Typography>
        <Typography variant="body1">Incident Type: {incidentReport.incidentType}</Typography>
        <Typography variant="body1">Description: {incidentReport.description}</Typography>
        <Typography variant="body1">Incident Time: {incidentReport.incidentTime}</Typography>
        <Typography variant="body1">Location: {incidentReport.location}</Typography>
        <Typography variant="body1">Type: {incidentReport.type}</Typography>
        <Typography variant="body1">Status: {incidentReport.status}</Typography>
        <Typography variant="body1">Resolution Details: {incidentReport.resolutionDetails}</Typography>
        <Typography variant="body1">Handle By: {incidentReport.handleBy}</Typography>
        <Typography variant="body1">Handle Time: {incidentReport.handleTime}</Typography>
        <Typography variant="body1">Created Date: {incidentReport.createdDate}</Typography>
        <Typography variant="h6" component="div" sx={{ mt: 2 }}>
          Ảnh sự cố
        </Typography>
        <ImageList cols={3} rowHeight={164}>
          {incidentReport.incidentImages.map((image, index) => (
            <ImageListItem key={index}>
              <img src={image} alt={`Incident Image ${index + 1}`} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>

        <Typography variant="h6" component="div" sx={{ mt: 2 }}>
          Ảnh hóa đơn
        </Typography>
        <ImageList cols={3} rowHeight={164}>
          {incidentReport.invoiceImages.map((image, index) => (
            <ImageListItem key={index}>
              <img src={image} alt={`Invoice Image ${index + 1}`} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>

        <Typography variant="h6" component="div" sx={{ mt: 2 }}>
          Ảnh chuyển nhượng hàng hóa
        </Typography>
        <ImageList cols={3} rowHeight={164}>
          {incidentReport.transferImages.map((image, index) => (
            <ImageListItem key={index}>
              <img src={image} alt={`Transfer Image ${index + 1}`} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentReportDialog;