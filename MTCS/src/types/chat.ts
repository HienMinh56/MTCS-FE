import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
  readAt: Timestamp;
}

export interface ChatParticipant {
  id: string;
  name: string;
}

export interface ChatConversation {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}