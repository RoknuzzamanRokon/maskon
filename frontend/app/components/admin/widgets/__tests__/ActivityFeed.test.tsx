import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActivityFeed from "../ActivityFeed";
import type { ActivityItem } from "../ActivityFeed";

describe("ActivityFeed", () => {
  const mockActivities: ActivityItem[] = [
    {
      id: "1",
      type: "post",
      action: "created",
      title: "New Blog Post About React",
      description: "A comprehensive guide to React hooks",
      timestamp: "2024-01-15T10:30:00Z",
      user: {
        name: "John Doe",
        avatar: "https://example.com/avatar1.jpg",
      },
    },
    {
      id: "2",
      type: "portfolio",
      action: "updated",
      title: "Portfolio Project Updated",
      timestamp: "2024-01-15T09:15:00Z",
      user: {
        name: "Jane Smith",
      },
    },
    {
      id: "3",
      type: "product",
      action: "deleted",
      title: "Old Product Removed",
      timestamp: "2024-01-15T08:00:00Z",
      user: {
        name: "Bob Wilson",
      },
    },
  ];

  const defaultProps = {
    activities: mockActivities,
  };

  it("renders activity feed with title", () => {
    render(<ActivityFeed {...defaultProps} />);

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("displays all activities when under maxItems limit", () => {
    render(<ActivityFeed {...defaultProps} />);

    expect(screen.getByText("New Blog Post About React")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Project Updated")).toBeInTheDocument();
    expect(screen.getByText("Old Product Removed")).toBeInTheDocument();
  });

  it("limits activities to maxItems", () => {
    render(<ActivityFeed {...defaultProps} maxItems={2} />);

    expect(screen.getByText("New Blog Post About React")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Project Updated")).toBeInTheDocument();
    expect(screen.queryByText("Old Product Removed")).not.toBeInTheDocument();
  });

  it("displays user names and actions correctly", () => {
    render(<ActivityFeed {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();

    expect(screen.getByText("created")).toBeInTheDocument();
    expect(screen.getByText("updated")).toBeInTheDocument();
    expect(screen.getByText("deleted")).toBeInTheDocument();
  });

  it("displays activity types correctly", () => {
    render(<ActivityFeed {...defaultProps} />);

    expect(screen.getByText("post")).toBeInTheDocument();
    expect(screen.getByText("portfolio")).toBeInTheDocument();
    expect(screen.getByText("product")).toBeInTheDocument();
  });

  it("shows descriptions when provided", () => {
    render(<ActivityFeed {...defaultProps} />);

    expect(
      screen.getByText("A comprehensive guide to React hooks")
    ).toBeInTheDocument();
  });

  it("renders user avatars when provided", () => {
    render(<ActivityFeed {...defaultProps} />);

    const avatar = screen.getByAltText("John Doe");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar1.jpg");
  });

  it("renders user initials when no avatar provided", () => {
    render(<ActivityFeed {...defaultProps} />);

    // Jane Smith and Bob Wilson should have initials
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("displays loading state correctly", () => {
    render(<ActivityFeed {...defaultProps} loading={true} />);

    // Should not show actual content when loading
    expect(screen.queryByText("Recent Activity")).not.toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

    // Should show loading skeleton
    const loadingElement = document.querySelector(".animate-pulse");
    expect(loadingElement).toBeInTheDocument();
  });

  it("shows empty state when no activities", () => {
    render(<ActivityFeed activities={[]} />);

    expect(screen.getByText("No recent activity")).toBeInTheDocument();
  });

  it("shows View All button when activities exceed maxItems", () => {
    const onViewAll = jest.fn();
    render(
      <ActivityFeed
        {...defaultProps}
        maxItems={2}
        onViewAll={onViewAll}
        showViewAll={true}
      />
    );

    const viewAllButton = screen.getByText("View All");
    expect(viewAllButton).toBeInTheDocument();

    fireEvent.click(viewAllButton);
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it("does not show View All button when showViewAll is false", () => {
    render(<ActivityFeed {...defaultProps} maxItems={2} showViewAll={false} />);

    expect(screen.queryByText("View All")).not.toBeInTheDocument();
  });

  it("does not show View All button when activities do not exceed maxItems", () => {
    const onViewAll = jest.fn();
    render(
      <ActivityFeed
        {...defaultProps}
        maxItems={10}
        onViewAll={onViewAll}
        showViewAll={true}
      />
    );

    expect(screen.queryByText("View All")).not.toBeInTheDocument();
  });

  it("handles activity item clicks", () => {
    const onItemClick = jest.fn();
    render(<ActivityFeed {...defaultProps} onItemClick={onItemClick} />);

    const firstActivity = screen
      .getByText("New Blog Post About React")
      .closest("div");
    fireEvent.click(firstActivity!);

    expect(onItemClick).toHaveBeenCalledWith(mockActivities[0]);
  });

  it("applies hover styles when onItemClick is provided", () => {
    const onItemClick = jest.fn();
    render(<ActivityFeed {...defaultProps} onItemClick={onItemClick} />);

    // Find the clickable activity item container
    const activityItems = document.querySelectorAll(".cursor-pointer");
    expect(activityItems.length).toBeGreaterThan(0);
    expect(activityItems[0]).toHaveClass("cursor-pointer");
    expect(activityItems[0]).toHaveClass("hover:bg-gray-50");
  });

  it("does not apply hover styles when onItemClick is not provided", () => {
    render(<ActivityFeed {...defaultProps} />);

    const firstActivity = screen
      .getByText("New Blog Post About React")
      .closest("div");
    expect(firstActivity).not.toHaveClass("cursor-pointer");
  });

  it("applies custom className", () => {
    const props = {
      ...defaultProps,
      className: "custom-activity-class",
    };

    render(<ActivityFeed {...props} />);

    const feed = document.querySelector(".custom-activity-class");
    expect(feed).toBeInTheDocument();
  });

  it("displays proper colors for different actions", () => {
    render(<ActivityFeed {...defaultProps} />);

    // Check that different action types have different colored icons
    const activities = document.querySelectorAll('[class*="bg-"]');

    // Should have green for created, blue for updated, red for deleted
    const hasGreenIcon = Array.from(activities).some((el) =>
      el.className.includes("bg-green-100")
    );
    const hasBlueIcon = Array.from(activities).some((el) =>
      el.className.includes("bg-blue-100")
    );
    const hasRedIcon = Array.from(activities).some((el) =>
      el.className.includes("bg-red-100")
    );

    expect(hasGreenIcon).toBe(true);
    expect(hasBlueIcon).toBe(true);
    expect(hasRedIcon).toBe(true);
  });

  it("formats timestamps correctly", () => {
    // Mock date to ensure consistent testing
    const mockDate = new Date("2024-01-15T12:00:00Z");
    jest.spyOn(Date, "now").mockImplementation(() => mockDate.getTime());

    render(<ActivityFeed {...defaultProps} />);

    // Should show relative time like "2 hours ago", "3 hours ago", etc.
    const timeElements = screen.getAllByText(/ago$/);
    expect(timeElements.length).toBeGreaterThan(0);

    jest.restoreAllMocks();
  });

  it("handles invalid timestamps gracefully", () => {
    const invalidActivity: ActivityItem = {
      id: "4",
      type: "post",
      action: "created",
      title: "Test Post",
      timestamp: "invalid-date",
      user: { name: "Test User" },
    };

    render(<ActivityFeed activities={[invalidActivity]} />);

    expect(screen.getByText("Unknown time")).toBeInTheDocument();
  });

  it("has proper card styling", () => {
    render(<ActivityFeed {...defaultProps} />);

    // Find the main container with card styling
    const cardElement = document.querySelector(".bg-white");
    expect(cardElement).toHaveClass("bg-white");
    expect(cardElement).toHaveClass("dark:bg-gray-800");
    expect(cardElement).toHaveClass("rounded-lg");
    expect(cardElement).toHaveClass("border");
    expect(cardElement).toHaveClass("shadow-sm");
  });
});
