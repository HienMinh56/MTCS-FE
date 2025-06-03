import React, { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  MoneyOff as UnpaidIcon,
  Assessment as ReportIcon,
} from "@mui/icons-material";
import ExpenseReportTable from "../components/finance/ExpenseReportTable";

interface FilterParams {
  driverId?: string;
  orderid?: string;
  tripId?: string;
  reportId?: string;
  isPay?: number;
  reportTypeId?: string;
}

const ExpenseReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilters, setOpenFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Summary statistics
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
  });

  const handleFilterChange = (field: keyof FilterParams, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value === "" ? undefined : value,
    };
    setFilters(newFilters);
    setHasActiveFilters(
      Object.keys(newFilters).some(
        (key) => newFilters[key as keyof FilterParams] !== undefined
      )
    );
  };

  const handlePaymentFilterChange = (value: string) => {
    const newFilters = {
      ...filters,
      isPay: value === "" ? undefined : parseInt(value),
    };
    setFilters(newFilters);
    setHasActiveFilters(
      Object.keys(newFilters).some(
        (key) => newFilters[key as keyof FilterParams] !== undefined
      )
    );
  };
  const handleApplyFilters = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setHasActiveFilters(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const refreshTable = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleCardClick = () => {
    if (hasActiveFilters) {
      setFilters({});
      setHasActiveFilters(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      {" "}
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Total card */}
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: !hasActiveFilters ? "3px solid #1976d2" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleCardClick()}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <ReportIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {summary.total}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tổng báo cáo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Paid card */}
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: filters.isPay === 1 ? "3px solid #4caf50" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => {
              const newFilters = { isPay: 1 };
              setFilters(newFilters);
              setHasActiveFilters(true);
              setRefreshTrigger((prev) => prev + 1);
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <PaymentIcon sx={{ fontSize: 40, color: "#4caf50", mb: 1 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {summary.paid}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Đã thanh toán
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Unpaid card */}
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              borderBottom: filters.isPay === 0 ? "3px solid #f44336" : "none",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
            onClick={() => {
              const newFilters = { isPay: 0 };
              setFilters(newFilters);
              setHasActiveFilters(true);
              setRefreshTrigger((prev) => prev + 1);
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <UnpaidIcon sx={{ fontSize: 40, color: "#f44336", mb: 1 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {summary.unpaid}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Chưa thanh toán
              </Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TextField
              placeholder="Tìm kiếm báo cáo chi phí..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Bộ lọc">
              <IconButton onClick={() => setOpenFilters(!openFilters)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Làm mới">
              <IconButton onClick={refreshTable}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={openFilters}>
            <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bộ lọc nâng cao
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Mã tài xế"
                    size="small"
                    value={filters.driverId || ""}
                    onChange={(e) =>
                      handleFilterChange("driverId", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Mã đơn hàng"
                    size="small"
                    value={filters.orderid || ""}
                    onChange={(e) =>
                      handleFilterChange("orderid", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Mã chuyến đi"
                    size="small"
                    value={filters.tripId || ""}
                    onChange={(e) =>
                      handleFilterChange("tripId", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Mã báo cáo"
                    size="small"
                    value={filters.reportId || ""}
                    onChange={(e) =>
                      handleFilterChange("reportId", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái thanh toán</InputLabel>
                    <Select
                      value={filters.isPay?.toString() || ""}
                      onChange={(e) =>
                        handlePaymentFilterChange(e.target.value)
                      }
                      label="Trạng thái thanh toán"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="1">Đã thanh toán</MenuItem>
                      <MenuItem value="0">Chưa thanh toán</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={handleApplyFilters}>
                  Áp dụng
                </Button>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              </Box>
            </Paper>
          </Collapse>
          {hasActiveFilters && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Bộ lọc đang áp dụng:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {Object.entries(filters).map(([key, value]) => {
                  if (value !== undefined && value !== null) {
                    let label = key;
                    if (key === "isPay") {
                      label = value === 1 ? "Đã thanh toán" : "Chưa thanh toán";
                    }
                    return (
                      <Chip
                        key={key}
                        label={`${label}: ${value}`}
                        size="small"
                        onDelete={() => {
                          const newFilters = { ...filters };
                          delete newFilters[key as keyof FilterParams];
                          setFilters(newFilters);
                          setHasActiveFilters(
                            Object.keys(newFilters).length > 0
                          );
                          setRefreshTrigger((prev) => prev + 1);
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </Box>
            </Box>
          )}{" "}
        </Box>

        {/* Expense Reports Table */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <ExpenseReportTable
            searchTerm={searchTerm}
            filterOptions={filters}
            onUpdateSummary={setSummary}
            refreshTrigger={refreshTrigger}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ExpenseReportsPage;
