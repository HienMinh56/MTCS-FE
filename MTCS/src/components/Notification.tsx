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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { formatTime } from "../utils/dateUtils";

interface NotificationComponentProps {
  userId: string;
  size?: "small" | "medium" | "large";
  iconSize?: number;
}

interface ExpandableTextProps {
  text: string;
  maxLength: number;
}

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
      // Only proceed if notification exists and is not already read
      if (notification && !notification.isRead) {
        const success = await markNotificationAsRead(notificationId);
        if (success) {
          // Only update local state to reflect the change immediately
          // The real-time listener will handle updating the count
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            )
          );
          // No need to manually update unread count here
          // The Firestore listener will handle this automatically
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  useEffect(() => {
    // Listen for real-time notifications from Firestore
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

      // Listen for foreground messages from Firebase Messaging
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
            maxHeight: 400,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
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

        <Divider />

        {error ? (
          <Alert severity="error" sx={{ margin: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography color="textSecondary">Không có thông báo</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
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
                        <Typography fontWeight="medium">
                          {notification.Title}
                        </Typography>
                        {/* Move timestamp next to the title */}
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
                    // Fix the hydration issue by using Typography with component="div"
                    secondary={
                      <Typography
                        component="div"
                        variant="body2"
                        sx={{ mt: 0.5 }}
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

        {notifications.length > 0 && (
          <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.mtcs.primary,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Xem tất cả thông báo
            </Typography>
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default NotificationComponent;
