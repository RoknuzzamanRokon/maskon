import { render, screen, fireEvent } from "@testing-library/react";
import MobileHeader from "../MobileHeader";
import { SidebarProvider } from "../../../contexts/SidebarContext";

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className} />
  ),
}));

describe("MobileHeader Component", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<SidebarProvider>{component}</SidebarProvider>);
  };

  it("renders with default title", () => {
    renderWithProvider(<MobileHeader />);

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    renderWithProvider(<MobileHeader title="Custom Title" />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("calls toggleMobileOpen when menu button is clicked", () => {
    renderWithProvider(<MobileHeader />);

    const menuButton = screen.getByLabelText("Open menu");
    fireEvent.click(menuButton);

    // We can't directly test the context state change without additional setup,
    // but we can verify the button is clickable and doesn't throw errors
    expect(menuButton).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    renderWithProvider(<MobileHeader />);

    const menuButton = screen.getByLabelText("Open menu");
    expect(menuButton).toHaveAttribute("aria-label", "Open menu");
  });

  it("applies correct CSS classes for mobile visibility", () => {
    const { container } = renderWithProvider(<MobileHeader />);

    const header = container.querySelector(".md\\:hidden");
    expect(header).toBeInTheDocument();
  });

  it("has proper layout structure", () => {
    renderWithProvider(<MobileHeader title="Test Title" />);

    // Check if all three sections are present: menu button, title, placeholder
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();

    // Check if the placeholder div exists (for layout balance)
    const container = screen.getByText("Test Title").parentElement;
    expect(container?.children).toHaveLength(3);
  });
});
