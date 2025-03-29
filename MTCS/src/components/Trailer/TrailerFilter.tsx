import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TrailerStatus } from "../../types/trailer";
import { ContainerSize } from "../../forms/trailer/trailerSchema";

interface FilterOptions {
  status?: TrailerStatus;
  containerSize?: number;
  maintenanceDueSoon?: boolean;
  registrationExpiringSoon?: boolean;
}

interface TrailerFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filterOptions: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

const TrailerFilter: React.FC<TrailerFilterProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters = {},
}) => {
  const [status, setStatus] = useState<TrailerStatus | undefined>(
    currentFilters.status
  );
  const [containerSize, setContainerSize] = useState<number | undefined>(
    currentFilters.containerSize
  );
  const [maintenanceDueSoon, setMaintenanceDueSoon] = useState<boolean>(
    currentFilters.maintenanceDueSoon || false
  );
  const [registrationExpiringSoon, setRegistrationExpiringSoon] =
    useState<boolean>(currentFilters.registrationExpiringSoon || false);

  const handleApplyFilter = () => {
    const filterOptions: FilterOptions = {};

    if (status !== undefined) {
      filterOptions.status = status;
    }

    if (containerSize !== undefined) {
      filterOptions.containerSize = containerSize;
    }

    if (maintenanceDueSoon) {
      filterOptions.maintenanceDueSoon = true;
    }

    if (registrationExpiringSoon) {
      filterOptions.registrationExpiringSoon = true;
    }

    onApplyFilter(filterOptions);
    onClose();
  };

  const handleClearFilter = () => {
    setStatus(undefined);
    setContainerSize(undefined);
    setMaintenanceDueSoon(false);
    setRegistrationExpiringSoon(false);
    onApplyFilter({});
    onClose();
  };

  const handleStatusChange = (
    event: React.MouseEvent<HTMLElement>,
    newStatus: TrailerStatus | null
  ) => {
    setStatus(newStatus || undefined);
  };

  const handleContainerSizeChange = (event: any) => {
    const value = event.target.value;
    setContainerSize(value === "" ? undefined : value);
  };

  const formatContainerSize = (size: number) => {
    return size === ContainerSize.Feet20 ? "20'" : "40'";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Bộ lọc rơ mooc
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
            aria-label="trailer status"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton
              value={TrailerStatus.Active}
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
              value={TrailerStatus.Inactive}
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

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Kích thước Container
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <Select
              value={containerSize || ""}
              onChange={handleContainerSizeChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>Tất cả kích thước</em>
              </MenuItem>
              <MenuItem value={ContainerSize.Feet20}>20'</MenuItem>
              <MenuItem value={ContainerSize.Feet40}>40'</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tình trạng bảo dưỡng
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={maintenanceDueSoon}
                  onChange={(e) => setMaintenanceDueSoon(e.target.checked)}
                  size="small"
                />
              }
              label="Sắp cần bảo dưỡng"
            />
          </FormGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Tình trạng đăng kiểm
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={registrationExpiringSoon}
                  onChange={(e) =>
                    setRegistrationExpiringSoon(e.target.checked)
                  }
                  size="small"
                />
              }
              label="Sắp hết hạn đăng kiểm"
            />
          </FormGroup>
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

export default TrailerFilter;
