import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";
import PortfolioManagementPage from "../../app/admin/portfolio/page";
import * as api from "../../app/lib/api";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock API functions
jest.mock("../../app/lib/api", () => ({
  getPortfolio: jest.fn(),
  deletePortfolioItem: jest.fn(),
  getUserInfo: jest.fn(),
  logout: jest.fn(),
}));

// Mock ProtectedRoute component
jest.mock("../../app/components/ProtectedRoute", () => {
  return function MockProtectedRoute({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
});

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

const mockPortfolioItems = [
  {
    id: 1,
    title: "Test Project 1",
    description: "Description for test project 1",
    technologies: "React, Node.js",
    project_url: "https://test1.com",
    github_url: "https://github.com/test/project1",
    image_url: "https://example.com/image1.jpg",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Test Project 2",
    description: "Description for test project 2",
    technologies: "Vue.js, Express.js",
    project_url: "https://test2.com",
    github_url: "https://github.com/test/project2",
    image_url: "https://example.com/image2.jpg",
    created_at: "2024-01-02T00:00:00Z",
  },
];

describe("PortfolioManagement", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.getUserInfo as jest.Mock).mockReturnValue({
      username: "admin",
      is_admin: true,
    });
    jest.clearAllMocks();
  });

  describe("Portfolio Items Display", () => {
    it("renders portfolio management page with items", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      expect(screen.getByText("Portfolio Management")).toBeInTheDocument();
      expect(
        screen.getByText("Manage your featured projects")
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Test Project 1")).toBeInTheDocument();
        expect(screen.getByText("Test Project 2")).toBeInTheDocument();
      });
    });

    it("shows loading state while fetching portfolio items", () => {
      (api.getPortfolio as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PortfolioManagementPage />);

      // Should show skeleton loaders
      const skeletonElements = screen.getAllByRole("generic");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("shows empty state when no portfolio items exist", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue([]);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        expect(screen.getByText("No Portfolio Items Yet")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Start showcasing your work by adding your first project."
          )
        ).toBeInTheDocument();
      });
    });

    it("displays portfolio item details correctly", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        // Check first item details
        expect(screen.getByText("Test Project 1")).toBeInTheDocument();
        expect(
          screen.getByText("Description for test project 1")
        ).toBeInTheDocument();
        expect(screen.getByText("React, Node.js")).toBeInTheDocument();

        // Check action buttons
        const editButtons = screen.getAllByText("✏️ Edit");
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to add new project page", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      const addButton = screen.getByText("➕ Add New Project");
      fireEvent.click(addButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio/new");
    });

    it("navigates to edit project page", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);
      });

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio/edit/1");
    });

    it("navigates back to admin dashboard", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue([]);

      render(<PortfolioManagementPage />);

      const backButton = screen.getByText("⬅️ Back to Dashboard");
      fireEvent.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin");
    });

    it("handles logout correctly", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue([]);

      render(<PortfolioManagementPage />);

      const logoutButton = screen.getByText("🚪 Logout");
      fireEvent.click(logoutButton);

      expect(api.logout).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("Delete Functionality", () => {
    it("shows delete confirmation modal", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      expect(
        screen.getByText("This action cannot be undone.")
      ).toBeInTheDocument();
    });

    it("cancels deletion when cancel button is clicked", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const cancelButton = screen.getByText("❌ Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
    });

    it("deletes portfolio item when confirmed", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);
      (api.deletePortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
      });

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = screen.getByText("🗑️ Delete");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(api.deletePortfolioItem).toHaveBeenCalledWith(1);
        expect(
          screen.getByText("Portfolio item deleted successfully!")
        ).toBeInTheDocument();
      });
    });

    it("handles delete error gracefully", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);
      (api.deletePortfolioItem as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = screen.getByText("🗑️ Delete");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText("Error deleting portfolio item")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles portfolio fetch error", async () => {
      (api.getPortfolio as jest.Mock).mockRejectedValue(
        new Error("Fetch failed")
      );

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Error loading portfolio items")
        ).toBeInTheDocument();
      });
    });

    it("displays error messages with proper styling", async () => {
      (api.getPortfolio as jest.Mock).mockRejectedValue(
        new Error("Fetch failed")
      );

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const errorMessage = screen.getByText("Error loading portfolio items");
        expect(errorMessage).toHaveClass("text-red-700");
      });
    });
  });

  describe("Responsive Design", () => {
    it("renders portfolio items in grid layout", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        const gridContainer = screen
          .getByText("Test Project 1")
          .closest(".grid");
        expect(gridContainer).toHaveClass("md:grid-cols-2", "lg:grid-cols-3");
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue([]);

      render(<PortfolioManagementPage />);

      expect(
        screen.getByRole("heading", { name: "Portfolio Management" })
      ).toBeInTheDocument();
    });

    it("has accessible buttons with proper labels", async () => {
      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "➕ Add New Project" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "⬅️ Back to Dashboard" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "🚪 Logout" })
        ).toBeInTheDocument();
      });
    });
  });
});
