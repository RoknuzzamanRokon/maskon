"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  type Notification,
  NotificationState,
  NotificationContextType,
  NotificationPreferences,
} from "../types/notification";

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetch: null,
};

// Action types
type NotificationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_ALL" }
  | { type: "UPDATE_UNREAD_COUNT" }
  | { type: "SET_LAST_FETCH"; payload: string };

// Reducer function
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_NOTIFICATIONS":
      const unreadCount = action.payload.filter((n) => !n.isRead).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        loading: false,
        error: null,
      };

    case "ADD_NOTIFICATION":
      const newNotifications = [action.payload, ...state.notifications];
      const newUnreadCount = newNotifications.filter((n) => !n.isRead).length;
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };

    case "MARK_AS_READ":
      const updatedNotifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      const updatedUnreadCount = updatedNotifications.filter(
        (n) => !n.isRead
      ).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedUnreadCount,
      };

    case "MARK_ALL_AS_READ":
      const allReadNotifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };

    case "REMOVE_NOTIFICATION":
      const filteredNotifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      const filteredUnreadCount = filteredNotifications.filter(
        (n) => !n.isRead
      ).length;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount,
      };

    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case "UPDATE_UNREAD_COUNT":
      const currentUnreadCount = state.notifications.filter(
        (n) => !n.isRead
      ).length;
      return {
        ...state,
        unreadCount: currentUnreadCount,
      };

    case "SET_LAST_FETCH":
      return {
        ...state,
        lastFetch: action.payload,
      };

    default:
      return state;
  }
}

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Provider component
interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("notifications");
      const savedPreferences = localStorage.getItem("notificationPreferences");

      if (savedNotifications) {
        const notifications: Notification[] = JSON.parse(savedNotifications);
        dispatch({ type: "SET_NOTIFICATIONS", payload: notifications });
      }
    } catch (error) {
      console.warn("Failed to load notifications from localStorage:", error);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "notifications",
        JSON.stringify(state.notifications)
      );
    } catch (error) {
      console.warn("Failed to save notifications to localStorage:", error);
    }
  }, [state.notifications]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Import API functions dynamically to avoid circular dependencies
      const { getNotifications } = await import("../lib/api");
      const response = await getNotifications();

      dispatch({ type: "SET_NOTIFICATIONS", payload: response.notifications });
      dispatch({ type: "SET_LAST_FETCH", payload: new Date().toISOString() });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch notifications" });
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Add new notification
  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "timestamp" | "isRead">) => {
      const notification: Notification = {
        ...notificationData,
        id: generateId(),
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      dispatch({ type: "ADD_NOTIFICATION", payload: notification });

      // Show browser notification if permission granted
      try {
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          typeof Notification.permission !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico",
            tag: notification.id,
          });
        }
      } catch (error) {
        // Ignore errors in environments where Notification API is not available
        console.warn("Failed to show browser notification:", error);
      }
    },
    [generateId]
  );

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    dispatch({ type: "MARK_AS_READ", payload: notificationId });

    try {
      const { markNotificationAsRead } = await import("../lib/api");
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to update notification read status:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    dispatch({ type: "MARK_ALL_AS_READ" });

    try {
      const { markAllNotificationsAsRead } = await import("../lib/api");
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback(async (notificationId: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });

    try {
      const { deleteNotification } = await import("../lib/api");
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    dispatch({ type: "CLEAR_ALL" });

    try {
      const { clearAllNotifications } = await import("../lib/api");
      await clearAllNotifications();
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        typeof Notification.permission !== "undefined" &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission();
      }
    } catch (error) {
      // Ignore errors in environments where Notification API is not available
      console.warn("Failed to request notification permission:", error);
    }
  }, []);

  // Set up real-time updates (mock implementation)
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock real-time notification
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        const mockNotification = {
          type: "info" as const,
          title: "Real-time Update",
          message: `System check completed at ${new Date().toLocaleTimeString()}`,
          category: "system" as const,
          priority: "low" as const,
        };
        addNotification(mockNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    fetchNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

// Alias for backward compatibility
export const useNotification = useNotifications;
