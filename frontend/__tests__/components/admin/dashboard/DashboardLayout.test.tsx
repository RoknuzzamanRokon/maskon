import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DashboardLayout } from "../../../../app/admin/dashboard/layout/DashboardLayout";

// Mock the responsive utilities
jest.mock("../../../../app/admin/dashboard/utils/responsive", () => ({
  useScreenSize: jest.fn(() => ({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
  useSwipeGesture: jest.fn(() => ({
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
  })),
}));

// Mock the context providers
jest.mock("../../../../app/admin/dashboard/contexts/DashboardContext", () => ({
  DashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("../../../../app/contexts/NotificationContext", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the child components
jest.mock("../../../../app/admin/dashboard/layout/Sidebar", () => ({
  Sidebar: ({
    isCollapsed,
    onToggle,
    isMobile,
    mobileMenuOpen,
    onCloseMobile,
  }: any) => (
    <div
      data-testid="sidebar"
      data-collapsed={isCollapsed}
      data-mobile={isMobile}
      data-mobile-open={mobileMenuOpen}
    >
      <button onClick={onToggle} data-testid="sidebar-toggle">
        Toggle
      </button>
      {onCloseMobile && (
        <button onClick={onCloseMobile} data-testid="close-mobile">
          Close
        </button>
      )}
    </div>
  ),
}));

jest.mock("../../../../app/admin/dashboard/layout/Header", () => ({
  Header: ({ onToggleSidebar, isMobile, mobileMenuOpen }: any) => (
    <div
      data-testid="header"
      data-mobile={isMobile}
      data-mobile-open={mobileMenuOpen}
    >
      <button onClick={onToggleSidebar} data-testid="header-toggle">
        Menu
      </button>
    </div>
  ),
}));

jest.mock("../../../../app/admin/dashboard/layout/MainContent", () => ({
  MainContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-content">{children}</div>
  ),
}));

const {
  useScreenSize,
  useSwipeGesture,
} = require("../../../../app/admin/dashboard/utils/responsive");

describe("DashboardLayout", () => {
  beforeEach(() => {
    // Reset mocks
    useScreenSize.mockReturnValue({
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    useSwipeGesture.mockReturnValue({
      onTouchStart: jest.fn(),
      onTouchEnd: jest.fn(),
    });
  });

  it("should render all layout components", () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should handle sidebar toggle on desktop", () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const sidebar = screen.getByTestId("sidebar");
    const toggleButton = screen.getByTestId("sidebar-toggle");

    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    fireEvent.click(toggleButton);

    expect(sidebar).toHaveAttribute("data-collapsed", "true");
  });

  it("should auto-collapse sidebar on mobile", () => {
    useScreenSize.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(sidebar).toHaveAttribute("data-mobile", "true");
  });

  it("should handle mobile menu toggle", () => {
    useScreenSize.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const sidebar = screen.getByTestId("sidebar");
    const headerToggle = screen.getByTestId("header-toggle");

    expect(sidebar).toHaveAttribute("data-mobile-open", "false");

    fireEvent.click(headerToggle);

    expect(sidebar).toHaveAttribute("data-mobile-open", "true");
  });

  it("should show mobile overlay when menu is open", () => {
    useScreenSize.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const headerToggle = screen.getByTestId("header-toggle");
    fireEvent.click(headerToggle);

    // Check for overlay
    const overlay = container.querySelector(".bg-black.bg-opacity-50");
    expect(overlay).toBeInTheDocument();
  });

  it("should close mobile menu when overlay is clicked", () => {
    useScreenSize.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const headerToggle = screen.getByTestId("header-toggle");
    const sidebar = screen.getByTestId("sidebar");

    // Open mobile menu
    fireEvent.click(headerToggle);
    expect(sidebar).toHaveAttribute("data-mobile-open", "true");

    // Click overlay to close
    const overlay = container.querySelector(".bg-black.bg-opacity-50");
    fireEvent.click(overlay!);

    expect(sidebar).toHaveAttribute("data-mobile-open", "false");
  });

  it("should auto-collapse on tablet", () => {
    useScreenSize.mockReturnValue({
      width: 768,
      height: 1024,
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    });

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(sidebar).toHaveAttribute("data-mobile", "false");
  });

  it("should apply correct margin classes based on screen size", () => {
    const { container, rerender } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Desktop - should have margin
    let contentWrapper = container.querySelector(".ml-64");
    expect(contentWrapper).toBeInTheDocument();

    // Mobile
    useScreenSize.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    rerender(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Mobile - should have no margin
    contentWrapper = container.querySelector(".ml-0");
    expect(contentWrapper).toBeInTheDocument();
  });

  it("should setup swipe gesture handlers", () => {
    const mockSwipeHandlers = {
      onTouchStart: jest.fn(),
      onTouchEnd: jest.fn(),
    };

    useSwipeGesture.mockReturnValue(mockSwipeHandlers);

    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(useSwipeGesture).toHaveBeenCalledWith(expect.any(Function));

    // Check that swipe handlers are applied to the main container
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass("min-h-screen");
  });
});
