import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

interface LogoutButtonProps extends ButtonProps {
  buttonType?: "button" | "menuItem";
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  buttonType = "button",
  ...props
}) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

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
