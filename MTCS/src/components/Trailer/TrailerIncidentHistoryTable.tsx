import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  TablePagination,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Card,
  CardMedia,
  Tooltip,
  Skeleton,
  Divider,
  Fade,
  useMediaQuery,
  useTheme,
  Zoom,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Close,
  Info,
  KeyboardArrowUp,
  OpenInNew,
  ZoomIn,
  Event,
  Person,
  Description,
  Image as ImageIcon,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IncidentReportAdminDTO,
  getVehicleIncidentHistory,
} from "../../services/IncidentReportApi";

interface TrailerIncidentHistoryTableProps {
  trailerId: string;
}

const TrailerIncidentHistoryTable: React.FC<
  TrailerIncidentHistoryTableProps
> = ({ trailerId }) => {
  const [incidents, setIncidents] = useState<IncidentReportAdminDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReportAdminDTO | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<{
    open: boolean;
    url: string;
    title: string;
  }>({
    open: false,
    url: "",
    title: "",
  });

  const tableRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      try {
        const response = await getVehicleIncidentHistory(trailerId, 2);
        if (response.success && response.data) {
          setIncidents(response.data);
          setError(null);
        } else {
          setError(
            response.messageVN ||
              response.message ||
              "Không thể tải dữ liệu sự cố"
          );
        }
      } catch (error) {
        console.error("Error loading incident history:", error);
        setError("Không thể tải dữ liệu sự cố");
      } finally {
        setLoading(false);
      }
    };

    if (trailerId) {
      loadIncidents();
    }

    const handleScroll = () => {
      if (tableRef.current) {
        setShowBackToTop(tableRef.current.scrollTop > 300);
      }
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [trailerId]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetails = (incident: IncidentReportAdminDTO) => {
    setSelectedIncident(incident);
    setOpenDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDialog(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    incident: IncidentReportAdminDTO
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenDetails(incident);
    }
  };

  const handleOpenImagePreview = (url: string, title: string) => {
    setImagePreview({
      open: true,
      url,
      title,
    });
  };

  const handleCloseImagePreview = () => {
    setImagePreview({
      ...imagePreview,
      open: false,
    });
  };

  const scrollToTop = () => {
    if (tableRef.current) {
      tableRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const getStatusChipColor = (status: string | number) => {
    if (typeof status === "number") {
      switch (status) {
        case 2:
          return "success";
        case 1:
          return "warning";
        case 3:
          return "error";
        default:
          return "default";
      }
    } else {
      switch (status) {
        case "Resolved":
          return "success";
        case "Handling":
          return "warning";
        case "Unredeemed":
          return "error";
        default:
          return "default";
      }
    }
  };

  const getStatusLabel = (status: string | number) => {
    if (typeof status === "number") {
      switch (status) {
        case 1:
          return "Đang xử lý";
        case 2:
          return "Đã xử lý";
        case 3:
          return "Không thể giải quyết";
        default:
          return "Không xác định";
      }
    } else {
      switch (status) {
        case "Handling":
          return "Đang xử lý";
        case "Resolved":
          return "Đã xử lý";
        case "Unredeemed":
          return "Không thể giải quyết";
        default:
          return status;
      }
    }
  };

  const getStatusIcon = (status: string | number) => {
    const statusColor = getStatusChipColor(status);
    if (statusColor === "success") return <CheckCircle fontSize="small" />;
    if (statusColor === "warning") return <WarningIcon fontSize="small" />;
    if (statusColor === "error") return <ErrorIcon fontSize="small" />;
    return <Info fontSize="small" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (e) {
      return dateString;
    }
  };

  const renderLoadingSkeleton = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <Skeleton variant="text" sx={{ mx: "auto", width: "70%" }} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" sx={{ mx: "auto", width: "70%" }} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" sx={{ mx: "auto", width: "70%" }} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" sx={{ mx: "auto", width: "70%" }} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" sx={{ mx: "auto", width: "70%" }} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell align="center">
                <Skeleton variant="text" sx={{ mx: "auto", width: "80%" }} />
              </TableCell>
              <TableCell align="center">
                <Skeleton variant="text" sx={{ mx: "auto", width: "80%" }} />
              </TableCell>
              <TableCell align="center">
                <Skeleton variant="text" sx={{ mx: "auto", width: "80%" }} />
              </TableCell>
              <TableCell align="center">
                <Skeleton variant="text" sx={{ mx: "auto", width: "80%" }} />
              </TableCell>
              <TableCell align="center">
                <Skeleton
                  variant="rectangular"
                  sx={{ mx: "auto", width: "60%", height: 32, borderRadius: 2 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Đã xảy ra lỗi
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  if (incidents.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Info
          sx={{ fontSize: 60, color: "primary.light", mb: 2, opacity: 0.7 }}
        />
        <Typography variant="h6" gutterBottom>
          Không có sự cố nào được ghi nhận
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rơ moóc này chưa có báo cáo sự cố nào.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          mb: 2,
          maxHeight: 600,
          overflow: "auto",
          position: "relative",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
        ref={tableRef}
      >
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
              >
                Mã báo cáo
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
              >
                Loại sự cố
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
              >
                Thời gian sự cố
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
              >
                Người báo cáo
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
              >
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((incident, index) => (
                <Tooltip
                  key={incident.reportId}
                  title="Nhấn để xem chi tiết"
                  arrow
                  placement="top"
                >
                  <TableRow
                    onClick={() => handleOpenDetails(incident)}
                    onKeyDown={(e) => handleKeyDown(e, incident)}
                    hover
                    tabIndex={0}
                    aria-label={`Sự cố ${incident.reportId}`}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                      "&:focus-visible": {
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        outline: `2px solid ${theme.palette.primary.main}`,
                      },
                      bgcolor: index % 2 ? "rgba(0, 0, 0, 0.02)" : "inherit",
                    }}
                  >
                    <TableCell align="center">{incident.reportId}</TableCell>
                    <TableCell align="center">
                      {incident.incidentType}
                    </TableCell>
                    <TableCell align="center">
                      {formatDate(incident.incidentTime)}
                    </TableCell>
                    <TableCell align="center">{incident.reportedBy}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(incident.status)}
                        label={getStatusLabel(incident.status)}
                        color={getStatusChipColor(incident.status) as any}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          minWidth: 120,
                          "& .MuiChip-icon": { ml: 0.5 },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))}
          </TableBody>
        </Table>
        {showBackToTop && (
          <Zoom in={showBackToTop}>
            <IconButton
              onClick={scrollToTop}
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                backgroundColor: "white",
                boxShadow: 2,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
              aria-label="Cuộn lên đầu"
            >
              <KeyboardArrowUp />
            </IconButton>
          </Zoom>
        )}
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={incidents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count}`
        }
        sx={{
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      />

      {/* Incident Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {selectedIncident && (
              <Chip
                icon={getStatusIcon(selectedIncident.status)}
                label={getStatusLabel(selectedIncident.status)}
                color={getStatusChipColor(selectedIncident.status) as any}
                size="small"
                sx={{ mr: 1.5, fontWeight: 500 }}
              />
            )}
            <Typography variant="h6">Chi tiết sự cố</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseDetails}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedIncident && (
            <>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Description fontSize="small" sx={{ mr: 1 }} />
                        Thông tin cơ bản
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Mã báo cáo
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedIncident.reportId}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Mã chuyến
                        </Typography>
                        <Typography variant="body1">
                          {selectedIncident.tripId}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Loại sự cố
                        </Typography>
                        <Typography variant="body1">
                          {selectedIncident.incidentType}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Mô tả
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {selectedIncident.description || "Không có mô tả"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Thời gian sự cố
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Event
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          {formatDate(selectedIncident.incidentTime)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Person fontSize="small" sx={{ mr: 1 }} />
                        Thông tin xử lý
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Người báo cáo
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Person
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          {selectedIncident.reportedBy}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Trạng thái xử lý
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            icon={getStatusIcon(selectedIncident.status)}
                            label={getStatusLabel(selectedIncident.status)}
                            color={
                              getStatusChipColor(selectedIncident.status) as any
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>

                      {selectedIncident.handledBy ? (
                        <>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Người xử lý
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <Person
                                fontSize="small"
                                color="action"
                                sx={{ mr: 0.5 }}
                              />
                              {selectedIncident.handledBy}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Thời gian xử lý
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <Event
                                fontSize="small"
                                color="action"
                                sx={{ mr: 0.5 }}
                              />
                              {selectedIncident.handledTime
                                ? formatDate(selectedIncident.handledTime)
                                : "N/A"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Chi tiết xử lý
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {selectedIncident.resolutionDetails ||
                                "Không có chi tiết"}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ py: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic" }}
                          >
                            Sự cố này chưa được xử lý
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {selectedIncident.files && selectedIncident.files.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ImageIcon sx={{ mr: 1 }} color="primary" />
                    Hình ảnh sự cố ({selectedIncident.files.length})
                  </Typography>

                  <Grid container spacing={2}>
                    {selectedIncident.files.map((file) => (
                      <Grid item xs={12} sm={6} md={4} key={file.fileId}>
                        <Card
                          elevation={2}
                          onClick={() =>
                            handleOpenImagePreview(file.fileUrl, file.fileName)
                          }
                          sx={{
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: 4,
                            },
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box sx={{ position: "relative" }}>
                            <CardMedia
                              component="img"
                              image={file.fileUrl}
                              alt={file.fileName}
                              sx={{ height: 180, objectFit: "cover" }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                bgcolor: "rgba(255,255,255,0.8)",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ZoomIn color="action" />
                            </Box>
                          </Box>
                          <Box sx={{ p: 1, bgcolor: "background.paper" }}>
                            <Typography
                              variant="body2"
                              noWrap
                              title={file.fileName}
                            >
                              {file.fileName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <Event
                                fontSize="small"
                                sx={{ mr: 0.5, fontSize: "0.8rem" }}
                              />
                              {formatDate(file.uploadDate)}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetails} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={handleCloseImagePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0,0,0,0.85)",
            color: "white",
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ImageIcon sx={{ mr: 1 }} />
            {imagePreview.title}
          </Box>
          <Box>
            <Tooltip title="Mở trong cửa sổ mới">
              <IconButton
                component="a"
                href={imagePreview.url}
                target="_blank"
                sx={{ color: "white", mr: 1 }}
              >
                <OpenInNew />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleCloseImagePreview}
              sx={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 1, textAlign: "center" }}>
          <img
            src={imagePreview.url}
            alt={imagePreview.title}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrailerIncidentHistoryTable;
