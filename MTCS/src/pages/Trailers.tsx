import React, { useState, useRef, useEffect } from "react";
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
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import AddIcon from "@mui/icons-material/Add";
import { TrailerStatus } from "../types/trailer";
import TrailerCreate from "../components/Trailer/TrailerCreate";
import TrailerFilter from "../components/Trailer/TrailerFilter";
import TrailerTable from "../components/Trailer/TrailerTable";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { getTrailers } from "../services/trailerApi";

const Trailers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    repair: 0,
  });
  const [totalSummary, setTotalSummary] = useState({
    total: 0,
    active: 0,
    onDuty: 0,
    inactive: 0,
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    status?: TrailerStatus;
    containerSize?: number;
    maintenanceDueSoon?: boolean;
    registrationExpiringSoon?: boolean;
  }>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isManualRefreshRef = useRef(false);
  const [loadingTotalSummary, setLoadingTotalSummary] = useState(false);

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
    setSummary({
      total: newSummary.total,
      active: newSummary.active,
      maintenance: newSummary.maintenance,
      repair: newSummary.repair,
    });
  };

  const handleApplyFilter = (filters: {
    status?: TrailerStatus;
    containerSize?: number;
    maintenanceDueSoon?: boolean;
    registrationExpiringSoon?: boolean;
  }) => {
    setFilterOptions(filters);
    setHasActiveFilters(Object.keys(filters).length > 0);
  };

  const handleCardClick = (status?: TrailerStatus) => {
    if (status === undefined || (filterOptions.status === status && hasActiveFilters)) {
      setFilterOptions({});
      setHasActiveFilters(false);
    } else {
      setFilterOptions({ status });
      setHasActiveFilters(true);
    }
  };

  const refreshTable = () => {
    console.log("Refreshing table data...");
    isManualRefreshRef.current = true;
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateSuccess = () => {
    refreshTable();
    fetchTotalSummary();
    handleCloseCreate();
  };

  const fetchTotalSummary = async () => {
    setLoadingTotalSummary(true);
    try {
      const totalResponse = await getTrailers(1, 1);
      const activeResponse = await getTrailers(1, 1, "", TrailerStatus.Active);
      const onDutyResponse = await getTrailers(1, 1, "", TrailerStatus.OnDuty);
      const inactiveResponse = await getTrailers(1, 1, "", TrailerStatus.Inactive);

      if (totalResponse.success && activeResponse.success && 
          onDutyResponse.success && inactiveResponse.success) {
        setTotalSummary({
          total: totalResponse.data.allCount || 0,
          active: activeResponse.data.trailers.totalCount || 0,
          onDuty: onDutyResponse.data.trailers.totalCount || 0,
          inactive: inactiveResponse.data.trailers.totalCount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching total summary:", error);
    } finally {
      setLoadingTotalSummary(false);
    }
  };

  useEffect(() => {
    fetchTotalSummary();
  }, [refreshTrigger]);

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{ 
              borderRadius: 2, 
              height: "100%", 
              cursor: "pointer",
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: !hasActiveFilters ? '3px solid #1976d2' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              }
            }}
            onClick={() => handleCardClick()}
          >
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
                    Tổng số rơ mooc
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalSummary.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarFilledIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{ 
              borderRadius: 2, 
              height: "100%", 
              cursor: "pointer",
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: filterOptions.status === TrailerStatus.Active ? '3px solid #4caf50' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              }
            }}
            onClick={() => handleCardClick(TrailerStatus.Active)}
          >
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
                    {totalSummary.active}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarFilledIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{ 
              borderRadius: 2, 
              height: "100%", 
              cursor: "pointer",
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: filterOptions.status === TrailerStatus.OnDuty ? '3px solid #1976d2' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              }
            }}
            onClick={() => handleCardClick(TrailerStatus.OnDuty)}
          >
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
                    Đang vận chuyển
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalSummary.onDuty}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarFilledIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{ 
              borderRadius: 2, 
              height: "100%", 
              cursor: "pointer",
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderBottom: filterOptions.status === TrailerStatus.Inactive ? '3px solid #f44336' : 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
              }
            }}
            onClick={() => handleCardClick(TrailerStatus.Inactive)}
          >
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
                    Không hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalSummary.inactive}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DoNotDisturbIcon color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              Danh sách rơ-moóc
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
                placeholder="Tìm kiếm biển số xe..."
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

        <TrailerTable
          searchTerm={searchTerm}
          filterOptions={filterOptions}
          onUpdateSummary={handleUpdateSummary}
          refreshTrigger={refreshTrigger}
        />

        <Modal
          open={openCreate}
          onClose={handleCloseCreate}
          aria-labelledby="create-trailer-modal"
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
              <TrailerCreate
                onClose={handleCloseCreate}
                onSuccess={handleCreateSuccess}
              />
            </LocalizationProvider>
          </Box>
        </Modal>

        <TrailerFilter
          open={openFilter}
          onClose={handleCloseFilter}
          onApplyFilter={handleApplyFilter}
          currentFilters={filterOptions}
        />
      </Paper>
    </Box>
  );
};

export default Trailers;
