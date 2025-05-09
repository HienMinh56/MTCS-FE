import React, { useEffect, useState } from "react";
import {
  fetchDeliveryStatuses,
  updateDeliveryStatuses,
  UpdateDeliveryStatusPayload,
} from "../services/deliveryStatusService";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  Switch,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Checkbox,
  ButtonGroup,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LockIcon from "@mui/icons-material/Lock";

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DeliveryStatus {
  statusId: string;
  statusName: string;
  isActive: number;
  createdBy: string;
  createdDate: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
  statusIndex: number;
  tripStatusHistories: any[];
}

// Sortable Item component for drag and drop functionality
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isDraggable: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  isDraggable,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  // Apply the ref and listeners directly to the TableRow
  return React.cloneElement(children as React.ReactElement, {
    ref: setNodeRef,
    style,
    ...(isDraggable ? { ...attributes, ...listeners } : {}),
  });
};

const DeliveryStatusPage: React.FC = () => {
  const [statuses, setStatuses] = useState<DeliveryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [showInactive, setShowInactive] = useState(false); // State to track whether to show inactive statuses
  const theme = useTheme();

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add status dialog state
  const [addStatusDialogOpen, setAddStatusDialogOpen] = useState(false);
  const [newStatusId, setNewStatusId] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusActive, setNewStatusActive] = useState(1);
  const [statusIdError, setStatusIdError] = useState("");
  const [statusNameError, setStatusNameError] = useState("");

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    setLoading(true);
    try {
      const data = await fetchDeliveryStatuses();
      // Filter out statuses with names "canceled" and "delaying" (case insensitive)
      const filteredData = data.filter(
        (status: DeliveryStatus) =>
          !["canceled", "delaying"].includes(status.statusId.toLowerCase())
      );

      // Sort by active status first (active on top), then by statusIndex
      const sortedData = [...filteredData].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return b.isActive - a.isActive; // Active statuses (1) first, inactive (0) later
        }
        return a.statusIndex - b.statusIndex; // Then sort by statusIndex
      });

      setStatuses(sortedData);
    } catch (error) {
      console.error("Error fetching delivery statuses:", error);
      showAlert("Không thể tải trạng thái giao hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, severity: "success" | "error") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const toggleStatusActive = (statusId: string) => {
    // Don't allow toggling for special statuses
    if (["not_started", "completed"].includes(statusId)) {
      return;
    }

    setStatuses((prevStatuses) => {
      const updatedStatuses = prevStatuses.map((status) => {
        if (status.statusId === statusId) {
          return {
            ...status,
            isActive: status.isActive === 1 ? 0 : 1,
          };
        }
        return status;
      });
      setModified(true);

      // Sắp xếp lại danh sách sau khi thay đổi trạng thái
      return [...updatedStatuses].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return b.isActive - a.isActive; // Active statuses (1) first, inactive (0) later
        }
        return a.statusIndex - b.statusIndex; // Then sort by statusIndex
      });
    });
  };

  const moveStatusUp = (index: number) => {
    // Filter only active statuses
    const activeStatuses = statuses.filter((status) => status.isActive === 1);
    if (index <= 0 || activeStatuses.length <= 1) return; // Can't move first item up or if only one active item

    // Find the actual index in the full statuses array
    const activeStatusId = activeStatuses[index].statusId;
    const actualIndex = statuses.findIndex(
      (s) => s.statusId === activeStatusId
    );
    const prevActiveStatusId = activeStatuses[index - 1].statusId;
    const prevIndex = statuses.findIndex(
      (s) => s.statusId === prevActiveStatusId
    );

    setStatuses((prevStatuses) => {
      const updatedStatuses = [...prevStatuses];
      // Swap items
      [updatedStatuses[prevIndex], updatedStatuses[actualIndex]] = [
        updatedStatuses[actualIndex],
        updatedStatuses[prevIndex],
      ];

      // Update statusIndex values to match new positions
      return updatedStatuses.map((status, idx) => ({
        ...status,
        statusIndex: idx,
      }));
    });
    setModified(true);

    // Sắp xếp lại danh sách sau khi thay đổi vị trí
    setStatuses((prevStatuses) => {
      return [...prevStatuses].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return b.isActive - a.isActive; // Active statuses (1) first, inactive (0) later
        }
        return a.statusIndex - b.statusIndex; // Then sort by statusIndex
      });
    });
  };

  const moveStatusDown = (index: number) => {
    // Filter only active statuses
    const activeStatuses = statuses.filter((status) => status.isActive === 1);
    if (index >= activeStatuses.length - 1 || activeStatuses.length <= 1)
      return; // Can't move last item down or if only one active item

    // Find the actual index in the full statuses array
    const activeStatusId = activeStatuses[index].statusId;
    const actualIndex = statuses.findIndex(
      (s) => s.statusId === activeStatusId
    );
    const nextActiveStatusId = activeStatuses[index + 1].statusId;
    const nextIndex = statuses.findIndex(
      (s) => s.statusId === nextActiveStatusId
    );

    setStatuses((prevStatuses) => {
      const updatedStatuses = [...prevStatuses];
      // Swap items
      [updatedStatuses[actualIndex], updatedStatuses[nextIndex]] = [
        updatedStatuses[nextIndex],
        updatedStatuses[actualIndex],
      ];

      // Update statusIndex values to match new positions
      return updatedStatuses.map((status, idx) => ({
        ...status,
        statusIndex: idx,
      }));
    });
    setModified(true);

    // Sắp xếp lại danh sách sau khi thay đổi vị trí
    setStatuses((prevStatuses) => {
      return [...prevStatuses].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return b.isActive - a.isActive; // Active statuses (1) first, inactive (0) later
        }
        return a.statusIndex - b.statusIndex; // Then sort by statusIndex
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setStatuses((prevStatuses) => {
      // Find the indices of the dragged and target items
      const filteredStatuses = prevStatuses.filter(
        (status) => showInactive || status.isActive === 1
      );
      const activeStatusId = String(active.id);
      const overStatusId = String(over.id);

      const activeIndex = filteredStatuses.findIndex(
        (s) => s.statusId === activeStatusId
      );
      const overIndex = filteredStatuses.findIndex(
        (s) => s.statusId === overStatusId
      );

      if (activeIndex === -1 || overIndex === -1) return prevStatuses;

      // Create a new array with the items reordered
      const reorderedFilteredStatuses = arrayMove(
        filteredStatuses,
        activeIndex,
        overIndex
      );

      // Update status indices
      const updatedFilteredStatuses = reorderedFilteredStatuses.map(
        (status, index) => ({
          ...status,
          statusIndex: index,
        })
      );

      // Merge back with inactive statuses if they're not shown
      const inactiveStatuses = !showInactive
        ? prevStatuses.filter((status) => status.isActive === 0)
        : [];

      const result = [...updatedFilteredStatuses, ...inactiveStatuses];

      // Sort the result by active status first, then by statusIndex
      const sortedResult = [...result].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return b.isActive - a.isActive;
        }
        return a.statusIndex - b.statusIndex;
      });

      setModified(true);
      return sortedResult;
    });
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Prepare payload for API
      const payload: UpdateDeliveryStatusPayload[] = statuses.map((status) => ({
        statusId: status.statusId,
        statusName: status.statusName,
        isActive: status.isActive,
        statusIndex: status.statusIndex,
      }));

      const response = await updateDeliveryStatuses(payload);
      showAlert("Cập nhật trạng thái giao hàng thành công", "success");
      setModified(false);

      // Reload data to ensure consistent display
      await fetchStatusData();
    } catch (error: any) {
      console.error("Error updating delivery statuses:", error);

      // Check for specific error message about trip in use
      if (
        error.response?.data?.message ===
        "Can not create or update delivery status when there is a trip in use"
      ) {
        showAlert(
          "Không thể tạo hoặc cập nhật trạng thái giao hàng khi có chuyến đang hoạt động",
          "error"
        );
      } else {
        showAlert("Không thể cập nhật trạng thái giao hàng", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const enableEditMode = (statusId: string, currentName: string) => {
    setEditModeId(statusId);
    setEditedName(currentName);
  };

  const saveStatusName = (statusId: string) => {
    if (editedName.trim() === "") return;

    setStatuses((prevStatuses) => {
      const updatedStatuses = prevStatuses.map((status) => {
        if (status.statusId === statusId) {
          return {
            ...status,
            statusName: editedName.trim(),
          };
        }
        return status;
      });
      setModified(true);
      return updatedStatuses;
    });

    setEditModeId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, statusId: string) => {
    if (e.key === "Enter") {
      saveStatusName(statusId);
    } else if (e.key === "Escape") {
      setEditModeId(null);
    }
  };

  const handleOpenAddStatusDialog = () => {
    // Reset form fields
    setNewStatusId("");
    setNewStatusName("");
    setNewStatusActive(1);
    setStatusIdError("");
    setStatusNameError("");
    setAddStatusDialogOpen(true);
  };

  const handleCloseAddStatusDialog = () => {
    setAddStatusDialogOpen(false);
  };

  const validateNewStatusForm = () => {
    let isValid = true;

    // Validate Status ID
    if (!newStatusId.trim()) {
      setStatusIdError("Mã trạng thái không được để trống");
      isValid = false;
    } else if (
      statuses.some((status) => status.statusId === newStatusId.trim())
    ) {
      setStatusIdError("Mã trạng thái đã tồn tại");
      isValid = false;
    } else {
      setStatusIdError("");
    }

    // Validate Status Name
    if (!newStatusName.trim()) {
      setStatusNameError("Tên trạng thái không được để trống");
      isValid = false;
    } else {
      setStatusNameError("");
    }

    return isValid;
  };

  const handleAddNewStatus = () => {
    if (!validateNewStatusForm()) {
      return;
    }

    // Create a new status with current date and next available index
    const nextIndex =
      statuses.length > 0
        ? Math.max(...statuses.map((s) => s.statusIndex)) + 1
        : 0;

    const newStatus: DeliveryStatus = {
      statusId: newStatusId.trim(),
      statusName: newStatusName.trim(),
      isActive: newStatusActive,
      createdBy: "current-user", // This would normally come from auth context
      createdDate: new Date().toISOString(),
      modifiedDate: null,
      modifiedBy: null,
      deletedDate: null,
      deletedBy: null,
      statusIndex: nextIndex,
      tripStatusHistories: [],
    };

    // Add the new status to the current list
    setStatuses((prevStatuses) => [...prevStatuses, newStatus]);
    setModified(true);

    // Close the dialog
    handleCloseAddStatusDialog();

    // Show success message
    showAlert(
      "Thêm trạng thái mới thành công. Hãy nhớ lưu thay đổi!",
      "success"
    );
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmSaveChanges = () => {
    handleCloseConfirmDialog();
    saveChanges();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        // Remove height and overflow properties that override parent layout
        display: "flex",
        flexDirection: "column",
        px: { xs: 1, sm: 2, md: 3, lg: 4 },
        py: { xs: 1, sm: 2 },
      }}
    >
      <Card
        elevation={3}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Hiển thị trạng thái không hoạt động
                  </Typography>
                }
              />
            </FormGroup>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell
                    width="15%"
                    align="center"
                    sx={{ fontWeight: "bold", py: 2 }}
                  >
                    Thứ tự
                  </TableCell>
                  <TableCell
                    width="30%"
                    align="center"
                    sx={{ fontWeight: "bold", py: 2 }}
                  >
                    Tên Trạng Thái
                  </TableCell>
                  <TableCell
                    align="center"
                    width="20%"
                    sx={{ fontWeight: "bold", py: 2 }}
                  >
                    Tình Trạng
                  </TableCell>
                  <TableCell
                    align="center"
                    width="35%"
                    sx={{ fontWeight: "bold", py: 2 }}
                  >
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={statuses
                    .filter((status) => showInactive || status.isActive === 1)
                    .map((status) => status.statusId)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {statuses
                      .filter((status) => showInactive || status.isActive === 1)
                      .map((status, index) => {
                        // Check if this is a special status that cannot be moved
                        const isSpecialStatus = [
                          "not_started",
                          "completed",
                        ].includes(status.statusId);

                        // Determine if this item is draggable - only special statuses can't be moved
                        const isDraggable =
                          status.isActive === 1 && !isSpecialStatus;

                        return (
                          <SortableItem
                            key={status.statusId}
                            id={status.statusId}
                            isDraggable={isDraggable}
                          >
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                                "&:hover": {
                                  backgroundColor: theme.palette.grey[50],
                                },
                                height: "64px",
                                cursor: isDraggable ? "grab" : "default",
                                // Highlight special statuses with subtle background
                                ...(isSpecialStatus && {
                                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                                }),
                              }}
                            >
                              <TableCell align="center">
                                {status.statusIndex}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="center"
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                  }}
                                >
                                  {isDraggable ? (
                                    <DragIndicatorIcon
                                      sx={{
                                        color: theme.palette.text.secondary,
                                        cursor: "grab",
                                        "&:hover": {
                                          color: theme.palette.primary.main,
                                        },
                                      }}
                                    />
                                  ) : (
                                    <LockIcon
                                      sx={{
                                        color: theme.palette.text.disabled,
                                        fontSize: "1.1rem",
                                      }}
                                    />
                                  )}

                                  {editModeId === status.statusId ? (
                                    <TextField
                                      value={editedName}
                                      onChange={(e) =>
                                        setEditedName(e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, status.statusId)
                                      }
                                      size="small"
                                      autoFocus
                                      sx={{ width: "100%" }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                      sx={{
                                        ...(isSpecialStatus && {
                                          fontWeight: "bold",
                                        }),
                                      }}
                                    >
                                      {status.statusName}
                                      {isSpecialStatus && (
                                        <Chip
                                          label="Cố định"
                                          size="small"
                                          color="secondary"
                                          sx={{
                                            ml: 1,
                                            height: 20,
                                            fontSize: "0.7rem",
                                          }}
                                        />
                                      )}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {status.isActive ? (
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label="Đang hoạt động"
                                    size="small"
                                    color="success"
                                    sx={{ fontWeight: "medium", px: 1 }}
                                  />
                                ) : (
                                  <Chip
                                    icon={<CancelIcon />}
                                    label="Không hoạt động"
                                    size="small"
                                    color="error"
                                    sx={{ fontWeight: "medium", px: 1 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip
                                  title={
                                    isSpecialStatus
                                      ? "Không thể thay đổi trạng thái"
                                      : "Đổi trạng thái hoạt động"
                                  }
                                >
                                  <span>
                                    <Switch
                                      checked={status.isActive === 1}
                                      onChange={() =>
                                        toggleStatusActive(status.statusId)
                                      }
                                      disabled={isSpecialStatus}
                                      size="small"
                                      sx={{
                                        "& .MuiSwitch-switchBase": {
                                          p: 0.75,
                                        },
                                      }}
                                    />
                                  </span>
                                </Tooltip>

                                {editModeId === status.statusId ? (
                                  <Tooltip title="Lưu tên">
                                    <IconButton
                                      onClick={() =>
                                        saveStatusName(status.statusId)
                                      }
                                      size="small"
                                      color="primary"
                                      sx={{
                                        ml: 1.5,
                                        border: `1px solid ${theme.palette.primary.main}`,
                                        backgroundColor:
                                          "rgba(25, 118, 210, 0.04)",
                                      }}
                                    >
                                      <DoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  // Only show edit button for non-special statuses
                                  !isSpecialStatus && (
                                    <Tooltip title="Sửa tên">
                                      <IconButton
                                        onClick={() =>
                                          enableEditMode(
                                            status.statusId,
                                            status.statusName
                                          )
                                        }
                                        size="small"
                                        color="primary"
                                        sx={{
                                          ml: 1.5,
                                          border: `1px solid ${theme.palette.grey[300]}`,
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(25, 118, 210, 0.04)",
                                            borderColor:
                                              theme.palette.primary.main,
                                          },
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )
                                )}
                              </TableCell>
                            </TableRow>
                          </SortableItem>
                        );
                      })}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </TableContainer>

          {statuses.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Không tìm thấy trạng thái giao hàng nào
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2,
          p: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Box display="flex" alignItems="center">
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mr: 3,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              backgroundColor: theme.palette.grey[100],
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
            }}
          >
            {showInactive
              ? `Tổng số trạng thái: ${statuses.length}`
              : `Trạng thái đang hoạt động: ${
                  statuses.filter((status) => status.isActive === 1).length
                }`}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddStatusDialog}
            size="medium"
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              py: 0.75,
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            Thêm trạng thái mới
          </Button>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleOpenConfirmDialog}
          disabled={!modified || saving}
          size="medium"
          sx={{
            borderRadius: 1.5,
            px: 3,
            py: 1,
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
          }}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Box>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Add Status Dialog */}
      <Dialog
        open={addStatusDialogOpen}
        onClose={handleCloseAddStatusDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            fontWeight: "bold",
            py: 2.5,
            px: 3,
          }}
        >
          Thêm Trạng Thái Giao Hàng Mới
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <DialogContentText
            sx={{ mb: 3, color: theme.palette.text.secondary }}
          >
            Nhập thông tin chi tiết cho trạng thái giao hàng mới.
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="Mã Trạng Thái"
            fullWidth
            variant="outlined"
            value={newStatusId}
            onChange={(e) => setNewStatusId(e.target.value)}
            error={!!statusIdError}
            helperText={statusIdError}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 1.5 },
            }}
          />

          <TextField
            margin="dense"
            label="Tên Trạng Thái"
            fullWidth
            variant="outlined"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            error={!!statusNameError}
            helperText={statusNameError}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 1.5 },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={newStatusActive === 1}
                onChange={(e) => setNewStatusActive(e.target.checked ? 1 : 0)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Trạng Thái Hoạt Động
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseAddStatusDialog}
            color="inherit"
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddNewStatus}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Thêm Trạng Thái
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Save Changes Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            background: theme.palette.primary.main,
            color: "white",
            fontWeight: "bold",
            py: 2,
            px: 3,
            fontSize: "1.1rem",
          }}
        >
          Xác nhận thay đổi
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <WarningIcon
              color="warning"
              sx={{ mr: 2, fontSize: 28, mt: 0.5 }}
            />
            <DialogContentText
              sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
            >
              Bạn có chắc chắn muốn lưu các thay đổi trạng thái giao hàng không?
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={handleCloseConfirmDialog}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 0.75,
              minWidth: 100,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmSaveChanges}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 0.75,
              minWidth: 100,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryStatusPage;
