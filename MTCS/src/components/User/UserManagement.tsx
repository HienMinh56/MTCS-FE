import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AddIcon from "@mui/icons-material/Add";
import UserTable from "./UserTable";
import { UserRole, UserStatus } from "../../types/auth";
import StaffRegistration from "./StaffRegistration";
import AdminRegistration from "./AdminRegistration";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-tab-${index}`,
    "aria-controls": `user-tabpanel-${index}`,
  };
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const isManualRefreshRef = useRef(false);
  const [tabValue, setTabValue] = useState(0);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const refreshData = () => {
    isManualRefreshRef.current = true;
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdateSummary = (
    totalCount: number,
    activeCount: number,
    inactiveCount: number
  ) => {
    setSummary({
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
    });
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDialogClose = () => {
    setOpenStaffDialog(false);
    setOpenAdminDialog(false);
    // Refresh user data when dialog closes
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Tổng số tài khoản
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <ManageAccountsIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.active}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <VerifiedUserIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              height: "100%",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Không hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.inactive}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <PersonOffIcon color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 1,
            }}
          >
            <Typography variant="h6" component="div" fontWeight={500}>
              Danh sách người dùng
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {tabValue === 0 && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenStaffDialog(true)}
                >
                  Thêm nhân viên
                </Button>
              )}
              {tabValue === 1 && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAdminDialog(true)}
                  color="primary"
                >
                  Thêm quản trị viên
                </Button>
              )}
              <Button variant="outlined" size="small" onClick={refreshData}>
                Làm mới
              </Button>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="user role tabs"
              variant="fullWidth"
            >
              <Tab
                icon={<AdminPanelSettingsIcon />}
                iconPosition="start"
                label="Quản trị viên"
                {...a11yProps(0)}
              />
              <Tab
                icon={<SupportAgentIcon />}
                iconPosition="start"
                label="Nhân viên"
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UserTable
            searchTerm={searchTerm}
            role={UserRole.Admin}
            refreshTrigger={refreshTrigger}
            onUpdateSummary={handleUpdateSummary}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UserTable
            searchTerm={searchTerm}
            role={UserRole.Staff}
            refreshTrigger={refreshTrigger}
            onUpdateSummary={handleUpdateSummary}
          />
        </TabPanel>

        <Dialog
          open={openStaffDialog}
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <StaffRegistration />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openAdminDialog}
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <AdminRegistration />
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserManagement;
