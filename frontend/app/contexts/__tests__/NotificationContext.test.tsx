import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { NotificationProvider, useNotifications } from "../NotificationContext";
import { Notification } from "../../types/notification";

// Mock the API module
jest.mock("../../lib/api", () => ({
  getNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  clearAllNotifications: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock Notification API
const mockNotification = jest.fn().mockImplementation((title, options) => ({
  title,
  ...options,
}));

Object.defineProperty(mockNotification, "permission", {
  value: "granted",
  writable: true,
});

Object.defineProperty(mockNotification, "requestPermission", {
  value: jest.fn().mockResolvedValue("granted"),
  writable: true,
});

Object.defineProperty(window, "Notification", {
  value: mockNotification,
  configurable: true,
});

// Test component that uses the notification context
function TestComponent() {
  const {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    fetchNotifications,
  } = useNotifications();

  return (
    <div>
      <div data-testid="notification-count">{state.notifications.length}</div>
      <div data-testid="unread-count">{state.unreadCount}</div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || "no-error"}</div>

      <button
        onClick={() =>
          addNotification({
            type: "info",
            title: "Test Notification",
            message: "This is a test notification",
            category: "system",
            priority: "medium",
          })
        }
        data-testid="add-notification"
      >
        Add Notification
      </button>

      <button onClick={() => markAsRead("test-id")} data-testid="mark-as-read">
        Mark as Read
      </button>

      <button onClick={markAllAsRead} data-testid="mark-all-as-read">
        Mark All as Read
      </button>

      <button
        onClick={() => removeNotification("test-id")}
        data-testid="remove-notification"
      >
        Remove Notification
      </button>

      <button onClick={clearAll} data-testid="clear-all">
        Clear All
      </button>

      <button onClick={fetchNotifications} data-testid="fetch-notifications">
        Fetch Notifications
      </button>

      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          data-testid={`notification-${notification.id}`}
        >
          <span data-testid={`title-${notification.id}`}>
            {notification.title}
          </span>
          <span data-testid={`read-${notification.id}`}>
            {notification.isRead.toString()}
          </span>
        </div>
      ))}
    </div>
  );
}

describe("NotificationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("should provide initial state", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("no-error");
  });

  it("should add a new notification", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-notification"));
    });

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
    expect(screen.getByTestId("unread-count")).toHaveTextContent("1");
    expect(screen.getByText("Test Notification")).toBeInTheDocument();
  });

  it("should mark notification as read", async () => {
    const { getNotifications } = require("../../lib/api");
    getNotifications.mockResolvedValue({
      notifications: [
        {
          id: "test-id",
          type: "info",
          title: "Test Notification",
          message: "Test message",
          timestamp: new Date().toISOString(),
          isRead: false,
          category: "system",
          priority: "medium",
        },
      ],
      unreadCount: 1,
      totalCount: 1,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Fetch notifications first
    await act(async () => {
      fireEvent.click(screen.getByTestId("fetch-notifications"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("1");
    });

    // Mark as read
    await act(async () => {
      fireEvent.click(screen.getByTestId("mark-as-read"));
    });

    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
    expect(screen.getByTestId("read-test-id")).toHaveTextContent("true");
  });

  it("should mark all notifications as read", async () => {
    const { getNotifications } = require("../../lib/api");
    getNotifications.mockResolvedValue({
      notifications: [
        {
          id: "test-id-1",
          type: "info",
          title: "Test Notification 1",
          message: "Test message 1",
          timestamp: new Date().toISOString(),
          isRead: false,
          category: "system",
          priority: "medium",
        },
        {
          id: "test-id-2",
          type: "warning",
          title: "Test Notification 2",
          message: "Test message 2",
          timestamp: new Date().toISOString(),
          isRead: false,
          category: "user",
          priority: "high",
        },
      ],
      unreadCount: 2,
      totalCount: 2,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Fetch notifications first
    await act(async () => {
      fireEvent.click(screen.getByTestId("fetch-notifications"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
    });

    // Mark all as read
    await act(async () => {
      fireEvent.click(screen.getByTestId("mark-all-as-read"));
    });

    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
  });

  it("should remove a notification", async () => {
    const { getNotifications } = require("../../lib/api");
    getNotifications.mockResolvedValue({
      notifications: [
        {
          id: "test-id",
          type: "info",
          title: "Test Notification",
          message: "Test message",
          timestamp: new Date().toISOString(),
          isRead: false,
          category: "system",
          priority: "medium",
        },
      ],
      unreadCount: 1,
      totalCount: 1,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Fetch notifications first
    await act(async () => {
      fireEvent.click(screen.getByTestId("fetch-notifications"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
    });

    // Remove notification
    await act(async () => {
      fireEvent.click(screen.getByTestId("remove-notification"));
    });

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
  });

  it("should clear all notifications", async () => {
    const { getNotifications } = require("../../lib/api");
    getNotifications.mockResolvedValue({
      notifications: [
        {
          id: "test-id-1",
          type: "info",
          title: "Test Notification 1",
          message: "Test message 1",
          timestamp: new Date().toISOString(),
          isRead: false,
          category: "system",
          priority: "medium",
        },
        {
          id: "test-id-2",
          type: "warning",
          title: "Test Notification 2",
          message: "Test message 2",
          timestamp: new Date().toISOString(),
          isRead: true,
          category: "user",
          priority: "high",
        },
      ],
      unreadCount: 1,
      totalCount: 2,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Fetch notifications first
    await act(async () => {
      fireEvent.click(screen.getByTestId("fetch-notifications"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("2");
    });

    // Clear all
    await act(async () => {
      fireEvent.click(screen.getByTestId("clear-all"));
    });

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
  });

  it("should handle fetch notifications error", async () => {
    const { getNotifications } = require("../../lib/api");
    getNotifications.mockRejectedValue(new Error("API Error"));

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("fetch-notifications"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Failed to fetch notifications"
      );
    });
  });

  it("should load notifications from localStorage on mount", () => {
    const savedNotifications: Notification[] = [
      {
        id: "saved-id",
        type: "success",
        title: "Saved Notification",
        message: "This was saved in localStorage",
        timestamp: new Date().toISOString(),
        isRead: false,
        category: "system",
        priority: "low",
      },
    ];

    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify(savedNotifications)
    );

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
    expect(screen.getByTestId("unread-count")).toHaveTextContent("1");
    expect(screen.getByText("Saved Notification")).toBeInTheDocument();
  });

  it("should save notifications to localStorage when they change", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-notification"));
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "notifications",
      expect.stringContaining("Test Notification")
    );
  });

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNotifications must be used within a NotificationProvider");

    consoleSpy.mockRestore();
  });
});
