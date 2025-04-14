import React from "react";
import { Button, IconButton, SxProps, Theme } from "@mui/material";
import StraightenIcon from "@mui/icons-material/Straighten";
import { useNavigate } from "react-router-dom";

interface DistanceCalculatorButtonProps {
  variant?: "text" | "outlined" | "contained";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  iconOnly?: boolean;
  sx?: SxProps<Theme>;
}

const DistanceCalculatorButton: React.FC<DistanceCalculatorButtonProps> = ({
  variant = "outlined",
  color = "primary",
  size = "medium",
  fullWidth = false,
  iconOnly = false,
  sx,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    window.open("/distance-calculator", "_blank");
  };

  if (iconOnly) {
    return (
      <IconButton color={color} size={size} onClick={handleClick} sx={sx}>
        <StraightenIcon />
      </IconButton>
    );
  }

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      startIcon={<StraightenIcon />}
      onClick={handleClick}
      sx={sx}
    >
      Tính khoảng cách
    </Button>
  );
};

export default DistanceCalculatorButton;
