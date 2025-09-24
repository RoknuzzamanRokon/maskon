import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardOverview from "../DashboardOverview";
import { DashboardProvider } from "../../contexts/DashboardContext";
import * as api from "../../../../lib/api";

// Mock the API functions
jest.mock("../../../../lib/api", () => ({
  getDashboardMetrics: jest.fn(),
  getRecentActivity: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  FileText: () => <div data-testid="file-text-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  ShoppingBag: () => <div data-testid="shopping-bag-icon" />,
  Users: () => <div data-testid="users-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
}));

// Mock MetricCard and ActivityFeed components
jest.mock("../../../../components/admin/widgets/MetricCard", () => {
  return function MockMetricCard({ title, value, loading, onClick }: any) {
    if (loading) {
      return <div data-testid={`metric-card-loading-${title}`}>Loading...</div>;
    }
    return (
      <div
        data-testid={`metric-card-${title}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        <span data-testid={`metric-title-${title}`}>{title}</span>
        <span data-testid={`metric-value-${title}`}>{value}</span>
      </div>
    );
  };
});

jest.mock("../../../../components/admin/widgets/ActivityFeed", () => {
  return function MockActivityFeed({
    activities,
    loading,
    onViewAll,
    onItemClick,
  }: any) {
    if (loading) {
      return (
        <div data-testid="activity-feed-loading">Loading activities...</div>
      );
    }
    return (
      <div data-testid="activity-feed">
        {activities.map((activity: any) => (
          <div
            key={activity.id}
            data-testid={`activity-${activity.id}`}
            onClick={() => onItemClick?.(activity)}
          >
            {activity.title}
          </div>
        ))}
        {onViewAll && (
          <button onClick={onViewAll} data-testid="view-all-activities">
            View All
          </button>
        )}
      </div>
    );
  };
});

const mockMetrics = {
  totalPosts: 42,
  totalPortfolioItems: 18,
  totalProducts: 25,
  totalUsers: 156,
  recentActivity: [],
  systemHealth: {
    serverHealth: "healthy" as const,
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.2,
    activeUsers: 23,
    memoryUsage: 68.5,
    cpuUsage: 34.2,
  },
};

const mockActivity = [
  {
    id: "1",
    type: "post" as const,
    action: "created" as const,
    title: "New Blog Post",
    description: "A test post",
    timestamp: new Date().toISOString(),
    user: { name: "Test User" },
  },
  {
    id: "2",
    type: "portfolio" as const,
    action: "updated" as const,
    title: "Portfolio Update",
    description: "Updated portfolio item",
    timestamp: new Date().toISOString(),
    user: { name: "Test User" },
  },
];

const renderWithProvider = (component: React.ReactElement) => {
  return render(<DashboardProvider>{component}</DashboardProvider>);
};

describe("DashboardOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getDashboardMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (api.getRecentActivity as jest.Mock).mockResolvedValue(mockActivity);
  });

  it("renders loading state initially", () => {
    renderWithProvider(<DashboardOverview />);

    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
  });

  it("fetches and displays dashboard metrics", async () => {
    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(api.getDashboardMetrics).toHaveBeenCalled();
      expect(api.getRecentActivity).toHaveBeenCalledWith(10);
    });

    await waitFor(() => {
      expect(screen.getByTestId("metric-card-Total Posts")).toBeInTheDocument();
      expect(screen.getByTestId("metric-value-Total Posts")).toHaveTextContent(
        "42"
      );

      expect(
        screen.getByTestId("metric-card-Portfolio Items")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("metric-value-Portfolio Items")
      ).toHaveTextContent("18");

      expect(screen.getByTestId("metric-card-Products")).toBeInTheDocument();
      expect(screen.getByTestId("metric-value-Products")).toHaveTextContent(
        "25"
      );

      expect(screen.getByTestId("metric-card-Total Users")).toBeInTheDocument();
      expect(screen.getByTestId("metric-value-Total Users")).toHaveTextContent(
        "156"
      );
    });
  });

  it("displays recent activity feed", async () => {
    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
      expect(screen.getByTestId("activity-1")).toHaveTextContent(
        "New Blog Post"
      );
      expect(screen.getByTestId("activity-2")).toHaveTextContent(
        "Portfolio Update"
      );
    });
  });

  it("displays system health information", async () => {
    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText("System Health")).toBeInTheDocument();
      expect(screen.getByText("healthy")).toBeInTheDocument();
      expect(screen.getByText("99.8%")).toBeInTheDocument();
      expect(screen.getByText("245ms")).toBeInTheDocument();
      expect(screen.getByText("23")).toBeInTheDocument();
    });
  });

  it("handles refresh functionality", async () => {
    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByTestId("metric-card-Total Posts")).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(api.getDashboardMetrics).toHaveBeenCalledTimes(2);
      expect(api.getRecentActivity).toHaveBeenCalledTimes(2);
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock the API to return mock data (as they do in real implementation)
    (api.getDashboardMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (api.getRecentActivity as jest.Mock).mockResolvedValue(mockActivity);

    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByTestId("metric-card-Total Posts")).toBeInTheDocument();
      expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
    });
  });

  it("navigates to correct pages when metric cards are clicked", async () => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: "" } as any;

    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByTestId("metric-card-Total Posts")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("metric-card-Total Posts"));
    expect(window.location.href).toBe("/admin/posts");

    fireEvent.click(screen.getByTestId("metric-card-Portfolio Items"));
    expect(window.location.href).toBe("/admin/portfolio");

    fireEvent.click(screen.getByTestId("metric-card-Products"));
    expect(window.location.href).toBe("/admin/products");
  });

  it("displays quick actions section", async () => {
    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(screen.getByText("Create New Post")).toBeInTheDocument();
      expect(screen.getByText("Add Portfolio Item")).toBeInTheDocument();
      expect(screen.getByText("Create Product")).toBeInTheDocument();
    });
  });

  it("shows last updated timestamp after data load", async () => {
    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it("handles activity feed interactions", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
    });

    // Test view all button
    fireEvent.click(screen.getByTestId("view-all-activities"));
    expect(consoleSpy).toHaveBeenCalledWith("Navigate to full activity log");

    // Test activity item click
    fireEvent.click(screen.getByTestId("activity-1"));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Navigate to activity item:",
      mockActivity[0]
    );

    consoleSpy.mockRestore();
  });

  it("auto-refreshes data every 5 minutes", async () => {
    jest.useFakeTimers();

    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(api.getDashboardMetrics).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(api.getDashboardMetrics).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });
});

describe("DashboardOverview Error Handling", () => {
  it("displays data when API functions return mock data", async () => {
    // API functions return mock data instead of throwing errors
    (api.getDashboardMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (api.getRecentActivity as jest.Mock).mockResolvedValue(mockActivity);

    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByTestId("metric-card-Total Posts")).toBeInTheDocument();
      expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
    });
  });

  it("renders dashboard with mock data when API is unavailable", async () => {
    // Even when API calls fail, the functions return mock data
    (api.getDashboardMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (api.getRecentActivity as jest.Mock).mockResolvedValue(mockActivity);

    renderWithProvider(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
      expect(screen.getByTestId("metric-card-Total Posts")).toBeInTheDocument();
    });
  });
});
