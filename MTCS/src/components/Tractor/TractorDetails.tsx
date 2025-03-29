import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Grid,
  Typography,
  IconButton,
  Box,
  Paper,
  Fade,
  Button,
  DialogActions,
  Snackbar,
  Alert,
  DialogContentText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getTractorDetails,
  deactivateTractor,
} from "../../services/tractorApi";
import {
  TractorDetails as ITractorDetails,
  ContainerType,
} from "../../types/tractor";

interface Props {
  open: boolean;
  tractorId: string | null | undefined;
  onClose: () => void;
  onDelete?: () => void;
}

const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

const TractorDetails = ({ open, tractorId, onClose, onDelete }: Props) => {
  const [details, setDetails] = useState<ITractorDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (tractorId) {
      fetchDetails();
    } else {
      setDetails(null);
    }
  }, [tractorId]);

  const fetchDetails = async () => {
    if (!tractorId) return;
    try {
      setLoading(true);
      const response = await getTractorDetails(tractorId);
      if (response.success) {
        setDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching tractor details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tractorId) {
      fetchDetails();
    }
  }, [tractorId, open]);

  const handleDeleteClick = () => {
    setConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!tractorId) return;

    setDeleteLoading(true);
    try {
      const response = await deactivateTractor(tractorId);

      if (response.success) {
        setAlert({
          open: true,
          message: "Đầu kéo đã được vô hiệu hóa thành công",
          severity: "success",
        });

        if (onDelete) {
          onDelete();
        }
        setConfirmDialog(false);
        onClose();
      } else {
        setAlert({
          open: true,
          message: response.messageVN || "Không thể vô hiệu hóa đầu kéo",
          severity: "error",
        });
        setConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error deleting tractor:", error);
      setAlert({
        open: true,
        message: "Đã xảy ra lỗi khi vô hiệu hóa đầu kéo",
        severity: "error",
      });
      setConfirmDialog(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          Chi tiết đầu kéo
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1.5, bgcolor: "#f5f5f5" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : details ? (
            <Grid container spacing={1}>
              {[
                { label: "Biển số xe", value: details.licensePlate },
                { label: "Hãng sản xuất", value: details.brand },
                { label: "Năm sản xuất", value: details.manufactureYear },
                {
                  label: "Tải trọng tối đa",
                  value: `${details.maxLoadWeight} tấn`,
                },
                {
                  label: "Loại container",
                  value:
                    details.containerType === ContainerType.DryContainer
                      ? "Khô"
                      : "Lạnh",
                },
                { label: "Số chuyến hàng", value: details.orderCount },
              ].map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      height: "100%",
                      backgroundColor: "white",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.25, fontWeight: 500 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}

              {[
                {
                  label: "Bảo dưỡng gần nhất",
                  value: formatDate(details.lastMaintenanceDate),
                },
                {
                  label: "Bảo dưỡng tiếp theo",
                  value: formatDate(details.nextMaintenanceDate),
                },
                {
                  label: "Ngày đăng kiểm",
                  value: formatDate(details.registrationDate),
                },
                {
                  label: "Hạn đăng kiểm",
                  value: formatDate(details.registrationExpirationDate),
                },
              ].map((item, index) => (
                <Grid item xs={6} key={`date-${index}`}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      height: "100%",
                      backgroundColor: "rgba(25, 118, 210, 0.08)",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      sx={{ mb: 0.25, fontWeight: 500 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "primary.dark" }}
                    >
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Không có thông tin chi tiết.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Đóng
          </Button>
          {onDelete && (
            <Button
              onClick={handleDeleteClick}
              color="secondary"
              startIcon={<DeleteIcon />}
            >
              Vô hiệu hóa
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn vô hiệu hóa đầu kéo này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="primary">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="secondary"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TractorDetails;
