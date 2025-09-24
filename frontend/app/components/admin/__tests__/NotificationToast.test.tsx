import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationProvider } from "../../../contexts/NotificationContext";
import NotificationToastContainer from "../NotificationToast";
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

// Mock window.open
Object.defineProperty(window, "open", {
  value: jest.fn(),
});

function renderWithProvider(component: React.ReactElement) {
  return render(<NotificationProvider>{component}</NotificationProvider>);
}

// Test component to trigger notifications
function TestTrigger() {
  const { addNotification } =
    require("../../../contexts/NotificationContext").useNotifications();

  return (
    <div>
      <button
        onClick={() =>
          addNotification({
            type: "success",
            title: "Success Toast",
            message: "This is a success notification",
            category: "system",
            priority: "medium",
          })
        }
        data-testid="add-success"
      >
        Add Success
      </button>

      <button
        onClick={() =>
          addNotification({
            type: "error",
            title: "Error Toast",
            message: "This is an error notification",
            category: "system",
            priority: "high",
          })
        }
        data-testid="add-error"
      >
        Add Error
      </button>

      <button
        onClick={() =>
          addNotification({
            type: "warning",
            title: "Warning Toast",
            message: "This is a warning notification",
            category: "security",
            priority: "medium",
          })
        }
        data-testid="add-warning"
      >
        Add Warning
      </button>

      <button
        onClick={() =>
          addNotification({
            type: "info",
            title: "Info Toast",
            message: "This is an info notification",
            category: "user",
            priority: "low",
            actionUrl: "https://example.com",
            actionLabel: "View Details",
          })
        }
        data-testid="add-info-with-action"
      >
        Add Info with Action
      </button>
    </div>
  );
}

describe("NotificationToastContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should render toast container without errors", () => {
    renderWithProvider(<NotificationToastContainer />);
    // Container should be present but empty initially
    expect(document.querySelector(".fixed.top-4.right-4")).toBeInTheDocument();
  });

  it("should show toast when new notification is added", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-success"));

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
      expect(
        screen.getByText("This is a success notification")
      ).toBeInTheDocument();
    });
  });

  it("should show different toast styles for different notification types", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    // Add success notification
    fireEvent.click(screen.getByTestId("add-success"));
    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
    });

    // Add error notification
    fireEvent.click(screen.getByTestId("add-error"));
    await waitFor(() => {
      expect(screen.getByText("Error Toast")).toBeInTheDocument();
    });

    // Add warning notification
    fireEvent.click(screen.getByTestId("add-warning"));
    await waitFor(() => {
      expect(screen.getByText("Warning Toast")).toBeInTheDocument();
    });

    // Should have all three toasts visible
    expect(screen.getByText("Success Toast")).toBeInTheDocument();
    expect(screen.getByText("Error Toast")).toBeInTheDocument();
    expect(screen.getByText("Warning Toast")).toBeInTheDocument();
  });

  it("should show action button when actionUrl is provided", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-info-with-action"));

    await waitFor(() => {
      expect(screen.getByText("View Details")).toBeInTheDocument();
    });

    // Click the action button
    fireEvent.click(screen.getByText("View Details"));

    expect(window.open).toHaveBeenCalledWith("https://example.com", "_blank");
  });

  it("should close toast when close button is clicked", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-success"));

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
    });

    // Find and click the close button
    const closeButton =
      screen.getByLabelText("Close") ||
      screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for animation and removal
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText("Success Toast")).not.toBeInTheDocument();
    });
  });

  it("should auto-close toast after delay", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-success"));

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
    });

    // Fast-forward time to trigger auto-close
    jest.advanceTimersByTime(5000); // Default auto-close delay

    // Wait for animation
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText("Success Toast")).not.toBeInTheDocument();
    });
  });

  it("should handle multiple toasts correctly", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    // Add multiple notifications quickly
    fireEvent.click(screen.getByTestId("add-success"));
    fireEvent.click(screen.getByTestId("add-error"));
    fireEvent.click(screen.getByTestId("add-warning"));

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
      expect(screen.getByText("Error Toast")).toBeInTheDocument();
      expect(screen.getByText("Warning Toast")).toBeInTheDocument();
    });

    // All toasts should be stacked vertically
    const toasts = document.querySelectorAll(".transform.transition-all");
    expect(toasts.length).toBe(3);
  });

  it("should show entrance animation", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-success"));

    // Initially should be off-screen (translate-x-full)
    const toast = await waitFor(() =>
      document.querySelector(".transform.transition-all")
    );

    expect(toast).toHaveClass("transition-all");

    // After animation delay, should be visible
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
    });
  });

  it("should show exit animation when closing", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-success"));

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
    });

    // Click close button
    const closeButton =
      screen.getByLabelText("Close") ||
      screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    // Should start exit animation
    const toast = document.querySelector(".transform.transition-all");
    expect(toast).toHaveClass("transition-all");

    // Complete the animation
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText("Success Toast")).not.toBeInTheDocument();
    });
  });

  it("should not show toasts for read notifications", async () => {
    const readNotifications: Notification[] = [
      {
        id: "read-notif",
        type: "info",
        title: "Read Notification",
        message: "This notification is already read",
        timestamp: new Date().toISOString(),
        isRead: true,
        category: "system",
        priority: "low",
      },
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(readNotifications));

    renderWithProvider(<NotificationToastContainer />);

    // Should not show any toasts for read notifications
    expect(screen.queryByText("Read Notification")).not.toBeInTheDocument();
  });

  it("should handle toast positioning correctly", async () => {
    renderWithProvider(
      <div>
        <TestTrigger />
        <NotificationToastContainer />
      </div>
    );

    fireEvent.click(screen.getByTestId("add-success"));
    fireEvent.click(screen.getByTestId("add-error"));

    await waitFor(() => {
      expect(screen.getByText("Success Toast")).toBeInTheDocument();
      expect(screen.getByText("Error Toast")).toBeInTheDocument();
    });

    // Container should have correct positioning classes
    const container = document.querySelector(
      ".fixed.top-4.right-4.z-50.space-y-2"
    );
    expect(container).toBeInTheDocument();
  });
});
