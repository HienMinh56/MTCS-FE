import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Pagination,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getChatList, subscribeToChatList } from '../../services/chatApi';
import { getDriverList } from '../../services/DriverApi';
import { ChatConversation } from '../../types/chat';
import { Driver } from '../../types/driver';

// Helper function to compare conversations
const areConversationsEqual = (conv1: ChatConversation, conv2: ChatConversation): boolean => {
  // Compare only the essential properties that affect rendering
  return (
    conv1.chatId === conv2.chatId &&
    conv1.unreadCount === conv2.unreadCount &&
    conv1.lastMessage?.text === conv2.lastMessage?.text
    // Not comparing timestamp as small timestamp differences may cause unnecessary updates
  );
};

// Function to check if two conversation arrays are effectively the same
const areConversationArraysEqual = (
  arr1: ChatConversation[],
  arr2: ChatConversation[]
): boolean => {
  if (arr1.length !== arr2.length) return false;
  
  // Create map of conversations by ID for easier comparison
  const arr2Map = arr2.reduce((map, conv) => {
    map[conv.chatId] = conv;
    return map;
  }, {} as Record<string, ChatConversation>);
  
  // Check if each conversation in arr1 has an equivalent in arr2
  return arr1.every(conv1 => {
    const conv2 = arr2Map[conv1.chatId];
    return conv2 && areConversationsEqual(conv1, conv2);
  });
};

interface ChatListProps {
  open: boolean;
  onClose: () => void;
  onSelectChat: (otherUserId: string, otherUserName: string) => void;
  popoverMode?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ open, onClose, onSelectChat, popoverMode = false }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const isMounted = useRef(true);
  
  // Driver list state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverLoading, setDriverLoading] = useState(false);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const driversPerPage = 5;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user || !open) return;

    let isActive = true;
    setLoading(true);

    // Initial load of conversations
    const loadConversations = async () => {
      try {
        const chatList = await getChatList(user.id);
        if (isActive) {
          setConversations(chatList);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading chat conversations:', error);
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToChatList(user.id, (updatedConversations) => {
      if (isActive) {
        // Use our custom comparison function to avoid unnecessary updates
        setConversations(prevConversations => {
          if (areConversationArraysEqual(updatedConversations, prevConversations)) {
            return prevConversations; // No change needed
          }
          return updatedConversations;
        });
        
        if (loading) setLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [user?.id, open]); // Remove loading from dependencies
  
  // Load drivers when drivers tab is selected
  useEffect(() => {
    if (!open || activeTab !== 1) return;
    
    loadDrivers(currentPage);
  }, [activeTab, currentPage, open, searchQuery]); // Thêm searchQuery vào dependencies

  const loadDrivers = async (page: number) => {
    if (!user) return;
    
    setDriverLoading(true);
    try {
      const response = await getDriverList({
        pageNumber: page,
        pageSize: driversPerPage,
        status: 1, // Active drivers
        keyword: searchQuery // Sửa từ search sang keyword để phù hợp với API
      });
      
      if (response.success) {
        setDrivers(response.data.items);
        setTotalDrivers(response.data.totalCount);
      } else {
        console.error('Failed to load drivers:', response.message);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setDriverLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const handleSelectChat = (conversation: ChatConversation) => {
    onSelectChat(conversation.otherUserId, conversation.otherUserName);
  };
  
  const handleSelectDriver = (driver: Driver) => {
    // Start a chat with the selected driver
    onSelectChat(driver.driverId, `${driver.fullName}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  };

  if (!user) return null;

  const contentComponent = (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="chat tabs"
          variant="fullWidth"
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: 'white'
              }
            }
          }}
        >
          <Tab label="Danh sách trò chuyện" icon={<ChatIcon />} iconPosition="start" />
          <Tab label="Tài xế" icon={<PersonIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <Box sx={{ overflowY: 'auto', height: '350px', p: 0 }}>
        {/* Conversations Tab */}
        {activeTab === 0 && (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : conversations.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 4,
                minHeight: popoverMode ? '300px' : '400px'
              }}
            >
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'primary.light',
                  mb: 2
                }}
              >
                <SupportAgentIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography align="center" variant="h6" gutterBottom>Chưa có cuộc trò chuyện nào !</Typography>
              <Typography color="textSecondary" align="center">
                Lịch sử trò chuyện của bạn sẽ hiện ở đây.
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {conversations.map((conversation, index) => (
                <React.Fragment key={conversation.chatId}>
                  <ListItem 
                    alignItems="flex-start" 
                    button 
                    onClick={() => handleSelectChat(conversation)}
                    sx={{
                      bgcolor: conversation.unreadCount > 0 ? 'action.hover' : 'transparent',
                      py: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="error"
                        badgeContent={conversation.unreadCount}
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <SupportAgentIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          component="span"
                          variant="subtitle1"
                          fontWeight={conversation.unreadCount > 0 ? 'bold' : 'regular'}
                        >
                          {conversation.otherUserName}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ 
                              display: 'inline',
                              fontWeight: conversation.unreadCount > 0 ? 'medium' : 'regular'
                            }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {conversation.lastMessage?.text || ''}
                          </Typography>
                          {conversation.lastMessage?.timestamp && (
                            <Typography
                              component="span"
                              variant="caption"
                              display="block"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {formatMessageTime(conversation.lastMessage.timestamp)}
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < conversations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )
        )}

        {/* Drivers Tab */}
        {activeTab === 1 && (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm theo tên hoặc số điện thoại"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {driverLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : drivers.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 4,
                  minHeight: popoverMode ? '200px' : '300px'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: 'primary.light',
                    mb: 2
                  }}
                >
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>Không có tài xế khả dụng !</Typography>
                <Typography color="textSecondary" align="center">
                  Hiện không tìm thấy tài xế đang hoạt động nào.
                </Typography>
              </Box>
            ) : (
              <Box>
                <List sx={{ width: '100%', p: 0 }}>
                  {drivers.map((driver, index) => (
                    <React.Fragment key={driver.driverId}>
                      <ListItem 
                        alignItems="flex-start" 
                        button 
                        onClick={() => handleSelectDriver(driver)}
                        sx={{ py: 1.5 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              component="span"
                              variant="subtitle1"
                            >
                              {driver.fullName}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                {driver.phoneNumber}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < drivers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                {totalDrivers > driversPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Pagination 
                      count={Math.ceil(totalDrivers / driversPerPage)} 
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size={popoverMode ? "small" : "medium"}
                    />
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );

  // If we're in popover mode, render without Dialog wrapper
  if (popoverMode) {
    return (
      <Paper 
        elevation={5} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '600px' 
        }}
      >
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Chat</Typography>
          </Box>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {contentComponent}
      </Paper>
    );
  }

  // Dialog mode (centered)
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChatIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Chat</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {contentComponent}

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatList;