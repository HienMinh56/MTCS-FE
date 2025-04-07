import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DistanceCalculator from "./DistanceCalculator";
import StraightenIcon from "@mui/icons-material/Straighten";

interface DistanceCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
}

const DistanceCalculatorDialog: React.FC<DistanceCalculatorDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "hidden",
          backgroundImage: "linear-gradient(to bottom, #ffffff, #f9faff)",
        },
      }}
      TransitionProps={{
        timeout: 400,
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.palette.primary.main,
          color: "white",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundImage: "linear-gradient(135deg, #0146C7, #2669e2)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StraightenIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div">
            Tính khoảng cách
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{
            borderRadius: "50%",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#a1a1a1",
          },
        }}
      >
        <DistanceCalculator />
      </DialogContent>
    </Dialog>
  );
};

export default DistanceCalculatorDialog;
