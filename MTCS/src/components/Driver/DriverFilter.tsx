import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DriverStatus } from "../../types/driver";

interface FilterOptions {
  status?: DriverStatus | null;
}

interface DriverFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const DriverFilter: React.FC<DriverFilterProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters,
}) => {
  const [status, setStatus] = useState<DriverStatus | null | undefined>(
    currentFilters.status
  );

  useEffect(() => {
    if (open) {
      setStatus(currentFilters.status);
    }
  }, [open, currentFilters]);

  const handleApplyFilter = () => {
    onApplyFilter({
      status: status,
    });
    onClose();
  };

  const handleClearFilter = () => {
    setStatus(undefined);
    onApplyFilter({});
    onClose();
  };

  const handleStatusChange = (
    event: React.MouseEvent<HTMLElement>,
    newStatus: DriverStatus | null
  ) => {
    setStatus(newStatus);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Bộ lọc tài xế
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Trạng thái
          </Typography>
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={handleStatusChange}
            aria-label="driver status"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton
              value={DriverStatus.Active}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "success.light",
                  color: "success.contrastText",
                  "&:hover": {
                    backgroundColor: "success.main",
                  },
                },
              }}
            >
              Đang hoạt động
            </ToggleButton>
            <ToggleButton
              value={DriverStatus.OnDuty}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                },
              }}
            >
              Đang vận chuyển
            </ToggleButton>
            <ToggleButton
              value={DriverStatus.Inactive}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "error.light",
                  color: "error.contrastText",
                  "&:hover": {
                    backgroundColor: "error.main",
                  },
                },
              }}
            >
              Không hoạt động
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={handleClearFilter}>Xóa bộ lọc</Button>
        <Button onClick={handleApplyFilter} variant="contained">
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverFilter;
