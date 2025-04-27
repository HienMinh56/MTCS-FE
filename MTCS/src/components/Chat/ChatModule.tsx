import React, { useState } from 'react';
import ChatIconComponent from './ChatIcon';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';

const ChatModule: React.FC = () => {
  const [chatListOpen, setChatListOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const handleChatIconClick = () => {
    setChatListOpen(true);
  };

  const handleCloseChatList = () => {
    setChatListOpen(false);
  };

  const handleSelectChat = (otherUserId: string, otherUserName: string) => {
    setSelectedUser({
      id: otherUserId,
      name: otherUserName
    });
    setChatListOpen(false);
    setConversationOpen(true);
  };

  const handleCloseConversation = () => {
    setConversationOpen(false);
  };

  return (
    <>
      <ChatIconComponent onClick={handleChatIconClick} />
      
      <ChatList
        open={chatListOpen}
        onClose={handleCloseChatList}
        onSelectChat={handleSelectChat}
      />
      
      {selectedUser && (
        <ChatConversation
          open={conversationOpen}
          onClose={handleCloseConversation}
          otherUserId={selectedUser.id}
          otherUserName={selectedUser.name}
        />
      )}
    </>
  );
};

export default ChatModule;