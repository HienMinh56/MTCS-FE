import axiosInstance from "../utils/axiosConfig";
import { ChatConversation, ChatMessage, ChatParticipant } from "../types/chat";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  documentId
} from "firebase/firestore";
import { firestore } from "../firebase";

// Helper to get a chat ID from two user IDs
const getChatId = (userId1: string, userId2: string): string => {
  return userId1.localeCompare(userId2) < 0
    ? `${userId1}_${userId2}`
    : `${userId2}_${userId1}`;
};

// Send a message via the API
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  message: string
): Promise<boolean> => {
  try {
    console.log("Sending message:", { senderId, receiverId, message });
    const response = await axiosInstance.post("/api/Chat/send", {
      senderId,
      receiverId,
      message
    });
    console.log("Send message response:", response);
    if (response.status === 200) {
      return true;
    } else {
      console.error("Send message failed with status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

// Get all chat messages between two users from Firestore
export const getMessages = (
  userId1: string,
  userId2: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const chatId = getChatId(userId1, userId2);
  
  const messagesRef = collection(firestore, "chats", chatId, "messages");
  // Sắp xếp theo thứ tự tăng dần của timestamp (từ cũ đến mới)
  // để tin nhắn hiển thị đúng thứ tự mà không cần sắp xếp lại ở UI
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        senderName: data.senderName,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        text: data.text,
        timestamp: data.timestamp,
        read: data.read,
        readAt: data.readAt
      });
    });
    callback(messages);
  }, (error) => {
    console.error("Error getting messages:", error);
    callback([]);
  });
};

// Mark a specific message as read
export const markMessageAsRead = async (
  userId1: string,
  userId2: string,
  messageId: string
): Promise<boolean> => {
  try {
    const chatId = getChatId(userId1, userId2);
    const messageRef = doc(firestore, "chats", chatId, "messages", messageId);
    await updateDoc(messageRef, { 
      read: true, 
      readAt: Timestamp.now() // Sử dụng Timestamp.now() để lấy thời gian hiện tại
    });
    return true;
  } catch (error) {
    console.error("Error marking message as read:", error);
    return false;
  }
};

// Mark all unread messages in a conversation as read
export const markAllMessagesAsRead = async (
  userId: string,
  otherUserId: string
): Promise<boolean> => {
  try {
    const chatId = getChatId(userId, otherUserId);
    const messagesRef = collection(firestore, "chats", chatId, "messages");
    const q = query(
      messagesRef,
      where("receiverId", "==", userId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(async (document) => {
      const messageRef = doc(firestore, "chats", chatId, "messages", document.id);
      return updateDoc(messageRef, { read: true, readAt: Timestamp.now() });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    return false;
  }
};

// Get all chats for a user
export const getChatList = async (userId: string): Promise<ChatConversation[]> => {
  try {
    const chatsRef = collection(firestore, "chats");
    const allChatsSnapshot = await getDocs(chatsRef);
    
    const chatConversations: ChatConversation[] = [];
    const processPromises: Promise<void>[] = [];
    
    allChatsSnapshot.forEach((chatDoc) => {
      const chatId = chatDoc.id;
      
      // Only process chats that include our user
      if (!chatId.includes(userId)) {
        return;
      }
      
      const processPromise = (async () => {
        try {
          const chatData = chatDoc.data();
          
          // Skip if participants field doesn't exist
          if (!chatData.participants) {
            return;
          }
          
          const participants = chatData.participants as ChatParticipant[];
          
          // Skip if user not in participants
          const isUserInChat = participants.some(p => p.id === userId);
          if (!isUserInChat) {
            return;
          }
          
          // Get the other participant
          const otherParticipant = participants.find(p => p.id !== userId);
          if (!otherParticipant) {
            return;
          }
          
          // Get the latest message
          const messagesRef = collection(firestore, "chats", chatId, "messages");
          const latestMessageQuery = query(
            messagesRef,
            orderBy("timestamp", "desc"),
            limit(1)
          );
          
          const messageSnapshot = await getDocs(latestMessageQuery);
          
          // Skip chats with no messages
          if (messageSnapshot.empty) {
            return;
          }
          
          const lastMessageDoc = messageSnapshot.docs[0];
          const lastMessageData = lastMessageDoc.data();
          
          const lastMessage: ChatMessage = {
            id: lastMessageDoc.id,
            senderId: lastMessageData.senderId,
            senderName: lastMessageData.senderName,
            receiverId: lastMessageData.receiverId,
            receiverName: lastMessageData.receiverName,
            text: lastMessageData.text,
            timestamp: lastMessageData.timestamp,
            read: lastMessageData.read
          };
          
          // Count unread messages
          const unreadQuery = query(
            messagesRef,
            where("receiverId", "==", userId),
            where("read", "==", false)
          );
          
          const unreadSnapshot = await getDocs(unreadQuery);
          
          chatConversations.push({
            chatId,
            otherUserId: otherParticipant.id,
            otherUserName: otherParticipant.name,
            lastMessage,
            unreadCount: unreadSnapshot.size
          });
        } catch (error) {
          console.error(`Error processing chat ${chatId}:`, error);
        }
      })();
      
      processPromises.push(processPromise);
    });
    
    await Promise.all(processPromises);
    
    // Sort by last message timestamp (most recent first)
    return chatConversations.sort((a, b) => {
      const timestampA = a.lastMessage?.timestamp?.toMillis() || 0;
      const timestampB = b.lastMessage?.timestamp?.toMillis() || 0;
      return timestampB - timestampA;
    });
  } catch (error) {
    console.error("Error getting chat list:", error);
    return [];
  }
};

// Subscribe to chat list changes in real-time
export const subscribeToChatList = (
  userId: string,
  callback: (conversations: ChatConversation[]) => void
): Unsubscribe => {
  const chatsRef = collection(firestore, "chats");
  
  // Listen to changes in the chats collection
  return onSnapshot(chatsRef, async (snapshot) => {
    try {
      const chatConversations: ChatConversation[] = [];
      const processPromises: Promise<void>[] = [];
      
      snapshot.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        
        // Only process chats that include our user
        if (!chatId.includes(userId)) {
          return;
        }
        
        const processPromise = (async () => {
          try {
            const chatData = chatDoc.data();
            
            // Skip if participants field doesn't exist
            if (!chatData.participants) {
              return;
            }
            
            const participants = chatData.participants as ChatParticipant[];
            
            // Skip if user not in participants
            const isUserInChat = participants.some(p => p.id === userId);
            if (!isUserInChat) {
              return;
            }
            
            // Get the other participant
            const otherParticipant = participants.find(p => p.id !== userId);
            if (!otherParticipant) {
              return;
            }
            
            // Get the latest message
            const messagesRef = collection(firestore, "chats", chatId, "messages");
            const latestMessageQuery = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            
            const messageSnapshot = await getDocs(latestMessageQuery);
            
            // Skip chats with no messages
            if (messageSnapshot.empty) {
              return;
            }
            
            const lastMessageDoc = messageSnapshot.docs[0];
            const lastMessageData = lastMessageDoc.data();
            
            const lastMessage: ChatMessage = {
              id: lastMessageDoc.id,
              senderId: lastMessageData.senderId,
              senderName: lastMessageData.senderName,
              receiverId: lastMessageData.receiverId,
              receiverName: lastMessageData.receiverName,
              text: lastMessageData.text,
              timestamp: lastMessageData.timestamp,
              read: lastMessageData.read
            };
            
            // Count unread messages
            const unreadQuery = query(
              messagesRef,
              where("receiverId", "==", userId),
              where("read", "==", false)
            );
            
            const unreadSnapshot = await getDocs(unreadQuery);
            
            chatConversations.push({
              chatId,
              otherUserId: otherParticipant.id,
              otherUserName: otherParticipant.name,
              lastMessage,
              unreadCount: unreadSnapshot.size
            });
          } catch (error) {
            console.error(`Error processing chat ${chatId}:`, error);
          }
        })();
        
        processPromises.push(processPromise);
      });
      
      await Promise.all(processPromises);
      
      // Sort by last message timestamp (most recent first)
      const sortedConversations = chatConversations.sort((a, b) => {
        const timestampA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timestampB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timestampB - timestampA;
      });
      
      callback(sortedConversations);
    } catch (error) {
      console.error("Error in chat list subscription:", error);
      callback([]);
    }
  });
};

// Get participant information for a chat
export const getChatParticipants = async (
  userId1: string,
  userId2: string
): Promise<Record<string, string>> => {
  try {
    const chatId = getChatId(userId1, userId2);
    const chatDoc = await getDoc(doc(firestore, "chats", chatId));
    
    if (!chatDoc.exists()) {
      return {};
    }
    
    const data = chatDoc.data();
    if (!data.participants) {
      return {};
    }
    
    const participants = data.participants as ChatParticipant[];
    const result: Record<string, string> = {};
    
    participants.forEach((participant) => {
      result[participant.id] = participant.name;
    });
    
    return result;
  } catch (error) {
    console.error("Error getting chat participants:", error);
    return {};
  }
};

// Get latest messages for all chats in real-time
export const getLatestMessages = (
  userId: string,
  callback: (conversations: ChatConversation[]) => void
): Unsubscribe => {
  const chatSubscriptions: Unsubscribe[] = [];
  let chatConversations: ChatConversation[] = [];
  
  // First, get the initial chat list
  const getInitialChatList = async () => {
    try {
      chatConversations = await getChatList(userId);
      callback(chatConversations);
      
      // Set up individual subscriptions for each chat
      setupChatSubscriptions();
    } catch (error) {
      console.error("Error getting initial chat list:", error);
      callback([]);
    }
  };
  
  // Set up realtime subscriptions for each chat
  const setupChatSubscriptions = () => {
    // Clear previous subscriptions
    chatSubscriptions.forEach(unsub => unsub());
    chatSubscriptions.length = 0;
    
    // For each chat conversation, listen to new messages
    chatConversations.forEach(conversation => {
      const chatId = conversation.chatId;
      const otherUserId = conversation.otherUserId;
      const messagesRef = collection(firestore, "chats", chatId, "messages");
      
      // Listen for new messages in this chat
      const messageSubscription = onSnapshot(
        query(messagesRef, orderBy("timestamp", "desc"), limit(1)),
        async (snapshot) => {
          if (!snapshot.empty) {
            const newMessageDoc = snapshot.docs[0];
            const newMessageData = newMessageDoc.data();
            
            const newMessage: ChatMessage = {
              id: newMessageDoc.id,
              senderId: newMessageData.senderId,
              senderName: newMessageData.senderName,
              receiverId: newMessageData.receiverId,
              receiverName: newMessageData.receiverName,
              text: newMessageData.text,
              timestamp: newMessageData.timestamp,
              read: newMessageData.read
            };
            
            // Update the conversation with the new message
            updateChatWithNewMessage(userId, otherUserId, newMessage);
          }
        },
        (error) => {
          console.error(`Error listening to messages for chat ${chatId}:`, error);
        }
      );
      
      chatSubscriptions.push(messageSubscription);
    });
  };
  
  // Update a chat when a new message is received
  const updateChatWithNewMessage = async (userId: string, otherUserId: string, latestMessage: ChatMessage) => {
    // Find the relevant conversation
    const chatIndex = chatConversations.findIndex(chat => chat.otherUserId === otherUserId);
    
    if (chatIndex !== -1) {
      // Update the last message
      chatConversations[chatIndex].lastMessage = latestMessage;
      
      // Instead of incrementing the count locally, get the actual count from Firestore
      const chatId = getChatId(userId, otherUserId);
      const messagesRef = collection(firestore, "chats", chatId, "messages");
      const unreadQuery = query(
        messagesRef,
        where("receiverId", "==", userId),
        where("read", "==", false)
      );
      
      try {
        const unreadSnapshot = await getDocs(unreadQuery);
        chatConversations[chatIndex].unreadCount = unreadSnapshot.size;
      } catch (error) {
        console.error("Error getting unread count:", error);
        // Don't update the unread count if there's an error
      }
      
      // Sort conversations by timestamp (most recent first)
      chatConversations.sort((a, b) => {
        const timestampA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timestampB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timestampB - timestampA;
      });
      
      // Call the callback with updated conversations
      callback([...chatConversations]);
    } else {
      // If we can't find the conversation, reload the entire list
      const updatedChatList = await getChatList(userId);
      chatConversations = updatedChatList;
      callback(updatedChatList);
      
      // Reset subscriptions
      setupChatSubscriptions();
    }
  };
  
  // Start the process
  getInitialChatList();
  
  // Return a function to clean up all subscriptions
  return () => {
    chatSubscriptions.forEach(unsub => unsub());
  };
};