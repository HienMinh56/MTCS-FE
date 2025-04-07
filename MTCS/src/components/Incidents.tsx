import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { getAllIncidentReports, getIncidentReportById, IncidentReports } from "../services/IncidentReportApi";
import ReplaceTripModal from "./ReplaceTripModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`incident-tabpanel-${index}`}
      aria-labelledby={`incident-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `incident-tab-${index}`,
    "aria-controls": `incident-tabpanel-${index}`,
  };
}

// Update the interface to match the API data structure
interface Incident extends IncidentReports {
  // Any additional fields not provided by the API can be added here
  images?: {
    incident: string[];
    invoice: string[];
    exchangePaper: string[];
  };
}

// Incident detail dialog component
const IncidentDetailDialog = ({ open, incident, onClose }: { 
  open: boolean; 
  incident: Incident | null; 
  onClose: () => void;
}) => {
  const [openReplaceTripModal, setOpenReplaceTripModal] = useState(false);
  const [createTripSuccess, setCreateTripSuccess] = useState(false);
  
  if (!incident) return null;
  
  // Group files by type
  const incidentFiles = incident.incidentReportsFiles?.filter(file => file.type === 1) || [];
  const invoiceFiles = incident.incidentReportsFiles?.filter(file => file.type === 2) || [];
  const transferFiles = incident.incidentReportsFiles?.filter(file => file.type === 3) || [];
  
  const handleReplaceTripSuccess = () => {
    setCreateTripSuccess(true);
    // Reset success message after 3 seconds
    setTimeout(() => setCreateTripSuccess(false), 3000);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết sự cố #{incident.reportId}</DialogTitle>
      <DialogContent dividers>
        {createTripSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Đã tạo chuyến thay thế thành công!
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Mã sự cố</Typography>
            <Typography variant="body1" gutterBottom>{incident.reportId}</Typography>
            
            <Typography variant="subtitle2">Mã chuyến</Typography>
            <Typography variant="body1" gutterBottom>{incident.tripId}</Typography>
            
            <Typography variant="subtitle2">Người báo cáo</Typography>
            <Typography variant="body1" gutterBottom>{incident.reportedBy}</Typography>
            
            <Typography variant="subtitle2">Loại sự cố</Typography>
            <Typography variant="body1" gutterBottom>{incident.incidentType}</Typography>
            
            <Typography variant="subtitle2">Thời gian xảy ra</Typography>
            <Typography variant="body1" gutterBottom>{new Date(incident.incidentTime).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Vị trí</Typography>
            <Typography variant="body1" gutterBottom>{incident.location}</Typography>
            
            <Typography variant="subtitle2">Trạng thái</Typography>
            <Typography variant="body1" gutterBottom>
              <Chip 
                size="small" 
                label={
                  incident.status === "Handling" ? "Đang xử lý" :
                  "Đã xử lý" // Changed to always show "Đã xử lý" for non-handling statuses
                } 
                color={
                  incident.status === "Handling" ? "info" :
                  "success" // Changed to always show success color for non-handling statuses
                } 
              />
            </Typography>
            
            <Typography variant="subtitle2">Ngày tạo</Typography>
            <Typography variant="body1" gutterBottom>{new Date(incident.createdDate).toLocaleString()}</Typography>
            
            {incident.handledBy && (
              <>
                <Typography variant="subtitle2">Người xử lý</Typography>
                <Typography variant="body1" gutterBottom>{incident.handledBy}</Typography>
              </>
            )}
            
            {incident.handledTime && (
              <>
                <Typography variant="subtitle2">Thời gian xử lý</Typography>
                <Typography variant="body1" gutterBottom>{new Date(incident.handledTime).toLocaleString()}</Typography>
              </>
            )}

            <Typography variant="subtitle2">Loại</Typography>
            <Typography variant="body1" gutterBottom>
              {incident.type === 1 ? "Có thể sửa" : 
               incident.type === 2 ? "Không thể sửa" : 
               incident.type}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Mô tả</Typography>
            <Typography variant="body1" paragraph>{incident.description}</Typography>
            
            {incident.resolutionDetails && (
              <>
                <Typography variant="subtitle2">Chi tiết xử lý</Typography>
                <Typography variant="body1" paragraph>{incident.resolutionDetails}</Typography>
              </>
            )}
          </Grid>
          
          {incidentFiles.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Ảnh sự cố</Typography>
              <ImageList cols={3} rowHeight={160} gap={8}>
                {incidentFiles.map((file, index) => (
                  <ImageListItem key={file.fileId}>
                    <img src={file.fileUrl} 
                         alt={`Ảnh sự cố ${index + 1}`} 
                         loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          )}
          
          {invoiceFiles.length > 0 ? (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Ảnh hóa đơn</Typography>
              <ImageList cols={3} rowHeight={160} gap={8}>
                {invoiceFiles.map((file, index) => (
                  <ImageListItem key={file.fileId}>
                    <img src={file.fileUrl} 
                         alt={`Ảnh hóa đơn ${index + 1}`} 
                         loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Ảnh hóa đơn</Typography>
              <Typography variant="body2" color="text.secondary">Không có ảnh</Typography>
            </Grid>
          )}
          
          {transferFiles.length > 0 ? (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Ảnh chuyển nhượng</Typography>
              <ImageList cols={3} rowHeight={160} gap={8}>
                {transferFiles.map((file, index) => (
                  <ImageListItem key={file.fileId}>
                    <img src={file.fileUrl} 
                         alt={`Ảnh chuyển nhượng ${index + 1}`} 
                         loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Ảnh chuyển nhượng</Typography>
              <Typography variant="body2" color="text.secondary">Không có ảnh</Typography>
            </Grid>
          )}

          {/* Driver Information */}
          {/* {incident.trip && incident.trip.driver && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Thông tin tài xế</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  <strong>Tên:</strong> {incident.trip.driver.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {incident.trip.driver.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Điện thoại:</strong> {incident.trip.driver.phoneNumber}
                </Typography>
              </Box>
            </Grid>
          )} */}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpenReplaceTripModal(true)}
        >
          Tạo chuyến thay thế
        </Button>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      {/* Replacement Trip Modal */}
      <ReplaceTripModal
        open={openReplaceTripModal}
        onClose={() => setOpenReplaceTripModal(false)}
        tripId={incident.tripId}
        onSuccess={handleReplaceTripSuccess}
      />
    </Dialog>
  );
};

const IncidentManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const navigate = useNavigate();

  // Fetch incident reports from API
  useEffect(() => {
    const fetchIncidentReports = async () => {
      setLoading(true);
      try {
        const data = await getAllIncidentReports();
        setIncidents(data);
      } catch (error) {
        console.error("Error fetching incident reports:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncidentReports();
  }, []);

  // Handle view incident details with API data
  const handleViewIncident = async (reportId: string) => {
    try {
      setLoading(true);
      const incidentData = await getIncidentReportById(reportId);
      setSelectedIncident(incidentData);
      setOpenDialog(true);
    } catch (error) {
      console.error(`Error fetching incident ${reportId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (incident: Incident) => {
    handleViewIncident(incident.reportId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  // Updated to properly count all non-handling statuses as "Đã xử lý"
  const getResolvedCount = () => {
    return incidents.filter((incident) => 
      incident.status === "Completed" || 
      incident.status === "Cancelled" || 
      incident.status === "Canceled" ||
      (incident.status !== "Handling" && incident.status !== "Pending")
    ).length;
  };

  // Incident status options with Vietnamese labels - fixed count method
  const incidentStatusOptions = [
    { value: "all", label: "Tất cả", color: "default", count: incidents.length },
    {
      value: "Handling",
      label: "Đang xử lý",
      color: "info",
      count: incidents.filter((incident) => incident.status === "Handling").length,
    },
    {
      value: "Completed",
      label: "Đã xử lý",
      color: "success",
      // Use the helper function to get the correct count
      count: getResolvedCount()
    }
  ];

  const filteredIncidents = incidents.filter((incident) =>
    incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) || 
    incident.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.tripId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredIncidentsByStatus = (status: string) => {
    if (status === "all") {
      return filteredIncidents;
    }
    if (status === "Completed") {
      // Include all non-handling and non-pending statuses as "Đã xử lý"
      return filteredIncidents.filter((incident) => 
        incident.status === "Completed" || 
        incident.status === "Cancelled" || 
        incident.status === "Canceled" ||
        (incident.status !== "Handling" && incident.status !== "Pending")
      );
    }
    return filteredIncidents.filter((incident) => incident.status === status);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={4}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Tổng số sự cố
                  </Typography>
                  <Typography variant="h5" component="div">
                    {incidents.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <AssignmentIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đang xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      incidents.filter((incident) => incident.status === "Handling")
                        .length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <AccessTimeIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đã xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {getResolvedCount()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <CheckCircleIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Incidents Table Section */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 1,
            }}
          >
            <Typography variant="h6" component="div" fontWeight={500}>
              Danh sách sự cố
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm sự cố..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Lọc
              </Button>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="incident status tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: "42px" }}
            >
              {incidentStatusOptions.map((status, index) => (
                <Tab
                  key={status.value}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography component="span" variant="body2">
                        {status.label}
                      </Typography>
                      <Chip
                        label={status.count}
                        size="small"
                        color="default"
                        sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  }
                  {...a11yProps(index)}
                  sx={{ py: 1, minHeight: "42px" }}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            incidentStatusOptions.map((status, index) => (
              <TabPanel key={index} value={tabValue} index={index}>
                <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
                  <Table
                    stickyHeader
                    size="small"
                    sx={{ minWidth: 650 }}
                    aria-label="incidents table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã sự cố</TableCell>
                        <TableCell>Mã chuyến</TableCell>
                        <TableCell>Loại sự cố</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredIncidentsByStatus(status.value)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .length > 0 ? (
                        getFilteredIncidentsByStatus(status.value)
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((incident) => (
                            <TableRow
                              key={incident.reportId}
                              hover
                              onClick={() => handleOpenDialog(incident)}
                              sx={{ cursor: "pointer" }}
                            >
                              <TableCell>{incident.reportId}</TableCell>
                              <TableCell>{incident.tripId}</TableCell>
                              <TableCell>{incident.incidentType}</TableCell>
                              <TableCell>
                                {incident.type === 1 
                                  ? "Có thể sửa" 
                                  : incident.type === 2 
                                  ? "Không thể sửa" 
                                  : incident.type}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={
                                    incident.status === "Pending"
                                      ? "Chờ xử lý"
                                      : incident.status === "Handling"
                                      ? "Đang xử lý"
                                      : "Đã xử lý" // Changed to always show "Đã xử lý" for non-handling/pending statuses
                                  }
                                  color={
                                    incident.status === "Pending"
                                      ? "warning"
                                      : incident.status === "Handling"
                                      ? "info"
                                      : "success" // Changed to always show success color for non-handling/pending statuses
                                  }
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDialog(incident);
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              py={3}
                            >
                              Không có dữ liệu
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={getFilteredIncidentsByStatus(status.value).length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Dòng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
                  }
                  sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
                />
              </TabPanel>
            ))
          )}
        </Box>
      </Paper>

      {/* Incident Detail Dialog Component */}
      <IncidentDetailDialog
        open={openDialog}
        incident={selectedIncident}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default IncidentManagement;
