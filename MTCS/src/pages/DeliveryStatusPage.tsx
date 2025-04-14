import React, { useEffect, useState } from 'react';
import { fetchDeliveryStatuses, updateDeliveryStatuses, UpdateDeliveryStatusPayload } from '../services/deliveryStatusService';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Container,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  Switch,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Checkbox,
  ButtonGroup
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';

interface DeliveryStatus {
  statusId: string;
  statusName: string;
  isActive: number;
  createdBy: string;
  createdDate: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
  statusIndex: number;
  tripStatusHistories: any[];
}

const DeliveryStatusPage: React.FC = () => {
  const [statuses, setStatuses] = useState<DeliveryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [showInactive, setShowInactive] = useState(false); // State to track whether to show inactive statuses
  const theme = useTheme();
  
  // Add status dialog state
  const [addStatusDialogOpen, setAddStatusDialogOpen] = useState(false);
  const [newStatusId, setNewStatusId] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusActive, setNewStatusActive] = useState(1);
  const [statusIdError, setStatusIdError] = useState('');
  const [statusNameError, setStatusNameError] = useState('');

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    setLoading(true);
    try {
      const data = await fetchDeliveryStatuses();
      // Filter out statuses with names "canceled" and "delaying" (case insensitive)
      const filteredData = data.filter((status: DeliveryStatus) => 
        !['canceled', 'delaying'].includes(status.statusId.toLowerCase())
      );
      // Sort by statusIndex
      const sortedData = [...filteredData].sort((a, b) => a.statusIndex - b.statusIndex);
      setStatuses(sortedData);
    } catch (error) {
      console.error('Error fetching delivery statuses:', error);
      showAlert('Failed to load delivery statuses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const toggleStatusActive = (statusId: string) => {
    setStatuses(prevStatuses => {
      const updatedStatuses = prevStatuses.map(status => {
        if (status.statusId === statusId) {
          return {
            ...status,
            isActive: status.isActive === 1 ? 0 : 1
          };
        }
        return status;
      });
      setModified(true);
      return updatedStatuses;
    });
  };

  const moveStatusUp = (index: number) => {
    if (index <= 0) return; // Can't move first item up
    
    setStatuses(prevStatuses => {
      const updatedStatuses = [...prevStatuses];
      // Swap items
      [updatedStatuses[index - 1], updatedStatuses[index]] = [updatedStatuses[index], updatedStatuses[index - 1]];
      
      // Update statusIndex values to match new positions
      return updatedStatuses.map((status, idx) => ({
        ...status,
        statusIndex: idx
      }));
    });
    setModified(true);
  };

  const moveStatusDown = (index: number) => {
    if (index >= statuses.length - 1) return; // Can't move last item down
    
    setStatuses(prevStatuses => {
      const updatedStatuses = [...prevStatuses];
      // Swap items
      [updatedStatuses[index], updatedStatuses[index + 1]] = [updatedStatuses[index + 1], updatedStatuses[index]];
      
      // Update statusIndex values to match new positions
      return updatedStatuses.map((status, idx) => ({
        ...status,
        statusIndex: idx
      }));
    });
    setModified(true);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Prepare payload for API
      const payload: UpdateDeliveryStatusPayload[] = statuses.map(status => ({
        statusId: status.statusId,
        statusName: status.statusName,
        isActive: status.isActive,
        statusIndex: status.statusIndex
      }));
      
      const response = await updateDeliveryStatuses(payload);
      showAlert('Delivery statuses updated successfully', 'success');
      setModified(false);
    } catch (error) {
      console.error('Error updating delivery statuses:', error);
      showAlert('Failed to update delivery statuses', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const enableEditMode = (statusId: string, currentName: string) => {
    setEditModeId(statusId);
    setEditedName(currentName);
  };
  
  const saveStatusName = (statusId: string) => {
    if (editedName.trim() === '') return;
    
    setStatuses(prevStatuses => {
      const updatedStatuses = prevStatuses.map(status => {
        if (status.statusId === statusId) {
          return {
            ...status,
            statusName: editedName.trim()
          };
        }
        return status;
      });
      setModified(true);
      return updatedStatuses;
    });
    
    setEditModeId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, statusId: string) => {
    if (e.key === 'Enter') {
      saveStatusName(statusId);
    } else if (e.key === 'Escape') {
      setEditModeId(null);
    }
  };

  const handleOpenAddStatusDialog = () => {
    // Reset form fields
    setNewStatusId('');
    setNewStatusName('');
    setNewStatusActive(1);
    setStatusIdError('');
    setStatusNameError('');
    setAddStatusDialogOpen(true);
  };

  const handleCloseAddStatusDialog = () => {
    setAddStatusDialogOpen(false);
  };

  const validateNewStatusForm = () => {
    let isValid = true;

    // Validate Status ID
    if (!newStatusId.trim()) {
      setStatusIdError('Status ID is required');
      isValid = false;
    } else if (statuses.some(status => status.statusId === newStatusId.trim())) {
      setStatusIdError('Status ID already exists');
      isValid = false;
    } else {
      setStatusIdError('');
    }

    // Validate Status Name
    if (!newStatusName.trim()) {
      setStatusNameError('Status Name is required');
      isValid = false;
    } else {
      setStatusNameError('');
    }

    return isValid;
  };

  const handleAddNewStatus = () => {
    if (!validateNewStatusForm()) {
      return;
    }

    // Create a new status with current date and next available index
    const nextIndex = statuses.length > 0 
      ? Math.max(...statuses.map(s => s.statusIndex)) + 1 
      : 0;
    
    const newStatus: DeliveryStatus = {
      statusId: newStatusId.trim(),
      statusName: newStatusName.trim(),
      isActive: newStatusActive,
      createdBy: 'current-user', // This would normally come from auth context
      createdDate: new Date().toISOString(),
      modifiedDate: null,
      modifiedBy: null,
      deletedDate: null,
      deletedBy: null,
      statusIndex: nextIndex,
      tripStatusHistories: []
    };

    // Add the new status to the current list
    setStatuses(prevStatuses => [...prevStatuses, newStatus]);
    setModified(true);
    
    // Close the dialog
    handleCloseAddStatusDialog();
    
    // Show success message
    showAlert('New status added successfully. Remember to save changes!', 'success');
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmSaveChanges = () => {
    handleCloseConfirmDialog();
    saveChanges();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            py: 2, 
            px: 3
          }}
        >
          <Typography variant="h4" color="white" fontWeight="bold">
            Delivery Statuses
          </Typography>
          <Typography variant="body1" color="white" sx={{ mt: 0.5, opacity: 0.9 }}>
            Overview of all delivery status types in the system
          </Typography>
        </Box>
        <CardContent>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
                label="Show Inactive Statuses"
              />
            </FormGroup>
          </Box>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell width="40%" sx={{ fontWeight: 'bold' }}>Status Name</TableCell>
                  <TableCell align="center" width="20%" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" width="40%" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses
                  .filter(status => showInactive || status.isActive === 1)
                  .map((status, index) => (
                  <TableRow 
                    key={status.statusId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: theme.palette.grey[50] } }}
                  >
                    <TableCell component="th" scope="row">
                      {editModeId === status.statusId ? (
                        <TextField 
                          value={editedName} 
                          onChange={(e) => setEditedName(e.target.value)} 
                          onKeyDown={(e) => handleKeyDown(e, status.statusId)} 
                          size="small" 
                          autoFocus 
                          sx={{ width: '100%' }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight="medium">
                          {status.statusName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {status.isActive ? (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Active" 
                          size="small" 
                          color="success" 
                          sx={{ fontWeight: 'medium' }}
                        />
                      ) : (
                        <Chip 
                          icon={<CancelIcon />} 
                          label="Inactive" 
                          size="small" 
                          color="error"
                          sx={{ fontWeight: 'medium' }} 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Toggle Active Status">
                          <Switch 
                            checked={status.isActive === 1} 
                            onChange={() => toggleStatusActive(status.statusId)}
                            size="small"
                          />
                        </Tooltip>

                        <ButtonGroup size="small" sx={{ ml: 1 }}>
                          <Tooltip title="Move Up">
                            <span> {/* Wrap with span to allow tooltip on disabled button */}
                              <IconButton 
                                onClick={() => moveStatusUp(index)} 
                                disabled={index === 0}
                                size="small"
                              >
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          
                          <Tooltip title="Move Down">
                            <span> {/* Wrap with span to allow tooltip on disabled button */}
                              <IconButton 
                                onClick={() => moveStatusDown(index)} 
                                disabled={index === statuses.length - 1}
                                size="small"
                              >
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </ButtonGroup>

                        {editModeId === status.statusId ? (
                          <Tooltip title="Save Name">
                            <IconButton 
                              onClick={() => saveStatusName(status.statusId)}
                              size="small"
                              color="primary"
                            >
                              <DoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit Name">
                            <IconButton 
                              onClick={() => enableEditMode(status.statusId, status.statusName)}
                              size="small"
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {statuses.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No delivery statuses found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {showInactive 
              ? `Total Statuses: ${statuses.length}` 
              : `Active Statuses: ${statuses.filter(status => status.isActive === 1).length}`
            }
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddStatusDialog}
            size="small"
          >
            Add New Status
          </Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />} 
          onClick={handleOpenConfirmDialog} 
          disabled={!modified || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Add Status Dialog */}
      <Dialog open={addStatusDialogOpen} onClose={handleCloseAddStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 'bold'
        }}>
          Add New Delivery Status
        </DialogTitle>
        <DialogContent sx={{ pt: 2, mt: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details for the new delivery status.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Status ID"
            fullWidth
            variant="outlined"
            value={newStatusId}
            onChange={(e) => setNewStatusId(e.target.value)}
            error={!!statusIdError}
            helperText={statusIdError}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Status Name"
            fullWidth
            variant="outlined"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            error={!!statusNameError}
            helperText={statusNameError}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={newStatusActive === 1}
                onChange={(e) => setNewStatusActive(e.target.checked ? 1 : 0)}
                color="primary"
              />
            }
            label="Status Active"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseAddStatusDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleAddNewStatus} 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Save Changes Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={handleCloseConfirmDialog} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle sx={{ 
          background: theme.palette.primary.main,
          color: 'white',
          fontWeight: 'bold',
          py: 1.5,
          fontSize: '1rem'
        }}>
          Xác nhận thay đổi
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <WarningIcon color="warning" sx={{ mr: 1.5, fontSize: 24 }} />
            <DialogContentText>
              Bạn có chắc chắn muốn lưu các thay đổi trạng thái giao hàng không?
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button 
            onClick={handleCloseConfirmDialog} 
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ minWidth: 80 }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmSaveChanges} 
            variant="contained" 
            color="primary"
            size="small"
            sx={{ minWidth: 80 }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryStatusPage;