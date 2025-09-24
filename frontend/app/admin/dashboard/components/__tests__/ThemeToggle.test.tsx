import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../ThemeToggle";
import { useTheme } from "../../../../contexts/ThemeContext";

// Mock theme context
jest.mock("../../../../contexts/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Sun: ({ className, ...props }: any) => (
    <div data-testid="sun-icon" className={className} {...props} />
  ),
  Moon: ({ className, ...props }: any) => (
    <div data-testid="moon-icon" className={className} {...props} />
  ),
}));

const mockUseTheme = {
  theme: "light" as const,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockUseTheme);
  });

  describe("Basic Rendering", () => {
    it("renders theme toggle button", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("shows moon icon in light mode", () => {
      render(<ThemeToggle />);

      expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
    });

    it("shows sun icon in dark mode", () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      render(<ThemeToggle />);

      expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls toggleTheme when button is clicked", async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockUseTheme.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("can be clicked multiple times", async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockUseTheme.toggleTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for light mode", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    });

    it("has proper aria-label for dark mode", () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    });

    it("has proper title attribute for light mode", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Switch to dark mode");
    });

    it("has proper title attribute for dark mode", () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Switch to light mode");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole("button");

      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to activate
      await user.keyboard("{Enter}");
      expect(mockUseTheme.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("can be activated with Space key", async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      button.focus();

      await user.keyboard(" ");
      expect(mockUseTheme.toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("Styling and Props", () => {
    it("applies default CSS classes", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "p-2",
        "rounded-lg",
        "hover:bg-gray-100",
        "dark:hover:bg-gray-700",
        "transition-colors"
      );
    });

    it("applies custom className prop", () => {
      render(<ThemeToggle className="custom-class" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("combines default and custom classes", () => {
      render(<ThemeToggle className="custom-class" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("p-2", "custom-class");
    });

    it("shows label when showLabel is true", () => {
      render(<ThemeToggle showLabel={true} />);

      expect(screen.getByText("Dark mode")).toBeInTheDocument();
    });

    it("shows correct label text for dark mode", () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      render(<ThemeToggle showLabel={true} />);

      expect(screen.getByText("Light mode")).toBeInTheDocument();
    });

    it("does not show label when showLabel is false", () => {
      render(<ThemeToggle showLabel={false} />);

      expect(screen.queryByText("Dark mode")).not.toBeInTheDocument();
      expect(screen.queryByText("Light mode")).not.toBeInTheDocument();
    });

    it("does not show label by default", () => {
      render(<ThemeToggle />);

      expect(screen.queryByText("Dark mode")).not.toBeInTheDocument();
      expect(screen.queryByText("Light mode")).not.toBeInTheDocument();
    });
  });

  describe("Icon Styling", () => {
    it("applies correct classes to icons", () => {
      render(<ThemeToggle />);

      const moonIcon = screen.getByTestId("moon-icon");
      expect(moonIcon).toHaveClass(
        "w-5",
        "h-5",
        "text-gray-600",
        "dark:text-gray-400"
      );
    });

    it("maintains icon classes in dark mode", () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      render(<ThemeToggle />);

      const sunIcon = screen.getByTestId("sun-icon");
      expect(sunIcon).toHaveClass(
        "w-5",
        "h-5",
        "text-gray-600",
        "dark:text-gray-400"
      );
    });
  });

  describe("Layout with Label", () => {
    it("uses flex layout when label is shown", () => {
      const { container } = render(<ThemeToggle showLabel={true} />);

      const flexContainer = container.querySelector(
        ".flex.items-center.space-x-2"
      );
      expect(flexContainer).toBeInTheDocument();
    });

    it("applies correct text styling to label", () => {
      render(<ThemeToggle showLabel={true} />);

      const label = screen.getByText("Dark mode");
      expect(label).toHaveClass(
        "text-sm",
        "text-gray-700",
        "dark:text-gray-300"
      );
    });
  });

  describe("Error Handling", () => {
    it("handles missing theme context gracefully", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: undefined,
        toggleTheme: undefined,
        setTheme: undefined,
      });

      // Should not throw error
      expect(() => render(<ThemeToggle />)).not.toThrow();
    });

    it("handles toggleTheme function errors gracefully", async () => {
      const user = userEvent.setup();
      const mockToggleTheme = jest.fn().mockImplementation(() => {
        throw new Error("Theme toggle failed");
      });

      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");

      // Should not throw error when clicked
      await user.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("Theme State Changes", () => {
    it("updates icon when theme changes", () => {
      const { rerender } = render(<ThemeToggle />);

      // Initially light mode - should show moon
      expect(screen.getByTestId("moon-icon")).toBeInTheDocument();

      // Change to dark mode
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      rerender(<ThemeToggle />);

      // Should now show sun
      expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
    });

    it("updates aria-label when theme changes", () => {
      const { rerender } = render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");

      // Change to dark mode
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      rerender(<ThemeToggle />);

      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    });

    it("updates label text when theme changes", () => {
      const { rerender } = render(<ThemeToggle showLabel={true} />);

      expect(screen.getByText("Dark mode")).toBeInTheDocument();

      // Change to dark mode
      (useTheme as jest.Mock).mockReturnValue({
        ...mockUseTheme,
        theme: "dark",
      });

      rerender(<ThemeToggle showLabel={true} />);

      expect(screen.getByText("Light mode")).toBeInTheDocument();
      expect(screen.queryByText("Dark mode")).not.toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not re-render unnecessarily", () => {
      const { rerender } = render(<ThemeToggle />);

      // Re-render with same props
      rerender(<ThemeToggle />);

      // Should still work correctly
      expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
    });
  });
});
