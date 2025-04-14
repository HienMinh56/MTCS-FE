import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  getDocs,
  FirestoreError,
  doc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFgY8lhhx-JqWVgGOBiJPP_-a6-xx3HZc",
  authDomain: "driverapp-3845f.firebaseapp.com",
  projectId: "driverapp-3845f",
  storageBucket: "driverapp-3845f.firebasestorage.app",
  messagingSenderId: "428549779999",
  appId: "1:428549779999:web:ca42b6f909b76199865b2a",
  measurementId: "G-QES3CC4NXE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const firestore = getFirestore(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey:
        "BEBlSMZtgfQutbkSMSBRKClKdTJBC0EQInnj17PKE5x9lQxYIWz0yhh1ybcmtRmtgpR5zfBlMfuTShRfVVs26bE",
    });
    return token;
  }
  return null;
};

export interface Notification {
  id: string;
  Title: string; // Updated to match Firestore field name
  Body: string; // Updated to match Firestore field name
  Timestamp: Timestamp; // Add back Timestamp in the interface
  isRead: boolean;
  UserId?: string; // Updated to match Firestore field name
  data?: any;
}

export const listenToFirebaseMessages = (callback: (payload: any) => void) => {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export const fetchUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  // Create a query against the notifications collection - still sort by Timestamp even if we don't display it
  const q = query(
    collection(firestore, "Notifications"),
    where("UserId", "==", userId),
    orderBy("Timestamp", "desc")
  );

  // Listen for real-time updates with error handling
  try {
    return onSnapshot(
      q,
      (querySnapshot) => {
        const notifications: Notification[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          notifications.push({
            id: doc.id,
            ...data,
            // Set isRead status if not present in data
            isRead: data.isRead !== undefined ? data.isRead : false,
          } as Notification);
        });

        callback(notifications);
      },
      (error) => {
        const fbError = error as FirestoreError;
        console.error(`Firestore error code: ${fbError.code}`, fbError);

        // Handle missing index error
        if (
          fbError.code === "failed-precondition" &&
          fbError.message.includes("requires an index")
        ) {
          console.error(
            "Firestore index is required. Please create the index using this link:",
            "https://console.firebase.google.com/v1/r/project/driverapp-3845f/firestore/indexes?create_composite=ClVwcm9qZWN0cy9kcml2ZXJhcHAtMzg0NWYvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGlmaWNhdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg"
          );

          const simpleQuery = query(
            collection(firestore, "notifications"),
            where("userId", "==", userId)
          );

          return onSnapshot(simpleQuery, (simpleSnapshot) => {
            const simpleNotifications: Notification[] = [];
            simpleSnapshot.forEach((doc) => {
              simpleNotifications.push({
                id: doc.id,
                ...doc.data(),
              } as Notification);
            });

            callback(simpleNotifications);
          });
        } else {
          // For other errors, log and return empty array
          console.error("Error fetching notifications:", error);
          callback([]);
        }
      }
    );
  } catch (err) {
    console.error("Unexpected error in fetchUserNotifications:", err);
    callback([]);
    return () => {};
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(firestore, "Notifications", notificationId), {
      isRead: true,
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

const analytics = getAnalytics(app);

export { firestore };
