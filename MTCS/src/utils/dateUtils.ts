import { Timestamp } from "firebase/firestore";

export const formatTime = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate();
    // Format: "DD/MM/YYYY HH:MM" (Vietnamese date format)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
};

export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
