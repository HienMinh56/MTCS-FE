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
import { getExpenseReportsList } from "../../services/expenseReportApi";
import { ExpenseReport } from "../../types/expenseReport";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useAuth } from "../../contexts/AuthContext";

interface FilterParams {
  driverId?: string;
  orderid?: string;
  tripId?: string;
  reportId?: string;
  isPay?: number;
  reportTypeId?: string;
}

interface ExpenseReportTableProps {
  searchTerm?: string;
  filterOptions: FilterParams;
  onUpdateSummary: (summary: {
    total: number;
    paid: number;
    unpaid: number;
    fuel: number;
    toll: number;
    carWash: number;
    other: number;
  }) => void;
  refreshTrigger?: number;
}

const ExpenseReportTable: React.FC<ExpenseReportTableProps> = ({
  searchTerm = "",
  filterOptions,
  onUpdateSummary,
  refreshTrigger = 0,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevRefreshTriggerRef = useRef(refreshTrigger);
  const isInitialMountRef = useRef(true);
  const isPageChangeRef = useRef(false);
  const shouldFetchDataRef = useRef(true);
  const prevFilterRef = useRef(filterOptions);
  const prevSearchTermRef = useRef(searchTerm);

  const fetchExpenseReports = useCallback(async () => {
    if (!shouldFetchDataRef.current) {
      return;
    }

    try {
      setLoading(true);
      const reports = await getExpenseReportsList();

      // Apply client-side filtering
      let filteredReports = reports;

      // Apply search filter
      if (searchTerm) {
        filteredReports = filteredReports.filter(
          (report) =>
            report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.tripId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportTypeName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      // Apply filter options
      if (filterOptions.driverId) {
        filteredReports = filteredReports.filter(
          (report) => report.driverId === filterOptions.driverId
        );
      }
      if (filterOptions.orderid) {
        filteredReports = filteredReports.filter(
          (report) => report.orderDetailId === filterOptions.orderid
        );
      }
      if (filterOptions.tripId) {
        filteredReports = filteredReports.filter(
          (report) => report.tripId === filterOptions.tripId
        );
      }
      if (filterOptions.reportId) {
        filteredReports = filteredReports.filter(
          (report) => report.reportId === filterOptions.reportId
        );
      }
      if (filterOptions.isPay !== undefined) {
        filteredReports = filteredReports.filter(
          (report) => report.isPay === filterOptions.isPay
        );
      }
      if (filterOptions.reportTypeId) {
        filteredReports = filteredReports.filter(
          (report) => report.reportTypeId === filterOptions.reportTypeId
        );
      }

      setTotalCount(filteredReports.length);

      // Apply pagination
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedReports = filteredReports.slice(startIndex, endIndex);

      setExpenseReports(paginatedReports);

      // Update summary statistics
      const total = reports.length;
      const paid = reports.filter((r) => r.isPay === 1).length;
      const unpaid = reports.filter((r) => r.isPay === 0).length;
      const fuel = reports.filter(
        (r) => r.reportTypeId === "fuel_report"
      ).length;
      const toll = reports.filter((r) => r.reportTypeId === "toll").length;
      const carWash = reports.filter(
        (r) => r.reportTypeId === "car wash"
      ).length;
      const other = reports.filter(
        (r) => !["fuel_report", "toll", "car wash"].includes(r.reportTypeId)
      ).length;

      onUpdateSummary({
        total,
        paid,
        unpaid,
        fuel,
        toll,
        carWash,
        other,
      });
    } catch (error) {
      setExpenseReports([]);
      setTotalCount(0);
      console.error("Error fetching expense reports:", error);
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
      fetchExpenseReports();
    }
  }, []);

  useEffect(() => {
    if (refreshTrigger !== prevRefreshTriggerRef.current) {
      prevRefreshTriggerRef.current = refreshTrigger;
      shouldFetchDataRef.current = true;
      fetchExpenseReports();
    }
  }, [refreshTrigger, fetchExpenseReports]);

  useEffect(() => {
    if (!isInitialMountRef.current && isPageChangeRef.current) {
      shouldFetchDataRef.current = true;
      fetchExpenseReports();
    }
  }, [page, fetchExpenseReports]);

  useEffect(() => {
    const filterChanged =
      JSON.stringify(filterOptions) !== JSON.stringify(prevFilterRef.current);
    const searchChanged = searchTerm !== prevSearchTermRef.current;

    if (!isInitialMountRef.current && (filterChanged || searchChanged)) {
      setPage(1);
      prevFilterRef.current = filterOptions;
      prevSearchTermRef.current = searchTerm;
      shouldFetchDataRef.current = true;
      fetchExpenseReports();
    }
  }, [searchTerm, filterOptions, fetchExpenseReports]);

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

  const handleRowClick = (reportId: string) => {
    const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";
    navigate(`${prefix}/expense-reports/${reportId}`);
  };

  const from = (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, totalCount);
  const hasNextPage = page < Math.ceil(totalCount / rowsPerPage);
  const hasPrevPage = page > 1;

  const getPaymentStatusChip = (isPay: number) => {
    if (isPay === 1) {
      return <Chip label="Đã thanh toán" color="success" size="small" />;
    } else {
      return <Chip label="Chưa thanh toán" color="error" size="small" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table
            stickyHeader
            size="small"
            sx={{ minWidth: 650 }}
            aria-label="expense reports table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="center">Mã báo cáo</TableCell>
                <TableCell align="center">Loại chi phí</TableCell>
                <TableCell align="center">Mã chuyến đi</TableCell>
                <TableCell align="center">Tài xế</TableCell>
                <TableCell align="center">Chi phí</TableCell>
                <TableCell align="center">Địa điểm</TableCell>
                <TableCell align="center">Thời gian</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : expenseReports.length > 0 ? (
                expenseReports.map((report) => (
                  <TableRow
                    key={report.reportId}
                    hover
                    onClick={() => handleRowClick(report.reportId)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {report.reportId}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {report.reportTypeName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="primary">
                        {report.tripId}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{report.reportBy}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(report.cost)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={report.location}
                      >
                        {report.location}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatDate(report.reportTime)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getPaymentStatusChip(report.isPay)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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

export default ExpenseReportTable;
