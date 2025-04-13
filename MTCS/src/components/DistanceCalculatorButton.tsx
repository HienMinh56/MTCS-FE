import React from "react";
import { Button, IconButton } from "@mui/material";
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
}

const DistanceCalculatorButton: React.FC<DistanceCalculatorButtonProps> = ({
  variant = "outlined",
  color = "primary",
  size = "medium",
  fullWidth = false,
  iconOnly = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/distance-calculator");
  };

  if (iconOnly) {
    return (
      <IconButton color={color} size={size} onClick={handleClick}>
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
    >
      Tính khoảng cách
    </Button>
  );
};

export default DistanceCalculatorButton;
