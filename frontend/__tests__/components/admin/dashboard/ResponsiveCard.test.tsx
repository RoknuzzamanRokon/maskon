import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveStack,
} from "../../../../app/admin/dashboard/components/ResponsiveCard";

describe("ResponsiveCard", () => {
  it("should render children correctly", () => {
    render(
      <ResponsiveCard>
        <div>Test Content</div>
      </ResponsiveCard>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should apply correct padding classes", () => {
    const { container } = render(
      <ResponsiveCard padding="lg">
        <div>Test Content</div>
      </ResponsiveCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("p-6", "sm:p-8");
  });

  it("should apply correct variant classes", () => {
    const { container } = render(
      <ResponsiveCard variant="elevated">
        <div>Test Content</div>
      </ResponsiveCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("shadow-lg");
  });

  it("should render as button when onClick is provided", () => {
    const handleClick = jest.fn();

    render(
      <ResponsiveCard onClick={handleClick} ariaLabel="Click me">
        <div>Clickable Content</div>
      </ResponsiveCard>
    );

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render as div when onClick is not provided", () => {
    const { container } = render(
      <ResponsiveCard>
        <div>Static Content</div>
      </ResponsiveCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.tagName).toBe("DIV");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ResponsiveCard className="custom-class">
        <div>Test Content</div>
      </ResponsiveCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("custom-class");
  });
});

describe("ResponsiveGrid", () => {
  it("should render children in grid layout", () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ResponsiveGrid>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("should apply correct grid classes", () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 3 }}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("grid");
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("sm:grid-cols-2");
    expect(grid).toHaveClass("lg:grid-cols-3");
  });

  it("should apply correct gap classes", () => {
    const { container } = render(
      <ResponsiveGrid gap="lg">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("gap-6", "sm:gap-8");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ResponsiveGrid className="custom-grid">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("custom-grid");
  });
});

describe("ResponsiveStack", () => {
  it("should render children in vertical stack", () => {
    render(
      <ResponsiveStack>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ResponsiveStack>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("should apply correct spacing classes", () => {
    const { container } = render(
      <ResponsiveStack spacing="lg">
        <div>Item 1</div>
      </ResponsiveStack>
    );

    const stack = container.firstChild as HTMLElement;
    expect(stack).toHaveClass("space-y-6", "sm:space-y-8");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ResponsiveStack className="custom-stack">
        <div>Item 1</div>
      </ResponsiveStack>
    );

    const stack = container.firstChild as HTMLElement;
    expect(stack).toHaveClass("custom-stack");
  });
});
