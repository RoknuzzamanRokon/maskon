import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MetricCard from "../MetricCard";
import { TrendingUp } from "lucide-react";

describe("MetricCard", () => {
  const defaultProps = {
    title: "Total Posts",
    value: 150,
  };

  it("renders basic metric card with title and value", () => {
    render(<MetricCard {...defaultProps} />);

    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("formats numeric values with locale string", () => {
    render(<MetricCard {...defaultProps} value={1500} />);

    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("displays string values as-is", () => {
    render(<MetricCard {...defaultProps} value="Active" />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders trend indicator for increase", () => {
    const props = {
      ...defaultProps,
      change: {
        value: 12.5,
        type: "increase" as const,
        period: "vs last month",
      },
    };

    render(<MetricCard {...props} />);

    expect(screen.getByText("12.5%")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();

    // Check for trending up icon (by checking for green color class)
    const trendElement = screen.getByText("12.5%").closest("div");
    expect(trendElement).toHaveClass("text-green-600");
  });

  it("renders trend indicator for decrease", () => {
    const props = {
      ...defaultProps,
      change: {
        value: 8.2,
        type: "decrease" as const,
      },
    };

    render(<MetricCard {...props} />);

    expect(screen.getByText("8.2%")).toBeInTheDocument();

    // Check for red color class indicating decrease
    const trendElement = screen.getByText("8.2%").closest("div");
    expect(trendElement).toHaveClass("text-red-600");
  });

  it("renders trend indicator for neutral change", () => {
    const props = {
      ...defaultProps,
      change: {
        value: 0,
        type: "neutral" as const,
      },
    };

    render(<MetricCard {...props} />);

    expect(screen.getByText("0%")).toBeInTheDocument();

    // Check for gray color class indicating neutral
    const trendElement = screen.getByText("0%").closest("div");
    expect(trendElement).toHaveClass("text-gray-600");
  });

  it("renders custom icon when provided", () => {
    const props = {
      ...defaultProps,
      icon: TrendingUp,
    };

    render(<MetricCard {...props} />);

    // Check that an icon is rendered (TrendingUp icon should be present)
    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });

  it("displays loading state correctly", () => {
    render(<MetricCard {...defaultProps} loading={true} />);

    // Should not show actual content when loading
    expect(screen.queryByText("Total Posts")).not.toBeInTheDocument();
    expect(screen.queryByText("150")).not.toBeInTheDocument();

    // Should show loading skeleton
    const loadingElement = document.querySelector(".animate-pulse");
    expect(loadingElement).toBeInTheDocument();
  });

  it("handles click events when onClick is provided", () => {
    const handleClick = jest.fn();
    const props = {
      ...defaultProps,
      onClick: handleClick,
    };

    render(<MetricCard {...props} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not have button role when onClick is not provided", () => {
    render(<MetricCard {...defaultProps} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const props = {
      ...defaultProps,
      className: "custom-class",
    };

    render(<MetricCard {...props} />);

    const card = document.querySelector(".custom-class");
    expect(card).toBeInTheDocument();
  });

  it("has proper accessibility attributes for clickable cards", () => {
    const handleClick = jest.fn();
    const props = {
      ...defaultProps,
      onClick: handleClick,
    };

    render(<MetricCard {...props} />);

    const card = screen.getByRole("button");
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("hover:border-blue-300");
  });

  it("displays uppercase title with proper styling", () => {
    render(<MetricCard {...defaultProps} />);

    const title = screen.getByText("Total Posts");
    expect(title).toHaveClass("uppercase");
    expect(title).toHaveClass("tracking-wide");
    expect(title).toHaveClass("text-sm");
  });

  it("handles edge case with undefined change period", () => {
    const props = {
      ...defaultProps,
      change: {
        value: 5.5,
        type: "increase" as const,
        // period is undefined
      },
    };

    render(<MetricCard {...props} />);

    expect(screen.getByText("5.5%")).toBeInTheDocument();
    expect(screen.queryByText("vs last month")).not.toBeInTheDocument();
  });
});
