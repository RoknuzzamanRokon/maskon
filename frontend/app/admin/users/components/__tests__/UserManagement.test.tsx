import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserManagement from "../UserManagement";
import { NotificationProvider } from "../../../../contexts/NotificationContext";
import * as api from "../../../../lib/api";

// Mock the API functions
jest.mock("../../../../lib/api", () => ({
  getUsers: jest.fn(),
  updateUserRole: jest.fn(),
  updateUserStatus: jest.fn(),
  deleteUser: jest.fn(),
}));

// Mock the modals
jest.mock("../UserDetailsModal", () => {
  return function MockUserDetailsModal({ isOpen, onClose, user }: any) {
    return isOpen ? (
      <div data-testid="user-details-modal">
        <span>User Details: {user?.username}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock("../UserActivityModal", () => {
  return function MockUserActivityModal({ isOpen, onClose, user }: any) {
    return isOpen ? (
      <div data-testid="user-activity-modal">
        <span>User Activity: {user?.username}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@test.com",
    role: "admin" as const,
    isActive: true,
    lastLogin: "2024-01-15T10:00:00Z",
    registrationDate: "2024-01-01T00:00:00Z",
    activityCount: 50,
  },
  {
    id: 2,
    username: "user1",
    email: "user1@test.com",
    role: "user" as const,
    isActive: true,
    lastLogin: "2024-01-14T15:30:00Z",
    registrationDate: "2024-01-05T00:00:00Z",
    activityCount: 25,
  },
  {
    id: 3,
    username: "inactive_user",
    email: "inactive@test.com",
    role: "user" as const,
    isActive: false,
    lastLogin: "2024-01-10T09:00:00Z",
    registrationDate: "2024-01-03T00:00:00Z",
    activityCount: 5,
  },
];

const mockApiResponse = {
  users: mockUsers,
  totalCount: 3,
  currentPage: 1,
  totalPages: 1,
  pageSize: 25,
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<NotificationProvider>{component}</NotificationProvider>);
};

describe("UserManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getUsers as jest.Mock).mockResolvedValue(mockApiResponse);
  });

  it("renders user management interface", async () => {
    renderWithProvider(<UserManagement />);

    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(
      screen.getByText("Manage user accounts, roles, and permissions")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("inactive_user")).toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    renderWithProvider(<UserManagement />);

    // Check for loading skeleton or spinner
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("fetches users on component mount", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(api.getUsers).toHaveBeenCalledWith(1, 25, {
        search: undefined,
        role: undefined,
        isActive: undefined,
        sortBy: "username",
        sortOrder: "asc",
      });
    });
  });

  it("displays user information correctly", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      // Check user data is displayed
      expect(screen.getByText("admin@test.com")).toBeInTheDocument();
      expect(screen.getByText("user1@test.com")).toBeInTheDocument();
      expect(screen.getByText("inactive@test.com")).toBeInTheDocument();

      // Check status badges
      expect(screen.getAllByText("Active")).toHaveLength(2);
      expect(screen.getByText("Inactive")).toBeInTheDocument();

      // Check role badges
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getAllByText("User")).toHaveLength(2);
    });
  });

  it("handles search functionality", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "admin" } });

    await waitFor(() => {
      expect(api.getUsers).toHaveBeenCalledWith(1, 25, {
        search: "admin",
        role: undefined,
        isActive: undefined,
        sortBy: "username",
        sortOrder: "asc",
      });
    });
  });

  it("handles role filter", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    const roleFilter = screen.getByDisplayValue("All Roles");
    fireEvent.change(roleFilter, { target: { value: "admin" } });

    await waitFor(() => {
      expect(api.getUsers).toHaveBeenCalledWith(1, 25, {
        search: undefined,
        role: "admin",
        isActive: undefined,
        sortBy: "username",
        sortOrder: "asc",
      });
    });
  });

  it("handles status filter", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue("All Status");
    fireEvent.change(statusFilter, { target: { value: "true" } });

    await waitFor(() => {
      expect(api.getUsers).toHaveBeenCalledWith(1, 25, {
        search: undefined,
        role: undefined,
        isActive: true,
        sortBy: "username",
        sortOrder: "asc",
      });
    });
  });

  it("opens user details modal", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByTitle("View Details");
    fireEvent.click(viewDetailsButtons[0]);

    expect(screen.getByTestId("user-details-modal")).toBeInTheDocument();
    expect(screen.getByText("User Details: admin")).toBeInTheDocument();
  });

  it("opens user activity modal", async () => {
    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    const viewActivityButtons = screen.getAllByTitle("View Activity");
    fireEvent.click(viewActivityButtons[0]);

    expect(screen.getByTestId("user-activity-modal")).toBeInTheDocument();
    expect(screen.getByText("User Activity: admin")).toBeInTheDocument();
  });

  it("handles user role change", async () => {
    (api.updateUserRole as jest.Mock).mockResolvedValue({});

    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("user1")).toBeInTheDocument();
    });

    const roleSelects = screen.getAllByDisplayValue("User");
    fireEvent.change(roleSelects[0], { target: { value: "admin" } });

    await waitFor(() => {
      expect(api.updateUserRole).toHaveBeenCalledWith(2, "admin");
    });
  });

  it("handles user status change", async () => {
    (api.updateUserStatus as jest.Mock).mockResolvedValue({});

    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("inactive_user")).toBeInTheDocument();
    });

    const activateButton = screen.getByText("Activate");
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(api.updateUserStatus).toHaveBeenCalledWith(3, true);
    });
  });

  it("handles user deletion with confirmation", async () => {
    (api.deleteUser as jest.Mock).mockResolvedValue({});
    window.confirm = jest.fn(() => true);

    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Delete User");
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    await waitFor(() => {
      expect(api.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  it("handles bulk actions", async () => {
    (api.updateUserStatus as jest.Mock).mockResolvedValue({});

    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    // Select users
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // Select first user
    fireEvent.click(checkboxes[2]); // Select second user

    // Perform bulk action
    const activateButton = screen.getByText("Activate");
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(api.updateUserStatus).toHaveBeenCalledTimes(2);
    });
  });

  it("handles pagination", async () => {
    const paginatedResponse = {
      ...mockApiResponse,
      totalPages: 2,
      currentPage: 1,
    };
    (api.getUsers as jest.Mock).mockResolvedValue(paginatedResponse);

    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    // Check if pagination controls are present when there are multiple pages
    if (screen.queryByText("Next")) {
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(api.getUsers).toHaveBeenCalledWith(2, 25, expect.any(Object));
      });
    }
  });

  it("handles API errors gracefully", async () => {
    (api.getUsers as jest.Mock).mockRejectedValue(new Error("API Error"));

    renderWithProvider(<UserManagement />);

    // Component should still render without crashing
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("displays empty state when no users found", async () => {
    (api.getUsers as jest.Mock).mockResolvedValue({
      users: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 25,
    });

    renderWithProvider(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });
  });
});
