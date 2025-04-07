import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { DriverStatus } from "../../types/driver";

interface DriverFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { status?: DriverStatus }) => void;
  currentFilters: { status?: DriverStatus };
}

const DriverFilter: React.FC<DriverFilterProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters,
}) => {
  const [status, setStatus] = useState<DriverStatus | undefined>(
    currentFilters.status !== undefined ? currentFilters.status : undefined
  );

  useEffect(() => {
    if (open) {
      setStatus(
        currentFilters.status !== undefined ? currentFilters.status : undefined
      );
    }
  }, [open, currentFilters]);

  const handleApply = () => {
    onApplyFilter({
      status: status,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setStatus(undefined);
    onApplyFilter({});
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={500}>
          Lọc tài xế
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="status-label">Trạng thái</InputLabel>
            <Select
              labelId="status-label"
              value={status !== undefined ? status : ""}
              onChange={(e) => setStatus(e.target.value as DriverStatus)}
              label="Trạng thái"
              displayEmpty
            >
              <MenuItem value="">
                <em>Tất cả</em>
              </MenuItem>
              <MenuItem value={DriverStatus.Inactive}>Không hoạt động</MenuItem>
              <MenuItem value={DriverStatus.Active}>Đang hoạt động</MenuItem>
              <MenuItem value={DriverStatus.OnDuty}>Đang vận chuyển</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClearFilters} color="inherit">
          Xóa lọc
        </Button>
        <Box sx={{ flex: 1 }}></Box>
        <Button onClick={handleCancel} color="inherit">
          Hủy
        </Button>
        <Button onClick={handleApply} variant="contained">
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverFilter;
