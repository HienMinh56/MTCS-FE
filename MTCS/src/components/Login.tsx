import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PasswordField from "./PasswordVisibility";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";

interface LoginProps {
  open: boolean;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ open, onClose }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", credentials);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Đăng nhập ngay</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
          />
          <PasswordField
            fullWidth
            label="Mât khẩu"
            margin="normal"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setForgotPasswordOpen(true)}
            >
              Quên mật khẩu?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Đăng nhập
          </Button>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="text"
              onClick={() => setRegisterOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Đăng ký
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <ForgotPassword
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
      <Register open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </Dialog>
  );
};

export default Login;
