import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PerformanceCharts from "../PerformanceCharts";

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
  uptime: 604800,
  responseTime: 245,
  errorRate: 0.2,
  activeUsers: 23,
  memoryUsage: 68.5,
  cpuUsage: 34.2,
  diskUsage: 45.8,
  networkLatency: 15,
  lastUpdated: "2024-01-01T12:00:00Z",
};

describe("PerformanceCharts", () => {
  it("renders performance charts component", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    expect(screen.getByText("Performance Charts")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders metric selection buttons", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText("Memory")).toBeInTheDocument();
    expect(screen.getByText("Response")).toBeInTheDocument();
    expect(screen.getByText("Errors")).toBeInTheDocument();
  });

  it("defaults to CPU metric selection", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    const cpuButton = screen.getByText("CPU");
    expect(cpuButton).toHaveClass("bg-blue-100");
  });

  it("switches between different metrics", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    const memoryButton = screen.getByText("Memory");
    fireEvent.click(memoryButton);

    expect(memoryButton).toHaveClass("bg-green-100");
    expect(screen.getByText("CPU")).not.toHaveClass("bg-blue-100");
  });

  it("displays current metric values", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    expect(screen.getByText("Current CPU")).toBeInTheDocument();
    expect(screen.getByText("34.2%")).toBeInTheDocument();
    expect(screen.getByText("Current Memory")).toBeInTheDocument();
    expect(screen.getByText("68.5%")).toBeInTheDocument();
    expect(screen.getByText("Response Time")).toBeInTheDocument();
    expect(screen.getByText("245ms")).toBeInTheDocument();
    expect(screen.getByText("Error Rate")).toBeInTheDocument();
    expect(screen.getByText("0.20%")).toBeInTheDocument();
  });

  it("shows loading state when no data is available", () => {
    render(<PerformanceCharts metrics={null} />);

    expect(
      screen.getByText("Collecting performance data...")
    ).toBeInTheDocument();
  });

  it("updates chart data when metrics change", () => {
    const { rerender } = render(<PerformanceCharts metrics={mockMetrics} />);

    const updatedMetrics = {
      ...mockMetrics,
      cpuUsage: 45.5,
      memoryUsage: 72.3,
    };

    rerender(<PerformanceCharts metrics={updatedMetrics} />);

    expect(screen.getByText("45.5%")).toBeInTheDocument();
    expect(screen.getByText("72.3%")).toBeInTheDocument();
  });

  it("applies correct styling for different metric buttons", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    fireEvent.click(screen.getByText("Memory"));
    expect(screen.getByText("Memory")).toHaveClass("bg-green-100");

    fireEvent.click(screen.getByText("Response"));
    expect(screen.getByText("Response")).toHaveClass("bg-yellow-100");

    fireEvent.click(screen.getByText("Errors"));
    expect(screen.getByText("Errors")).toHaveClass("bg-red-100");
  });

  it("renders chart components when data is available", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    // After metrics are provided, chart components should be rendered
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("handles null metrics gracefully", () => {
    render(<PerformanceCharts metrics={null} />);

    expect(screen.getByText("Performance Charts")).toBeInTheDocument();
    expect(
      screen.getByText("Collecting performance data...")
    ).toBeInTheDocument();

    // Current values should show undefined or default values
    expect(screen.queryByText("34.2%")).not.toBeInTheDocument();
  });

  it("maintains metric selection state across renders", () => {
    const { rerender } = render(<PerformanceCharts metrics={mockMetrics} />);

    // Select memory metric
    fireEvent.click(screen.getByText("Memory"));
    expect(screen.getByText("Memory")).toHaveClass("bg-green-100");

    // Re-render with updated metrics
    const updatedMetrics = { ...mockMetrics, cpuUsage: 50 };
    rerender(<PerformanceCharts metrics={updatedMetrics} />);

    // Memory should still be selected
    expect(screen.getByText("Memory")).toHaveClass("bg-green-100");
  });

  it("displays metric values with correct units", () => {
    render(<PerformanceCharts metrics={mockMetrics} />);

    // CPU, Memory, and Error Rate should show percentages
    expect(screen.getByText("34.2%")).toBeInTheDocument();
    expect(screen.getByText("68.5%")).toBeInTheDocument();
    expect(screen.getByText("0.20%")).toBeInTheDocument();

    // Response time should show milliseconds
    expect(screen.getByText("245ms")).toBeInTheDocument();
  });
});
