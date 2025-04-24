import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UserStatus } from "../../types/auth";

interface FilterOptions {
  role?: number;
  isDeleted?: boolean;
}

interface UserFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filterOptions: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

const UserFilter: React.FC<UserFilterProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters = {},
}) => {
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(
    currentFilters.isDeleted
  );

  // Synchronize with current filters when dialog opens
  useEffect(() => {
    if (open) {
      setIsDeleted(currentFilters.isDeleted);
    }
  }, [open, currentFilters]);

  const handleApplyFilter = () => {
    const filterOptions: FilterOptions = {};

    if (isDeleted !== undefined) {
      filterOptions.isDeleted = isDeleted;
    }

    onApplyFilter(filterOptions);
    onClose();
  };

  const handleClearFilter = () => {
    setIsDeleted(undefined);
    onApplyFilter({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Bộ lọc người dùng
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
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDeleted === true}
                  onChange={(e) =>
                    setIsDeleted(e.target.checked ? true : undefined)
                  }
                  size="small"
                />
              }
              label="Người dùng đã vô hiệu hóa"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDeleted === false}
                  onChange={(e) =>
                    setIsDeleted(e.target.checked ? false : undefined)
                  }
                  size="small"
                />
              }
              label="Người dùng đang hoạt động"
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

export default UserFilter;
