import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import { TractorStatus } from "../types/tractor";
import TractorDetails from "../components/Tractor/TractorDetails";
import TractorCreate from "../components/Tractor/TractorCreate";
import TractorFilter from "../components/Tractor/TractorFilter";
import TractorTable from "../components/Tractor/TractorTable";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Tractors = () => {
  const navigate = useNavigate();
  const { tractorId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    repair: 0,
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    status?: TractorStatus;
    maintenanceDueSoon?: boolean;
    registrationExpiringSoon?: boolean;
  }>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleUpdateSummary = (newSummary: {
    total: number;
    active: number;
    maintenance: number;
    repair: number;
  }) => {
    setSummary(newSummary);
  };

  const handleApplyFilter = (filters: {
    status?: TractorStatus;
    maintenanceDueSoon?: boolean;
    registrationExpiringSoon?: boolean;
  }) => {
    setFilterOptions(filters);
    setHasActiveFilters(Object.keys(filters).length > 0);
  };

  const handleCreateSuccess = () => {
    // Table will automatically update via its own fetchTractors
  };

  const handleDeleteSuccess = () => {
    // Table will automatically update via its own fetchTractors
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
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
                    Tổng số đầu kéo
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <LocalShippingIcon color="primary" />
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
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.active}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <LocalShippingIcon color="success" />
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
                    Cần đăng kiểm
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.repair}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <EventIcon color="warning" />
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
                    Cần bảo dưỡng
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.maintenance}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <BuildIcon color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tractors Table Section */}
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
              Danh sách đầu kéo
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                size="small"
              >
                Thêm mới
              </Button>
              <TextField
                size="small"
                placeholder="Tìm kiếm đầu kéo..."
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
              <Badge
                color="primary"
                variant="dot"
                invisible={!hasActiveFilters}
              >
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  size="small"
                  onClick={handleOpenFilter}
                  color={hasActiveFilters ? "primary" : "inherit"}
                >
                  Lọc
                </Button>
              </Badge>
            </Box>
          </Box>
        </Box>

        {/* Integrate the TractorTable component */}
        <TractorTable
          searchTerm={searchTerm}
          filterOptions={filterOptions}
          onUpdateSummary={handleUpdateSummary}
        />

        <Modal
          open={openCreate}
          onClose={handleCloseCreate}
          aria-labelledby="create-tractor-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: 800,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TractorCreate
                onClose={handleCloseCreate}
                onSuccess={handleCreateSuccess}
              />
            </LocalizationProvider>
          </Box>
        </Modal>

        {/* Filter Dialog */}
        <TractorFilter
          open={openFilter}
          onClose={handleCloseFilter}
          onApplyFilter={handleApplyFilter}
          currentFilters={filterOptions}
        />
      </Paper>
      <TractorDetails
        open={!!tractorId}
        tractorId={tractorId || null}
        onClose={() => navigate("/staff-menu/tractors")}
        onDelete={handleDeleteSuccess}
      />
    </Box>
  );
};

export default Tractors;
