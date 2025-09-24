"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface DashboardMetrics {
  totalPosts: number;
  totalPortfolioItems: number;
  totalProducts: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
  systemHealth: SystemStatus;
}

export interface ActivityItem {
  id: string;
  type: "post" | "portfolio" | "product" | "user";
  action: "created" | "updated" | "deleted";
  title: string;
  timestamp: string;
  user: string;
}

export interface SystemStatus {
  serverHealth: "healthy" | "warning" | "error";
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface DashboardState {
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadCount: number;
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_METRICS"; payload: DashboardMetrics }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] };

const initialState: DashboardState = {
  sidebarCollapsed: false,
  notifications: [],
  unreadCount: 0,
  metrics: null,
  loading: false,
  error: null,
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "SET_METRICS":
      return {
        ...state,
        metrics: action.payload,
        loading: false,
        error: null,
      };
    case "ADD_NOTIFICATION":
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.isRead).length,
      };
    case "MARK_NOTIFICATION_READ":
      const updatedNotifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
      };
    case "REMOVE_NOTIFICATION":
      const filteredNotifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter((n) => !n.isRead).length,
      };
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.isRead).length,
      };
    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  // Convenience getters
  notifications: Notification[];
  unreadCount: number;
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Actions
  const toggleSidebar = () => dispatch({ type: "TOGGLE_SIDEBAR" });
  const setLoading = (loading: boolean) =>
    dispatch({ type: "SET_LOADING", payload: loading });
  const setError = (error: string | null) =>
    dispatch({ type: "SET_ERROR", payload: error });
  const setMetrics = (metrics: DashboardMetrics) =>
    dispatch({ type: "SET_METRICS", payload: metrics });

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">
  ) => {
    const fullNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: fullNotification });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  // Initialize with sample notifications for development
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: "info",
        title: "Welcome to the new dashboard",
        message:
          "Explore the enhanced admin interface with improved navigation and features.",
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      {
        id: "2",
        type: "success",
        title: "System update completed",
        message: "All systems are running smoothly after the latest update.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
      },
    ];
    dispatch({ type: "SET_NOTIFICATIONS", payload: sampleNotifications });
  }, []);

  const contextValue: DashboardContextType = {
    state,
    toggleSidebar,
    setLoading,
    setError,
    setMetrics,
    addNotification,
    markNotificationRead,
    removeNotification,
    // Convenience getters
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    metrics: state.metrics,
    loading: state.loading,
    error: state.error,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
