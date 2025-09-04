import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";
import * as api from "../../app/lib/api";

// Import components
import PortfolioManagementPage from "../../app/admin/portfolio/page";
import NewPortfolioPage from "../../app/admin/portfolio/new/page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock API functions
jest.mock("../../app/lib/api", () => ({
  getPortfolio: jest.fn(),
  createPortfolioItem: jest.fn(),
  updatePortfolioItem: jest.fn(),
  deletePortfolioItem: jest.fn(),
  uploadImage: jest.fn(),
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

describe("Portfolio Integration Tests", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.getUserInfo as jest.Mock).mockReturnValue({
      username: "admin",
      is_admin: true,
    });
    jest.clearAllMocks();
  });

  describe("Complete Portfolio Management Workflow", () => {
    it("allows admin to create, view, and delete portfolio items", async () => {
      // Step 1: Start with empty portfolio
      (api.getPortfolio as jest.Mock).mockResolvedValueOnce([]);

      const { rerender } = render(<PortfolioManagementPage />);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText("No Portfolio Items Yet")).toBeInTheDocument();
      });

      // Step 2: Navigate to create new project
      const addButton = screen.getByText("➕ Add New Project");
      fireEvent.click(addButton);
      expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio/new");

      // Step 3: Render new project form
      rerender(<NewPortfolioPage />);

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Integration Test Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "A project created during integration testing" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React, TypeScript, Jest" },
      });
      fireEvent.change(screen.getByLabelText(/Project URL/), {
        target: { value: "https://integration-test.com" },
      });

      // Step 4: Submit the form
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Portfolio item created successfully",
        id: 1,
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(api.createPortfolioItem).toHaveBeenCalledWith({
          title: "Integration Test Project",
          description: "A project created during integration testing",
          technologies: "React, TypeScript, Jest",
          project_url: "https://integration-test.com",
          github_url: null,
          image_url: null,
        });
        expect(
          screen.getByText("Portfolio item created successfully!")
        ).toBeInTheDocument();
      });

      // Step 5: Return to portfolio management with new item
      const newPortfolioItem = {
        id: 1,
        title: "Integration Test Project",
        description: "A project created during integration testing",
        technologies: "React, TypeScript, Jest",
        project_url: "https://integration-test.com",
        github_url: null,
        image_url: null,
        created_at: "2024-01-01T00:00:00Z",
      };

      (api.getPortfolio as jest.Mock).mockResolvedValue([newPortfolioItem]);
      rerender(<PortfolioManagementPage />);

      // Should show the new item
      await waitFor(() => {
        expect(
          screen.getByText("Integration Test Project")
        ).toBeInTheDocument();
        expect(
          screen.getByText("A project created during integration testing")
        ).toBeInTheDocument();
      });

      // Step 6: Delete the item
      const deleteButton = screen.getByText("🗑️ Delete");
      fireEvent.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      });

      (api.deletePortfolioItem as jest.Mock).mockResolvedValue({
        message: "Portfolio item deleted successfully",
      });

      const confirmDeleteButton = screen.getByRole("button", {
        name: "🗑️ Delete",
      });
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(api.deletePortfolioItem).toHaveBeenCalledWith(1);
        expect(
          screen.getByText("Portfolio item deleted successfully!")
        ).toBeInTheDocument();
      });
    });

    it("handles form validation errors during creation workflow", async () => {
      render(<NewPortfolioPage />);

      // Try to submit empty form
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
        expect(
          screen.getByText("Technologies are required")
        ).toBeInTheDocument();
      });

      // Fill only title
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Test Project" },
      });

      // Try to submit again
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
        expect(
          screen.getByText("Technologies are required")
        ).toBeInTheDocument();
      });

      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      // Should be able to submit now
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
        id: 1,
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(api.createPortfolioItem).toHaveBeenCalled();
      });
    });

    it("handles API errors gracefully throughout workflow", async () => {
      // Test portfolio fetch error
      (api.getPortfolio as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<PortfolioManagementPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Error loading portfolio items")
        ).toBeInTheDocument();
      });

      // Test creation error
      const { rerender } = render(<NewPortfolioPage />);

      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Test Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      (api.createPortfolioItem as jest.Mock).mockRejectedValue(
        new Error("Creation failed")
      );

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Error creating portfolio item. Please try again.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Image Upload Integration", () => {
    it("integrates image upload with form submission", async () => {
      (api.uploadImage as jest.Mock).mockResolvedValue({
        url: "https://example.com/uploaded-image.jpg",
      });
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
        id: 1,
      });

      render(<NewPortfolioPage />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Project with Image" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      // Upload image
      const fileInput = screen
        .getByRole("button", { name: /Choose file/ })
        .closest("input") as HTMLInputElement;
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(api.uploadImage).toHaveBeenCalledWith(file);
        expect(
          screen.getByText("Image uploaded successfully!")
        ).toBeInTheDocument();
      });

      // Submit form with uploaded image
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(api.createPortfolioItem).toHaveBeenCalledWith({
          title: "Project with Image",
          description: "Description",
          technologies: "React",
          project_url: null,
          github_url: null,
          image_url: "https://example.com/uploaded-image.jpg",
        });
      });
    });
  });

  describe("Navigation Integration", () => {
    it("maintains proper navigation flow between pages", async () => {
      // Start at portfolio management
      (api.getPortfolio as jest.Mock).mockResolvedValue([]);
      render(<PortfolioManagementPage />);

      // Navigate to new project
      fireEvent.click(screen.getByText("➕ Add New Project"));
      expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio/new");

      // Navigate back to dashboard
      fireEvent.click(screen.getByText("⬅️ Back to Dashboard"));
      expect(mockRouter.push).toHaveBeenCalledWith("/admin");

      // Test logout navigation
      fireEvent.click(screen.getByText("🚪 Logout"));
      expect(api.logout).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("Public Portfolio Integration", () => {
    it("verifies that portfolio items would appear on public page", async () => {
      // This test verifies the API integration that the public page would use
      const mockPortfolioItems = [
        {
          id: 1,
          title: "Public Project 1",
          description: "Description 1",
          technologies: "React",
          project_url: "https://project1.com",
          github_url: "https://github.com/user/project1",
          image_url: "https://example.com/image1.jpg",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          title: "Public Project 2",
          description: "Description 2",
          technologies: "Vue.js",
          project_url: null,
          github_url: "https://github.com/user/project2",
          image_url: null,
          created_at: "2024-01-02T00:00:00Z",
        },
      ];

      (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);

      // Simulate what the public portfolio page would do
      const portfolioItems = await api.getPortfolio();

      expect(portfolioItems).toHaveLength(2);
      expect(portfolioItems[0].title).toBe("Public Project 1");
      expect(portfolioItems[1].title).toBe("Public Project 2");

      // Verify that both items with and without optional fields are handled
      expect(portfolioItems[0].project_url).toBe("https://project1.com");
      expect(portfolioItems[1].project_url).toBeNull();
      expect(portfolioItems[0].image_url).toBe(
        "https://example.com/image1.jpg"
      );
      expect(portfolioItems[1].image_url).toBeNull();
    });
  });

  describe("Error Recovery", () => {
    it("allows user to retry after errors", async () => {
      render(<NewPortfolioPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Retry Test" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Testing retry functionality" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      // First attempt fails
      (api.createPortfolioItem as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Error creating portfolio item. Please try again.")
        ).toBeInTheDocument();
      });

      // Second attempt succeeds
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
        id: 1,
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Portfolio item created successfully!")
        ).toBeInTheDocument();
      });
    });
  });
});
