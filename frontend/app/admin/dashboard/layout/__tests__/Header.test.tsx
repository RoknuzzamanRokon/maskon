import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { Header } from "../Header";
import { useDashboard } from "../../contexts/DashboardContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import { getUserInfo, logout } from "../../../../lib/api";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock contexts
jest.mock("../../contexts/DashboardContext", () => ({
  useDashboard: jest.fn(),
}));

jest.mock("../../../../contexts/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

// Mock API functions
jest.mock("../../../../lib/api", () => ({
  getUserInfo: jest.fn(),
  logout: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Bell: ({ className, ...props }: any) => (
    <div data-testid="bell-icon" className={className} {...props} />
  ),
  Menu: ({ className, ...props }: any) => (
    <div data-testid="menu-icon" className={className} {...props} />
  ),
  Sun: ({ className, ...props }: any) => (
    <div data-testid="sun-icon" className={className} {...props} />
  ),
  Moon: ({ className, ...props }: any) => (
    <div data-testid="moon-icon" className={className} {...props} />
  ),
  User: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props} />
  ),
  Settings: ({ className, ...props }: any) => (
    <div data-testid="settings-icon" className={className} {...props} />
  ),
  LogOut: ({ className, ...props }: any) => (
    <div data-testid="logout-icon" className={className} {...props} />
  ),
  ChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-down-icon" className={className} {...props} />
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
  Shield: ({ className, ...props }: any) => (
    <div data-testid="shield-icon" className={className} {...props} />
  ),
  HelpCircle: ({ className, ...props }: any) => (
    <div data-testid="help-circle-icon" className={className} {...props} />
  ),
}));

// Mock child components
jest.mock("../../components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

jest.mock("../../components/NotificationCenter", () => ({
  NotificationCenter: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="notification-center">
        <button onClick={onClose} data-testid="close-notifications">
          Close
        </button>
        Notification Center
      </div>
    ) : null,
}));

