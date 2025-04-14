import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  IconButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate } from "react-router-dom";
import { getDriverList } from "../../services/DriverApi";
import {
  Driver,
  DriverStatus,
  PaginatedData,
  getDriverStatusText,
} from "../../types/driver";

// Component props
interface DriverTableProps {
  searchTerm?: string;
  statusFilter?: DriverStatus | null;
  onUpdateSummary?: (data: {
    total: number;
    active: number;
    onTrip: number;
  }) => void;
  refreshTrigger?: number;
  onStatusClick?: (status: DriverStatus) => void; // New prop for status click handling
}

const DriverTable: React.FC<DriverTableProps> = ({
  searchTerm = "",
  statusFilter = null,
  onUpdateSummary,
  refreshTrigger = 0,
}) => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  const prevRefreshTriggerRef = useRef(refreshTrigger);
  const isInitialMountRef = useRef(true);
  const isPageChangeRef = useRef(false);
  const shouldFetchDataRef = useRef(true);
  const prevStatusFilterRef = useRef(statusFilter);
  const prevSearchTermRef = useRef(searchTerm);

  // Load drivers data
  const loadDrivers = useCallback(async () => {
    if (!shouldFetchDataRef.current) {
      return;
    }

    setLoading(true);
    try {
      const response = await getDriverList({
        pageNumber: page,
        pageSize: pageSize,
        status: statusFilter,
        keyword: searchTerm || null,
      });

      if (response.success && response.data) {
        setDrivers(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);

        // Calculate summary statistics for drivers based on API results
        if (onUpdateSummary && response.data.totalCount !== undefined) {
          // Get counts directly from the response if available
          let activeCount = 0;
          let onTripCount = 0;

          // Count from current page items only if no filters are applied
          if (!statusFilter) {
            activeCount =
              response.data.items?.filter(
                (d) => d.status === DriverStatus.Active
              ).length || 0;

            onTripCount =
              response.data.items?.filter(
                (d) => d.status === DriverStatus.OnDuty
              ).length || 0;
          } else {
            // If filtered, we know all items match the filter
            if (statusFilter === DriverStatus.Active) {
              activeCount = response.data.totalCount;
            } else if (statusFilter === DriverStatus.OnDuty) {
              onTripCount = response.data.totalCount;
            }
          }

          onUpdateSummary({
            total: response.data.totalCount,
            active: activeCount,
            onTrip: onTripCount,
          });
        }
      } else {
        console.error("Invalid API response:", response);
        setDrivers([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error loading drivers:", error);
      setDrivers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      isPageChangeRef.current = false;
      shouldFetchDataRef.current = false;
    }
  }, [page, pageSize, statusFilter, searchTerm, onUpdateSummary]);

  // Initial data fetch
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      shouldFetchDataRef.current = true;
      loadDrivers();
    }
  }, []);

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger !== prevRefreshTriggerRef.current) {
      prevRefreshTriggerRef.current = refreshTrigger;
      shouldFetchDataRef.current = true;
      loadDrivers();
    }
  }, [refreshTrigger, loadDrivers]);

  // Handle page changes
  useEffect(() => {
    if (!isInitialMountRef.current && isPageChangeRef.current) {
      shouldFetchDataRef.current = true;
      loadDrivers();
    }
  }, [page, loadDrivers]);

  // Handle filter or search changes
  useEffect(() => {
    const filterChanged = statusFilter !== prevStatusFilterRef.current;
    const searchChanged = searchTerm !== prevSearchTermRef.current;

    if (!isInitialMountRef.current && (filterChanged || searchChanged)) {
      setPage(1);
      prevStatusFilterRef.current = statusFilter;
      prevSearchTermRef.current = searchTerm;
      shouldFetchDataRef.current = true;
      loadDrivers();
    }
  }, [searchTerm, statusFilter, loadDrivers]);

  // Ensure we're immediately updating the table when we come back from driver profile
  useEffect(() => {
    const handleFocus = () => {
      shouldFetchDataRef.current = true;
      loadDrivers();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadDrivers]);

  // Pagination controls
  const handleNextPage = () => {
    const lastPage = Math.ceil(totalCount / pageSize);
    if (page < lastPage) {
      isPageChangeRef.current = true;
      shouldFetchDataRef.current = true;
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      isPageChangeRef.current = true;
      shouldFetchDataRef.current = true;
      setPage((prev) => prev - 1);
    }
  };

  // Navigation
  const handleDriverClick = (driverId: string) => {
    navigate(`/staff-menu/drivers/${driverId}`);
  };

  // Render status chip based on driver status
  const renderStatusChip = (status: DriverStatus) => {
    const statusText = getDriverStatusText(status);
    switch (statusText) {
      case "active":
        return <Chip label="Hoạt động" color="success" size="small" />;
      case "inactive":
        return <Chip label="Không hoạt động" color="error" size="small" />;
      case "on_duty":
        return <Chip label="Đang vận chuyển" color="primary" size="small" />;
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const hasNextPage = page < Math.ceil(totalCount / pageSize);
  const hasPrevPage = page > 1;

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table
            stickyHeader
            size="small"
            sx={{ minWidth: 650 }}
            aria-label="drivers table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="center">Họ tên</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell align="center">Tổng giờ tuần này</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : drivers.length > 0 ? (
                drivers.map((driver) => (
                  <TableRow
                    key={driver.driverId}
                    hover
                    onClick={() => handleDriverClick(driver.driverId)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell align="center">{driver.fullName || "N/A"}</TableCell>
                    <TableCell align="center">{driver.email || "N/A"}</TableCell>
                    <TableCell>{driver.phoneNumber || "N/A"}</TableCell>
                    <TableCell align="center">
                      {driver.currentWeekHours !== null &&
                      driver.currentWeekHours !== undefined
                        ? driver.currentWeekHours.toLocaleString()
                        : "0"}{" "}
                      giờ
                    </TableCell>
                    <TableCell align="center">{renderStatusChip(driver.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            borderTop: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {totalCount > 0
              ? `${from}-${to} trên ${totalCount}`
              : "Không có dữ liệu"}
          </Typography>
          <Box>
            <IconButton
              onClick={handlePrevPage}
              disabled={!hasPrevPage || loading}
              size="small"
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNextPage}
              disabled={!hasNextPage || loading}
              size="small"
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DriverTable;
