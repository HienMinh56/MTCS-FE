import React, { useState } from "react";
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import TimeTable from "./TimeTable";
import DriverTimeTable from "./DriverTimeTable";

type ViewMode = "trips" | "drivers";

const TimeTableContainer: React.FC = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("trips");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleRefresh = () => {
    // This will be passed to child components to trigger their refresh
  };

  const ToggleButtonComponent = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mb: 2,
      }}
    >
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        aria-label="view mode"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: "8px !important",
            mx: 0.5,
            px: 2,
            py: 1,
            fontWeight: "medium",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: theme.palette.primary.main + "10",
            },
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          },
        }}
      >
        <ToggleButton value="trips" aria-label="trips view">
          <LocalShippingIcon sx={{ mr: 1, fontSize: 18 }} />
          Lịch Giao Hàng
        </ToggleButton>
        <ToggleButton value="drivers" aria-label="drivers view">
          <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
          Lịch Tài Xế
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 2,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Content */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            {viewMode === "trips" ? (
              <TimeTable renderToggle={ToggleButtonComponent} />
            ) : (
              <DriverTimeTable
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onRefresh={handleRefresh}
                renderToggle={ToggleButtonComponent}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TimeTableContainer;
