import React, { useState, useEffect } from "react";
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
import { getTractors } from "../../services/tractorApi";
import { Tractor, TractorStatus, ContainerType } from "../../types/tractor";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

interface TractorTableProps {
  searchTerm?: string;
  filterOptions: {
    status?: TractorStatus;
    containerType?: ContainerType;
    maintenanceDueSoon?: boolean;
    registrationExpiringSoon?: boolean;
  };
  onUpdateSummary: (summary: {
    total: number;
    active: number;
    maintenance: number;
    repair: number;
  }) => void;
}

const TractorTable: React.FC<TractorTableProps> = ({
  searchTerm = "",
  filterOptions,
  onUpdateSummary,
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTractors = async () => {
    try {
      setLoading(true);

      const result = await getTractors(
        page,
        rowsPerPage,
        searchTerm,
        filterOptions.status,
        filterOptions.maintenanceDueSoon,
        filterOptions.registrationExpiringSoon
      );

      if (result.success) {
        let filteredItems = result.data.tractors.items;

        // Apply containerType filter on the frontend
        if (filterOptions.containerType !== undefined) {
          filteredItems = filteredItems.filter(
            (tractor) => tractor.containerType === filterOptions.containerType
          );
        }

        setTractors(filteredItems);

        // Adjust totalCount based on containerType filter
        const filteredCount =
          filterOptions.containerType !== undefined
            ? filteredItems.length
            : result.data.tractors.totalCount;

        setTotalCount(filteredCount);

        onUpdateSummary({
          total: result.data.allCount,
          active: result.data.activeCount,
          maintenance: result.data.maintenanceDueCount,
          repair: result.data.registrationExpiryDueCount,
        });
      } else {
        setTractors([]);
        setTotalCount(0);
      }
    } catch (error) {
      setTractors([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTractors();
  }, [page, searchTerm, filterOptions]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterOptions]);

  const handleNextPage = () => {
    const lastPage = Math.ceil(totalCount / rowsPerPage);
    if (page < lastPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/staff-menu/tractors/${id}`);
  };

  const from = (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, totalCount);
  const hasNextPage = page < Math.ceil(totalCount / rowsPerPage);
  const hasPrevPage = page > 1;

  const getStatusChip = (status: TractorStatus) => {
    switch (status) {
      case TractorStatus.Active:
        return <Chip label="Đang hoạt động" color="success" size="small" />;
      case TractorStatus.Inactive:
        return <Chip label="Không hoạt động" color="error" size="small" />;
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  const getContainerTypeText = (type: ContainerType) => {
    switch (type) {
      case ContainerType.DryContainer:
        return "Khô";
      case ContainerType.ReeferContainer:
        return "Lạnh";
      default:
        return "Không xác định";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table
            stickyHeader
            size="small"
            sx={{ minWidth: 650 }}
            aria-label="tractors table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="center">Biển số xe</TableCell>
                <TableCell align="center">Hãng sản xuất</TableCell>
                <TableCell align="center">Loại container</TableCell>
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
              ) : tractors.length > 0 ? (
                tractors.map((tractor) => (
                  <TableRow
                    key={tractor.tractorId}
                    hover
                    onClick={() => handleRowClick(tractor.tractorId)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell align="center">{tractor.licensePlate}</TableCell>
                    <TableCell align="center">{tractor.brand}</TableCell>
                    <TableCell align="center">
                      {getContainerTypeText(tractor.containerType)}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(
                        tractor.registrationExpirationDate
                      ).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(tractor.nextMaintenanceDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(tractor.status)}
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

export default TractorTable;
