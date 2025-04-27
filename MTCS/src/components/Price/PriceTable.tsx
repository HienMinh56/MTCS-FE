import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Grid,
  Tooltip,
  Skeleton,
  TableSortLabel,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  ButtonGroup,
  Stack,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  FileUpload as FileUploadIcon,
} from "@mui/icons-material";
import {
  getPriceTables,
  updatePriceTables,
  importPriceTable,
  downloadPriceTableTemplate,
} from "../../services/priceTableApi";
import {
  ContainerSizeMap,
  ContainerTypeMap,
  DeliveryTypeMap,
  PriceTable as IPriceTable,
  StatusMap,
  UpdatePriceTableRequest,
  VersionInfo,
} from "../../types/price-table";
import PriceChangesComponent from "./PriceChanges";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof IPriceTable | "distanceRange";
  label: string;
  numeric: boolean;
  sortable: boolean;
  tooltip?: string;
}

const headCells: HeadCell[] = [
  {
    id: "distanceRange",
    label: "Khoảng cách (km)",
    numeric: true,
    sortable: true,
    tooltip: "Phạm vi khoảng cách áp dụng",
  },
  {
    id: "containerType",
    label: "Loại container",
    numeric: false,
    sortable: false,
  },
  {
    id: "minPricePerKm",
    label: "Giá tối thiểu",
    numeric: true,
    sortable: true,
    tooltip: "Giá tối thiểu cho mỗi km vận chuyển",
  },
  {
    id: "maxPricePerKm",
    label: "Giá tối đa",
    numeric: true,
    sortable: true,
    tooltip: "Giá tối đa cho mỗi km vận chuyển",
  },
  {
    id: "status",
    label: "Trạng thái",
    numeric: false,
    sortable: false,
  },
  {
    id: "createdDate",
    label: "Ngày tạo",
    numeric: false,
    sortable: false,
  },
  {
    id: "createdBy",
    label: "Người tạo",
    numeric: false,
    sortable: false,
  },
];

