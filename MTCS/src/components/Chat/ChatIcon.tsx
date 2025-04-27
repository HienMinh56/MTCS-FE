import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useAuth } from '../../contexts/AuthContext';
import { getLatestMessages } from '../../services/chatApi';

interface ChatIconProps {
  onClick: () => void;
}

const ChatIconComponent: React.FC<ChatIconProps> = ({ onClick }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only subscribe to chat updates if user is logged in and is Staff
    if (!user || user.role !== 'Staff') return;

    const unsubscribe = getLatestMessages(user.id, (conversations) => {
      // Calculate total unread messages across all conversations
      const totalUnread = conversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0
      );
      setUnreadCount(totalUnread);
    });

    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [user]);

  if (!user || user.role !== 'Staff') return null;

  return (
    <Tooltip title="Chat">
      <IconButton color="inherit" onClick={onClick}>
        <Badge badgeContent={unreadCount} color="error" overlap="circular">
          <ChatIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default ChatIconComponent;