jest.mock("../../components/UserMenu", () => ({
  UserMenu: ({ isOpen, onToggle, onClose }: any) => (
    <div data-testid="user-menu">
      <button onClick={onToggle} data-testid="user-menu-toggle">
        Toggle User Menu
      </button>
      {isOpen && (
        <div data-testid="user-menu-dropdown">
          <button onClick={onClose} data-testid="close-user-menu">
            Close
          </button>
          User Menu Dropdown
        </div>
      )}
    </div>
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

const mockUseDashboard = {
  unreadCount: 0,
  notifications: [],
  markNotificationRead: jest.fn(),
  removeNotification: jest.fn(),
};

const mockUseTheme = {
  theme: "light" as const,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

const mockUserInfo = {
  username: "testuser",
  is_admin: true,
};

describe("Header Component", () => {
  const mockOnToggleSidebar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useDashboard as jest.Mock).mockReturnValue(mockUseDashboard);
    (useTheme as jest.Mock).mockReturnValue(mockUseTheme);
    (getUserInfo as jest.Mock).mockReturnValue(mockUserInfo);
  });

  describe("Basic Rendering", () => {
    it("renders header with all main elements", () => {
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
      expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("renders mobile menu button", () => {
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const mobileMenuButton = screen.getByLabelText("Toggle sidebar");
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveClass("md:hidden");
    });

    it("applies correct CSS classes for layout", () => {
      const { container } = render(
        <Header onToggleSidebar={mockOnToggleSidebar} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass(
        "h-16",
        "bg-white",
        "dark:bg-gray-800",
        "border-b",
        "border-gray-200",
        "dark:border-gray-700",
        "flex",
        "items-center",
        "justify-between"
      );
    });
  });

  describe("Mobile Menu Functionality", () => {
    it("calls onToggleSidebar when mobile menu button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const mobileMenuButton = screen.getByLabelText("Toggle sidebar");
      await user.click(mobileMenuButton);

      expect(mockOnToggleSidebar).toHaveBeenCalledTimes(1);
    });
  });

  describe("Notification Badge", () => {
    it("shows notification badge when there are unread notifications", () => {
      (useDashboard as jest.Mock).mockReturnValue({
        ...mockUseDashboard,
        unreadCount: 5,
      });

      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const badge = screen.getByText("5");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-red-500", "text-white");
    });

    it("shows 9+ when unread count exceeds 9", () => {
      (useDashboard as jest.Mock).mockReturnValue({
        ...mockUseDashboard,
        unreadCount: 15,
      });

      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("does not show badge when unread count is 0", () => {
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  describe("Notification Center", () => {
    it("opens notification center when bell icon is clicked", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const notificationButton = screen.getByLabelText("Notifications");
      await user.click(notificationButton);

      expect(screen.getByTestId("notification-center")).toBeInTheDocument();
    });

    it("closes notification center when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Open notification center
      const notificationButton = screen.getByLabelText("Notifications");
      await user.click(notificationButton);

      // Close notification center
      const closeButton = screen.getByTestId("close-notifications");
      await user.click(closeButton);

      expect(
        screen.queryByTestId("notification-center")
      ).not.toBeInTheDocument();
    });

    it("closes notification center when clicking outside", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Open notification center
      const notificationButton = screen.getByLabelText("Notifications");
      await user.click(notificationButton);

      expect(screen.getByTestId("notification-center")).toBeInTheDocument();

      // Click outside
      await user.click(document.body);

      await waitFor(() => {
        expect(
          screen.queryByTestId("notification-center")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("User Menu", () => {
    it("opens user menu when toggle button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const userMenuToggle = screen.getByTestId("user-menu-toggle");
      await user.click(userMenuToggle);

      expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();
    });

    it("closes user menu when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Open user menu
      const userMenuToggle = screen.getByTestId("user-menu-toggle");
      await user.click(userMenuToggle);

      // Close user menu
      const closeButton = screen.getByTestId("close-user-menu");
      await user.click(closeButton);

      expect(
        screen.queryByTestId("user-menu-dropdown")
      ).not.toBeInTheDocument();
    });

    it("closes user menu when clicking outside", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Open user menu
      const userMenuToggle = screen.getByTestId("user-menu-toggle");
      await user.click(userMenuToggle);

      expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

      // Click outside
      await user.click(document.body);

      await waitFor(() => {
        expect(
          screen.queryByTestId("user-menu-dropdown")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes dropdowns when Escape key is pressed", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Open notification center
      const notificationButton = screen.getByLabelText("Notifications");
      await user.click(notificationButton);

      // Open user menu
      const userMenuToggle = screen.getByTestId("user-menu-toggle");
      await user.click(userMenuToggle);

      expect(screen.getByTestId("notification-center")).toBeInTheDocument();
      expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

      // Press Escape
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(
          screen.queryByTestId("notification-center")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId("user-menu-dropdown")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes for notification button", () => {
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const notificationButton = screen.getByLabelText("Notifications");
      expect(notificationButton).toHaveAttribute("aria-expanded", "false");
      expect(notificationButton).toHaveAttribute("aria-haspopup", "true");
    });

    it("updates ARIA attributes when notification center is open", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const notificationButton = screen.getByLabelText("Notifications");
      await user.click(notificationButton);

      expect(notificationButton).toHaveAttribute("aria-expanded", "true");
    });

    it("has proper title attributes for tooltips", () => {
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      const notificationButton = screen.getByLabelText("Notifications");
      expect(notificationButton).toHaveAttribute("title", "Notifications");
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive spacing classes", () => {
      const { container } = render(
        <Header onToggleSidebar={mockOnToggleSidebar} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass("px-4", "md:px-6");

      const leftSection = container.querySelector(".ml-2.md\\:ml-4");
      expect(leftSection).toBeInTheDocument();

      const rightSection = container.querySelector(".space-x-2.md\\:space-x-4");
      expect(rightSection).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles missing user info gracefully", () => {
      (getUserInfo as jest.Mock).mockReturnValue(null);

      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Should still render without errors
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("handles dashboard context errors gracefully", () => {
      (useDashboard as jest.Mock).mockReturnValue({
        unreadCount: 0,
        notifications: [],
        markNotificationRead: undefined,
        removeNotification: undefined,
      });

      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Should still render without errors
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to child components", () => {
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("maintains state consistency across components", async () => {
      const user = userEvent.setup();
      render(<Header onToggleSidebar={mockOnToggleSidebar} />);

      // Open notification center
      const notificationButton = screen.getByLabelText("Notifications");
      await user.click(notificationButton);

      // Open user menu - should not affect notification center
      const userMenuToggle = screen.getByTestId("user-menu-toggle");
      await user.click(userMenuToggle);

      expect(screen.getByTestId("notification-center")).toBeInTheDocument();
      expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();
    });
  });
});
