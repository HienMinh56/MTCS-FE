import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Link,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import { getDriverById } from "../services/DriverApi";
import {
  Driver,
  getDriverStatusColor,
  DriverStatus,
  DriverFile,
} from "../types/driver";

const DriverProfile: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverProfile = async () => {
      if (!driverId) {
        setError("Driver ID is missing");
        setLoading(false);
        return;
      }

      try {
        const driverData = await getDriverById(driverId);
        setDriver(driverData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load driver profile");
        setLoading(false);
        console.error(err);
      }
    };

    fetchDriverProfile();
  }, [driverId]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusText = (status: DriverStatus): string => {
    switch (status) {
      case DriverStatus.Active:
        return "Đang hoạt động";
      case DriverStatus.Inactive:
        return "Không hoạt động";
      case DriverStatus.OnDuty:
        return "Đang vận chuyển";
      default:
        return "Không xác định";
    }
  };

  const isImageFile = (fileType: string): boolean => {
    return (
      fileType.toLowerCase().includes("image") ||
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileType.toLowerCase())
    );
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return <PictureAsPdfIcon color="error" />;
    } else if (isImageFile(type)) {
      return <ImageIcon color="primary" />;
    } else if (type.includes("doc") || type.includes("word")) {
      return <DescriptionIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !driver) {
    return (
      <Container>
        <Typography variant="h6" color="error" sx={{ mt: 4 }}>
          {error || "Không tìm thấy tài xế"}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        Quay lại danh sách tài xế
      </Button>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Thông tin tài xế
          </Typography>
          <Chip
            label={getStatusText(driver.status)}
            color={getDriverStatusColor(driver.status) as any}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Họ và tên
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {driver.fullName || "N/A"}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {driver.email || "N/A"}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Số điện thoại
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {driver.phoneNumber || "N/A"}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Ngày sinh
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(driver.dateOfBirth)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Ngày tạo
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(driver.createdDate)}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Cập nhật lần cuối
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(driver.modifiedDate)}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Tổng thời gian làm việc
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {driver.totalWorkingTime || 0} giờ
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Thời gian làm tuần này
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {driver.currentWeekWorkingTime || 0} giờ
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">
              Tổng số đơn hàng
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {driver.totalOrder || 0}
            </Typography>
          </Grid>
        </Grid>

        {driver.files && driver.files.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Tài liệu
            </Typography>
            <Grid container spacing={2}>
              {driver.files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.fileId}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {isImageFile(file.fileType) && (
                      <Box
                        sx={{
                          position: "relative",
                          pt: "56.25%",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          component="img"
                          src={file.fileUrl}
                          alt={file.fileName}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      </Box>
                    )}
                    <CardContent sx={{ py: 1.5, flexGrow: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        {!isImageFile(file.fileType) &&
                          getFileIcon(file.fileType)}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            ml: isImageFile(file.fileType) ? 0 : 1,
                            fontWeight: 500,
                          }}
                          noWrap
                        >
                          {file.fileName}
                        </Typography>
                      </Box>

                      {file.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {file.description}
                        </Typography>
                      )}

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Ngày tải lên:{" "}
                        {new Date(file.uploadDate).toLocaleDateString("vi-VN")}
                      </Typography>

                      {file.note && (
                        <Tooltip title={file.note}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Ghi chú: {file.note}
                          </Typography>
                        </Tooltip>
                      )}
                    </CardContent>
                    <CardActions
                      sx={{ pt: 0, justifyContent: "space-between" }}
                    >
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<GetAppIcon />}
                        component={Link}
                        href={file.fileUrl}
                        target="_blank"
                        download
                      >
                        Tải xuống
                      </Button>
                      {isImageFile(file.fileType) && (
                        <Button
                          size="small"
                          color="primary"
                          component={Link}
                          href={file.fileUrl}
                          target="_blank"
                        >
                          Xem đầy đủ
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DriverProfile;
