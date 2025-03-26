import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Avatar,
  Box,
  Divider,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Driver,
  getDriverStatusText,
  getDriverById,
} from "../services/DriverApi";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useParams, useNavigate } from "react-router-dom";

interface DriverDetailDialogProps {
  open?: boolean;
  driver?: Driver | null;
  loading?: boolean;
  onClose?: () => void;
  standalone?: boolean;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} giờ ${mins} phút`;
};

const DriverDetailDialog: React.FC<DriverDetailDialogProps> = ({
  open = false,
  driver: initialDriver = null,
  loading: initialLoading = false,
  onClose = () => {},
  standalone = false,
}) => {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(initialDriver);
  const [loading, setLoading] = useState<boolean>(initialLoading);

  useEffect(() => {
    // If in standalone mode and we have a driverId from URL
    if (standalone && driverId) {
      setLoading(true);
      getDriverById(driverId)
        .then((data) => {
          setDriver(data);
        })
        .catch((error) => {
          console.error("Error fetching driver:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!standalone) {
      // In dialog mode, use the props
      setDriver(initialDriver);
      setLoading(initialLoading);
    }
  }, [driverId, standalone, initialDriver, initialLoading]);

  const handleClose = () => {
    if (standalone) {
      // Navigate back when in standalone mode
      navigate("/staff-menu/drivers");
    } else {
      // Call the provided onClose in dialog mode
      onClose();
    }
  };

  // If not standalone and not open, don't render anything
  if (!standalone && !open) return null;

  // Separate rendering for standalone and dialog modes
  if (standalone) {
    return (
      <Box sx={{ maxWidth: "1000px", margin: "0 auto", mt: 3 }}>
        <Box mb={2}>
          <Typography variant="h4" display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" fontSize="large" />
            Thông tin tài xế
          </Typography>
        </Box>

        <DialogContent dividers={false}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              p={3}
            >
              <CircularProgress />
            </Box>
          ) : driver ? (
            <Grid container spacing={3}>
              {/* Driver profile header */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{ width: 80, height: 80, bgcolor: "primary.main" }}
                  >
                    {driver.fullName
                      ? driver.fullName.charAt(0).toUpperCase()
                      : "D"}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {driver.fullName || "Không có tên"}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        size="small"
                        label={getDriverStatusText(driver.status)}
                        color={
                          driver.status === 1
                            ? "success"
                            : driver.status === 2
                            ? "error"
                            : driver.status === 3
                            ? "warning"
                            : "default"
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        ID: {driver.driverId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Driver stats cards */}
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Tổng thời gian làm việc
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon color="primary" />
                      <Typography variant="h6">
                        {driver.totalWorkingTime !== undefined
                          ? formatTime(driver.totalWorkingTime)
                          : "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Thời gian tuần này
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon color="info" />
                      <Typography variant="h6">
                        {driver.currentWeekWorkingTime !== undefined
                          ? formatTime(driver.currentWeekWorkingTime)
                          : "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Tổng quãng đường
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DirectionsCarIcon color="success" />
                      <Typography variant="h6">
                        {driver.totalKm ? `${driver.totalKm} km` : "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Driver details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin chi tiết
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Email</Typography>
                    <Typography variant="body1" gutterBottom>
                      {driver.email}
                    </Typography>

                    <Typography variant="subtitle2">Số điện thoại</Typography>
                    <Typography variant="body1" gutterBottom>
                      {driver.phoneNumber || "Chưa cập nhật"}
                    </Typography>

                    <Typography variant="subtitle2">Ngày sinh</Typography>
                    <Typography variant="body1" gutterBottom>
                      {driver.dateOfBirth
                        ? new Date(driver.dateOfBirth).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Chưa cập nhật"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Ngày tạo</Typography>
                    <Typography variant="body1" gutterBottom>
                      {driver.createdDate
                        ? new Date(driver.createdDate).toLocaleString("vi-VN")
                        : "N/A"}
                    </Typography>

                    <Typography variant="subtitle2">
                      Cập nhật lần cuối
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {driver.modifiedDate
                        ? new Date(driver.modifiedDate).toLocaleString("vi-VN")
                        : "Chưa cập nhật"}
                    </Typography>

                    <Typography variant="subtitle2">Người tạo</Typography>
                    <Typography variant="body1" gutterBottom>
                      {driver.createdBy || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Driver documents/images if available */}
              {driver.fileUrls && driver.fileUrls.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Tài liệu & Hình ảnh
                  </Typography>
                  <Grid container spacing={1}>
                    {driver.fileUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box
                          component="img"
                          src={url}
                          alt={`Driver document ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography color="text.secondary" align="center">
              Không tìm thấy thông tin tài xế
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ paddingX: 0, mt: 2 }}>
          <Button onClick={handleClose}>Quay lại</Button>
        </DialogActions>
      </Box>
    );
  }

  // Dialog mode
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon color="primary" />
          <Typography variant="h6">Thông tin tài xế</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : driver ? (
          <Grid container spacing={3}>
            {/* Driver profile header */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
                  {driver.fullName
                    ? driver.fullName.charAt(0).toUpperCase()
                    : "D"}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {driver.fullName || "Không có tên"}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Chip
                      size="small"
                      label={getDriverStatusText(driver.status)}
                      color={
                        driver.status === 1
                          ? "success"
                          : driver.status === 2
                          ? "error"
                          : driver.status === 3
                          ? "warning"
                          : "default"
                      }
                    />
                    <Typography variant="body2" color="text.secondary">
                      ID: {driver.driverId}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Driver stats cards */}
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tổng thời gian làm việc
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="h6">
                      {driver.totalWorkingTime !== undefined
                        ? formatTime(driver.totalWorkingTime)
                        : "N/A"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Thời gian tuần này
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="info" />
                    <Typography variant="h6">
                      {driver.currentWeekWorkingTime !== undefined
                        ? formatTime(driver.currentWeekWorkingTime)
                        : "N/A"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tổng quãng đường
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DirectionsCarIcon color="success" />
                    <Typography variant="h6">
                      {driver.totalKm ? `${driver.totalKm} km` : "N/A"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Driver details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin chi tiết
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {driver.email}
                  </Typography>

                  <Typography variant="subtitle2">Số điện thoại</Typography>
                  <Typography variant="body1" gutterBottom>
                    {driver.phoneNumber || "Chưa cập nhật"}
                  </Typography>

                  <Typography variant="subtitle2">Ngày sinh</Typography>
                  <Typography variant="body1" gutterBottom>
                    {driver.dateOfBirth
                      ? new Date(driver.dateOfBirth).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Ngày tạo</Typography>
                  <Typography variant="body1" gutterBottom>
                    {driver.createdDate
                      ? new Date(driver.createdDate).toLocaleString("vi-VN")
                      : "N/A"}
                  </Typography>

                  <Typography variant="subtitle2">Cập nhật lần cuối</Typography>
                  <Typography variant="body1" gutterBottom>
                    {driver.modifiedDate
                      ? new Date(driver.modifiedDate).toLocaleString("vi-VN")
                      : "Chưa cập nhật"}
                  </Typography>

                  <Typography variant="subtitle2">Người tạo</Typography>
                  <Typography variant="body1" gutterBottom>
                    {driver.createdBy || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Driver documents/images if available */}
            {driver.fileUrls && driver.fileUrls.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tài liệu & Hình ảnh
                </Typography>
                <Grid container spacing={1}>
                  {driver.fileUrls.map((url, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box
                        component="img"
                        src={url}
                        alt={`Driver document ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        ) : (
          <Typography color="text.secondary" align="center">
            Không tìm thấy thông tin tài xế
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverDetailDialog;
