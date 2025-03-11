import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/authApi";

interface LogoutButtonProps extends ButtonProps {
  buttonType?: "button" | "menuItem";
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  buttonType = "button",
  ...props
}) => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");

    if (props.onClick) {
      props.onClick({} as React.MouseEvent<HTMLButtonElement>);
    }
  };

  return buttonType === "menuItem" ? (
    <div onClick={handleLogout} style={{ width: "100%", color: "inherit" }}>
      Đăng xuất
    </div>
  ) : (
    <Button {...props} onClick={handleLogout} variant="contained" color="error">
      Đăng xuất
    </Button>
  );
};

export default LogoutButton;
