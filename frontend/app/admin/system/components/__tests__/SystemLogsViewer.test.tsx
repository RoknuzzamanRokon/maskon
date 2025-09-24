import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SystemLogsViewer from "../SystemLogsViewer";

const mockLogs = [
  {
    id: "log_1",
    timestamp: "2024-01-01T12:00:00Z",
    level: "info" as const,
    source: "api",
    message: "User authentication successful",
    userId: "user_123",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log_2",
    timestamp: "2024-01-01T11:59:00Z",
    level: "error" as const,
    source: "database",
    message: "Connection timeout",
    details: "Stack trace information here",
  },
  {
    id: "log_3",
    timestamp: "2024-01-01T11:58:00Z",
    level: "warning" as const,
    source: "cache",
    message: "High memory usage detected",
  },
  {
    id: "log_4",
    timestamp: "2024-01-01T11:57:00Z",
    level: "debug" as const,
    source: "scheduler",
    message: "Background job queued",
  },
];

const mockOnRefresh = jest.fn();

// Mock URL.createObjectURL for CSV export
Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: jest.fn(() => "mock-url"),
    revokeObjectURL: jest.fn(),
  },
});

// Mock document.createElement for CSV export
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(document, "createElement", {
  value: jest.fn(() => ({
    href: "",
    download: "",
    click: mockClick,
  })),
});

Object.defineProperty(document.body, "appendChild", {
  value: mockAppendChild,
});

Object.defineProperty(document.body, "removeChild", {
  value: mockRemoveChild,
});

describe("SystemLogsViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders system logs viewer with logs", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("System Logs")).toBeInTheDocument();
    expect(
      screen.getByText("User authentication successful")
    ).toBeInTheDocument();
    expect(screen.getByText("Connection timeout")).toBeInTheDocument();
    expect(screen.getByText("High memory usage detected")).toBeInTheDocument();
    expect(screen.getByText("Background job queued")).toBeInTheDocument();
  });

  it("displays log metadata correctly", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("INFO")).toBeInTheDocument();
    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText("DEBUG")).toBeInTheDocument();

    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("database")).toBeInTheDocument();
    expect(screen.getByText("cache")).toBeInTheDocument();
    expect(screen.getByText("scheduler")).toBeInTheDocument();
  });

  it("shows user and IP information when available", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("User: user_123")).toBeInTheDocument();
    expect(screen.getByText("IP: 192.168.1.100")).toBeInTheDocument();
  });

  it("toggles filters visibility", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    const filtersButton = screen.getByText("Filters");

    // Filters should be hidden initially
    expect(
      screen.queryByPlaceholderText("Search logs...")
    ).not.toBeInTheDocument();

    fireEvent.click(filtersButton);

    // Filters should be visible after clicking
    expect(screen.getByPlaceholderText("Search logs...")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All")).toBeInTheDocument();
  });

  it("filters logs by search term", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Open filters
    fireEvent.click(screen.getByText("Filters"));

    const searchInput = screen.getByPlaceholderText("Search logs...");
    fireEvent.change(searchInput, { target: { value: "authentication" } });

    // Should only show the authentication log
    expect(
      screen.getByText("User authentication successful")
    ).toBeInTheDocument();
    expect(screen.queryByText("Connection timeout")).not.toBeInTheDocument();
  });

  it("filters logs by level", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Open filters
    fireEvent.click(screen.getByText("Filters"));

    const levelSelect = screen.getAllByDisplayValue("All")[0]; // First select is level
    fireEvent.change(levelSelect, { target: { value: "error" } });

    // Should only show error logs
    expect(screen.getByText("Connection timeout")).toBeInTheDocument();
    expect(
      screen.queryByText("User authentication successful")
    ).not.toBeInTheDocument();
  });

  it("filters logs by source", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Open filters
    fireEvent.click(screen.getByText("Filters"));

    const sourceSelect = screen.getAllByDisplayValue("All")[1]; // Second select is source
    fireEvent.change(sourceSelect, { target: { value: "api" } });

    // Should only show API logs
    expect(
      screen.getByText("User authentication successful")
    ).toBeInTheDocument();
    expect(screen.queryByText("Connection timeout")).not.toBeInTheDocument();
  });

  it("expands log details when available", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Find the error log with details
    const errorLogContainer = screen
      .getByText("Connection timeout")
      .closest("div");
    const expandButton = errorLogContainer?.querySelector("button");

    expect(expandButton).toBeInTheDocument();

    // Details should not be visible initially
    expect(
      screen.queryByText("Stack trace information here")
    ).not.toBeInTheDocument();

    if (expandButton) {
      fireEvent.click(expandButton);
    }

    // Details should be visible after clicking
    expect(
      screen.getByText("Stack trace information here")
    ).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button is clicked", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it("exports logs to CSV", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it("displays log count summary", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("Showing 4 of 4 logs")).toBeInTheDocument();
    expect(screen.getByText("Errors: 1")).toBeInTheDocument();
    expect(screen.getByText("Warnings: 1")).toBeInTheDocument();
    expect(screen.getByText("Info: 1")).toBeInTheDocument();
  });

  it("shows empty state when no logs match filters", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Open filters and search for something that doesn't exist
    fireEvent.click(screen.getByText("Filters"));
    const searchInput = screen.getByPlaceholderText("Search logs...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText("No logs found matching your criteria")
    ).toBeInTheDocument();
  });

  it("displays correct log level icons and colors", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Check that different log levels have different styling
    const infoLog = screen
      .getByText("User authentication successful")
      .closest("div");
    const errorLog = screen.getByText("Connection timeout").closest("div");
    const warningLog = screen
      .getByText("High memory usage detected")
      .closest("div");

    expect(infoLog).toHaveClass("bg-blue-50");
    expect(errorLog).toHaveClass("bg-red-50");
    expect(warningLog).toHaveClass("bg-yellow-50");
  });

  it("formats timestamps correctly", () => {
    render(<SystemLogsViewer logs={mockLogs} onRefresh={mockOnRefresh} />);

    // Check that timestamps are formatted as locale strings
    const timestamp = new Date("2024-01-01T12:00:00Z").toLocaleString();
    expect(screen.getByText(timestamp)).toBeInTheDocument();
  });
});
