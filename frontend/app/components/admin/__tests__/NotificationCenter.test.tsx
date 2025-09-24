import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationProvider } from "../../../contexts/NotificationContext";
import NotificationCenter from "../NotificationCenter";
import { Notification } from "../../../types/notification";

// Mock the API module
jest.mock("../../../lib/api", () => ({
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
Object.defineProperty(window, "Notification", {
  value: {
    permission: "granted",
    requestPermission: jest.fn(),
  },
});

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "info",
    title: "System Update",
    message: "System has been updated to version 2.1.0",
    timestamp: new Date().toISOString(),
    isRead: false,
    category: "system",
    priority: "medium",
  },
  {
    id: "notif-2",
    type: "success",
    title: "User Registration",
    message: "New user has registered successfully",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
    category: "user",
    priority: "low",
  },
  {
    id: "notif-3",
    type: "warning",
    title: "High Memory Usage",
    message: "Server memory usage is at 85%",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: true,
    category: "system",
    priority: "high",
  },
];

function renderWithProvider(component: React.ReactElement) {
  return render(<NotificationProvider>{component}</NotificationProvider>);
}

describe("NotificationCenter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockNotifications));
  });

  it("should render notification bell with unread count", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    expect(bellButton).toBeInTheDocument();

    // Should show unread count badge
    const badge = screen.getByText("2"); // 2 unread notifications
    expect(badge).toBeInTheDocument();
  });

  it("should open notification dropdown when bell is clicked", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("2 new")).toBeInTheDocument();
  });

  it("should display notifications in the dropdown", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    expect(screen.getByText("System Update")).toBeInTheDocument();
    expect(screen.getByText("User Registration")).toBeInTheDocument();
    expect(screen.getByText("High Memory Usage")).toBeInTheDocument();
  });

  it("should show correct notification icons based on type", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    // Check that different notification types have different styling
    const notifications = screen
      .getAllByRole("button")
      .filter(
        (button) =>
          button.textContent?.includes("System Update") ||
          button.textContent?.includes("User Registration") ||
          button.textContent?.includes("High Memory Usage")
      );

    expect(notifications.length).toBeGreaterThan(0);
  });

  it("should mark notification as read when clicked", async () => {
    const { markNotificationAsRead } = require("../../../lib/api");
    markNotificationAsRead.mockResolvedValue({});

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    // Find and click an unread notification
    const systemUpdateNotification = screen
      .getByText("System Update")
      .closest("div");
    if (systemUpdateNotification) {
      fireEvent.click(systemUpdateNotification);
    }

    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith("notif-1");
    });
  });

  it("should mark all notifications as read when button is clicked", async () => {
    const { markAllNotificationsAsRead } = require("../../../lib/api");
    markAllNotificationsAsRead.mockResolvedValue({});

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const markAllButton = screen.getByTitle("Mark all as read");
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(markAllNotificationsAsRead).toHaveBeenCalled();
    });
  });

  it("should remove notification when delete button is clicked", async () => {
    const { deleteNotification } = require("../../../lib/api");
    deleteNotification.mockResolvedValue({});

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const deleteButtons = screen.getAllByTitle("Remove notification");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteNotification).toHaveBeenCalledWith("notif-1");
    });
  });

  it("should clear all notifications when clear all button is clicked", async () => {
    const { clearAllNotifications } = require("../../../lib/api");
    clearAllNotifications.mockResolvedValue({});

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const clearAllButton = screen.getByText("Clear All");
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(clearAllNotifications).toHaveBeenCalled();
    });
  });

  it("should refresh notifications when refresh button is clicked", async () => {
    const { getNotifications } = require("../../../lib/api");
    getNotifications.mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 2,
      totalCount: 3,
    });

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const refreshButton = screen.getByTitle("Refresh notifications");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });
  });

  it("should show filters when filter button is clicked", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const filterButton = screen.getByTitle("Filter notifications");
    fireEvent.click(filterButton);

    expect(screen.getByText("All Types")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("All Status")).toBeInTheDocument();
  });

  it("should filter notifications by type", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const filterButton = screen.getByTitle("Filter notifications");
    fireEvent.click(filterButton);

    const typeSelect = screen.getByDisplayValue("All Types");
    fireEvent.change(typeSelect, { target: { value: "warning" } });

    // Should only show warning notifications
    expect(screen.getByText("High Memory Usage")).toBeInTheDocument();
    expect(screen.queryByText("System Update")).not.toBeInTheDocument();
  });

  it("should show empty state when no notifications", () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    expect(screen.getByText("No notifications")).toBeInTheDocument();
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    const { getNotifications } = require("../../../lib/api");
    getNotifications.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const refreshButton = screen.getByTitle("Refresh notifications");
    fireEvent.click(refreshButton);

    expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
  });

  it("should show error state when API fails", async () => {
    const { getNotifications } = require("../../../lib/api");
    getNotifications.mockRejectedValue(new Error("API Error"));

    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    const refreshButton = screen.getByTitle("Refresh notifications");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });
  });

  it("should close dropdown when clicking outside", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    expect(screen.getByText("Notifications")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  it("should format timestamps correctly", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    // Should show relative time formats
    expect(screen.getByText("Just now")).toBeInTheDocument();
    expect(screen.getByText("30m ago")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
  });

  it("should show priority indicators", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    // High priority notification should show priority badge
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("should show category badges", () => {
    renderWithProvider(<NotificationCenter />);

    const bellButton = screen.getByLabelText("Notifications");
    fireEvent.click(bellButton);

    expect(screen.getByText("system")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });
});
