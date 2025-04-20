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
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
  Tooltip,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { getPriceChangesInVersion } from "../../services/priceTableApi";
import {
  ContainerSizeMap,
  ContainerTypeMap,
  DeliveryTypeMap,
  PriceChangeGroup,
  StatusMap,
} from "../../types/price-table";

interface PriceChangesComponentProps {
  version: number;
}

const PriceChangesComponent: React.FC<PriceChangesComponentProps> = ({
  version,
}) => {
  const theme = useTheme();
  const [priceChangeGroups, setPriceChangeGroups] = useState<
    PriceChangeGroup[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Group price changes by container size
  const groupedPriceChanges = useMemo(() => {
    const size20 = priceChangeGroups.filter(
      (group) => group.containerSize === 1
    );
    const size40 = priceChangeGroups.filter(
      (group) => group.containerSize === 2
    );
    return { size20, size40 };
  }, [priceChangeGroups]);

  useEffect(() => {
    const fetchPriceChanges = async () => {
      try {
        setLoading(true);
        console.log(`Fetching price changes for version ${version}...`);
        const response = await getPriceChangesInVersion(version);
        console.log("Price changes API response:", response);

        if (response.success) {
          setPriceChangeGroups(response.data);
          setError(null);
        } else {
          console.error(
            "API returned error:",
            response.messageVN || response.message
          );
          setError(response.messageVN || response.message);
        }
      } catch (err) {
        console.error("Error fetching price changes:", err);
        if (err instanceof Error) {
          console.error("Error details:", err.message, err.stack);
          setError(err.message);
        } else {
          console.error("Unknown error type:", err);
          setError("Lỗi khi tải thay đổi giá");
        }
      } finally {
        setLoading(false);
      }
    };

    if (version) {
      fetchPriceChanges();
    }
  }, [version]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Determine if price has increased or decreased
  const getPriceChangeInfo = (group: PriceChangeGroup) => {
    if (group.changes.length < 2) return null;

    // Find the active (new) and inactive (old) prices
    const newPrice = group.changes.find((p) => p.status === 1);
    const oldPrice = group.changes.find((p) => p.status === 0);

    if (!newPrice || !oldPrice) return null;

    const minPriceDiff = newPrice.minPricePerKm - oldPrice.minPricePerKm;
    const maxPriceDiff = newPrice.maxPricePerKm - oldPrice.maxPricePerKm;

    const minPriceChange = (minPriceDiff / oldPrice.minPricePerKm) * 100;
    const maxPriceChange = (maxPriceDiff / oldPrice.maxPricePerKm) * 100;

    const isIncrease = minPriceDiff > 0 || maxPriceDiff > 0;
    const isDecrease = minPriceDiff < 0 || maxPriceDiff < 0;

    return {
      minPriceDiff,
      maxPriceDiff,
      minPriceChange,
      maxPriceChange,
      isIncrease,
      isDecrease,
    };
  };

  // Render loading skeletons for the accordion groups
  const renderLoadingSkeletons = () => (
    <>
      {[1, 2, 3].map((item) => (
        <Box key={`skeleton-${item}`} sx={{ mb: 2 }}>
          <Skeleton
            variant="rectangular"
            height={72}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ))}
    </>
  );

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Lịch sử chỉnh sửa - Phiên bản {version}
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : loading ? (
        renderLoadingSkeletons()
      ) : priceChangeGroups.length === 0 ? (
        <Alert severity="info">Không có thay đổi giá trong phiên bản này</Alert>
      ) : (
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Container 20 Feet" />
            <Tab label="Container 40 Feet" />
          </Tabs>
          {(tabValue === 0
            ? groupedPriceChanges.size20
            : groupedPriceChanges.size40
          ).map((group, index) => {
            const priceChangeInfo = getPriceChangeInfo(group);
            const newPrice = group.changes.find((p) => p.status === 1);
            const oldPrice = group.changes.find((p) => p.status === 0);

            return (
              <Accordion
                key={`group-${index}`}
                defaultExpanded={index === 0}
                sx={{
                  mb: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderRadius: "8px !important",
                  "&::before": { display: "none" },
                  "&.Mui-expanded": {
                    margin: "8px 0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ mr: 1 }}>
                      <Typography component="div" sx={{ fontWeight: 600 }}>
                        {`${group.minKm} - ${group.maxKm} km`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`Container ${
                          ContainerSizeMap[group.containerSize]
                        } | ${ContainerTypeMap[group.containerType]} | ${
                          DeliveryTypeMap[group.deliveryType]
                        }`}
                      </Typography>
                    </Box>

                    {priceChangeInfo && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          ml: "auto",
                          mr: 2,
                        }}
                      >
                        {priceChangeInfo.isIncrease && (
                          <Chip
                            icon={<TrendingUpIcon fontSize="small" />}
                            label={`Tăng ${Math.abs(
                              priceChangeInfo.minPriceChange
                            ).toFixed(1)}%`}
                            color="error"
                            size="small"
                            sx={{ fontWeight: 500, ml: 1 }}
                          />
                        )}
                        {priceChangeInfo.isDecrease && (
                          <Chip
                            icon={<TrendingDownIcon fontSize="small" />}
                            label={`Giảm ${Math.abs(
                              priceChangeInfo.minPriceChange
                            ).toFixed(1)}%`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500, ml: 1 }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Trạng thái
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Giá tối thiểu
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Giá tối đa
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Ngày thay đổi
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Người thay đổi
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.changes.map((price) => (
                          <TableRow
                            key={price.priceId}
                            sx={{
                              backgroundColor:
                                price.status === 1
                                  ? "rgba(76, 175, 80, 0.04)"
                                  : "rgba(211, 47, 47, 0.04)",
                              "&:hover": {
                                backgroundColor:
                                  price.status === 1
                                    ? "rgba(76, 175, 80, 0.08)"
                                    : "rgba(211, 47, 47, 0.08)",
                              },
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={price.status === 1 ? "Mới" : "Cũ"}
                                color={
                                  price.status === 1 ? "success" : "default"
                                }
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              {formatCurrency(price.minPricePerKm)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(price.maxPricePerKm)}
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={
                                  price.status === 1
                                    ? new Date(
                                        price.createdDate
                                      ).toLocaleString("vi-VN")
                                    : price.modifiedDate
                                    ? new Date(
                                        price.modifiedDate
                                      ).toLocaleString("vi-VN")
                                    : "Không có thông tin"
                                }
                                arrow
                              >
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <ScheduleIcon
                                    fontSize="small"
                                    sx={{ mr: 0.5, opacity: 0.7 }}
                                  />
                                  <Typography variant="body2">
                                    {price.status === 1
                                      ? new Date(
                                          price.createdDate
                                        ).toLocaleDateString("vi-VN")
                                      : price.modifiedDate
                                      ? new Date(
                                          price.modifiedDate
                                        ).toLocaleDateString("vi-VN")
                                      : "N/A"}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {price.status === 1
                                ? price.createdBy
                                : price.modifiedBy}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {priceChangeInfo && newPrice && oldPrice && (
                    <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <InfoIcon
                          fontSize="small"
                          sx={{ mr: 1, opacity: 0.7 }}
                        />
                        Chi tiết thay đổi
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Giá tối thiểu
                          </Typography>
                          <Typography>
                            {formatCurrency(oldPrice.minPricePerKm)} →{" "}
                            {formatCurrency(newPrice.minPricePerKm)}{" "}
                            <Typography
                              component="span"
                              sx={{
                                color:
                                  priceChangeInfo.minPriceDiff > 0
                                    ? "error.main"
                                    : "success.main",
                                fontWeight: 500,
                              }}
                            >
                              ({priceChangeInfo.minPriceDiff > 0 ? "+" : ""}
                              {formatCurrency(priceChangeInfo.minPriceDiff)})
                            </Typography>
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Giá tối đa
                          </Typography>
                          <Typography>
                            {formatCurrency(oldPrice.maxPricePerKm)} →{" "}
                            {formatCurrency(newPrice.maxPricePerKm)}{" "}
                            <Typography
                              component="span"
                              sx={{
                                color:
                                  priceChangeInfo.maxPriceDiff > 0
                                    ? "error.main"
                                    : "success.main",
                                fontWeight: 500,
                              }}
                            >
                              ({priceChangeInfo.maxPriceDiff > 0 ? "+" : ""}
                              {formatCurrency(priceChangeInfo.maxPriceDiff)})
                            </Typography>
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      )}
    </Box>
  );
};

export default PriceChangesComponent;
