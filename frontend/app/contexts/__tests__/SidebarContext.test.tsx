import { render, screen, fireEvent, act } from "@testing-library/react";
import { SidebarProvider, useSidebar } from "../SidebarContext";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component that uses the sidebar context
function TestComponent() {
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    toggleMobileOpen,
    closeMobile,
  } = useSidebar();

  return (
    <div>
      <div data-testid="collapsed-state">{isCollapsed.toString()}</div>
      <div data-testid="mobile-open-state">{isMobileOpen.toString()}</div>
      <button onClick={toggleCollapsed} data-testid="toggle-collapsed">
        Toggle Collapsed
      </button>
      <button onClick={toggleMobileOpen} data-testid="toggle-mobile">
        Toggle Mobile
      </button>
      <button onClick={closeMobile} data-testid="close-mobile">
        Close Mobile
      </button>
    </div>
  );
}

describe("SidebarContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    // Clean up any event listeners
    window.removeEventListener("resize", jest.fn());
  });

  it("provides default values", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");
  });

  it("loads collapsed state from localStorage on mount", () => {
    localStorageMock.getItem.mockReturnValue("true");

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith("sidebar-collapsed");
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
  });

  it("toggles collapsed state", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    const toggleButton = screen.getByTestId("toggle-collapsed");

    // Initial state should be false
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");

    // Toggle to true
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");

    // Toggle back to false
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
  });

  it("saves collapsed state to localStorage", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    const toggleButton = screen.getByTestId("toggle-collapsed");
    fireEvent.click(toggleButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "sidebar-collapsed",
      "true"
    );
  });

  it("toggles mobile open state", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    const toggleButton = screen.getByTestId("toggle-mobile");

    // Initial state should be false
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");

    // Toggle to true
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("true");

    // Toggle back to false
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");
  });

  it("closes mobile menu", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    const toggleButton = screen.getByTestId("toggle-mobile");
    const closeButton = screen.getByTestId("close-mobile");

    // Open mobile menu
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("true");

    // Close mobile menu
    fireEvent.click(closeButton);
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");
  });

  it("closes mobile menu on window resize to desktop", () => {
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    const toggleButton = screen.getByTestId("toggle-mobile");

    // Open mobile menu
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("true");

    // Simulate window resize to desktop size
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");
  });

  it("does not close mobile menu on resize if already closed", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    // Mobile menu should be closed initially
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");

    // Simulate window resize
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // Should still be closed
    expect(screen.getByTestId("mobile-open-state")).toHaveTextContent("false");
  });

  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useSidebar must be used within a SidebarProvider");

    consoleSpy.mockRestore();
  });

  it("handles localStorage errors gracefully", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("localStorage not available");
    });

    // Should not throw and should use default values
    expect(() => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      );
    }).not.toThrow();

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
  });

  it("handles invalid localStorage data gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid-json");

    // Should not throw and should use default values
    expect(() => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      );
    }).not.toThrow();

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
  });
});
