import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TractorStatus, ContainerType } from "../../types/tractor";

interface FilterOptions {
  status?: TractorStatus;
  containerType?: ContainerType;
  maintenanceDueSoon?: boolean;
  registrationExpiringSoon?: boolean;
}

interface TractorFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filterOptions: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

const TractorFilter: React.FC<TractorFilterProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters = {},
}) => {
  const [status, setStatus] = useState<TractorStatus | undefined>(
    currentFilters.status
  );
  const [containerType, setContainerType] = useState<ContainerType | undefined>(
    currentFilters.containerType
  );
  const [maintenanceDueSoon, setMaintenanceDueSoon] = useState<boolean>(
    currentFilters.maintenanceDueSoon || false
  );
  const [registrationExpiringSoon, setRegistrationExpiringSoon] =
    useState<boolean>(currentFilters.registrationExpiringSoon || false);

  // Đồng bộ hóa các trạng thái của dialog với currentFilters khi mở dialog
  useEffect(() => {
    if (open) {
      setStatus(currentFilters.status);
      setContainerType(currentFilters.containerType);
      setMaintenanceDueSoon(currentFilters.maintenanceDueSoon || false);
      setRegistrationExpiringSoon(currentFilters.registrationExpiringSoon || false);
    }
  }, [open, currentFilters]);

  const handleApplyFilter = () => {
    const filterOptions: FilterOptions = {};

    if (status !== undefined) {
      filterOptions.status = status;
    }

    if (containerType !== undefined) {
      filterOptions.containerType = containerType;
    }

    if (maintenanceDueSoon) {
      filterOptions.maintenanceDueSoon = true;
    }

    if (registrationExpiringSoon) {
      filterOptions.registrationExpiringSoon = true;
    }

    // Apply filter immediately
    onApplyFilter(filterOptions);
    onClose();
  };

  const handleClearFilter = () => {
    setStatus(undefined);
    setContainerType(undefined);
    setMaintenanceDueSoon(false);
    setRegistrationExpiringSoon(false);
    onApplyFilter({});
    onClose();
  };

  // Apply filter instantly when toggling status or container type
  const handleStatusChange = (
    event: React.MouseEvent<HTMLElement>,
    newStatus: TractorStatus | null
  ) => {
    setStatus(newStatus || undefined);

    // Auto-apply for better responsiveness (optional, uncomment if needed)
    // const filterOptions: FilterOptions = {...currentFilters};
    // filterOptions.status = newStatus || undefined;
    // onApplyFilter(filterOptions);
  };

  const handleContainerTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newContainerType: ContainerType | null
  ) => {
    setContainerType(newContainerType || undefined);

    // Auto-apply for better responsiveness (optional, uncomment if needed)
    // const filterOptions: FilterOptions = {...currentFilters};
    // filterOptions.containerType = newContainerType || undefined;
    // onApplyFilter(filterOptions);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Bộ lọc đầu kéo
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
            aria-label="tractor status"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton
              value={TractorStatus.Active}
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
              value={TractorStatus.OnDuty}
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
              value={TractorStatus.Inactive}
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
            Loại Container
          </Typography>
          <ToggleButtonGroup
            value={containerType}
            exclusive
            onChange={handleContainerTypeChange}
            aria-label="container type"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton
              value={ContainerType.DryContainer}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "info.light",
                  color: "info.contrastText",
                  "&:hover": {
                    backgroundColor: "info.main",
                  },
                },
              }}
            >
              Khô
            </ToggleButton>
            <ToggleButton
              value={ContainerType.ReeferContainer}
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
              Lạnh
            </ToggleButton>
          </ToggleButtonGroup>
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

export default TractorFilter;
