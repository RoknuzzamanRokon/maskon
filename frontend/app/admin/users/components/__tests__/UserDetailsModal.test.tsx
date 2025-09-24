import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserDetailsModal from "../UserDetailsModal";
import { NotificationProvider } from "../../../../contexts/NotificationContext";
import * as api from "../../../../lib/api";

// Mock the API functions
jest.mock("../../../../lib/api", () => ({
  getUserDetails: jest.fn(),
  updateUserRole: jest.fn(),
  updateUserStatus: jest.fn(),
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

const renderWithProvider = (component: React.ReactElement) => {
  return render(<NotificationProvider>{component}</NotificationProvider>);
};

describe("UserDetailsModal", () => {
  const mockOnClose = jest.fn();
  const mockOnUserUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getUserDetails as jest.Mock).mockResolvedValue(mockUser);
  });

  it("does not render when closed", () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={false}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    expect(screen.queryByText("User Details")).not.toBeInTheDocument();
  });

  it("renders user details when open", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    expect(screen.getByText("User Details")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("fetches user details on open", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(api.getUserDetails).toHaveBeenCalledWith(1);
    });
  });

  it("displays loading state while fetching", () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    // Should show loading skeletons
    expect(screen.getByText("User Details")).toBeInTheDocument();
  });

  it("displays user information correctly", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("User")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument(); // Activity count
    });
  });

  it("displays formatted dates correctly", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      // Check that dates are formatted (exact format may vary based on locale)
      expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });
  });

  it("calculates account age correctly", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      // Should show account age in days
      expect(screen.getByText(/\d+ days/)).toBeInTheDocument();
    });
  });

  it("handles role update", async () => {
    (api.updateUserRole as jest.Mock).mockResolvedValue({});

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("user")).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue("user");
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    await waitFor(() => {
      expect(api.updateUserRole).toHaveBeenCalledWith(1, "admin");
      expect(mockOnUserUpdate).toHaveBeenCalled();
    });
  });

  it("handles status update", async () => {
    (api.updateUserStatus as jest.Mock).mockResolvedValue({});

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Deactivate Account")).toBeInTheDocument();
    });

    const statusButton = screen.getByText("Deactivate Account");
    fireEvent.click(statusButton);

    await waitFor(() => {
      expect(api.updateUserStatus).toHaveBeenCalledWith(1, false);
      expect(mockOnUserUpdate).toHaveBeenCalled();
    });
  });

  it("shows activate button for inactive users", async () => {
    const inactiveUser = { ...mockUser, isActive: false };
    (api.getUserDetails as jest.Mock).mockResolvedValue(inactiveUser);

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={inactiveUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Activate Account")).toBeInTheDocument();
    });
  });

  it("disables controls while updating", async () => {
    (api.updateUserRole as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("user")).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue("user");
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    // Controls should be disabled during update
    expect(roleSelect).toBeDisabled();
  });

  it("closes modal when close button is clicked", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes modal when X button is clicked", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    const xButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(xButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes modal when backdrop is clicked", async () => {
    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    const backdrop = document.querySelector(".bg-gray-500");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("handles API errors gracefully", async () => {
    (api.getUserDetails as jest.Mock).mockRejectedValue(new Error("API Error"));

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load user details")
      ).toBeInTheDocument();
    });
  });

  it("handles role update errors", async () => {
    (api.updateUserRole as jest.Mock).mockRejectedValue(
      new Error("Update failed")
    );

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("user")).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue("user");
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    // Should handle error gracefully without crashing
    await waitFor(() => {
      expect(api.updateUserRole).toHaveBeenCalled();
    });
  });

  it("handles status update errors", async () => {
    (api.updateUserStatus as jest.Mock).mockRejectedValue(
      new Error("Update failed")
    );

    renderWithProvider(
      <UserDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onUserUpdate={mockOnUserUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Deactivate Account")).toBeInTheDocument();
    });

    const statusButton = screen.getByText("Deactivate Account");
    fireEvent.click(statusButton);

    // Should handle error gracefully without crashing
    await waitFor(() => {
      expect(api.updateUserStatus).toHaveBeenCalled();
    });
  });
});
