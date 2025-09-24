import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../Sidebar";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Home: ({ className }: { className?: string }) => (
    <div data-testid="home-icon" className={className} />
  ),
  FileText: ({ className }: { className?: string }) => (
    <div data-testid="filetext-icon" className={className} />
  ),
  Briefcase: ({ className }: { className?: string }) => (
    <div data-testid="briefcase-icon" className={className} />
  ),
  ShoppingBag: ({ className }: { className?: string }) => (
    <div data-testid="shoppingbag-icon" className={className} />
  ),
  Users: ({ className }: { className?: string }) => (
    <div data-testid="users-icon" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className} />
  ),
  Monitor: ({ className }: { className?: string }) => (
    <div data-testid="monitor-icon" className={className} />
  ),
  Bell: ({ className }: { className?: string }) => (
    <div data-testid="bell-icon" className={className} />
  ),
  ChevronLeft: ({ className }: { className?: string }) => (
    <div data-testid="chevron-left-icon" className={className} />
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <div data-testid="chevron-right-icon" className={className} />
  ),
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className} />
  ),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Sidebar Component", () => {
  const defaultProps = {
    isCollapsed: false,
    onToggle: jest.fn(),
    currentPath: "/admin",
    isMobileOpen: false,
    onMobileToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    mockUsePathname.mockReturnValue("/admin");
  });

  describe("Desktop Sidebar", () => {
    it("renders desktop sidebar with all menu items when not collapsed", () => {
      render(<Sidebar {...defaultProps} />);

      // Check if admin panel title is visible
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();

      // Check if all menu items are rendered
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Posts")).toBeInTheDocument();
      expect(screen.getByText("Portfolio")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("System Monitor")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();

      // Check if icons are rendered
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
      expect(screen.getByTestId("filetext-icon")).toBeInTheDocument();
      expect(screen.getByTestId("briefcase-icon")).toBeInTheDocument();
    });

    it("renders collapsed sidebar without text labels", () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} />);

      // Title should not be visible when collapsed
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();

      // Menu item labels should not be visible in the main navigation (only in tooltips)
      const dashboardSpans = screen.queryAllByText("Dashboard");
      const postsSpans = screen.queryAllByText("Posts");

      // Should only find tooltip text, not main navigation text
      expect(dashboardSpans.length).toBe(1); // Only tooltip
      expect(postsSpans.length).toBe(1); // Only tooltip

      // Icons should still be visible
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
      expect(screen.getByTestId("filetext-icon")).toBeInTheDocument();
    });

    it("calls onToggle when collapse button is clicked", () => {
      const onToggle = jest.fn();
      render(<Sidebar {...defaultProps} onToggle={onToggle} />);

      const toggleButton = screen.getByLabelText("Collapse sidebar");
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows correct icon for collapse/expand state", () => {
      const { rerender } = render(
        <Sidebar {...defaultProps} isCollapsed={false} />
      );
      expect(screen.getByTestId("chevron-left-icon")).toBeInTheDocument();

      rerender(<Sidebar {...defaultProps} isCollapsed={true} />);
      expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument();
    });

    it("highlights active route correctly", () => {
      mockUsePathname.mockReturnValue("/admin/posts");
      render(<Sidebar {...defaultProps} currentPath="/admin/posts" />);

      const postsButton = screen.getByLabelText("Navigate to Posts");
      expect(postsButton).toHaveClass("bg-blue-100", "dark:bg-blue-900");
    });

    it("navigates to correct route when menu item is clicked", () => {
      render(<Sidebar {...defaultProps} />);

      const postsButton = screen.getByLabelText("Navigate to Posts");
      fireEvent.click(postsButton);

      expect(mockPush).toHaveBeenCalledWith("/admin/posts");
    });

    it("shows tooltips in collapsed state", () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} />);

      const dashboardButton = screen.getByLabelText("Navigate to Dashboard");
      expect(dashboardButton).toHaveAttribute("title", "Dashboard");
    });
  });

  describe("Mobile Sidebar", () => {
    it("renders mobile sidebar when isMobileOpen is true", () => {
      render(<Sidebar {...defaultProps} isMobileOpen={true} />);

      // Should show mobile sidebar with backdrop
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();

      // All menu items should be visible
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Posts")).toBeInTheDocument();
    });

    it("calls onMobileToggle when close button is clicked", () => {
      const onMobileToggle = jest.fn();
      render(
        <Sidebar
          {...defaultProps}
          isMobileOpen={true}
          onMobileToggle={onMobileToggle}
        />
      );

      const closeButton = screen.getByLabelText("Close menu");
      fireEvent.click(closeButton);

      expect(onMobileToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onMobileToggle when backdrop is clicked", () => {
      const onMobileToggle = jest.fn();
      render(
        <Sidebar
          {...defaultProps}
          isMobileOpen={true}
          onMobileToggle={onMobileToggle}
        />
      );

      const backdrop = document.querySelector(".bg-black.bg-opacity-50");
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);
      expect(onMobileToggle).toHaveBeenCalledTimes(1);
    });

    it("closes mobile menu after navigation", () => {
      const onMobileToggle = jest.fn();
      render(
        <Sidebar
          {...defaultProps}
          isMobileOpen={true}
          onMobileToggle={onMobileToggle}
        />
      );

      const postsButton = screen.getByLabelText("Navigate to Posts");
      fireEvent.click(postsButton);

      expect(mockPush).toHaveBeenCalledWith("/admin/posts");
      expect(onMobileToggle).toHaveBeenCalledTimes(1);
    });

    it("does not render desktop sidebar when mobile is open", () => {
      render(<Sidebar {...defaultProps} isMobileOpen={true} />);

      // Desktop sidebar should be hidden (no collapse button visible)
      expect(
        screen.queryByLabelText("Collapse sidebar")
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Expand sidebar")).not.toBeInTheDocument();
    });
  });

  describe("Route Highlighting", () => {
    it("highlights dashboard route only for exact match", () => {
      mockUsePathname.mockReturnValue("/admin");
      render(<Sidebar {...defaultProps} currentPath="/admin" />);

      const dashboardButton = screen.getByLabelText("Navigate to Dashboard");
      expect(dashboardButton).toHaveClass("bg-blue-100");
    });

    it("highlights sub-routes correctly", () => {
      mockUsePathname.mockReturnValue("/admin/posts/create");
      render(<Sidebar {...defaultProps} currentPath="/admin/posts/create" />);

      const postsButton = screen.getByLabelText("Navigate to Posts");
      expect(postsButton).toHaveClass("bg-blue-100");
    });

    it("does not highlight dashboard for sub-routes", () => {
      mockUsePathname.mockReturnValue("/admin/posts");
      render(<Sidebar {...defaultProps} currentPath="/admin/posts" />);

      const dashboardButton = screen.getByLabelText("Navigate to Dashboard");
      expect(dashboardButton).not.toHaveClass("bg-blue-100");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for navigation buttons", () => {
      render(<Sidebar {...defaultProps} />);

      expect(
        screen.getByLabelText("Navigate to Dashboard")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Navigate to Posts")).toBeInTheDocument();
      expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
    });

    it("has proper ARIA labels for mobile menu", () => {
      render(<Sidebar {...defaultProps} isMobileOpen={true} />);

      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(<Sidebar {...defaultProps} />);

      const dashboardButton = screen.getByLabelText("Navigate to Dashboard");

      // Focus the button
      dashboardButton.focus();
      expect(document.activeElement).toBe(dashboardButton);

      // Press Enter
      fireEvent.keyDown(dashboardButton, { key: "Enter", code: "Enter" });
      fireEvent.click(dashboardButton);

      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  describe("Responsive Behavior", () => {
    it("applies correct CSS classes for collapsed state", () => {
      const { container } = render(
        <Sidebar {...defaultProps} isCollapsed={true} />
      );

      const sidebar = container.querySelector(".w-16");
      expect(sidebar).toBeInTheDocument();
    });

    it("applies correct CSS classes for expanded state", () => {
      const { container } = render(
        <Sidebar {...defaultProps} isCollapsed={false} />
      );

      const sidebar = container.querySelector(".w-64");
      expect(sidebar).toBeInTheDocument();
    });

    it("hides desktop sidebar on mobile screens", () => {
      const { container } = render(<Sidebar {...defaultProps} />);

      const desktopSidebar = container.querySelector(".hidden.md\\:flex");
      expect(desktopSidebar).toBeInTheDocument();
    });
  });
});
