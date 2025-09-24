import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SystemMonitor from "../SystemMonitor";
import * as systemApi from "../../../../lib/systemApi";

// Mock the system API
jest.mock("../../../../lib/systemApi");
const mockSystemApi = systemApi as jest.Mocked<typeof systemApi>;

// Mock recharts components
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: any) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockMetrics = {
  serverHealth: "healthy" as const,
  uptime: 604800, // 7 days
  responseTime: 245,
  errorRate: 0.2,
  activeUsers: 23,
  memoryUsage: 68.5,
  cpuUsage: 34.2,
  diskUsage: 45.8,
  networkLatency: 15,
  lastUpdated: "2024-01-01T12:00:00Z",
};

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
];

describe("SystemMonitor", () => {
  beforeEach(() => {
    mockSystemApi.getSystemMetrics.mockResolvedValue(mockMetrics);
    mockSystemApi.getSystemLogs.mockResolvedValue(mockLogs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders system monitor with loading state initially", () => {
    render(<SystemMonitor />);

    // Should show loading skeleton initially
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("displays system metrics after loading", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("System Monitor")).toBeInTheDocument();
      expect(screen.getAllByText("Server Health")[0]).toBeInTheDocument();
      expect(screen.getByText("healthy")).toBeInTheDocument();
      expect(screen.getAllByText("Uptime")[0]).toBeInTheDocument();
      expect(screen.getByText("7d 0h 0m")).toBeInTheDocument();
      expect(screen.getAllByText("Active Users")[0]).toBeInTheDocument();
      expect(screen.getByText("23")).toBeInTheDocument();
    });
  });

  it("displays performance metrics with progress bars", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getAllByText("CPU Usage")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/34\.2%/)[0]).toBeInTheDocument();
      expect(screen.getAllByText("Memory Usage")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/68\.5%/)[0]).toBeInTheDocument();
      expect(screen.getAllByText("Disk Usage")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/45\.8%/)[0]).toBeInTheDocument();
      expect(screen.getAllByText("Error Rate")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/0\.20%/)[0]).toBeInTheDocument();
    });
  });

  it("handles refresh button click", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getAllByText("Refresh")[0]).toBeInTheDocument();
    });

    const refreshButtons = screen.getAllByText("Refresh");
    fireEvent.click(refreshButtons[0]);

    expect(mockSystemApi.getSystemMetrics).toHaveBeenCalledTimes(2);
    expect(mockSystemApi.getSystemLogs).toHaveBeenCalledTimes(2);
  });

  it("toggles auto-refresh functionality", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("Auto-refresh:")).toBeInTheDocument();
    });

    const autoRefreshToggle = screen.getByRole("switch", {
      name: /toggle auto-refresh/i,
    });
    fireEvent.click(autoRefreshToggle);

    // Auto-refresh should be toggled off
    expect(autoRefreshToggle).toHaveClass("bg-gray-200");
  });

  it("displays error state when API calls fail", async () => {
    mockSystemApi.getSystemMetrics.mockRejectedValue(new Error("API Error"));
    mockSystemApi.getSystemLogs.mockRejectedValue(new Error("API Error"));

    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading System Data")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load system monitoring data")
      ).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  it("handles try again button in error state", async () => {
    mockSystemApi.getSystemMetrics.mockRejectedValueOnce(
      new Error("API Error")
    );
    mockSystemApi.getSystemLogs.mockRejectedValueOnce(new Error("API Error"));

    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    // Reset mocks to return successful data
    mockSystemApi.getSystemMetrics.mockResolvedValue(mockMetrics);
    mockSystemApi.getSystemLogs.mockResolvedValue(mockLogs);

    const tryAgainButton = screen.getByText("Try Again");
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText("Server Health")).toBeInTheDocument();
    });
  });

  it("displays correct health status colors", async () => {
    const warningMetrics = { ...mockMetrics, serverHealth: "warning" as const };
    mockSystemApi.getSystemMetrics.mockResolvedValue(warningMetrics);

    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("warning")).toBeInTheDocument();
    });
  });

  it("formats uptime correctly for different durations", async () => {
    const shortUptimeMetrics = { ...mockMetrics, uptime: 3661 }; // 1h 1m 1s
    mockSystemApi.getSystemMetrics.mockResolvedValue(shortUptimeMetrics);

    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("1h 1m")).toBeInTheDocument();
    });
  });

  it("shows performance charts component", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("Performance Charts")).toBeInTheDocument();
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  it("shows system logs viewer component", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText("System Logs")).toBeInTheDocument();
      expect(
        screen.getByText("User authentication successful")
      ).toBeInTheDocument();
      expect(screen.getByText("Connection timeout")).toBeInTheDocument();
    });
  });

  it("displays last updated timestamp", async () => {
    render(<SystemMonitor />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });
});
