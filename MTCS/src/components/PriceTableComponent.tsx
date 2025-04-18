import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { getPriceTables } from "../services/priceTableApi";
import {
  ContainerSizeMap,
  ContainerTypeMap,
  DeliveryTypeMap,
  PriceTable as IPriceTable,
  StatusMap,
} from "../types/price-table";

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
    id: "deliveryType",
    label: "Loại giao hàng",
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

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

  // Sorting
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("minKm");

  const fetchPriceTables = async () => {
    try {
      setLoading(true);
      const response = await getPriceTables(selectedVersion);

      if (response.success) {
        setPriceTables(response.data.priceTables);
        setAvailableVersions(response.data.availableVersions);
        setCurrentVersion(response.data.currentVersion);
        setActiveVersion(response.data.activeVersion);
        setError(null);

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
  }, [selectedVersion]);

  const handleVersionChange = (event: SelectChangeEvent<number>) => {
    setSelectedVersion(event.target.value as number);
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

  function getComparator<Key extends keyof any>(
    order: Order,
    orderByProperty: string
  ): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string }
  ) => number {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderByProperty as any)
      : (a, b) => -descendingComparator(a, b, orderByProperty as any);
  }

  // Group price tables by container size and sort them
  const groupedPriceTables = useMemo(() => {
    const sorted = [...priceTables].sort(getComparator(order, orderBy));
    const size20 = sorted.filter((price) => price.containerSize === 1);
    const size40 = sorted.filter((price) => price.containerSize === 2);

    return { size20, size40 };
  }, [priceTables, order, orderBy]);

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
                {availableVersions.map((version) => (
                  <MenuItem
                    key={version}
                    value={version}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Phiên bản {version}</span>
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
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

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
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader sx={{ minWidth: 700 }}>
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
                            sx={{
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(0, 0, 0, 0.02)"
                                  : "transparent",
                              "&:hover": {
                                backgroundColor: "rgba(1, 70, 199, 0.05)",
                                transition: "background-color 0.2s ease",
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
                              {DeliveryTypeMap[price.deliveryType] ||
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
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader sx={{ minWidth: 700 }}>
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
                            sx={{
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(0, 0, 0, 0.02)"
                                  : "transparent",
                              "&:hover": {
                                backgroundColor: "rgba(1, 70, 199, 0.05)",
                                transition: "background-color 0.2s ease",
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
                              {DeliveryTypeMap[price.deliveryType] ||
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
    </Box>
  );
};

export default PriceTableComponent;
