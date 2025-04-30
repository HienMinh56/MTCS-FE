import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
  Divider,
  Fade,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  getSystemConfigurations,
  updateSystemConfiguration,
  SystemConfiguration as SystemConfigType,
} from "../services/systemConfigApi";

const SystemConfiguration: React.FC = () => {
  const [configurations, setConfigurations] = useState<SystemConfigType[]>([]);
  const [editingConfig, setEditingConfig] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await getSystemConfigurations();

      if (response.status > 0 && Array.isArray(response.data)) {
        setConfigurations(response.data);
      } else {
        setError("Không thể tải cấu hình hệ thống.");
      }
    } catch (err) {
      console.error("Error fetching configurations:", err);
      setError(
        "Đã xảy ra lỗi khi tải cấu hình hệ thống. Vui lòng thử lại sau."
      );
    } finally {
      setIsFetching(false);
    }
  };

  const isNumericConfig = (key: string): boolean => {
    return key.includes("Weight") || key.includes("WorkTime");
  };

  const handleEdit = (configId: number, currentValue: string) => {
    setEditingConfig(configId);
    setEditValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setEditValue("");
  };

  const handleSave = async (configId: number) => {
    if (!editValue.trim()) {
      setError("Giá trị không được để trống");
      return;
    }

    const config = configurations.find((c) => c.configId === configId);
    if (config && isNumericConfig(config.configKey)) {
      const numValue = Number(editValue);
      if (isNaN(numValue)) {
        setError("Giá trị phải là số");
        return;
      }
      if (numValue <= 0) {
        setError("Giá trị phải lớn hơn 0");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateSystemConfiguration(configId, editValue);

      setConfigurations((prevConfigs) =>
        prevConfigs.map((config) =>
          config.configId === configId
            ? {
                ...config,
                configValue: editValue,
                updatedDate: new Date().toISOString(),
                updatedBy: "System",
              }
            : config
        )
      );

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      setEditingConfig(null);
    } catch (err) {
      console.error("Error updating configuration:", err);
      setError("Có lỗi xảy ra khi cập nhật cấu hình. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const config = configurations.find((c) => c.configId === editingConfig);

    if (config && isNumericConfig(config.configKey)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setEditValue(value);
      }
    } else {
      setEditValue(value);
    }
  };

  const getConfigLabel = (key: string): string => {
    const labels: Record<string, string> = {
      "20'_Dry_Weight": "Khối lượng container rỗng khô 20'",
      "40'_Dry_Weight": "Khối lượng container rỗng khô 40'",
      "20'_Reefer_Weight": "Khối lượng container rỗng lạnh 20'",
      "40'_Reefer_Weight": "Khối lượng container rỗng lạnh 40'",
      Daily_Driver_WorkTime: "Thời gian làm việc trong ngày của tài xế",
      Weekly_Driver_WorkTime: "Thời gian làm việc trong tuần của tài xế",
      Total_orders_per_day: "Số đơn hàng tối đa nhận trong ngày",
      Maintenance_Due_Alert: "Hạn cảnh báo bảo trì",
      Registration_Expiry_Alert: "Hạn cảnh báo đăng kiểm",
      Contract_Expiry_Alert: "Hạn cảnh báo hợp đồng",
    };

    return labels[key] || key;
  };

  const getConfigUnit = (key: string): string => {
    if (key.includes("Weight")) {
      return "kg";
    } else if (key.includes("WorkTime")) {
      return "giờ";
    } else if (key.includes("Alert")) {
      return "ngày";
    }
    return "";
  };

  const getConfigCategory = (key: string): string => {
    if (key.includes("Weight")) {
      return "Container";
    } else if (key.includes("WorkTime")) {
      return "Tài xế";
    }
    return "Khác";
  };

  const categories = Array.from(
    new Set(configurations.map((config) => getConfigCategory(config.configKey)))
  );

  const filteredConfigurations = categoryFilter
    ? configurations.filter(
        (config) => getConfigCategory(config.configKey) === categoryFilter
      )
    : configurations;

  if (isFetching) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h5" sx={{ mt: 3, color: "text.secondary" }}>
          Đang tải cấu hình hệ thống...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            <Typography fontSize="1rem">{error}</Typography>
          </Alert>
        </Fade>
      )}

      {isSaved && (
        <Fade in={isSaved}>
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setIsSaved(false)}
          >
            <Typography fontSize="1rem">
              Cấu hình đã được cập nhật thành công!
            </Typography>
          </Alert>
        </Fade>
      )}

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
            <Button
              variant={categoryFilter === null ? "contained" : "outlined"}
              size="medium"
              onClick={() => setCategoryFilter(null)}
              sx={{ borderRadius: 5, fontSize: "1rem" }}
            >
              Tất cả
            </Button>

            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "contained" : "outlined"}
                size="medium"
                onClick={() => setCategoryFilter(category)}
                sx={{ borderRadius: 5, fontSize: "1rem" }}
              >
                {category}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, bgcolor: "background.default" }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {categoryFilter
                ? `Cấu hình ${categoryFilter.toLowerCase()}`
                : "Tất cả cấu hình"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredConfigurations.length} cấu hình{" "}
              {categoryFilter
                ? `trong nhóm ${categoryFilter.toLowerCase()}`
                : ""}
            </Typography>
          </Box>

          <Divider />

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell
                    width="40%"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Tên cấu hình
                  </TableCell>
                  <TableCell
                    width="25%"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Giá trị
                  </TableCell>
                  <TableCell
                    width="20%"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Cập nhật lần cuối
                  </TableCell>
                  <TableCell
                    width="15%"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConfigurations.length > 0 ? (
                  filteredConfigurations.map((config) => (
                    <TableRow
                      key={config.configId}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          fontSize="1.05rem"
                        >
                          {getConfigLabel(config.configKey)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {editingConfig === config.configId ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editValue}
                            onChange={handleChange}
                            autoFocus
                            error={
                              !editValue.trim() ||
                              (isNumericConfig(config.configKey) &&
                                (isNaN(Number(editValue)) ||
                                  Number(editValue) <= 0))
                            }
                            helperText={
                              !editValue.trim()
                                ? "Giá trị không được để trống"
                                : isNumericConfig(config.configKey) &&
                                  isNaN(Number(editValue))
                                ? "Giá trị phải là số"
                                : isNumericConfig(config.configKey) &&
                                  Number(editValue) <= 0
                                ? "Giá trị phải lớn hơn 0"
                                : ""
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    fontSize="1rem"
                                  >
                                    {getConfigUnit(config.configKey)}
                                  </Typography>
                                </InputAdornment>
                              ),
                              style: { fontSize: "1.05rem" },
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  borderColor: "primary.main",
                                  borderWidth: 2,
                                },
                              },
                              "& .MuiFormHelperText-root": {
                                fontSize: "0.9rem",
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            fontWeight={500}
                            fontSize="1.05rem"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {config.configValue}
                            {getConfigUnit(config.configKey) && (
                              <Typography
                                component="span"
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                                fontSize="1rem"
                              >
                                {getConfigUnit(config.configKey)}
                              </Typography>
                            )}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.updatedDate ? (
                          <Box>
                            <Typography variant="body1" fontSize="1.05rem">
                              {new Date(config.updatedDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontSize="0.95rem"
                            >
                              bởi {config.updatedBy}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip
                            label="Chưa cập nhật"
                            size="medium"
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: 1, fontSize: "0.95rem" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {editingConfig === config.configId ? (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Lưu">
                              <Button
                                size="medium"
                                variant="contained"
                                color="primary"
                                onClick={() => handleSave(config.configId)}
                                disabled={isLoading || !editValue.trim()}
                                sx={{ minWidth: 0, borderRadius: 1 }}
                              >
                                {isLoading ? (
                                  <CircularProgress size={24} />
                                ) : (
                                  <SaveIcon />
                                )}
                              </Button>
                            </Tooltip>
                            <Tooltip title="Hủy">
                              <Button
                                size="medium"
                                variant="outlined"
                                color="inherit"
                                onClick={handleCancelEdit}
                                sx={{ minWidth: 0, borderRadius: 1 }}
                              >
                                <CancelIcon />
                              </Button>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              color="primary"
                              size="large"
                              onClick={() =>
                                handleEdit(config.configId, config.configValue)
                              }
                              sx={{
                                bgcolor: "rgba(25, 118, 210, 0.08)",
                                "&:hover": {
                                  bgcolor: "rgba(25, 118, 210, 0.12)",
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontSize="1.1rem"
                      >
                        Không tìm thấy cấu hình nào{" "}
                        {categoryFilter ? `trong nhóm ${categoryFilter}` : ""}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemConfiguration;