const PriceTableComponent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [priceTables, setPriceTables] = useState<IPriceTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number | undefined>(
    undefined
  );
  const [activeVersion, setActiveVersion] = useState<number | undefined>(
    undefined
  );
  const [availableVersions, setAvailableVersions] = useState<number[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | undefined>(
    undefined
  );
  const [showChanges, setShowChanges] = useState<boolean>(false);

  // Add a refreshKey to force re-rendering of the PriceChanges component
  const [refreshPriceChangesKey, setRefreshPriceChangesKey] =
    useState<number>(0);

  // Import related states
  const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [createConfirmOpen, setCreateConfirmOpen] = useState<boolean>(false);

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingPrice, setEditingPrice] = useState<IPriceTable | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const [validationErrors, setValidationErrors] = useState<{
    minPrice?: string;
    maxPrice?: string;
  }>({});

  const [versionsInfo, setVersionsInfo] = useState<VersionInfo[]>([]);

  const validatePriceUpdate = (minPrice: number, maxPrice: number): boolean => {
    const errors: { minPrice?: string; maxPrice?: string } = {};

    if (minPrice <= 0) {
      errors.minPrice = "Giá tối thiểu phải lớn hơn 0";
    }

    if (maxPrice <= 0) {
      errors.maxPrice = "Giá tối đa phải lớn hơn 0";
    }

    if (minPrice > maxPrice) {
      errors.minPrice = "Giá tối thiểu phải nhỏ hơn giá tối đa";
      errors.maxPrice = "Giá tối đa phải lớn hơn giá tối thiểu";
    }

    if (minPrice > 10000000) {
      errors.minPrice = "Giá tối thiểu không được lớn hơn 10,000,000";
    }

    if (maxPrice > 10000000) {
      errors.maxPrice = "Giá tối đa không được lớn hơn 10,000,000";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const isAdmin = useMemo(() => {
    return true; // Always return true regardless of user role
  }, []);

  // Sorting
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("minKm");

  const fetchPriceTables = async () => {
    try {
      setLoading(true);
      const response = await getPriceTables(selectedVersion);

      if (response.success) {
        setPriceTables(response.data.priceTables);
        setVersionsInfo(response.data.versionsInfo);
        setCurrentVersion(response.data.currentVersion);
        setActiveVersion(response.data.activeVersion);
        setError(null);

        // Extract available versions from versionsInfo
        const versions = response.data.versionsInfo.map((v) => v.version);
        setAvailableVersions(versions);

        // If no version is selected, set it to the current version
        if (!selectedVersion) {
          setSelectedVersion(response.data.currentVersion);
        }
      } else {
        setError(response.messageVN || response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải bảng giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceTables();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      fetchPriceTables();
    }
  }, [selectedVersion]);

  const handleVersionChange = (event: SelectChangeEvent<number>) => {
    const newVersion = event.target.value as number;
    setSelectedVersion(newVersion);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  function descendingComparator<T>(a: T, b: T, orderByProperty: keyof T) {
    if (orderByProperty === ("distanceRange" as keyof T)) {
      return (a as any).minKm - (b as any).minKm;
    }

    if (b[orderByProperty] < a[orderByProperty]) {
      return -1;
    }
    if (b[orderByProperty] > a[orderByProperty]) {
      return 1;
    }
    return 0;
  }

  function getComparator<T>(
    order: Order,
    orderByProperty: string
  ): (a: T, b: T) => number {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderByProperty as keyof T)
      : (a, b) => -descendingComparator(a, b, orderByProperty as keyof T);
  }

  const groupedPriceTables = useMemo(() => {
    const sorted = [...priceTables].sort(getComparator(order, orderBy));
    const size20 = sorted.filter((price) => price.containerSize === 1);
    const size40 = sorted.filter((price) => price.containerSize === 2);

    return { size20, size40 };
  }, [priceTables, order, orderBy]);

  const handleEditClick = (price: IPriceTable) => {
    setEditingPrice(price);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingPrice(null);
  };

  const handleUpdatePrice = async () => {
    if (!editingPrice) return;

    if (
      !validatePriceUpdate(
        editingPrice.minPricePerKm,
        editingPrice.maxPricePerKm
      )
    ) {
      return;
    }

    setUpdating(true);
    try {
      const updateRequest: UpdatePriceTableRequest = {
        priceId: editingPrice.priceId,
        minPricePerKm: editingPrice.minPricePerKm,
        maxPricePerKm: editingPrice.maxPricePerKm,
      };

      const response = await updatePriceTables(updateRequest);

      if (response.success) {
        fetchPriceTables();
        handleEditDialogClose();
        setConfirmOpen(false);
        setRefreshPriceChangesKey((prevKey) => prevKey + 1); // Update refresh key
      } else {
        setError(response.messageVN || response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật giá");
    } finally {
      setUpdating(false);
    }
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleImportDialogClose = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    setImportSuccess(null);
    setImportError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!selectedFile) return;
    setCreateConfirmOpen(true);
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) return;

    setImportLoading(true);
    try {
      const response = await importPriceTable(selectedFile);

      if (response.success) {
        setImportSuccess("Nhập dữ liệu thành công!");
        fetchPriceTables();
        setTimeout(() => {
          handleImportDialogClose();
          setCreateConfirmOpen(false);
        }, 1500);
      } else {
        setImportError(response.messageVN || response.message);
      }
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Lỗi khi nhập dữ liệu"
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadPriceTableTemplate();

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "PriceTableTemplate.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Lỗi khi tải mẫu bảng giá"
      );
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from(new Array(5)).map((_, index) => (
      <TableRow
        key={`skeleton-${index}`}
        sx={{ "&:hover": { bgcolor: "transparent !important" } }}
      >
        {Array.from(new Array(headCells.length)).map((_, cellIndex) => (
          <TableCell key={`cell-${index}-${cellIndex}`} align="center">
            <Skeleton
              variant="text"
              width={
                cellIndex === 0
                  ? 70
                  : cellIndex === 3 || cellIndex === 4
                  ? 110
                  : 90
              }
              height={24}
            />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Box sx={{ my: 4 }}>
      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} sm={5} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="version-select-label">Phiên bản</InputLabel>
              <Select
                labelId="version-select-label"
                value={selectedVersion || ""}
                label="Phiên bản"
                onChange={handleVersionChange}
              >
                {availableVersions.map((version) => {
                  const versionInfo = versionsInfo.find(
                    (v) => v.version === version
                  );
                  const startDate = versionInfo?.startDate
                    ? new Date(versionInfo.startDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Chưa xác định";
                  const endDate = versionInfo?.endDate
                    ? new Date(versionInfo.endDate).toLocaleDateString("vi-VN")
                    : "";

                  return (
                    <MenuItem
                      key={version}
                      value={version}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <span>Phiên bản {version}</span>
                        <Box
                          component="span"
                          sx={{
                            fontSize: "0.75rem",
                            ml: 1,
                            color: "text.secondary",
                          }}
                        >
                          {startDate} {endDate && `- ${endDate}`}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {version === currentVersion && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              fontSize: "0.75rem",
                              color: "primary.main",
                              fontWeight: 500,
                            }}
                          >
                            (Hiện tại)
                          </Typography>
                        )}
                        {version === activeVersion && (
                          <Chip
                            label="Đang lưu hành"
                            size="small"
                            color="success"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={7} md={8}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color={showChanges ? "primary" : "inherit"}
                onClick={() => setShowChanges(!showChanges)}
                startIcon={<InfoIcon />}
                disabled={!selectedVersion}
              >
                {showChanges ? "Ẩn thay đổi" : "Xem thay đổi giá"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudDownloadIcon />}
                onClick={handleDownloadTemplate}
              >
                Tải mẫu
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={handleImportClick}
                disabled={!isAdmin}
              >
                Tạo cước phí mới
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Price Changes */}
      {showChanges && selectedVersion && (
        <Fade in={true}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              },
            }}
          >
            <PriceChangesComponent
              version={selectedVersion}
              key={refreshPriceChangesKey}
            />
          </Paper>
        </Fade>
      )}

      {/* Container Size 20' */}
      <Fade in={true} style={{ transitionDelay: "150ms" }}>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            mb: 3,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
            },
          }}
        >
          <Box
            sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Container 20'
            </Typography>
          </Box>

          {error ? (
            <Alert
              severity="error"
              sx={{
                m: 2,
                borderRadius: 1,
                "& .MuiAlert-icon": { alignItems: "center" },
              }}
            >
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      {headCells.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          align="center"
                          sortDirection={
                            orderBy === headCell.id ? order : false
                          }
                          sx={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            backgroundColor: "#f5f5f5",
                            borderBottom: "2px solid #e0e0e0",
                          }}
                        >
                          {headCell.sortable ? (
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={
                                orderBy === headCell.id ? order : "asc"
                              }
                              onClick={() =>
                                handleRequestSort(String(headCell.id))
                              }
                              sx={{
                                "& .MuiTableSortLabel-icon": {
                                  opacity: orderBy === headCell.id ? 1 : 0.4,
                                },
                              }}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          ) : (
                            headCell.label
                          )}
                          {headCell.tooltip && (
                            <Tooltip title={headCell.tooltip} arrow>
                              <InfoIcon
                                fontSize="small"
                                sx={{
                                  ml: 0.5,
                                  fontSize: 16,
                                  opacity: 0.6,
                                  verticalAlign: "middle",
                                }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      renderSkeletons()
                    ) : groupedPriceTables.size20.length > 0 ? (
                      groupedPriceTables.size20.map((price, index) => {
                        // Calculate price change indicators
                        const previousPrice =
                          index > 0
                            ? groupedPriceTables.size20[index - 1]
                            : null;
                        const isPriceIncreased =
                          previousPrice &&
                          price.containerType === previousPrice.containerType &&
                          price.minKm === previousPrice.minKm &&
                          price.minPricePerKm > previousPrice.minPricePerKm;
                        const isPriceDecreased =
                          previousPrice &&
                          price.containerType === previousPrice.containerType &&
                          price.minKm === previousPrice.minKm &&
                          price.minPricePerKm < previousPrice.minPricePerKm;

                        return (
                          <TableRow
                            key={price.priceId}
                            onClick={() =>
                              isAdmin &&
                              price.status === 1 &&
                              handleEditClick(price)
                            }
                            sx={{
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(0, 0, 0, 0.02)"
                                  : "transparent",
                              "&:hover": {
                                backgroundColor: "rgba(1, 70, 199, 0.05)",
                                transition: "background-color 0.2s ease",
                                cursor:
                                  isAdmin && price.status === 1
                                    ? "pointer"
                                    : "default",
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <TableCell align="center">{`${price.minKm} - ${price.maxKm}`}</TableCell>
                            <TableCell align="center">
                              {ContainerTypeMap[price.containerType] ||
                                "Không xác định"}
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {formatCurrency(price.minPricePerKm)}
                                {isPriceIncreased && (
                                  <ArrowUpwardIcon
                                    fontSize="small"
                                    color="error"
                                    sx={{ ml: 0.5, fontSize: 16 }}
                                  />
                                )}
                                {isPriceDecreased && (
                                  <ArrowDownwardIcon
                                    fontSize="small"
                                    color="success"
                                    sx={{ ml: 0.5, fontSize: 16 }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {formatCurrency(price.maxPricePerKm)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={
                                  StatusMap[price.status] || "Không xác định"
                                }
                                color={
                                  price.status === 1 ? "success" : "default"
                                }
                                size="small"
                                sx={{
                                  fontWeight: 500,
                                  minWidth: 100,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip
                                title={new Date(
                                  price.createdDate
                                ).toLocaleString("vi-VN")}
                                arrow
                              >
                                <span>
                                  {new Date(
                                    price.createdDate
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              {price.createdBy}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={headCells.length}
                          align="center"
                          sx={{ py: 4 }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            Không có dữ liệu bảng giá cho container 20'
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Fade>

      {/* Container Size 40' */}
      <Fade in={true} style={{ transitionDelay: "250ms" }}>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
            },
          }}
        >
          <Box
            sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Container 40'
            </Typography>
          </Box>

          {error ? (
            <Alert
              severity="error"
              sx={{
                m: 2,
                borderRadius: 1,
                "& .MuiAlert-icon": { alignItems: "center" },
              }}
            >
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      {headCells.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          align="center"
                          sortDirection={
                            orderBy === headCell.id ? order : false
                          }
                          sx={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            backgroundColor: "#f5f5f5",
                            borderBottom: "2px solid #e0e0e0",
                          }}
                        >
                          {headCell.sortable ? (
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={
                                orderBy === headCell.id ? order : "asc"
                              }
                              onClick={() =>
                                handleRequestSort(String(headCell.id))
                              }
                              sx={{
                                "& .MuiTableSortLabel-icon": {
                                  opacity: orderBy === headCell.id ? 1 : 0.4,
                                },
                              }}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          ) : (
                            headCell.label
                          )}
                          {headCell.tooltip && (
                            <Tooltip title={headCell.tooltip} arrow>
                              <InfoIcon
                                fontSize="small"
                                sx={{
                                  ml: 0.5,
                                  fontSize: 16,
                                  opacity: 0.6,
                                  verticalAlign: "middle",
                                }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      renderSkeletons()
                    ) : groupedPriceTables.size40.length > 0 ? (
                      groupedPriceTables.size40.map((price, index) => {
                        // Calculate price change indicators
                        const previousPrice =
                          index > 0
                            ? groupedPriceTables.size40[index - 1]
                            : null;
                        const isPriceIncreased =
                          previousPrice &&
                          price.containerType === previousPrice.containerType &&
                          price.minKm === previousPrice.minKm &&
                          price.minPricePerKm > previousPrice.minPricePerKm;
                        const isPriceDecreased =
                          previousPrice &&
                          price.containerType === previousPrice.containerType &&
                          price.minKm === previousPrice.minKm &&
                          price.minPricePerKm < previousPrice.minPricePerKm;

                        return (
                          <TableRow
                            key={price.priceId}
                            onClick={() =>
                              isAdmin &&
                              price.status === 1 &&
                              handleEditClick(price)
                            }
                            sx={{
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(0, 0, 0, 0.02)"
                                  : "transparent",
                              "&:hover": {
                                backgroundColor: "rgba(1, 70, 199, 0.05)",
                                transition: "background-color 0.2s ease",
                                cursor:
                                  isAdmin && price.status === 1
                                    ? "pointer"
                                    : "default",
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <TableCell align="center">{`${price.minKm} - ${price.maxKm}`}</TableCell>
                            <TableCell align="center">
                              {ContainerTypeMap[price.containerType] ||
                                "Không xác định"}
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {formatCurrency(price.minPricePerKm)}
                                {isPriceIncreased && (
                                  <ArrowUpwardIcon
                                    fontSize="small"
                                    color="error"
                                    sx={{ ml: 0.5, fontSize: 16 }}
                                  />
                                )}
                                {isPriceDecreased && (
                                  <ArrowDownwardIcon
                                    fontSize="small"
                                    color="success"
                                    sx={{ ml: 0.5, fontSize: 16 }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {formatCurrency(price.maxPricePerKm)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={
                                  StatusMap[price.status] || "Không xác định"
                                }
                                color={
                                  price.status === 1 ? "success" : "default"
                                }
                                size="small"
                                sx={{
                                  fontWeight: 500,
                                  minWidth: 100,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip
                                title={new Date(
                                  price.createdDate
                                ).toLocaleString("vi-VN")}
                                arrow
                              >
                                <span>
                                  {new Date(
                                    price.createdDate
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              {price.createdBy}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={headCells.length + 1}
                          align="center"
                          sx={{ py: 4 }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            Không có dữ liệu bảng giá cho container 40'
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Fade>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Chỉnh sửa giá</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              Chi tiết giá
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingPrice && (
                <>
                  Container {ContainerSizeMap[editingPrice.containerSize]}
                  {" • "}
                  {ContainerTypeMap[editingPrice.containerType]}
                  {" • "}
                  {editingPrice.minKm} - {editingPrice.maxKm} km
                </>
              )}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <TextField
            label="Giá tối thiểu"
            type="number"
            fullWidth
            margin="normal"
            value={editingPrice?.minPricePerKm || ""}
            onChange={(e) =>
              setEditingPrice((prev) =>
                prev ? { ...prev, minPricePerKm: +e.target.value } : null
              )
            }
            InputProps={{
              endAdornment: <Typography variant="body2">VND / km</Typography>,
            }}
            error={!!validationErrors.minPrice}
            helperText={validationErrors.minPrice}
          />
          <TextField
            label="Giá tối đa"
            type="number"
            fullWidth
            margin="normal"
            value={editingPrice?.maxPricePerKm || ""}
            onChange={(e) =>
              setEditingPrice((prev) =>
                prev ? { ...prev, maxPricePerKm: +e.target.value } : null
              )
            }
            InputProps={{
              endAdornment: <Typography variant="body2">VND / km</Typography>,
            }}
            error={!!validationErrors.maxPrice}
            helperText={validationErrors.maxPrice}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={() => {
              if (!editingPrice) return;

              if (
                validatePriceUpdate(
                  editingPrice.minPricePerKm,
                  editingPrice.maxPricePerKm
                )
              ) {
                setConfirmOpen(true);
              }
            }}
            color="primary"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => !updating && setConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận thay đổi giá</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn cập nhật giá này không? Hành động này sẽ thay
            đổi giá vận chuyển cho các đơn hàng mới.
          </Typography>

          {editingPrice && (
            <Box
              sx={{
                mt: 2,
                bgcolor: "background.default",
                p: 2,
                borderRadius: 1,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Giá tối thiểu
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatCurrency(editingPrice.minPricePerKm)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Giá tối đa
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatCurrency(editingPrice.maxPricePerKm)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            disabled={updating}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdatePrice}
            color="primary"
            variant="contained"
            disabled={updating}
            startIcon={
              updating ? <CircularProgress size={20} /> : <CheckIcon />
            }
          >
            {updating ? "Đang cập nhật" : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={handleImportDialogClose}>
        <DialogTitle>Tạo bảng cước phí mới</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<FileUploadIcon />}
            >
              Chọn tệp
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Tệp đã chọn: {selectedFile.name}
              </Typography>
            )}
          </Box>
          {importError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {importError}
            </Alert>
          )}
          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {importSuccess}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportDialogClose} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmImport}
            color="primary"
            variant="contained"
            disabled={!selectedFile || importLoading}
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Confirmation Dialog */}
      <Dialog
        open={createConfirmOpen}
        onClose={() => !importLoading && setCreateConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận tạo bảng cước phí</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn tạo bảng cước phí mới từ tệp đã chọn không?
          </Typography>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Tệp: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateConfirmOpen(false)}
            color="inherit"
            disabled={importLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleImportSubmit}
            color="primary"
            variant="contained"
            disabled={importLoading}
            startIcon={
              importLoading ? <CircularProgress size={20} /> : <CheckIcon />
            }
          >
            {importLoading ? "Đang nhập" : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PriceTableComponent;
