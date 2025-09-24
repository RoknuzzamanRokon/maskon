import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  DashboardErrorBoundary,
  ComponentErrorBoundary,
  ErrorFallback,
  InlineError,
  NetworkErrorFallback,
} from "../ErrorBoundary";

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("DashboardErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <DashboardErrorBoundary>
        <div>Test content</div>
      </DashboardErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    render(
      <DashboardErrorBoundary>
        <ThrowError />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an error while loading the dashboard/)
    ).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <DashboardErrorBoundary fallback={customFallback}>
        <ThrowError />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("allows retry functionality", () => {
    const { rerender } = render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const retryButton = screen.getByText("Try Again");
    fireEvent.click(retryButton);

    // Rerender with no error
    rerender(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={false} />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("shows refresh page button", () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <DashboardErrorBoundary>
        <ThrowError />
      </DashboardErrorBoundary>
    );

    const refreshButton = screen.getByText("Refresh Page");
    fireEvent.click(refreshButton);

    expect(mockReload).toHaveBeenCalled();
  });
});

describe("ComponentErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ComponentErrorBoundary>
        <div>Component content</div>
      </ComponentErrorBoundary>
    );

    expect(screen.getByText("Component content")).toBeInTheDocument();
  });

  it("renders error fallback when child component throws", () => {
    render(
      <ComponentErrorBoundary>
        <ThrowError />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText("Component Error")).toBeInTheDocument();
  });
});

describe("ErrorFallback", () => {
  it("renders with default props", () => {
    render(<ErrorFallback />);

    expect(screen.getByText("Error loading content")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  it("renders with custom error message", () => {
    const error = new Error("Custom error message");
    render(<ErrorFallback error={error} />);

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<ErrorFallback title="Custom Title" />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("calls resetError when retry button is clicked", () => {
    const mockReset = jest.fn();
    render(<ErrorFallback resetError={mockReset} />);

    const retryButton = screen.getByText("Try Again");
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalled();
  });

  it("does not render retry button when resetError is not provided", () => {
    render(<ErrorFallback />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });
});

describe("InlineError", () => {
  it("renders with error message", () => {
    const error = new Error("Inline error message");
    render(<InlineError error={error} />);

    expect(screen.getByText("Inline error message")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<InlineError message="Custom inline message" />);

    expect(screen.getByText("Custom inline message")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const mockRetry = jest.fn();
    render(<InlineError message="Error" onRetry={mockRetry} />);

    const retryButton = screen.getByTitle("Retry");
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalled();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<InlineError message="Error" />);

    expect(screen.queryByTitle("Retry")).not.toBeInTheDocument();
  });
});

describe("NetworkErrorFallback", () => {
  it("renders with default props", () => {
    render(<NetworkErrorFallback />);

    expect(screen.getByText("Network Error")).toBeInTheDocument();
    expect(
      screen.getByText(/Unable to connect to the server/)
    ).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<NetworkErrorFallback title="Connection Failed" />);

    expect(screen.getByText("Connection Failed")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const mockRetry = jest.fn();
    render(<NetworkErrorFallback onRetry={mockRetry} />);

    const retryButton = screen.getByText("Try Again");
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalled();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<NetworkErrorFallback />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });
});
