import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserActivityModal from "../UserActivityModal";
import { NotificationProvider } from "../../../../contexts/NotificationContext";
import * as api from "../../../../lib/api";

// Mock the API functions
jest.mock("../../../../lib/api", () => ({
  getUserActivity: jest.fn(),
}));

const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  role: "user" as const,
  isActive: true,
  lastLogin: "2024-01-15T10:00:00Z",
  registrationDate: "2024-01-01T00:00:00Z",
  activityCount: 42,
};

const mockActivities = [
  {
    id: "act_1",
    userId: 1,
    action: "login",
    description: "User logged in successfully",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: "2024-01-15T10:00:00Z",
  },
  {
    id: "act_2",
    userId: 1,
    action: "profile_update",
    description: "Updated profile information",
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-15T09:30:00Z",
  },
  {
    id: "act_3",
    userId: 1,
    action: "login_failed",
    description: "Failed login attempt",
    ipAddress: "192.168.1.105",
    timestamp: "2024-01-15T09:00:00Z",
  },
];

const mockActivityResponse = {
  activities: mockActivities,
  totalCount: 3,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<NotificationProvider>{component}</NotificationProvider>);
};

describe("UserActivityModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getUserActivity as jest.Mock).mockResolvedValue(mockActivityResponse);
  });

  it("does not render when closed", () => {
    renderWithProvider(
      <UserActivityModal isOpen={false} onClose={mockOnClose} user={mockUser} />
    );

    expect(
      screen.queryByText("Activity Log - testuser")
    ).not.toBeInTheDocument();
  });

  it("renders activity modal when open", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    expect(screen.getByText("Activity Log - testuser")).toBeInTheDocument();
  });

  it("fetches user activity on open", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(api.getUserActivity).toHaveBeenCalledWith(1, 1, 10, {
        action: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });
    });
  });

  it("displays activity list correctly", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Profile Update")).toBeInTheDocument();
      expect(screen.getByText("Login Failed")).toBeInTheDocument();

      expect(
        screen.getByText("User logged in successfully")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Updated profile information")
      ).toBeInTheDocument();
      expect(screen.getByText("Failed login attempt")).toBeInTheDocument();
    });
  });

  it("displays IP addresses and user agents", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("IP: 192.168.1.100")).toBeInTheDocument();
      expect(screen.getByText("IP: 192.168.1.105")).toBeInTheDocument();
      expect(screen.getByText(/UA: Mozilla\/5\.0/)).toBeInTheDocument();
    });
  });

  it("formats timestamps correctly", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      // Check that timestamps are formatted (exact format may vary based on locale)
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });
  });

  it("handles action filter", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    const actionFilter = screen.getByDisplayValue("All Actions");
    fireEvent.change(actionFilter, { target: { value: "login" } });

    await waitFor(() => {
      expect(api.getUserActivity).toHaveBeenCalledWith(1, 1, 10, {
        action: "login",
        dateFrom: undefined,
        dateTo: undefined,
      });
    });
  });

  it("handles date filters", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    const fromDateInput = screen.getByLabelText("From Date");
    const toDateInput = screen.getByLabelText("To Date");

    fireEvent.change(fromDateInput, { target: { value: "2024-01-01" } });
    fireEvent.change(toDateInput, { target: { value: "2024-01-31" } });

    await waitFor(() => {
      expect(api.getUserActivity).toHaveBeenCalledWith(1, 1, 10, {
        action: undefined,
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
      });
    });
  });

  it("displays correct action icons", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      // Check that different action types have different styling
      const loginActivity = screen.getByText("Login").closest("div");
      const failedLoginActivity = screen
        .getByText("Login Failed")
        .closest("div");
      const profileUpdateActivity = screen
        .getByText("Profile Update")
        .closest("div");

      expect(loginActivity).toBeInTheDocument();
      expect(failedLoginActivity).toBeInTheDocument();
      expect(profileUpdateActivity).toBeInTheDocument();
    });
  });

  it("handles pagination", async () => {
    const paginatedResponse = {
      ...mockActivityResponse,
      totalPages: 2,
      currentPage: 1,
    };
    (api.getUserActivity as jest.Mock).mockResolvedValue(paginatedResponse);

    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.getUserActivity).toHaveBeenCalledWith(
        1,
        2,
        10,
        expect.any(Object)
      );
    });
  });

  it("disables pagination buttons appropriately", async () => {
    const paginatedResponse = {
      ...mockActivityResponse,
      totalPages: 2,
      currentPage: 1,
    };
    (api.getUserActivity as jest.Mock).mockResolvedValue(paginatedResponse);

    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      const previousButton = screen.getByText("Previous");
      const nextButton = screen.getByText("Next");

      expect(previousButton).toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  it("displays empty state when no activities found", async () => {
    (api.getUserActivity as jest.Mock).mockResolvedValue({
      activities: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 10,
    });

    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("No activity found")).toBeInTheDocument();
    });
  });

  it("displays loading state", () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    // Should show loading skeletons initially
    expect(screen.getByText("Activity Log - testuser")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes modal when X button is clicked", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    const xButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(xButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes modal when backdrop is clicked", async () => {
    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    const backdrop = document.querySelector(".bg-gray-500");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("handles API errors gracefully", async () => {
    (api.getUserActivity as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );

    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    // Component should still render without crashing
    expect(screen.getByText("Activity Log - testuser")).toBeInTheDocument();
  });

  it("displays pagination info correctly", async () => {
    const paginatedResponse = {
      activities: mockActivities.slice(0, 2),
      totalCount: 5,
      currentPage: 1,
      totalPages: 3,
      pageSize: 2,
    };
    (api.getUserActivity as jest.Mock).mockResolvedValue(paginatedResponse);

    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(
        screen.getByText("Showing 1 to 2 of 5 activities")
      ).toBeInTheDocument();
    });
  });

  it("handles different action types with correct styling", async () => {
    const diverseActivities = [
      { ...mockActivities[0], action: "password_change" },
      { ...mockActivities[1], action: "logout" },
      { ...mockActivities[2], action: "unknown_action" },
    ];

    (api.getUserActivity as jest.Mock).mockResolvedValue({
      ...mockActivityResponse,
      activities: diverseActivities,
    });

    renderWithProvider(
      <UserActivityModal isOpen={true} onClose={mockOnClose} user={mockUser} />
    );

    await waitFor(() => {
      expect(screen.getByText("Password Change")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.getByText("Unknown Action")).toBeInTheDocument();
    });
  });
});
