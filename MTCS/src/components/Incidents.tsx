import React, { useState } from "react";
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

interface Incident {
  reportId: string;
  tripId: string;
  reportedBy: string;
  incidentType: string;
  incidentTime: string;
  description: string;
  location: string;
  type: number;
  status: string;
  createdDate: string;
  images?: {
    incident: string[];
    invoice: string[];
    exchangePaper: string[];
  };
}

// Incident detail dialog component
const IncidentDetailDialog = ({ open, incident, onClose, onEdit }: { 
  open: boolean; 
  incident: Incident | null; 
  onClose: () => void;
  onEdit: (id: string) => void;
}) => {
  if (!incident) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết sự cố #{incident.reportId}</DialogTitle>
      <DialogContent dividers>
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
            <Typography variant="body1" gutterBottom>{incident.incidentTime}</Typography>
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
                  incident.status === "Completed" ? "Đã xử lý" : "Đã hủy"
                } 
                color={
                  incident.status === "Handling" ? "info" :
                  incident.status === "Completed" ? "success" : "error"
                } 
              />
            </Typography>
            
            <Typography variant="subtitle2">Ngày tạo</Typography>
            <Typography variant="body1" gutterBottom>{incident.createdDate}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Mô tả</Typography>
            <Typography variant="body1" paragraph>{incident.description}</Typography>
          </Grid>
          
          {incident.images && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Hình ảnh sự cố</Typography>
              <ImageList cols={3} rowHeight={160} gap={8}>
                {incident.images.incident.map((img, index) => (
                  <ImageListItem key={index}>
                    <img src={img} alt={`Incident ${index}`} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Hình ảnh hóa đơn</Typography>
              <ImageList cols={3} rowHeight={160} gap={8}>
                {incident.images.invoice.map((img, index) => (
                  <ImageListItem key={index}>
                    <img src={img} alt={`Invoice ${index}`} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Giấy tờ đổi trả</Typography>
              <ImageList cols={3} rowHeight={160} gap={8}>
                {incident.images.exchangePaper.map((img, index) => (
                  <ImageListItem key={index}>
                    <img src={img} alt={`Exchange paper ${index}`} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            onEdit(incident.reportId);
            onClose();
          }}
        >
          Chỉnh sửa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const IncidentManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      reportId: "INC000001",
      tripId: "TRIP0001",
      reportedBy: "Đoàn Lê Hiển Minh",
      incidentType: "Bể Bánh",
      incidentTime: "2025-03-01",
      description: "Bể bánh xe phía trước",
      status: "Handling",
      location: "Quảng trường Ba Đình",
      type: 1,
      createdDate: "2025-03-01",
      images: {
        incident: ["/path/to/image1.jpg", "/path/to/image2.jpg"],
        invoice: ["/path/to/image4.jpg", "/path/to/image5.jpg"],
        exchangePaper: ["/path/to/image6.jpg"],
      },
    },
    {
      reportId: "INC000002",
      tripId: "TRIP0001",
      reportedBy: "Đoàn Lê Hiển Minh",
      incidentType: "Rơi Bánh",
      incidentTime: "2025-03-01",
      description: "Bể bánh xe phía trước",
      status: "Handling",
      location: "Quảng trường Ba Đình",
      type: 1,
      createdDate: "2025-03-01",
      images: {
        incident: ["/path/to/image1.jpg", "/path/to/image2.jpg"],
        invoice: ["/path/to/image4.jpg", "/path/to/image5.jpg"],
        exchangePaper: ["/path/to/image6.jpg"],
      },
    },
    {
      reportId: "INC000003",
      tripId: "TRIP0002",
      reportedBy: "Nguyễn Văn A",
      incidentType: "Hỏng động cơ",
      incidentTime: "2025-03-03",
      description: "Động cơ phát ra tiếng kêu lạ",
      status: "Resolved",
      location: "Đường Nguyễn Huệ",
      type: 2,
      createdDate: "2025-03-03",
      images: {
        incident: ["/path/to/image7.jpg"],
        invoice: ["/path/to/image8.jpg"],
        exchangePaper: [],
      },
    },
    {
      reportId: "INC000004",
      tripId: "TRIP0003",
      reportedBy: "Trần Thị B",
      incidentType: "Va chạm nhẹ",
      incidentTime: "2025-03-05",
      description: "Va chạm với xe máy tại ngã tư",
      status: "Resolved",
      location: "Ngã tư Hàng Xanh",
      type: 3,
      createdDate: "2025-03-05",
      images: {
        incident: ["/path/to/image9.jpg", "/path/to/image10.jpg"],
        invoice: [],
        exchangePaper: ["/path/to/image11.jpg"],
      },
    },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const navigate = useNavigate();

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
    setSelectedIncident(incident);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  const handleEdit = (reportId: string) => {
    navigate(`/staff-menu/incidents/${reportId}`);
  };

  // Incident status options with Vietnamese labels
  const incidentStatusOptions = [
    { value: "all", label: "Tất cả", color: "default", count: incidents.length },
    {
      value: "Handling",
      label: "Đang xử lý",
      color: "info",
      count: incidents.filter((incident) => incident.status === "Handling").length,
    },
    {
      value: "ResolvedResolved",
      label: "Đã xử lý",
      color: "success",
      count: incidents.filter((incident) => incident.status === "Completed").length,
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
    return filteredIncidents.filter((incident) => incident.status === status);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
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
        <Grid item xs={6} sm={6} md={3}>
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
                    Chờ xử lý
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      incidents.filter((incident) => incident.status === "Pending")
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
        <Grid item xs={6} sm={6} md={3}>
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
                    {
                      incidents.filter((incident) => incident.status === "Completed")
                        .length
                    }
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
        <Grid item xs={6} sm={6} md={3}>
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
                    Đã hủy
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      incidents.filter((incident) => incident.status === "Cancelled")
                        .length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <CancelIcon color="error" />
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
          {incidentStatusOptions.map((status, index) => (
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
                      <TableCell>Người báo cáo</TableCell>
                      <TableCell>Loại sự cố</TableCell>
                      <TableCell>Thời gian xảy ra</TableCell>
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
                            <TableCell>{incident.reportedBy}</TableCell>
                            <TableCell>{incident.incidentType}</TableCell>
                            <TableCell>{incident.incidentTime}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  incident.status === "Pending"
                                    ? "Chờ xử lý"
                                    : incident.status === "Handling"
                                    ? "Đang xử lý"
                                    : incident.status === "Completed"
                                    ? "Đã xử lý"
                                    : "Đã hủy"
                                }
                                color={
                                  incident.status === "Pending"
                                    ? "warning"
                                    : incident.status === "Handling"
                                    ? "info"
                                    : incident.status === "Completed"
                                    ? "success"
                                    : "error"
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
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(incident.reportId);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
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
          ))}
        </Box>
      </Paper>

      {/* Incident Detail Dialog Component */}
      <IncidentDetailDialog
        open={openDialog}
        incident={selectedIncident}
        onClose={handleCloseDialog}
        onEdit={handleEdit}
      />
    </Box>
  );
};

export default IncidentManagement;
