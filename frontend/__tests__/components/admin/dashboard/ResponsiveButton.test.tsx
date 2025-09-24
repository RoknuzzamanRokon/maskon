import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ResponsiveButton,
  ResponsiveIconButton,
} from "../../../../app/admin/dashboard/components/ResponsiveButton";

describe("ResponsiveButton", () => {
  it("should render children correctly", () => {
    render(<ResponsiveButton>Click me</ResponsiveButton>);

    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();

    render(<ResponsiveButton onClick={handleClick}>Click me</ResponsiveButton>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply correct variant classes", () => {
    const { container } = render(
      <ResponsiveButton variant="primary">Primary Button</ResponsiveButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass(
      "bg-blue-600",
      "hover:bg-blue-700",
      "text-white"
    );
  });

  it("should apply correct size classes", () => {
    const { container } = render(
      <ResponsiveButton size="lg">Large Button</ResponsiveButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("px-6", "py-3", "text-base");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<ResponsiveButton disabled>Disabled Button</ResponsiveButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
  });

  it("should show loading state", () => {
    render(<ResponsiveButton loading>Loading Button</ResponsiveButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    // Check for loading spinner
    const spinner = button.querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("should apply fullWidth class when fullWidth is true", () => {
    const { container } = render(
      <ResponsiveButton fullWidth>Full Width Button</ResponsiveButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("w-full");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ResponsiveButton className="custom-button">
        Custom Button
      </ResponsiveButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("custom-button");
  });

  it("should set correct button type", () => {
    render(<ResponsiveButton type="submit">Submit Button</ResponsiveButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should apply touch-friendly classes", () => {
    const { container } = render(
      <ResponsiveButton>Touch Button</ResponsiveButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass(
      "min-h-touch",
      "min-w-touch",
      "touch-manipulation"
    );
  });
});

describe("ResponsiveIconButton", () => {
  it("should render icon correctly", () => {
    render(
      <ResponsiveIconButton ariaLabel="Settings">
        <span>⚙️</span>
      </ResponsiveIconButton>
    );

    const button = screen.getByRole("button", { name: "Settings" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("⚙️")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();

    render(
      <ResponsiveIconButton onClick={handleClick} ariaLabel="Click me">
        <span>🔥</span>
      </ResponsiveIconButton>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply correct variant classes", () => {
    const { container } = render(
      <ResponsiveIconButton variant="primary" ariaLabel="Primary icon">
        <span>✓</span>
      </ResponsiveIconButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass(
      "bg-blue-600",
      "hover:bg-blue-700",
      "text-white"
    );
  });

  it("should apply correct size classes", () => {
    const { container } = render(
      <ResponsiveIconButton size="lg" ariaLabel="Large icon">
        <span>📱</span>
      </ResponsiveIconButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("p-3");
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <ResponsiveIconButton disabled ariaLabel="Disabled icon">
        <span>❌</span>
      </ResponsiveIconButton>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ResponsiveIconButton
        className="custom-icon-button"
        ariaLabel="Custom icon"
      >
        <span>🎨</span>
      </ResponsiveIconButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("custom-icon-button");
  });

  it("should set title attribute", () => {
    render(
      <ResponsiveIconButton ariaLabel="Help" title="Get help">
        <span>❓</span>
      </ResponsiveIconButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Get help");
  });

  it("should apply touch-friendly classes", () => {
    const { container } = render(
      <ResponsiveIconButton ariaLabel="Touch icon">
        <span>👆</span>
      </ResponsiveIconButton>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass(
      "min-h-touch",
      "min-w-touch",
      "touch-manipulation"
    );
  });
});
