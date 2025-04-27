import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  AppBar,
  Toolbar,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, markAllMessagesAsRead, sendMessage } from '../../services/chatApi';
import { ChatMessage } from '../../types/chat';

// Helper function to determine if two message arrays are effectively the same
const areMessageArraysEqual = (
  arr1: ChatMessage[],
  arr2: ChatMessage[]
): boolean => {
  if (arr1.length !== arr2.length) return false;
  
  // Create map of messages by ID for easier comparison
  const arr2Map = arr2.reduce((map, msg) => {
    map[msg.id] = msg;
    return map;
  }, {} as Record<string, ChatMessage>);
  
  // Check if each message in arr1 has an equivalent in arr2
  return arr1.every(msg1 => {
    const msg2 = arr2Map[msg1.id];
    if (!msg2) return false;
    
    // Compare only essential properties
    return (
      msg1.id === msg2.id &&
      msg1.text === msg2.text &&
      msg1.senderId === msg2.senderId &&
      msg1.read === msg2.read
      // Not comparing timestamp as small timestamp differences may cause unnecessary updates
    );
  });
};

interface ChatConversationProps {
  open: boolean;
  onClose: () => void;
  otherUserId: string;
  otherUserName: string;
  popoverMode?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  open,
  onClose,
  otherUserId,
  otherUserName,
  popoverMode = false,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load messages and setup real-time listener
  useEffect(() => {
    if (!user || !open || !otherUserId) return;

    let isActive = true;
    setLoading(true);

    // Subscribe to messages
    const unsubscribe = getMessages(user.id, otherUserId, (updatedMessages) => {
      if (isActive) {
        // Use our custom comparison function to avoid unnecessary updates
        setMessages(prevMessages => {
          if (areMessageArraysEqual(updatedMessages, prevMessages)) {
            return prevMessages; // No change needed
          }
          return updatedMessages;
        });
        
        if (loading) setLoading(false);

        // Mark messages as read
        markAllMessagesAsRead(user.id, otherUserId).catch((error) => {
          console.error('Error marking messages as read:', error);
        });
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [user?.id, otherUserId, open]); // Remove loading from dependencies

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user || !otherUserId || !newMessage.trim()) return;
    
    setSending(true);
    try {
      await sendMessage(user.id, otherUserId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  // Format the readAt timestamp
  const formatReadAtTime = (readAt: any) => {
    if (!readAt) return '';
    
    try {
      // Kiểm tra nếu readAt là timestamp của Firebase
      if (typeof readAt.toDate === 'function') {
        const date = readAt.toDate();
        return format(date, 'dd/MM/yyyy HH:mm');
      } 
      // Kiểm tra nếu readAt là chuỗi thời gian ISO hoặc đối tượng Date
      else if (readAt instanceof Date || typeof readAt === 'string') {
        return format(new Date(readAt), 'dd/MM/yyyy HH:mm');
      }
      
      // Trường hợp khác
      return 'Đã xem';
    } catch (error) {
      console.error('Error formatting readAt timestamp:', error);
      return 'Đã xem';
    }
  };

  // Group messages by timestamp (within 5 minutes)
  const shouldShowTimestamp = (current: ChatMessage, previous?: ChatMessage) => {
    if (!previous) return true;
    
    const currentTime = current.timestamp.toDate();
    const previousTime = previous.timestamp.toDate();
    
    // Show timestamp if more than 5 minutes apart or different sender
    return (
      (currentTime.getTime() - previousTime.getTime()) > 10 * 60 * 1000
      // || current.senderId !== previous.senderId
    );
  };

  if (!user) return null;

  const contentComponent = (
    <>
      <Box ref={messageListRef} sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2,
        bgcolor: '#f5f5f5',
        height: popoverMode ? '350px' : '100%' 
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.light',
                mb: 2,
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography align="center" variant="h6" gutterBottom>
              Không có tin nhắn nào 
            </Typography>
            <Typography color="textSecondary" align="center">
              Bắt đầu trò chuyện với {otherUserName}
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message, index) => {
              const isSentByMe = message.senderId === user.id;
              const showTimestamp = shouldShowTimestamp(
                message,
                index > 0 ? messages[index - 1] : undefined
              );

              return (
                <Box key={message.id}>
                  {showTimestamp && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        my: 2,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          py: 0.5,
                          px: 2,
                          borderRadius: 5,
                          bgcolor: 'grey.300',
                        }}
                      >
                        <Typography variant="caption">
                          {formatMessageTime(message.timestamp)}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    {!isSentByMe && (
                      <Avatar
                        sx={{ mr: 1, width: 32, height: 32, bgcolor: 'primary.main' }}
                      >
                        <SupportAgentIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}

                    <Box sx={{ maxWidth: '70%', display: 'flex', alignItems: 'flex-end' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isSentByMe ? 'primary.main' : 'background.paper',
                          color: isSentByMe ? 'white' : 'text.primary',
                          borderBottomRightRadius: isSentByMe ? 0 : 2,
                          borderBottomLeftRadius: isSentByMe ? 2 : 0,
                        }}
                      >
                        <Typography variant="body2">{message.text}</Typography>
                      </Paper>

                      {isSentByMe && (
                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                          {message.read ? (
                            <Tooltip title={message.readAt ? `Đã xem lúc ${formatReadAtTime(message.readAt)}` : "Đã xem"}>
                              <Box display="flex" flexDirection="column" alignItems="center">
                                <DoneAllIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                {message.readAt && (
                                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', mt: 0.5 }}>
                                    {(() => {
                                      try {
                                        if (typeof message.readAt.toDate === 'function') {
                                          return format(message.readAt.toDate(), 'HH:mm');
                                        } else if (message.readAt instanceof Date || typeof message.readAt === 'string') {
                                          return format(new Date(message.readAt), 'HH:mm');
                                        }
                                        return '';
                                      } catch (error) {
                                        console.error('Error formatting time:', error);
                                        return '';
                                      }
                                    })()}
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          ) : (
                            <DoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      <Paper 
        component="form"
        elevation={3}
        sx={{ 
          p: 1,
          display: 'flex', 
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
        onSubmit={handleSendMessage}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nhập tin nhắn ..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          size="small"
          sx={{ mr: 1 }}
          disabled={sending}
        />
        <IconButton 
          color="primary" 
          onClick={() => handleSendMessage()} 
          disabled={!newMessage.trim() || sending}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
            }
          }}
        >
          {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Paper>
    </>
  );

  // Popover mode (shown above the chat button)
  if (popoverMode) {
    return (
      <Paper 
        elevation={5} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '500px', // 100%
          maxHeight: '500px',
          width: '350px' 
        }}
      >
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar variant="dense" sx={{ minHeight: '56px' }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="back"
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Avatar sx={{ mr: 1.5, bgcolor: 'primary.dark', width: 32, height: 32 }}>
              <SupportAgentIcon fontSize="small" />
            </Avatar>
            <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
              {otherUserName}
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>

        {contentComponent}
      </Paper>
    );
  }

  // Dialog mode (centered)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          height: '70vh',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.dark' }}>
            <SupportAgentIcon />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {otherUserName}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent 
        sx={{ 
          p: 0, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {contentComponent}
      </DialogContent>
    </Dialog>
  );
};

export default ChatConversation;