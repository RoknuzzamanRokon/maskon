import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  DashboardSkeleton,
  MetricCardSkeleton,
  ActivityFeedSkeleton,
  TableSkeleton,
  ChartSkeleton,
  FormSkeleton,
  NotificationSkeleton,
  LoadingSpinner,
  FullPageLoader,
  InlineLoader,
} from "../LoadingStates";

describe("DashboardSkeleton", () => {
  it("renders dashboard skeleton with correct structure", () => {
    render(<DashboardSkeleton />);

    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-skeleton")).toHaveClass(
      "animate-pulse"
    );
  });
});

describe("MetricCardSkeleton", () => {
  it("renders metric card skeleton", () => {
    render(<MetricCardSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-white", "dark:bg-gray-800");
  });
});

describe("ActivityFeedSkeleton", () => {
  it("renders activity feed skeleton with multiple items", () => {
    render(<ActivityFeedSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-white", "dark:bg-gray-800");
  });
});

describe("TableSkeleton", () => {
  it("renders table skeleton with default rows and columns", () => {
    render(<TableSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-white", "dark:bg-gray-800");
  });

  it("renders table skeleton with custom rows and columns", () => {
    render(<TableSkeleton rows={3} columns={2} />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
  });
});

describe("ChartSkeleton", () => {
  it("renders chart skeleton", () => {
    render(<ChartSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-white", "dark:bg-gray-800");
  });
});

describe("FormSkeleton", () => {
  it("renders form skeleton", () => {
    render(<FormSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-white", "dark:bg-gray-800");
  });
});

describe("NotificationSkeleton", () => {
  it("renders notification skeleton", () => {
    render(<NotificationSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-white", "dark:bg-gray-800");
  });
});

describe("LoadingSpinner", () => {
  it("renders with default size", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("generic");
    expect(spinner).toHaveClass("animate-spin", "w-6", "h-6");
  });

  it("renders with small size", () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByRole("generic");
    expect(spinner).toHaveClass("animate-spin", "w-4", "h-4");
  });

  it("renders with large size", () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole("generic");
    expect(spinner).toHaveClass("animate-spin", "w-8", "h-8");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="text-blue-500" />);

    const spinner = screen.getByRole("generic");
    expect(spinner).toHaveClass("text-blue-500");
  });
});

describe("FullPageLoader", () => {
  it("renders with default message", () => {
    render(<FullPageLoader />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
    expect(screen.getByRole("generic")).toHaveClass("animate-spin");
  });

  it("renders with custom message", () => {
    render(<FullPageLoader message="Loading data..." />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });
});

describe("InlineLoader", () => {
  it("renders with default message", () => {
    render(<InlineLoader />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("generic")).toHaveClass("animate-spin");
  });

  it("renders with custom message", () => {
    render(<InlineLoader message="Processing..." />);

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<InlineLoader className="my-custom-class" />);

    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
