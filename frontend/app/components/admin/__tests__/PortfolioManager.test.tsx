import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PortfolioManager } from "../PortfolioManager";
import * as api from "../../../lib/api";

// Mock the API functions
jest.mock("../../../lib/api", () => ({
  getPortfolio: jest.fn(),
  updatePortfolioItem: jest.fn(),
  deletePortfolioItem: jest.fn(),
}));

const mockPortfolioItems = [
  {
    id: 1,
    title: "E-commerce Platform",
    description:
      "A full-stack e-commerce platform built with React and Node.js",
    technologies: "React, Node.js, MongoDB, Stripe",
    project_url: "https://example.com/project1",
    github_url: "https://github.com/user/project1",
    image_url: "https://example.com/image1.jpg",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates",
    technologies: "Vue.js, Express, Socket.io, PostgreSQL",
    project_url: "https://example.com/project2",
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description: "A responsive weather dashboard with location-based forecasts",
    technologies: "JavaScript, Chart.js, OpenWeather API",
    github_url: "https://github.com/user/project3",
    image_url: "https://example.com/image3.jpg",
    created_at: "2024-01-03T00:00:00Z",
  },
];

describe("PortfolioManager", () => {
  const mockOnEdit = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolioItems);
    (api.updatePortfolioItem as jest.Mock).mockResolvedValue({ success: true });
    (api.deletePortfolioItem as jest.Mock).mockResolvedValue({ success: true });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders portfolio manager with header", async () => {
      render(<PortfolioManager onEdit={mockOnEdit} onView={mockOnView} />);

      expect(screen.getByText("Portfolio Management")).toBeInTheDocument();
      expect(screen.getByText("➕ Add New Project")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();
      });
    });

    it("displays loading state initially", () => {
      render(<PortfolioManager />);

      const skeletonElements = document.querySelectorAll(".animate-pulse");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("fetches and displays portfolio items on mount", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        expect(api.getPortfolio).toHaveBeenCalled();
        expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();
        expect(screen.getByText("Task Management App")).toBeInTheDocument();
        expect(screen.getByText("Weather Dashboard")).toBeInTheDocument();
      });
    });

    it("displays item count in header", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        expect(screen.getByText(/3 total/)).toBeInTheDocument();
      });
    });
  });

  describe("Portfolio Item Display", () => {
    it("displays portfolio item information correctly", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        // Check titles
        expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();
        expect(screen.getByText("Task Management App")).toBeInTheDocument();

        // Check technologies
        expect(
          screen.getByText("React, Node.js, MongoDB, Stripe")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Vue.js, Express, Socket.io, PostgreSQL")
        ).toBeInTheDocument();

        // Check links
        expect(screen.getByText("🔗 Live Demo")).toBeInTheDocument();
        expect(screen.getByText("📁 GitHub")).toBeInTheDocument();
      });
    });

    it("displays project images when available", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(2); // Two items have images
        expect(images[0]).toHaveAttribute(
          "src",
          "https://example.com/image1.jpg"
        );
      });
    });

    it("truncates long descriptions", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const truncatedDescription = screen.getByText(
          /A full-stack e-commerce platform/
        );
        expect(truncatedDescription.textContent).toContain("...");
      });
    });
  });

  describe("Inline Editing", () => {
    it("enters edit mode when edit button is clicked", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        // Should show input fields
        expect(
          screen.getByDisplayValue("E-commerce Platform")
        ).toBeInTheDocument();
        expect(
          screen.getByDisplayValue("React, Node.js, MongoDB, Stripe")
        ).toBeInTheDocument();

        // Should show save/cancel buttons
        expect(screen.getByText("✅ Save")).toBeInTheDocument();
        expect(screen.getByText("❌ Cancel")).toBeInTheDocument();
      });
    });

    it("shows editing notice when in edit mode", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        expect(
          screen.getByText(/You are currently editing an item/)
        ).toBeInTheDocument();
      });
    });

    it("allows editing title and description", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        const titleInput = screen.getByDisplayValue("E-commerce Platform");
        fireEvent.change(titleInput, {
          target: { value: "Updated E-commerce Platform" },
        });

        expect(
          screen.getByDisplayValue("Updated E-commerce Platform")
        ).toBeInTheDocument();
      });
    });

    it("saves changes when save button is clicked", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        const titleInput = screen.getByDisplayValue("E-commerce Platform");
        fireEvent.change(titleInput, { target: { value: "Updated Title" } });

        const saveButton = screen.getByText("✅ Save");
        fireEvent.click(saveButton);

        expect(api.updatePortfolioItem).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            title: "Updated Title",
          })
        );
      });
    });

    it("cancels editing when cancel button is clicked", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        const cancelButton = screen.getByText("❌ Cancel");
        fireEvent.click(cancelButton);

        // Should exit edit mode
        expect(screen.queryByText("✅ Save")).not.toBeInTheDocument();
        expect(
          screen.queryByDisplayValue("E-commerce Platform")
        ).not.toBeInTheDocument();
      });
    });

    it("validates required fields before saving", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        const titleInput = screen.getByDisplayValue("E-commerce Platform");
        fireEvent.change(titleInput, { target: { value: "" } });

        const saveButton = screen.getByText("✅ Save");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Title and description are required")
        ).toBeInTheDocument();
        expect(api.updatePortfolioItem).not.toHaveBeenCalled();
      });
    });
  });

  describe("Portfolio Actions", () => {
    it("calls onView when view button is clicked", async () => {
      render(<PortfolioManager onView={mockOnView} />);

      await waitFor(() => {
        const viewButtons = screen.getAllByText("👁️ View");
        fireEvent.click(viewButtons[0]);

        expect(mockOnView).toHaveBeenCalledWith(mockPortfolioItems[0]);
      });
    });

    it("calls onEdit when full edit button is clicked", async () => {
      render(<PortfolioManager onEdit={mockOnEdit} />);

      await waitFor(() => {
        const fullEditButtons = screen.getAllByText("📝 Full Edit");
        fireEvent.click(fullEditButtons[0]);

        expect(mockOnEdit).toHaveBeenCalledWith(mockPortfolioItems[0]);
      });
    });

    it("deletes item when delete button is clicked", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete "E-commerce Platform"?'
        );
        expect(api.deletePortfolioItem).toHaveBeenCalledWith(1);
      });
    });

    it("shows success message after deletion", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Portfolio item deleted successfully!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Bulk Operations", () => {
    it("shows bulk actions when items are selected", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select first item

        expect(screen.getByText("1 items selected")).toBeInTheDocument();
        expect(screen.getByText("🗑️ Delete Selected")).toBeInTheDocument();
      });
    });

    it("performs bulk delete operation", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select first item
        fireEvent.click(checkboxes[2]); // Select second item

        const bulkDeleteButton = screen.getByText("🗑️ Delete Selected");
        fireEvent.click(bulkDeleteButton);

        expect(window.confirm).toHaveBeenCalledWith(
          "Are you sure you want to delete 2 selected items?"
        );
      });
    });
  });

  describe("Search Functionality", () => {
    it("includes search functionality", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      });
    });

    it("filters items by search term", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search...");
        fireEvent.change(searchInput, { target: { value: "e-commerce" } });

        expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();
        expect(
          screen.queryByText("Task Management App")
        ).not.toBeInTheDocument();
      });
    });

    it("searches in title, description, and technologies", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search...");

        // Search by technology
        fireEvent.change(searchInput, { target: { value: "Vue.js" } });
        expect(screen.getByText("Task Management App")).toBeInTheDocument();
        expect(
          screen.queryByText("E-commerce Platform")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    it("includes pagination controls", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        expect(
          screen.getByText(/Showing \d+ to \d+ of \d+ results/)
        ).toBeInTheDocument();
      });
    });

    it("allows changing page size", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const pageSizeSelect = screen.getByDisplayValue("25 per page");
        expect(pageSizeSelect).toBeInTheDocument();

        fireEvent.change(pageSizeSelect, { target: { value: "50" } });
        expect(screen.getByDisplayValue("50 per page")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetching portfolio fails", async () => {
      (api.getPortfolio as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<PortfolioManager />);

      await waitFor(() => {
        expect(
          screen.getByText("Error loading portfolio items")
        ).toBeInTheDocument();
      });
    });

    it("displays error message when update fails", async () => {
      (api.updatePortfolioItem as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        const saveButton = screen.getByText("✅ Save");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Error updating portfolio item")
        ).toBeInTheDocument();
      });
    });

    it("displays error message when deletion fails", async () => {
      (api.deletePortfolioItem as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      render(<PortfolioManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Error deleting portfolio item")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("has add new project button that navigates to portfolio creation page", async () => {
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<PortfolioManager />);

      const createButton = screen.getByText("➕ Add New Project");
      fireEvent.click(createButton);

      expect(window.location.href).toBe("/admin/portfolio/new");
    });
  });

  describe("Link Handling", () => {
    it("displays project and GitHub links correctly", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const projectLinks = screen.getAllByText("🔗 Live Demo");
        const githubLinks = screen.getAllByText("📁 GitHub");

        expect(projectLinks).toHaveLength(2); // Two items have project URLs
        expect(githubLinks).toHaveLength(2); // Two items have GitHub URLs

        expect(projectLinks[0].closest("a")).toHaveAttribute(
          "href",
          "https://example.com/project1"
        );
        expect(githubLinks[0].closest("a")).toHaveAttribute(
          "href",
          "https://github.com/user/project1"
        );
      });
    });

    it("allows editing URLs in inline edit mode", async () => {
      render(<PortfolioManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        const projectUrlInput = screen.getByDisplayValue(
          "https://example.com/project1"
        );
        const githubUrlInput = screen.getByDisplayValue(
          "https://github.com/user/project1"
        );

        expect(projectUrlInput).toBeInTheDocument();
        expect(githubUrlInput).toBeInTheDocument();

        fireEvent.change(projectUrlInput, {
          target: { value: "https://newurl.com" },
        });
        expect(
          screen.getByDisplayValue("https://newurl.com")
        ).toBeInTheDocument();
      });
    });
  });
});
