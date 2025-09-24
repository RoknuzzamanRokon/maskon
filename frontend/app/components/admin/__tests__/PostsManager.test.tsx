import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PostsManager } from "../PostsManager";
import * as api from "../../../lib/api";

// Mock the API functions
jest.mock("../../../lib/api", () => ({
  getBlogPosts: jest.fn(),
  deletePost: jest.fn(),
}));

const mockPosts = [
  {
    id: 1,
    title: "First Blog Post",
    content:
      "This is the content of the first blog post. It contains some interesting information.",
    category: "tech",
    image_url: "https://example.com/image1.jpg",
    created_at: "2024-01-01T00:00:00Z",
    likes_count: 10,
    dislikes_count: 2,
    comments_count: 5,
  },
  {
    id: 2,
    title: "Food Recipe",
    content: "A delicious recipe for homemade pasta with fresh ingredients.",
    category: "food",
    created_at: "2024-01-02T00:00:00Z",
    likes_count: 25,
    dislikes_count: 1,
    comments_count: 8,
  },
  {
    id: 3,
    title: "Fitness Tips",
    content:
      "Great tips for staying fit and healthy during busy work schedules.",
    category: "activity",
    image_url: "https://example.com/image3.jpg",
    created_at: "2024-01-03T00:00:00Z",
    likes_count: 15,
    dislikes_count: 0,
    comments_count: 3,
  },
];

describe("PostsManager", () => {
  const mockOnEdit = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getBlogPosts as jest.Mock).mockResolvedValue(mockPosts);
    (api.deletePost as jest.Mock).mockResolvedValue({ success: true });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders posts manager with header", async () => {
      render(<PostsManager onEdit={mockOnEdit} onView={mockOnView} />);

      expect(screen.getByText("Posts Management")).toBeInTheDocument();
      expect(screen.getByText("➕ Create New Post")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("First Blog Post")).toBeInTheDocument();
      });
    });

    it("displays loading state initially", () => {
      render(<PostsManager />);

      // Check for loading skeleton elements
      const skeletonElements = document.querySelectorAll(".animate-pulse");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("fetches and displays posts on mount", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        expect(api.getBlogPosts).toHaveBeenCalledWith(100);
        expect(screen.getByText("First Blog Post")).toBeInTheDocument();
        expect(screen.getByText("Food Recipe")).toBeInTheDocument();
        expect(screen.getByText("Fitness Tips")).toBeInTheDocument();
      });
    });

    it("displays post count in header", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        expect(screen.getByText(/3 total/)).toBeInTheDocument();
      });
    });
  });

  describe("Post Display", () => {
    it("displays post information correctly", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        // Check post titles
        expect(screen.getByText("First Blog Post")).toBeInTheDocument();
        expect(screen.getByText("Food Recipe")).toBeInTheDocument();

        // Check categories with emojis
        expect(screen.getByText("🚀tech")).toBeInTheDocument();
        expect(screen.getByText("🍕food")).toBeInTheDocument();
        expect(screen.getByText("🏃activity")).toBeInTheDocument();

        // Check engagement stats
        expect(screen.getByText("👍 10")).toBeInTheDocument();
        expect(screen.getByText("💬 5")).toBeInTheDocument();
      });
    });

    it("displays post images when available", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(2); // Two posts have images
        expect(images[0]).toHaveAttribute(
          "src",
          "https://example.com/image1.jpg"
        );
      });
    });

    it("truncates long content", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const truncatedContent = screen.getByText(
          /This is the content of the first blog post/
        );
        expect(truncatedContent.textContent).toContain("...");
      });
    });
  });

  describe("Filtering and Search", () => {
    it("renders category filter dropdown", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        expect(screen.getByLabelText("Category")).toBeInTheDocument();
        expect(screen.getByDisplayValue("All Categories")).toBeInTheDocument();
      });
    });

    it("filters posts by category", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "tech" } });

        expect(screen.getByText("First Blog Post")).toBeInTheDocument();
        expect(screen.queryByText("Food Recipe")).not.toBeInTheDocument();
      });
    });

    it("includes search functionality", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      });
    });

    it("filters posts by search term", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search...");
        fireEvent.change(searchInput, { target: { value: "recipe" } });

        expect(screen.getByText("Food Recipe")).toBeInTheDocument();
        expect(screen.queryByText("First Blog Post")).not.toBeInTheDocument();
      });
    });
  });

  describe("Post Actions", () => {
    it("calls onView when view button is clicked", async () => {
      render(<PostsManager onView={mockOnView} />);

      await waitFor(() => {
        const viewButtons = screen.getAllByText("👁️ View");
        fireEvent.click(viewButtons[0]);

        expect(mockOnView).toHaveBeenCalledWith(mockPosts[0]);
      });
    });

    it("calls onEdit when edit button is clicked", async () => {
      render(<PostsManager onEdit={mockOnEdit} />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        expect(mockOnEdit).toHaveBeenCalledWith(mockPosts[0]);
      });
    });

    it("deletes post when delete button is clicked", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete "First Blog Post"?'
        );
        expect(api.deletePost).toHaveBeenCalledWith(1);
      });
    });

    it("shows success message after deletion", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Post deleted successfully!")
        ).toBeInTheDocument();
      });
    });

    it("does not delete when confirmation is cancelled", async () => {
      window.confirm = jest.fn(() => false);
      render(<PostsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);

        expect(api.deletePost).not.toHaveBeenCalled();
      });
    });
  });

  describe("Bulk Operations", () => {
    it("shows bulk actions when posts are selected", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select first post

        expect(screen.getByText("1 selected")).toBeInTheDocument();
        expect(screen.getByText("🗑️ Delete Selected")).toBeInTheDocument();
      });
    });

    it("performs bulk delete operation", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select first post
        fireEvent.click(checkboxes[2]); // Select second post

        const bulkDeleteButton = screen.getByText("🗑️ Delete Selected");
        fireEvent.click(bulkDeleteButton);

        expect(window.confirm).toHaveBeenCalledWith(
          "Are you sure you want to delete 2 selected posts?"
        );
      });
    });

    it("selects all posts when select all is clicked", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
        fireEvent.click(selectAllCheckbox);

        expect(screen.getByText("3 selected")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    it("includes pagination controls", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        expect(
          screen.getByText(/Showing \d+ to \d+ of \d+ results/)
        ).toBeInTheDocument();
      });
    });

    it("allows changing page size", async () => {
      render(<PostsManager />);

      await waitFor(() => {
        const pageSizeSelect = screen.getByDisplayValue("25 per page");
        expect(pageSizeSelect).toBeInTheDocument();

        fireEvent.change(pageSizeSelect, { target: { value: "50" } });
        expect(screen.getByDisplayValue("50 per page")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetching posts fails", async () => {
      (api.getBlogPosts as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<PostsManager />);

      await waitFor(() => {
        expect(screen.getByText("Error loading posts")).toBeInTheDocument();
      });
    });

    it("displays error message when deletion fails", async () => {
      (api.deletePost as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      render(<PostsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText("Error deleting post")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("has create new post button that navigates to admin page", async () => {
      // Mock window.location
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<PostsManager />);

      const createButton = screen.getByText("➕ Create New Post");
      fireEvent.click(createButton);

      expect(window.location.href).toBe("/admin");
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive classes", () => {
      const { container } = render(<PostsManager className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
