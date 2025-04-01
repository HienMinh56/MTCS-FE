import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Stack,
  Snackbar
} from '@mui/material';
import { createContract } from '../../services/contractApi';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { format } from 'date-fns';
import axios from 'axios';
import { formatApiError } from '../../utils/errorFormatting';
import { ContractStatus, OrderStatus } from '../../types/contract';

interface AddContractFileModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId?: string; // Make customerId optional since we'll add an input field
  orderId: string;
}

const AddContractFileModal: React.FC<AddContractFileModalProps> = ({
  open,
  onClose,
  onSuccess,
  customerId: initialCustomerId,
  orderId
}) => {
  // Basic contract fields
  const [summary, setSummary] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [signedDate, setSignedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [signedTime, setSignedTime] = useState<string>(format(new Date(), 'HH:mm')); // Changed back to time format
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.Active);
  const [customerId, setCustomerId] = useState<string>(initialCustomerId || '');
  
  // Files and file metadata
  const [files, setFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<OrderStatus[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // For each new file, add default values for all required fields
      setFileDescriptions(prev => [...prev, ...newFiles.map(() => '')]);
      setFileNotes(prev => [...prev, ...newFiles.map(() => '')]);
      setFileStatuses(prev => [...prev, ...newFiles.map(() => OrderStatus.Valid)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setFileDescriptions(prev => prev.filter((_, i) => i !== index));
    setFileNotes(prev => prev.filter((_, i) => i !== index));
    setFileStatuses(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleFileDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...fileDescriptions];
    newDescriptions[index] = value;
    setFileDescriptions(newDescriptions);
  };

  const handleFileNoteChange = (index: number, value: string) => {
    const newNotes = [...fileNotes];
    newNotes[index] = value;
    setFileNotes(newNotes);
  };

  const handleFileStatusChange = (index: number, value: OrderStatus) => {
    const newStatuses = [...fileStatuses];
    newStatuses[index] = value;
    setFileStatuses(newStatuses);
  };
  
  const validateForm = () => {
    if (!summary.trim()) {
      setError('Vui lòng nhập tiêu đề hợp đồng');
      return false;
    }

    if (!signedBy.trim()) {
      setError('Vui lòng nhập người ký hợp đồng');
      return false;
    }

    if (!signedDate.trim()) {
      setError('Vui lòng chọn ngày ký');
      return false;
    }

    if (!signedTime.trim()) {
      setError('Vui lòng chọn giờ ký');
      return false;
    }

    if (!startDate.trim()) {
      setError('Vui lòng chọn ngày bắt đầu');
      return false;
    }

    if (!endDate.trim()) {
      setError('Vui lòng chọn ngày kết thúc');
      return false;
    }

    if (!customerId.trim()) {
      setError('Vui lòng nhập mã khách hàng');
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(signedDate)) {
      setError('Định dạng ngày ký không hợp lệ');
      return false;
    }

    if (!dateRegex.test(startDate)) {
      setError('Định dạng ngày bắt đầu không hợp lệ');
      return false;
    }

    if (!dateRegex.test(endDate)) {
      setError('Định dạng ngày kết thúc không hợp lệ');
      return false;
    }

    const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(signedTime)) {
      setError('Định dạng giờ ký không hợp lệ');
      return false;
    }

    // Validate that startDate is after or equal to signedDate
    const signedDateObj = new Date(signedDate);
    const startDateObj = new Date(startDate);
    if (startDateObj < signedDateObj) {
      setError('Ngày bắt đầu không được trước ngày ký');
      return false;
    }

    // Validate that end date is after startDate
    const endDateObj = new Date(endDate);
    if (endDateObj <= startDateObj) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }

    if (files.length === 0) {
      setError('Vui lòng thêm ít nhất một tệp đính kèm');
      return false;
    }
    
    // Check if every file has the required metadata
    const missingDescriptions = fileDescriptions.some(desc => !desc.trim());
    const missingNotes = fileNotes.some(note => !note.trim());
    
    if (missingDescriptions) {
      setError('Vui lòng nhập mô tả cho tất cả các tệp đính kèm');
      return false;
    }
    
    if (missingNotes) {
      setError('Vui lòng nhập ghi chú cho tất cả các tệp đính kèm');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Combine date and time for signedTime
      const combinedDateTime = `${signedDate}T${signedTime}:00`;
      
      const formData = new FormData();
      formData.append('summary', summary);
      formData.append('signedBy', signedBy);
      formData.append('signedDate', signedDate);
      formData.append('signedTime', combinedDateTime); // Send as ISO string with both date and time
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('status', status.toString());
      formData.append('customerId', customerId); // Now using the state value
      formData.append('orderId', orderId);
      
      // Add general description and note if needed
      formData.append('description', description);
      formData.append('note', note);

      // Add all files with corresponding metadata
      files.forEach((file, index) => {
        formData.append('files', file);
        formData.append('descriptions', fileDescriptions[index]);
        formData.append('notes', fileNotes[index]);
        formData.append('fileStatuses', fileStatuses[index].toString());
      });

      console.log('===== CONTRACT CREATE REQUEST DATA =====');
      console.log('FormData keys:', [...formData.keys()]);
      console.log('SignedDate:', signedDate);
      console.log('SignedTime (combined):', combinedDateTime);
      console.log('StartDate:', startDate);
      console.log('EndDate:', endDate);
      console.log('CustomerId:', customerId);
      console.log('Files:', files);
      console.log('File Descriptions:', fileDescriptions);
      console.log('File Notes:', fileNotes);
      console.log('File Statuses:', fileStatuses);

      const response = await createContract(formData);
      console.log('===== CONTRACT CREATE RESPONSE =====');
      console.log('Response:', response);
      
      setSnackbar({
        open: true,
        message: "Tạo hợp đồng thành công!",
        severity: "success",
      });
      
      setTimeout(() => {
        setLoading(false);
        onSuccess();
        handleClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('===== CONTRACT CREATE ERROR =====');
      console.error('Error details:', err);
      
      let errorMessage = "Không thể tạo hợp đồng. Vui lòng thử lại.";

      // Handle Axios error
      if (axios.isAxiosError(err)) {
        if (err.response?.data) {
          errorMessage = formatApiError(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    // Reset form when closing
    setSummary('');
    setSignedBy('');
    setSignedDate(format(new Date(), 'yyyy-MM-dd'));
    setSignedTime(format(new Date(), 'HH:mm')); // Reset to current time
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'));
    setDescription('');
    setNote('');
    setStatus(ContractStatus.Active);
    setCustomerId(initialCustomerId || '');
    setFiles([]);
    setFileDescriptions([]);
    setFileNotes([]);
    setFileStatuses([]);
    setError('');
    
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Thêm tài liệu hợp đồng mới</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tiêu đề hợp đồng"
                fullWidth
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Người ký"
                fullWidth
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Mã khách hàng"
                fullWidth
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                disabled={!!initialCustomerId}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày ký"
                type="date"
                value={signedDate}
                onChange={(e) => setSignedDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Giờ ký"
                type="time"
                value={signedTime}
                onChange={(e) => setSignedTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày bắt đầu"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày kết thúc"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContractStatus)}
                  label="Trạng thái"
                >
                  <MenuItem value={ContractStatus.Active}>Hoạt động</MenuItem>
                  <MenuItem value={ContractStatus.Inactive}>Không hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Ghi chú"
                fullWidth
                multiline
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Tải lên tài liệu
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />
              </Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tài liệu đã chọn ({files.length})
                </Typography>
                {files.map((file, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      borderRadius: 1
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Xóa
                      </Button>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth margin="normal" required>
                          <InputLabel>Trạng thái tệp</InputLabel>
                          <Select
                            value={fileStatuses[index] || OrderStatus.Valid}
                            onChange={(e) => handleFileStatusChange(index, e.target.value as OrderStatus)}
                            label="Trạng thái tệp"
                          >
                            <MenuItem value={OrderStatus.Valid}>Hợp lệ</MenuItem>
                            <MenuItem value={OrderStatus.Invalid}>Không hợp lệ</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Mô tả tệp đính kèm"
                          fullWidth
                          required
                          margin="normal"
                          value={fileDescriptions[index] || ''}
                          onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                          error={!fileDescriptions[index]?.trim()}
                          helperText={!fileDescriptions[index]?.trim() ? "Vui lòng nhập mô tả tệp đính kèm" : ""}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Ghi chú tệp đính kèm"
                          fullWidth
                          required
                          margin="normal"
                          value={fileNotes[index] || ''}
                          onChange={(e) => handleFileNoteChange(index, e.target.value)}
                          error={!fileNotes[index]?.trim()}
                          helperText={!fileNotes[index]?.trim() ? "Vui lòng nhập ghi chú tệp đính kèm" : ""}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddContractFileModal;
