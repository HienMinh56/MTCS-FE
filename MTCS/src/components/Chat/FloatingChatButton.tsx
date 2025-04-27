import React, { useState, useEffect, useRef } from 'react';
import { Badge, Fab, Box, Zoom, keyframes, ClickAwayListener, Grow, Paper } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useAuth } from '../../contexts/AuthContext';
import { getLatestMessages } from '../../services/chatApi';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';

// Bounce animation keyframe
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const FloatingChatButton: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const chatListRef = useRef(null);

  useEffect(() => {
    // Only subscribe to chat updates if user is logged in and is Staff
    if (!user || user.role !== 'Staff') return;

    const unsubscribe = getLatestMessages(user.id, (conversations) => {
      // Calculate total unread messages across all conversations
      const totalUnread = conversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0
      );
      
      // Show animation if unread count increases
      if (totalUnread > unreadCount) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1000); // Disable animation after 1 second
      }
      
      setUnreadCount(totalUnread);
    });

    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [user, unreadCount]);

  const handleChatIconClick = () => {
    setChatListOpen((prev) => !prev);
    if (conversationOpen) {
      setConversationOpen(false);
    }
  };

  const handleCloseChatList = () => {
    setChatListOpen(false);
  };

  const handleClickAway = () => {
    if (chatListOpen && !conversationOpen) {
      setChatListOpen(false);
    }
  };

  const handleSelectChat = (otherUserId: string, otherUserName: string) => {
    setSelectedUser({
      id: otherUserId,
      name: otherUserName
    });
    setConversationOpen(true);
  };

  const handleCloseConversation = () => {
    setConversationOpen(false);
    setChatListOpen(true);
  };

  // Only render for Staff users
  if (!user || user.role !== 'Staff') return null;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 55,
          right: 40,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        {chatListOpen && !conversationOpen && (
          <Grow
            in={chatListOpen}
            style={{ transformOrigin: 'bottom right' }}
          >
            <Box
              ref={chatListRef}
              sx={{
                position: 'absolute',
                bottom: 70,
                right: 0,
                maxWidth: '350px',
                width: '100vw',
                maxHeight: 'calc(100vh - 100px)',
                zIndex: 1001,
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <ChatList
                open={chatListOpen}
                onClose={handleCloseChatList}
                onSelectChat={handleSelectChat}
                popoverMode={true}
              />
            </Box>
          </Grow>
        )}
        
        {conversationOpen && selectedUser && (
          <ChatConversation
            open={conversationOpen}
            onClose={handleCloseConversation}
            otherUserId={selectedUser.id}
            otherUserName={selectedUser.name}
            popoverMode={true}
          />
        )}

        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <Fab
            color="primary"
            aria-label="chat"
            onClick={handleChatIconClick}
            sx={{
              width: 60,
              height: 60,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
              background: 'linear-gradient(135deg, #0088ff, #0055cc)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0099ff, #0066dd)',
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
              },
              transition: 'all 0.3s ease-in-out',
              animation: showAnimation ? `${bounce} 1s ease` : 'none',
            }}
          >
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff3d00',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                  minWidth: unreadCount > 9 ? '22px' : '18px',
                  height: unreadCount > 9 ? '22px' : '18px',
                  borderRadius: '50%',
                  padding: '0 4px',
                }
              }}
            >
              <ChatIcon sx={{ fontSize: 28 }} />
            </Badge>
          </Fab>
        </Zoom>
      </Box>
    </ClickAwayListener>
  );
};

export default FloatingChatButton;