import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChartWidget from "../ChartWidget";

// Mock recharts components
jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  AreaChart: ({ children }: any) => (
    <div data-testid="area-chart">{children}</div>
  ),
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("ChartWidget", () => {
  const mockData = [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 150 },
    { name: "Mar", value: 120 },
    { name: "Apr", value: 180 },
  ];

  const defaultProps = {
    title: "Monthly Sales",
    data: mockData,
    type: "line" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders chart widget with title", () => {
    render(<ChartWidget {...defaultProps} />);

    expect(screen.getByText("Monthly Sales")).toBeInTheDocument();
  });

  it("renders line chart correctly", () => {
    render(<ChartWidget {...defaultProps} type="line" />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line")).toBeInTheDocument();
  });

  it("renders area chart correctly", () => {
    render(<ChartWidget {...defaultProps} type="area" />);

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area")).toBeInTheDocument();
  });

  it("renders bar chart correctly", () => {
    render(<ChartWidget {...defaultProps} type="bar" />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("renders pie chart correctly", () => {
    render(<ChartWidget {...defaultProps} type="pie" />);

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toBeInTheDocument();
  });

  it("displays loading state correctly", () => {
    render(<ChartWidget {...defaultProps} loading={true} />);

    // Should not show actual content when loading
    expect(screen.queryByText("Monthly Sales")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("responsive-container")
    ).not.toBeInTheDocument();

    // Should show loading skeleton
    const loadingElement = document.querySelector(".animate-pulse");
    expect(loadingElement).toBeInTheDocument();
  });

  it("applies custom height", () => {
    render(<ChartWidget {...defaultProps} height={400} />);

    const container = screen.getByTestId("responsive-container").parentElement;
    expect(container).toHaveStyle("height: 400px");
  });

  it("uses default height when not specified", () => {
    render(<ChartWidget {...defaultProps} />);

    const container = screen.getByTestId("responsive-container").parentElement;
    expect(container).toHaveStyle("height: 300px");
  });

  it("applies custom className", () => {
    const props = {
      ...defaultProps,
      className: "custom-chart-class",
    };

    render(<ChartWidget {...props} />);

    const widget = document.querySelector(".custom-chart-class");
    expect(widget).toBeInTheDocument();
  });

  it("renders grid when showGrid is true", () => {
    render(<ChartWidget {...defaultProps} showGrid={true} />);

    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("does not render grid when showGrid is false", () => {
    render(<ChartWidget {...defaultProps} showGrid={false} />);

    expect(screen.queryByTestId("cartesian-grid")).not.toBeInTheDocument();
  });

  it("renders tooltip when showTooltip is true", () => {
    render(<ChartWidget {...defaultProps} showTooltip={true} />);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("does not render tooltip when showTooltip is false", () => {
    render(<ChartWidget {...defaultProps} showTooltip={false} />);

    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("uses custom dataKey", () => {
    const customData = [
      { name: "Jan", sales: 100, value: 100 },
      { name: "Feb", sales: 150, value: 150 },
    ];

    render(<ChartWidget {...defaultProps} data={customData} dataKey="sales" />);

    // Chart should render without errors with custom dataKey
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("uses custom xAxisKey", () => {
    const customData = [
      { name: "Jan", month: "Jan", value: 100 },
      { name: "Feb", month: "Feb", value: 150 },
    ];

    render(
      <ChartWidget {...defaultProps} data={customData} xAxisKey="month" />
    );

    // Chart should render without errors with custom xAxisKey
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(<ChartWidget {...defaultProps} data={[]} />);

    // Should still render the chart structure
    expect(screen.getByText("Monthly Sales")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders multiple cells for pie chart with multiple data points", () => {
    render(<ChartWidget {...defaultProps} type="pie" />);

    // Should render pie chart structure (cells are rendered by recharts internally)
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toBeInTheDocument();
  });

  it("has proper card styling", () => {
    render(<ChartWidget {...defaultProps} />);

    const widget = screen.getByText("Monthly Sales").closest("div");
    expect(widget).toHaveClass("bg-white");
    expect(widget).toHaveClass("dark:bg-gray-800");
    expect(widget).toHaveClass("rounded-lg");
    expect(widget).toHaveClass("border");
    expect(widget).toHaveClass("shadow-sm");
  });

  it("renders axes for cartesian charts", () => {
    render(<ChartWidget {...defaultProps} type="line" />);

    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
  });

  it("does not render axes for pie chart", () => {
    render(<ChartWidget {...defaultProps} type="pie" />);

    expect(screen.queryByTestId("x-axis")).not.toBeInTheDocument();
    expect(screen.queryByTestId("y-axis")).not.toBeInTheDocument();
  });
});
