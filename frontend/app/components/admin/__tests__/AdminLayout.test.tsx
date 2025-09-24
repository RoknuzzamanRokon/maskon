import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import AdminLayout from "../AdminLayout";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(),
}));

// Mock child components
jest.mock("../Sidebar", () => {
  return function MockSidebar(props: any) {
    const serializedProps = {
      ...props,
      onToggle: typeof props.onToggle,
      onMobileToggle: typeof props.onMobileToggle,
    };
    return (
      <div data-testid="sidebar" data-props={JSON.stringify(serializedProps)}>
        Sidebar Component
      </div>
    );
  };
});

jest.mock("../MobileHeader", () => {
  return function MockMobileHeader() {
    return <div data-testid="mobile-header">Mobile Header</div>;
  };
});

// Mock Lucide React icons (used in child components)
jest.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon" />,
  Home: () => <div data-testid="home-icon" />,
  FileText: () => <div data-testid="filetext-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  ShoppingBag: () => <div data-testid="shoppingbag-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Monitor: () => <div data-testid="monitor-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("AdminLayout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/admin");
  });

  it("renders layout with sidebar and mobile header", () => {
    render(
      <AdminLayout>
        <div data-testid="test-content">Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-header")).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("passes correct props to sidebar component", () => {
    mockUsePathname.mockReturnValue("/admin/posts");

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const sidebar = screen.getByTestId("sidebar");
    const props = JSON.parse(sidebar.getAttribute("data-props") || "{}");

    expect(props.currentPath).toBe("/admin/posts");
    expect(typeof props.isCollapsed).toBe("boolean");
    expect(typeof props.isMobileOpen).toBe("boolean");
    expect(props.onToggle).toBe("function");
    expect(props.onMobileToggle).toBe("function");
  });

  it("renders children content in main area", () => {
    const testContent = (
      <div>
        <h1>Test Page</h1>
        <p>This is test content</p>
      </div>
    );

    render(<AdminLayout>{testContent}</AdminLayout>);

    expect(screen.getByText("Test Page")).toBeInTheDocument();
    expect(screen.getByText("This is test content")).toBeInTheDocument();
  });

  it("has proper layout structure", () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    // Check for main layout container
    const layoutContainer = container.querySelector(".min-h-screen.bg-gray-50");
    expect(layoutContainer).toBeInTheDocument();

    // Check for flex layout
    const flexContainer = container.querySelector(".flex");
    expect(flexContainer).toBeInTheDocument();

    // Check for main content area
    const mainContent = container.querySelector("main");
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass("flex-1", "p-4", "md:p-6");
  });

  it("provides sidebar context to children", () => {
    // This test verifies that the SidebarProvider is working
    render(
      <AdminLayout>
        <div data-testid="content">Content</div>
      </AdminLayout>
    );

    // If the context is working, the sidebar should render without errors
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("applies responsive classes correctly", () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    // Check for responsive padding on main content
    const mainElement = container.querySelector("main");
    expect(mainElement).toHaveClass("p-4", "md:p-6");
  });

  it("supports dark mode classes", () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const layoutContainer = container.querySelector(
      ".bg-gray-50.dark\\:bg-gray-900"
    );
    expect(layoutContainer).toBeInTheDocument();
  });
});
