import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { NotificationCenter } from "../NotificationCenter";
import { useDashboard } from "../../contexts/DashboardContext";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock dashboard context
jest.mock("../../contexts/DashboardContext", () => ({
  useDashboard: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Bell: ({ className, ...props }: any) => (
    <div data-testid="bell-icon" className={className} {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <div data-testid="x-icon" className={className} {...props} />
  ),
  Check: ({ className, ...props }: any) => (
    <div data-testid="check-icon" className={className} {...props} />
  ),
  Trash2: ({ className, ...props }: any) => (
    <div data-testid="trash-icon" className={className} {...props} />
  ),
  ExternalLink: ({ className, ...props }: any) => (
    <div data-testid="external-link-icon" className={className} {...props} />
  ),
  Filter: ({ className, ...props }: any) => (
    <div data-testid="filter-icon" className={className} {...props} />
  ),
  CheckCheck: ({ className, ...props }: any) => (
    <div data-testid="check-check-icon" className={className} {...props} />
  ),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockNotifications = [
  {
    id: "1",
    type: "info" as const,
    title: "Welcome",
    message: "Welcome to the dashboard",
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: "/admin/welcome",
    actionLabel: "View Details",
  },
  {
    id: "2",
    type: "success" as const,
    title: "Update Complete",
    message: "System update completed successfully",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
  },
  {
    id: "3",
    type: "warning" as const,
    title: "Warning",
    message: "Please check your settings",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
  },
  {
    id: "4",
    type: "error" as const,
    title: "Error",
    message: "An error occurred",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    isRead: false,
  },
];

const mockUseDashboard = {
  notifications: mockNotifications,
  unreadCount: 3,
  markNotificationRead: jest.fn(),
  removeNotification: jest.fn(),
};

describe("NotificationCenter Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useDashboard as jest.Mock).mockReturnValue(mockUseDashboard);
  });

  describe("Basic Rendering", () => {
    it("renders when isOpen is true", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("3 unread")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(<NotificationCenter isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });

    it("renders all notifications", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(screen.getByText("Update Complete")).toBeInTheDocument();
      expect(screen.getByText("Warning")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("shows empty state when no notifications", () => {
      (useDashboard as jest.Mock).mockReturnValue({
        ...mockUseDashboard,
        notifications: [],
        unreadCount: 0,
      });

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  describe("Notification Display", () => {
    it("displays notification icons correctly", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      // Check for emoji icons in notifications
      expect(screen.getByText("ℹ️")).toBeInTheDocument(); // info
      expect(screen.getByText("✅")).toBeInTheDocument(); // success
      expect(screen.getByText("⚠️")).toBeInTheDocument(); // warning
      expect(screen.getByText("❌")).toBeInTheDocument(); // error
    });

    it("applies correct styling for unread notifications", () => {
      const { container } = render(
        <NotificationCenter isOpen={true} onClose={mockOnClose} />
      );

      // Unread notifications should have blue background
      const unreadNotifications = container.querySelectorAll(".bg-blue-50");
      expect(unreadNotifications.length).toBeGreaterThan(0);
    });

    it("shows action buttons for notifications with actions", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("View Details")).toBeInTheDocument();
    });

    it("formats timestamps correctly", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      // Should show relative time formats
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("closes when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText("Close notifications");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("marks notification as read when mark as read button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const markAsReadButtons = screen.getAllByLabelText("Mark as read");
      await user.click(markAsReadButtons[0]);

      expect(mockUseDashboard.markNotificationRead).toHaveBeenCalledWith("1");
    });

    it("removes notification when remove button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const removeButtons = screen.getAllByLabelText("Remove notification");
      await user.click(removeButtons[0]);

      expect(mockUseDashboard.removeNotification).toHaveBeenCalledWith("1");
    });

    it("navigates to action URL when action button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const actionButton = screen.getByText("View Details");
      await user.click(actionButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/welcome");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("marks all notifications as read when mark all button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const markAllButton = screen.getByLabelText("Mark all as read");
      await user.click(markAllButton);

      // Should call markNotificationRead for each unread notification
      expect(mockUseDashboard.markNotificationRead).toHaveBeenCalledTimes(3);
    });

    it("navigates to all notifications page when view all button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const viewAllButton = screen.getByText("View all notifications");
      await user.click(viewAllButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/notifications");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Filtering", () => {
    it("toggles between all and unread filter", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const filterButton = screen.getByLabelText("Show unread only");
      await user.click(filterButton);

      // Should now show only unread notifications
      expect(screen.queryByText("Update Complete")).not.toBeInTheDocument();
      expect(screen.getByText("Welcome")).toBeInTheDocument();
    });

    it("shows correct filter state", async () => {
      const user = userEvent.setup();
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const filterButton = screen.getByLabelText("Show unread only");
      await user.click(filterButton);

      // Filter button should now show "Show all"
      expect(screen.getByLabelText("Show all")).toBeInTheDocument();
    });

    it("shows empty state for unread filter when no unread notifications", async () => {
      const user = userEvent.setup();
      (useDashboard as jest.Mock).mockReturnValue({
        ...mockUseDashboard,
        notifications: [mockNotifications[1]], // Only read notification
        unreadCount: 0,
      });

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const filterButton = screen.getByLabelText("Show unread only");
      await user.click(filterButton);

      expect(screen.getByText("No unread notifications")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for buttons", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText("Close notifications")).toBeInTheDocument();
      expect(screen.getByLabelText("Mark all as read")).toBeInTheDocument();
      expect(screen.getByLabelText("Show unread only")).toBeInTheDocument();
    });

    it("has proper titles for tooltips", () => {
      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      const markAsReadButton = screen.getAllByTitle("Mark as read")[0];
      expect(markAsReadButton).toBeInTheDocument();

      const removeButton = screen.getAllByTitle("Remove notification")[0];
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies correct width and positioning classes", () => {
      const { container } = render(
        <NotificationCenter isOpen={true} onClose={mockOnClose} />
      );

      const notificationCenter = container.querySelector(".w-80");
      expect(notificationCenter).toBeInTheDocument();
      expect(notificationCenter).toHaveClass("absolute", "right-0", "mt-2");
    });

    it("has scrollable content area", () => {
      const { container } = render(
        <NotificationCenter isOpen={true} onClose={mockOnClose} />
      );

      const scrollableArea = container.querySelector(
        ".max-h-96.overflow-y-auto"
      );
      expect(scrollableArea).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles notifications without action URLs", () => {
      const notificationsWithoutActions = mockNotifications.map((n) => ({
        ...n,
        actionUrl: undefined,
        actionLabel: undefined,
      }));

      (useDashboard as jest.Mock).mockReturnValue({
        ...mockUseDashboard,
        notifications: notificationsWithoutActions,
      });

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.queryByText("View Details")).not.toBeInTheDocument();
    });

    it("respects maxVisible prop", () => {
      render(
        <NotificationCenter
          isOpen={true}
          onClose={mockOnClose}
          maxVisible={2}
        />
      );

      // Should only show first 2 notifications
      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(screen.getByText("Update Complete")).toBeInTheDocument();
      // The 3rd and 4th notifications should not be visible
      expect(screen.queryByText("Warning")).not.toBeInTheDocument();
      expect(screen.queryByText("Error")).not.toBeInTheDocument();
    });

    it("handles missing dashboard context gracefully", () => {
      (useDashboard as jest.Mock).mockReturnValue({
        notifications: [],
        unreadCount: 0,
        markNotificationRead: undefined,
        removeNotification: undefined,
      });

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("only renders visible notifications", () => {
      const manyNotifications = Array.from({ length: 50 }, (_, i) => ({
        ...mockNotifications[0],
        id: `notification-${i}`,
        title: `Notification ${i}`,
      }));

      (useDashboard as jest.Mock).mockReturnValue({
        ...mockUseDashboard,
        notifications: manyNotifications,
      });

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      // Should only render first 10 (default maxVisible)
      expect(screen.getByText("Notification 0")).toBeInTheDocument();
      expect(screen.getByText("Notification 9")).toBeInTheDocument();
      expect(screen.queryByText("Notification 10")).not.toBeInTheDocument();
    });
  });
});
