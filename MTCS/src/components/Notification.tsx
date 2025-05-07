import React, { useEffect, useState } from "react";
import {
  listenToFirebaseMessages,
  fetchUserNotifications,
  Notification,
  markNotificationAsRead,
} from "../firebase";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Alert,
  AlertTitle,
  useTheme,
  Link,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsIcon from "@mui/icons-material/Directions";
import { formatTime } from "../utils/dateUtils";

// Define notification types
enum NotificationType {
  ALL = "all",
  INCIDENT = "incident",
  TRACTOR = "tractor",
  TRAILER = "trailer",
  CONTRACT = "contract",
  TRIP = "trip",
}

interface NotificationComponentProps {
  userId: string;
  size?: "small" | "medium" | "large";
  iconSize?: number;
}

interface ExpandableTextProps {
  text: string;
  maxLength: number;
}

// Helper function to determine notification type
const getNotificationType = (notification: Notification): NotificationType => {
  const title = notification.Title?.toLowerCase() || "";
  const body = notification.Body?.toLowerCase() || "";

  // Enhanced incident detection patterns
  if (
    title.includes("báo cáo sự cố") ||
    body.includes("báo cáo sự cố") ||
    title.includes("sự cố") ||
    body.includes("sự cố") ||
    title.includes("incident") ||
    body.includes("incident") ||
    title.includes("inc2025") ||
    body.match(/inc\d+/i) ||
    body.match(/inc\d+_\d+/i) ||
    title.includes("đã được giải quyết") ||
    body.includes("đã được giải quyết") ||
    title.includes("đã được điều chỉnh") ||
    body.includes("đã được điều chỉnh")
  ) {
    return NotificationType.INCIDENT;
  }

  if (title.includes("đầu kéo") || body.includes("đầu kéo")) {
    return NotificationType.TRACTOR;
  }

  if (title.includes("rơ-móoc") || body.includes("rơ-móoc")) {
    return NotificationType.TRAILER;
  }

  if (
    title.includes("hợp đồng") ||
    body.includes("hợp đồng") ||
    title.includes("ctr") ||
    body.match(/ctr\d+/i)
  ) {
    return NotificationType.CONTRACT;
  }

  if (
    title.includes("chuyến") ||
    body.includes("chuyến") ||
    title.match(/trip\w+/i) ||
    body.match(/trip\w+/i)
  ) {
    return NotificationType.TRIP;
  }

  return NotificationType.ALL;
};

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) {
    return (
      <Typography component="span" variant="body2" color="textPrimary">
        {text}
      </Typography>
    );
  }

  return (
    <Typography component="span" variant="body2" color="textPrimary">
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <Link
        component="button"
        variant="body2"
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        sx={{
          ml: 1,
          fontWeight: "medium",
          color: "primary.main",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        {isExpanded ? "Thu gọn" : "Xem thêm"}
      </Link>
    </Typography>
  );
};

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  userId,
  size = "medium",
  iconSize,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [activeTab, setActiveTab] = useState<NotificationType>(
    NotificationType.ALL
  );
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        const success = await markNotificationAsRead(notificationId);
        if (success) {
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            )
          );
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: NotificationType
  ) => {
    setActiveTab(newValue);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  useEffect(() => {
    try {
      const unsubscribe = fetchUserNotifications(userId, (newNotifications) => {
        setNotifications(newNotifications);
        const unread = newNotifications.filter(
          (notification) => !notification.isRead
        ).length;

        setUnreadCount(unread);

        if (error) {
          setError(null);
        }
      });

      const messageUnsub = listenToFirebaseMessages((payload) => {});

      return () => {
        unsubscribe();
        messageUnsub();
      };
    } catch (err) {
      console.error("Error setting up notification listeners:", err);
      setError("Failed to load notifications");
      return () => {};
    }
  }, [userId]);

  const getFilteredNotifications = () => {
    if (activeTab === NotificationType.ALL) {
      return notifications;
    }
    return notifications.filter(
      (notification) => getNotificationType(notification) === activeTab
    );
  };

  const countByType = (type: NotificationType): number => {
    if (type === NotificationType.ALL) {
      return notifications.length;
    }
    return notifications.filter((n) => getNotificationType(n) === type).length;
  };

  return (
    <Box>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
        size={size}
        sx={{
          "&:hover": {
            transform: "translateY(-2px)",
            transition: "all 0.3s ease",
            backgroundColor: "rgba(255,255,255,0.25)",
          },
          transition: "all 0.3s ease",
          borderRadius: 1.5,
          p: 1.5,
        }}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon
            sx={iconSize ? { fontSize: iconSize } : undefined}
          />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 320,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
            maxHeight: 500,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.mtcs.primary,
            color: "white",
          }}
        >
          <Typography variant="h6">Thông báo</Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="notification type tabs"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-flexContainer": {
              justifyContent: "flex-start",
            },
            "& .MuiTabs-scroller": {
              ml: 0,
              pl: 0,
            },
            "& .MuiTabScrollButton-root": {
              width: 20,
            },
            "& .MuiTabs-indicator": {
              ml: 0,
            },
            mx: 0,
            px: 0,
            width: "100%",
          }}
        >
          <Tab
            icon={<AllInboxIcon sx={{ fontSize: 16 }} />}
            iconPosition="top"
            label={`Tất cả (${countByType(NotificationType.ALL)})`}
            value={NotificationType.ALL}
            sx={{
              minHeight: "48px",
              fontSize: "0.7rem",
              p: 0.5,
              ml: 0,
              pl: 0,
            }}
          />
          <Tab
            icon={<ReportProblemIcon sx={{ fontSize: 16 }} />}
            iconPosition="top"
            label={`Sự cố (${countByType(NotificationType.INCIDENT)})`}
            value={NotificationType.INCIDENT}
            sx={{
              minHeight: "48px",
              fontSize: "0.7rem",
              p: 0.5,
            }}
          />
          <Tab
            icon={<LocalShippingIcon sx={{ fontSize: 16 }} />}
            iconPosition="top"
            label={`Đầu kéo (${countByType(NotificationType.TRACTOR)})`}
            value={NotificationType.TRACTOR}
            sx={{
              minHeight: "48px",
              fontSize: "0.7rem",
              p: 0.5,
            }}
          />
          <Tab
            icon={<AirportShuttleIcon sx={{ fontSize: 16 }} />}
            iconPosition="top"
            label={`Rơ-Móoc (${countByType(NotificationType.TRAILER)})`}
            value={NotificationType.TRAILER}
            sx={{
              minHeight: "48px",
              fontSize: "0.7rem",
              p: 0.5,
            }}
          />
          <Tab
            icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
            iconPosition="top"
            label={`HĐ (${countByType(NotificationType.CONTRACT)})`}
            value={NotificationType.CONTRACT}
            sx={{
              minHeight: "48px",
              fontSize: "0.7rem",
              p: 0.5,
            }}
          />
          <Tab
            icon={<DirectionsIcon sx={{ fontSize: 16 }} />}
            iconPosition="top"
            label={`Chuyến (${countByType(NotificationType.TRIP)})`}
            value={NotificationType.TRIP}
            sx={{
              minHeight: "48px",
              fontSize: "0.7rem",
              p: 0.5,
            }}
          />
        </Tabs>

        <Divider />

        {error ? (
          <Alert severity="error" sx={{ margin: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : getFilteredNotifications().length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <NotificationsNoneIcon
              sx={{ fontSize: 32, color: "text.secondary" }}
            />
            <Typography color="textSecondary">
              {activeTab === NotificationType.ALL
                ? "Bạn chưa có thông báo nào"
                : "Không có thông báo trong mục này"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 300, overflowY: "auto" }}>
            {getFilteredNotifications().map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notification.isRead
                      ? "inherit"
                      : "rgba(1, 70, 199, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(1, 70, 199, 0.1)",
                    },
                    padding: "12px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {!notification.isRead && (
                    <FiberManualRecordIcon
                      sx={{
                        color: theme.palette.mtcs.primary,
                        width: 10,
                        height: 10,
                        mr: 1,
                        mt: 1,
                      }}
                    />
                  )}
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          fontWeight={notification.isRead ? "normal" : "bold"}
                        >
                          {notification.Title}
                        </Typography>
                        {notification.Timestamp && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {formatTime(notification.Timestamp)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="div"
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          fontWeight: notification.isRead ? "normal" : "medium",
                        }}
                      >
                        <ExpandableText
                          text={notification.Body}
                          maxLength={100}
                        />
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  );
};

export default NotificationComponent;
