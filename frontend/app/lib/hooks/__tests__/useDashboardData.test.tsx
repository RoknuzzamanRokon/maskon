/**
 * Tests for useDashboardData hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useDashboardData,
  useNotificationActions,
  useConnectionStatus,
} from "../useDashboardData";
import {
  getCachedDashboardMetrics,
  getCachedNotifications,
  getCachedSystemMetrics,
  dashboardWebSocket,
  dashboardPoller,
  dashboardCache,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../api";

// Mock the API functions
jest.mock("../../api", () => ({
  getCachedDashboardMetrics: jest.fn(),
  getCachedNotifications: jest.fn(),
  getCachedSystemMetrics: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  clearAllNotifications: jest.fn(),
  dashboardWebSocket: {
    subscribe: jest.fn(),
    isConnected: jest.fn(),
    getConnectionId: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn(),
  },
  dashboardPoller: {
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
  },
  dashboardCache: {
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
    clear: jest.fn(),
  },
}));

const mockGetCachedDashboardMetrics =
  getCachedDashboardMetrics as jest.MockedFunction<
    typeof getCachedDashboardMetrics
  >;
const mockGetCachedNotifications =
  getCachedNotifications as jest.MockedFunction<typeof getCachedNotifications>;
const mockGetCachedSystemMetrics =
  getCachedSystemMetrics as jest.MockedFunction<typeof getCachedSystemMetrics>;
const mockDashboardWebSocket = dashboardWebSocket as jest.Mocked<
  typeof dashboardWebSocket
>;
const mockDashboardPoller = dashboardPoller as jest.Mocked<
  typeof dashboardPoller
>;
const mockDashboardCache = dashboardCache as jest.Mocked<typeof dashboardCache>;

describe("useDashboardData", () => {
  const mockMetrics = {
    totalPosts: 42,
    totalPortfolioItems: 18,
    totalProducts: 25,
    totalUsers: 156,
    recentActivity: [],
    systemHealth: {
      serverHealth: "healthy" as const,
      uptime: 99.8,
      responseTime: 245,
      errorRate: 0.2,
      activeUsers: 23,
      memoryUsage: 68.5,
      cpuUsage: 34.2,
    },
  };

  const mockNotifications = {
    notifications: [
      {
        id: "notif_1",
        type: "info" as const,
        title: "Test Notification",
        message: "This is a test notification",
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    ],
    unreadCount: 1,
    totalCount: 1,
  };

  const mockSystemMetrics = {
    serverHealth: "healthy" as const,
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.2,
    activeUsers: 23,
    memoryUsage: 68.5,
    cpuUsage: 34.2,
    diskUsage: 45.7,
    networkIO: {
      bytesIn: 1024000,
      bytesOut: 2048000,
    },
    databaseConnections: 12,
    queueSize: 5,
    lastUpdated: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockGetCachedDashboardMetrics.mockResolvedValue(mockMetrics);
    mockGetCachedNotifications.mockResolvedValue(mockNotifications);
    mockGetCachedSystemMetrics.mockResolvedValue(mockSystemMetrics);
    mockDashboardWebSocket.isConnected.mockReturnValue(true);
    mockDashboardWebSocket.getConnectionId.mockReturnValue("conn_123");
    mockDashboardWebSocket.subscribe.mockReturnValue(() => {});
  });

  test("should initialize with default state", () => {
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.metrics).toBeNull();
    expect(result.current.notifications).toBeNull();
    expect(result.current.systemMetrics).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  test("should fetch all data on initialization", async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.systemMetrics).toEqual(mockSystemMetrics);
    });

    expect(mockGetCachedDashboardMetrics).toHaveBeenCalled();
    expect(mockGetCachedNotifications).toHaveBeenCalledWith(20, 0);
    expect(mockGetCachedSystemMetrics).toHaveBeenCalled();
  });

  test("should handle loading states correctly", async () => {
    let resolveMetrics: (value: any) => void;
    const metricsPromise = new Promise((resolve) => {
      resolveMetrics = resolve;
    });

    mockGetCachedDashboardMetrics.mockReturnValue(metricsPromise);

    const { result } = renderHook(() => useDashboardData());

    // Should be loading initially
    await waitFor(() => {
      expect(result.current.loading.metrics).toBe(true);
    });

    // Resolve the promise
    act(() => {
      resolveMetrics(mockMetrics);
    });

    // Should not be loading after resolution
    await waitFor(() => {
      expect(result.current.loading.metrics).toBe(false);
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });

  test("should handle errors correctly", async () => {
    const error = new Error("Failed to fetch metrics");
    mockGetCachedDashboardMetrics.mockRejectedValue(error);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.error.metrics).toBe("Failed to fetch metrics");
      expect(result.current.hasError).toBe(true);
    });
  });

  test("should setup WebSocket listeners when enableRealTime is true", () => {
    renderHook(() => useDashboardData({ enableRealTime: true }));

    expect(mockDashboardWebSocket.subscribe).toHaveBeenCalledWith(
      "metrics_update",
      expect.any(Function)
    );
    expect(mockDashboardWebSocket.subscribe).toHaveBeenCalledWith(
      "notification_update",
      expect.any(Function)
    );
    expect(mockDashboardWebSocket.subscribe).toHaveBeenCalledWith(
      "system_update",
      expect.any(Function)
    );
    expect(mockDashboardWebSocket.subscribe).toHaveBeenCalledWith(
      "content_update",
      expect.any(Function)
    );
    expect(mockDashboardWebSocket.subscribe).toHaveBeenCalledWith(
      "user_update",
      expect.any(Function)
    );
  });

  test("should not setup WebSocket listeners when enableRealTime is false", () => {
    renderHook(() => useDashboardData({ enableRealTime: false }));

    expect(mockDashboardWebSocket.subscribe).not.toHaveBeenCalled();
  });

  test("should refresh specific data type", async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.metrics).toEqual(mockMetrics);
    });

    // Clear mocks to test refresh
    jest.clearAllMocks();
    mockGetCachedDashboardMetrics.mockResolvedValue({
      ...mockMetrics,
      totalPosts: 50, // Updated value
    });

    await act(async () => {
      await result.current.refresh("metrics");
    });

    expect(mockDashboardCache.invalidate).toHaveBeenCalledWith(
      "dashboard_metrics"
    );
    expect(mockGetCachedDashboardMetrics).toHaveBeenCalled();
    expect(result.current.metrics?.totalPosts).toBe(50);
  });

  test("should refresh all data", async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.metrics).toEqual(mockMetrics);
    });

    // Clear mocks to test refresh
    jest.clearAllMocks();

    await act(async () => {
      await result.current.refresh("all");
    });

    expect(mockDashboardCache.clear).toHaveBeenCalled();
    expect(mockGetCachedDashboardMetrics).toHaveBeenCalled();
    expect(mockGetCachedNotifications).toHaveBeenCalled();
    expect(mockGetCachedSystemMetrics).toHaveBeenCalled();
  });

  test("should start polling when WebSocket is not connected", async () => {
    mockDashboardWebSocket.isConnected.mockReturnValue(false);

    renderHook(() =>
      useDashboardData({ autoRefresh: true, pollingInterval: 5000 })
    );

    // Wait for the connection check interval
    await waitFor(
      () => {
        expect(mockDashboardPoller.startPolling).toHaveBeenCalledWith(
          "dashboard-data",
          expect.any(Function),
          5000
        );
      },
      { timeout: 6000 }
    );
  });

  test("should stop polling when WebSocket is connected", async () => {
    // Start with disconnected state
    mockDashboardWebSocket.isConnected.mockReturnValue(false);

    const { rerender } = renderHook(() =>
      useDashboardData({ autoRefresh: true })
    );

    await waitFor(() => {
      expect(mockDashboardPoller.startPolling).toHaveBeenCalled();
    });

    // Change to connected state
    mockDashboardWebSocket.isConnected.mockReturnValue(true);

    // Trigger recheck by rerendering
    rerender();

    await waitFor(() => {
      expect(mockDashboardPoller.stopPolling).toHaveBeenCalledWith(
        "dashboard-data"
      );
    });
  });

  test("should cleanup on unmount", () => {
    const unsubscribe = jest.fn();
    mockDashboardWebSocket.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useDashboardData());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
    expect(mockDashboardPoller.stopPolling).toHaveBeenCalledWith(
      "dashboard-data"
    );
  });
});

describe("useNotificationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should mark notification as read", async () => {
    const { result } = renderHook(() => useNotificationActions());

    await act(async () => {
      await result.current.markAsRead("notif_1");
    });

    expect(markNotificationAsRead).toHaveBeenCalledWith("notif_1");
    expect(mockDashboardCache.invalidatePattern).toHaveBeenCalledWith(
      "notifications_"
    );
  });

  test("should mark all notifications as read", async () => {
    const { result } = renderHook(() => useNotificationActions());

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(markAllNotificationsAsRead).toHaveBeenCalled();
    expect(mockDashboardCache.invalidatePattern).toHaveBeenCalledWith(
      "notifications_"
    );
  });

  test("should delete notification", async () => {
    const { result } = renderHook(() => useNotificationActions());

    await act(async () => {
      await result.current.deleteNotification("notif_1");
    });

    expect(deleteNotification).toHaveBeenCalledWith("notif_1");
    expect(mockDashboardCache.invalidatePattern).toHaveBeenCalledWith(
      "notifications_"
    );
  });

  test("should clear all notifications", async () => {
    const { result } = renderHook(() => useNotificationActions());

    await act(async () => {
      await result.current.clearAll();
    });

    expect(clearAllNotifications).toHaveBeenCalled();
    expect(mockDashboardCache.invalidatePattern).toHaveBeenCalledWith(
      "notifications_"
    );
  });

  test("should handle loading state", async () => {
    let resolveMarkAsRead: (value: any) => void;
    const markAsReadPromise = new Promise((resolve) => {
      resolveMarkAsRead = resolve;
    });

    (markNotificationAsRead as jest.Mock).mockReturnValue(markAsReadPromise);

    const { result } = renderHook(() => useNotificationActions());

    // Start the async operation
    const markAsReadPromise2 = act(async () => {
      return result.current.markAsRead("notif_1");
    });

    // Should be loading
    expect(result.current.loading).toBe(true);

    // Resolve the promise
    act(() => {
      resolveMarkAsRead(undefined);
    });

    await markAsReadPromise2;

    // Should not be loading anymore
    expect(result.current.loading).toBe(false);
  });

  test("should handle errors", async () => {
    const error = new Error("Failed to mark as read");
    (markNotificationAsRead as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useNotificationActions());

    await expect(
      act(async () => {
        await result.current.markAsRead("notif_1");
      })
    ).rejects.toThrow("Failed to mark as read");

    expect(result.current.loading).toBe(false);
  });
});

describe("useConnectionStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should initialize with connection status", () => {
    mockDashboardWebSocket.isConnected.mockReturnValue(true);
    mockDashboardWebSocket.getConnectionId.mockReturnValue("conn_123");

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionId).toBe("conn_123");
  });

  test("should update connection status periodically", () => {
    mockDashboardWebSocket.isConnected.mockReturnValue(false);
    mockDashboardWebSocket.getConnectionId.mockReturnValue(null);

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.isConnected).toBe(false);

    // Change connection status
    mockDashboardWebSocket.isConnected.mockReturnValue(true);
    mockDashboardWebSocket.getConnectionId.mockReturnValue("conn_456");

    // Fast-forward the interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionId).toBe("conn_456");
  });

  test("should handle connection events", () => {
    let connectionCallback: (payload: any) => void = () => {};

    mockDashboardWebSocket.subscribe.mockImplementation((event, callback) => {
      if (event === "connection_established") {
        connectionCallback = callback;
      }
      return () => {};
    });

    const { result } = renderHook(() => useConnectionStatus());

    // Simulate connection established event
    act(() => {
      connectionCallback({ connectionId: "new_conn_789" });
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionId).toBe("new_conn_789");
    expect(result.current.lastConnected).toBeInstanceOf(Date);
    expect(result.current.reconnectAttempts).toBe(0);
  });

  test("should handle reconnect attempts", () => {
    let reconnectCallback: (payload: any) => void = () => {};

    mockDashboardWebSocket.subscribe.mockImplementation((event, callback) => {
      if (event === "reconnect_attempt") {
        reconnectCallback = callback;
      }
      return () => {};
    });

    const { result } = renderHook(() => useConnectionStatus());

    // Simulate reconnect attempt
    act(() => {
      reconnectCallback({ attempt: 3 });
    });

    expect(result.current.reconnectAttempts).toBe(3);
  });

  test("should reconnect manually", () => {
    const { result } = renderHook(() => useConnectionStatus());

    act(() => {
      result.current.reconnect();
    });

    expect(mockDashboardWebSocket.disconnect).toHaveBeenCalled();

    // Fast-forward the timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockDashboardWebSocket.connect).toHaveBeenCalled();
  });

  test("should cleanup on unmount", () => {
    const unsubscribe = jest.fn();
    mockDashboardWebSocket.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useConnectionStatus());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
