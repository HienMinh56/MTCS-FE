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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getTrailers } from "../../services/trailerApi";
import { Trailer, TrailerStatus } from "../../types/trailer";
import { ContainerSize } from "../../forms/trailer/trailerSchema";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useAuth } from "../../contexts/AuthContext";

interface TrailerTableProps {
  searchTerm?: string;
  filterOptions: {
    status?: TrailerStatus;
    containerSize?: number;
    maintenanceDueSoon?: boolean;
    registrationExpiringSoon?: boolean;
  };
  onUpdateSummary: (summary: {
    total: number;
    active: number;
    maintenance: number;
    repair: number;
  }) => void;
  refreshTrigger?: number;
}

const TrailerTable: React.FC<TrailerTableProps> = ({
  searchTerm = "",
  filterOptions,
  onUpdateSummary,
  refreshTrigger = 0,
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevRefreshTriggerRef = useRef(refreshTrigger);
  const isInitialMountRef = useRef(true);
  const isPageChangeRef = useRef(false);
  const shouldFetchDataRef = useRef(true);
  const prevFilterRef = useRef(filterOptions);
  const prevSearchTermRef = useRef(searchTerm);

  const fetchTrailers = useCallback(async () => {
    if (!shouldFetchDataRef.current) {
      return;
    }

    try {
      setLoading(true);

      const result = await getTrailers(
        page,
        rowsPerPage,
        searchTerm,
        filterOptions.status,
        filterOptions.maintenanceDueSoon,
        filterOptions.registrationExpiringSoon
      );

      if (result.success) {
        let filteredItems = result.data.trailers.items;

        // Apply containerSize filter on the frontend if specified
        if (filterOptions.containerSize !== undefined) {
          filteredItems = filteredItems.filter(
            (trailer) => trailer.containerSize === filterOptions.containerSize
          );
        }

        setTrailers(filteredItems);

        // Adjust totalCount based on containerSize filter
        const filteredCount =
          filterOptions.containerSize !== undefined
            ? filteredItems.length
            : result.data.trailers.totalCount;

        setTotalCount(filteredCount);

        // Cập nhật các số liệu tóm tắt
        // repair (cần đăng kiểm) sẽ được hiển thị là onDuty (đang vận chuyển)
        // maintenance (cần bảo dưỡng) sẽ được hiển thị là inactive (không hoạt động)
        onUpdateSummary({
          total: result.data.allCount,
          active: result.data.activeCount,
          maintenance: result.data.inactiveCount || 0,
          repair: result.data.onDutyCount || 0,
        });
      } else {
        setTrailers([]);
        setTotalCount(0);
      }
    } catch (error) {
      setTrailers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      isPageChangeRef.current = false;
      shouldFetchDataRef.current = false;
    }
  }, [page, rowsPerPage, searchTerm, filterOptions, onUpdateSummary]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      shouldFetchDataRef.current = true;
      fetchTrailers();
    }
  }, []);

  useEffect(() => {
    if (refreshTrigger !== prevRefreshTriggerRef.current) {
      prevRefreshTriggerRef.current = refreshTrigger;
      shouldFetchDataRef.current = true;
      fetchTrailers();
    }
  }, [refreshTrigger, fetchTrailers]);

  useEffect(() => {
    if (!isInitialMountRef.current && isPageChangeRef.current) {
      shouldFetchDataRef.current = true;
      fetchTrailers();
    }
  }, [page, fetchTrailers]);

  useEffect(() => {
    const filterChanged =
      JSON.stringify(filterOptions) !== JSON.stringify(prevFilterRef.current);
    const searchChanged = searchTerm !== prevSearchTermRef.current;

    if (!isInitialMountRef.current && (filterChanged || searchChanged)) {
      setPage(1);
      prevFilterRef.current = filterOptions;
      prevSearchTermRef.current = searchTerm;
      shouldFetchDataRef.current = true;
      fetchTrailers();
    }
  }, [searchTerm, filterOptions, fetchTrailers]);

  const handleNextPage = () => {
    const lastPage = Math.ceil(totalCount / rowsPerPage);
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

  const { user } = useAuth();
  const handleRowClick = (id: string) => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/trailers/${id}`);
  };

  const from = (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, totalCount);
  const hasNextPage = page < Math.ceil(totalCount / rowsPerPage);
  const hasPrevPage = page > 1;

  const getStatusChip = (status: TrailerStatus) => {
    switch (status) {
      case TrailerStatus.Active:
        return <Chip label="Đang hoạt động" color="success" size="small" />;
      case TrailerStatus.OnDuty:
        return <Chip label="Đang vận chuyển" color="primary" size="small" />;
      case TrailerStatus.Inactive:
        return <Chip label="Không hoạt động" color="error" size="small" />;
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  const formatContainerSize = (size: number) => {
    return size === ContainerSize.Feet20
      ? "20'"
      : size === ContainerSize.Feet40
      ? "40'"
      : `${size}`;
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table
            stickyHeader
            size="small"
            sx={{ minWidth: 650 }}
            aria-label="trailers table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="center">Biển số xe</TableCell>
                <TableCell align="center">Hãng sản xuất</TableCell>
                <TableCell align="center">
                  Kích thước container (feet)
                </TableCell>
                <TableCell align="center">Hạn đăng kiểm</TableCell>
                <TableCell align="center">Bảo dưỡng tiếp theo</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : trailers.length > 0 ? (
                trailers.map((trailer) => (
                  <TableRow
                    key={trailer.trailerId}
                    hover
                    onClick={() => handleRowClick(trailer.trailerId)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell align="center">{trailer.licensePlate}</TableCell>
                    <TableCell align="center">{trailer.brand}</TableCell>
                    <TableCell align="center">
                      {formatContainerSize(trailer.containerSize)}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(
                        trailer.registrationExpirationDate
                      ).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(trailer.nextMaintenanceDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(trailer.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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

export default TrailerTable;
