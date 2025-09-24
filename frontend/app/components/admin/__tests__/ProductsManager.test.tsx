import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProductsManager } from "../ProductsManager";
import * as api from "../../../lib/api";

// Mock the API functions
jest.mock("../../../lib/api", () => ({
  getProducts: jest.fn(),
  deleteProduct: jest.fn(),
  updateProduct: jest.fn(),
}));

const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    category: "electronics",
    stock: 25,
    is_active: true,
    discount: 10,
    image_url: "https://example.com/headphones.jpg",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Cotton T-Shirt",
    description: "Comfortable 100% cotton t-shirt in various colors",
    price: 29.99,
    category: "clothing",
    stock: 0,
    is_active: false,
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "JavaScript Guide",
    description: "Complete guide to modern JavaScript development",
    price: 49.99,
    category: "books",
    stock: 15,
    is_active: true,
    images: [
      { image_url: "https://example.com/book1.jpg", is_primary: true },
      { image_url: "https://example.com/book2.jpg", is_primary: false },
    ],
    created_at: "2024-01-03T00:00:00Z",
  },
];

describe("ProductsManager", () => {
  const mockOnEdit = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (api.deleteProduct as jest.Mock).mockResolvedValue({ success: true });
    (api.updateProduct as jest.Mock).mockResolvedValue({ success: true });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders products manager with header", async () => {
      render(<ProductsManager onEdit={mockOnEdit} onView={mockOnView} />);

      expect(screen.getByText("Products Management")).toBeInTheDocument();
      expect(screen.getByText("➕ Add New Product")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
      });
    });

    it("displays loading state initially", () => {
      render(<ProductsManager />);

      const skeletonElements = document.querySelectorAll(".animate-pulse");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("fetches and displays products on mount", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(api.getProducts).toHaveBeenCalledWith(100);
        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("Cotton T-Shirt")).toBeInTheDocument();
        expect(screen.getByText("JavaScript Guide")).toBeInTheDocument();
      });
    });

    it("displays product count in header", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(screen.getByText(/3 total/)).toBeInTheDocument();
      });
    });
  });

  describe("Product Display", () => {
    it("displays product information correctly", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        // Check product names
        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("Cotton T-Shirt")).toBeInTheDocument();

        // Check prices
        expect(screen.getByText("$199.99")).toBeInTheDocument();
        expect(screen.getByText("$29.99")).toBeInTheDocument();

        // Check categories
        expect(screen.getByText("electronics")).toBeInTheDocument();
        expect(screen.getByText("clothing")).toBeInTheDocument();
        expect(screen.getByText("books")).toBeInTheDocument();

        // Check stock levels
        expect(screen.getByText("25 units")).toBeInTheDocument();
        expect(screen.getByText("0 units")).toBeInTheDocument();
        expect(screen.getByText("15 units")).toBeInTheDocument();
      });
    });

    it("displays product images correctly", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(2); // Two products have images

        // Check primary image from images array
        expect(images[1]).toHaveAttribute(
          "src",
          "https://example.com/book1.jpg"
        );
      });
    });

    it("shows discount information when available", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(screen.getByText("-10% off")).toBeInTheDocument();
      });
    });

    it("displays stock status with appropriate colors", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const stockElements = screen.getAllByText(/\d+ units/);

        // High stock (>10) should have green styling
        const highStock = screen.getByText("25 units");
        expect(highStock).toHaveClass("bg-green-100");

        // Zero stock should have red styling
        const zeroStock = screen.getByText("0 units");
        expect(zeroStock).toHaveClass("bg-red-100");
      });
    });

    it("displays product status correctly", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const activeStatuses = screen.getAllByText("Active");
        const inactiveStatuses = screen.getAllByText("Inactive");

        expect(activeStatuses).toHaveLength(2);
        expect(inactiveStatuses).toHaveLength(1);
      });
    });
  });

  describe("Filtering", () => {
    it("renders category and status filter dropdowns", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(screen.getByLabelText("Category")).toBeInTheDocument();
        expect(screen.getByLabelText("Status")).toBeInTheDocument();
        expect(screen.getByDisplayValue("All Categories")).toBeInTheDocument();
        expect(screen.getByDisplayValue("All Status")).toBeInTheDocument();
      });
    });

    it("filters products by category", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "electronics" } });

        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.queryByText("Cotton T-Shirt")).not.toBeInTheDocument();
      });
    });

    it("filters products by status", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const statusSelect = screen.getByLabelText("Status");
        fireEvent.change(statusSelect, { target: { value: "active" } });

        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("JavaScript Guide")).toBeInTheDocument();
        expect(screen.queryByText("Cotton T-Shirt")).not.toBeInTheDocument();
      });
    });

    it("combines category and status filters", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const categorySelect = screen.getByLabelText("Category");
        const statusSelect = screen.getByLabelText("Status");

        fireEvent.change(categorySelect, { target: { value: "electronics" } });
        fireEvent.change(statusSelect, { target: { value: "active" } });

        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.queryByText("Cotton T-Shirt")).not.toBeInTheDocument();
        expect(screen.queryByText("JavaScript Guide")).not.toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("includes search functionality", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      });
    });

    it("filters products by search term", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search...");
        fireEvent.change(searchInput, { target: { value: "headphones" } });

        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.queryByText("Cotton T-Shirt")).not.toBeInTheDocument();
      });
    });

    it("searches in name, description, and category", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search...");

        // Search by description
        fireEvent.change(searchInput, { target: { value: "cotton" } });
        expect(screen.getByText("Cotton T-Shirt")).toBeInTheDocument();
        expect(
          screen.queryByText("Wireless Headphones")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Product Actions", () => {
    it("calls onView when view button is clicked", async () => {
      render(<ProductsManager onView={mockOnView} />);

      await waitFor(() => {
        const viewButtons = screen.getAllByText("👁️ View");
        fireEvent.click(viewButtons[0]);

        expect(mockOnView).toHaveBeenCalledWith(mockProducts[0]);
      });
    });

    it("calls onEdit when edit button is clicked", async () => {
      render(<ProductsManager onEdit={mockOnEdit} />);

      await waitFor(() => {
        const editButtons = screen.getAllByText("✏️ Edit");
        fireEvent.click(editButtons[0]);

        expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0]);
      });
    });

    it("deletes product when delete button is clicked", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete "Wireless Headphones"?'
        );
        expect(api.deleteProduct).toHaveBeenCalledWith(1);
      });
    });

    it("toggles product status when activate/deactivate is clicked", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const deactivateButtons = screen.getAllByText("Deactivate");
        fireEvent.click(deactivateButtons[0]);

        expect(api.updateProduct).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            is_active: false,
          })
        );
      });
    });

    it("shows success message after status change", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const deactivateButtons = screen.getAllByText("Deactivate");
        fireEvent.click(deactivateButtons[0]);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Product deactivated successfully!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Bulk Operations", () => {
    it("shows bulk actions when products are selected", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select first product

        expect(screen.getByText("1 selected")).toBeInTheDocument();
        expect(screen.getByText("✅ Activate")).toBeInTheDocument();
        expect(screen.getByText("⏸️ Deactivate")).toBeInTheDocument();
        expect(screen.getByText("🗑️ Delete")).toBeInTheDocument();
      });
    });

    it("performs bulk activation", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[2]); // Select inactive product

        const activateButton = screen.getByText("✅ Activate");
        fireEvent.click(activateButton);

        expect(window.confirm).toHaveBeenCalledWith(
          "Are you sure you want to activate 1 selected products?"
        );
      });
    });

    it("performs bulk deactivation", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select active product

        const deactivateButton = screen.getByText("⏸️ Deactivate");
        fireEvent.click(deactivateButton);

        expect(window.confirm).toHaveBeenCalledWith(
          "Are you sure you want to deactivate 1 selected products?"
        );
      });
    });

    it("performs bulk delete operation", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[1]); // Select first product
        fireEvent.click(checkboxes[2]); // Select second product

        const bulkDeleteButton = screen.getByText("🗑️ Delete");
        fireEvent.click(bulkDeleteButton);

        expect(window.confirm).toHaveBeenCalledWith(
          "Are you sure you want to delete 2 selected products?"
        );
      });
    });
  });

  describe("Image Handling", () => {
    it("displays primary image from images array", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        // Find the image for JavaScript Guide (has images array)
        const bookImage = images.find(
          (img) => img.getAttribute("src") === "https://example.com/book1.jpg"
        );
        expect(bookImage).toBeInTheDocument();
      });
    });

    it("shows placeholder for products without images", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(screen.getByText("No Image")).toBeInTheDocument();
      });
    });

    it("handles different image formats (image_url, image_urls, images)", async () => {
      const productsWithDifferentImages = [
        { ...mockProducts[0] }, // Has image_url
        { ...mockProducts[1], image_urls: ["https://example.com/shirt.jpg"] }, // Has image_urls
        { ...mockProducts[2] }, // Has images array
      ];

      (api.getProducts as jest.Mock).mockResolvedValue(
        productsWithDifferentImages
      );

      render(<ProductsManager />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(3);
      });
    });
  });

  describe("Pagination", () => {
    it("includes pagination controls", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        expect(
          screen.getByText(/Showing \d+ to \d+ of \d+ results/)
        ).toBeInTheDocument();
      });
    });

    it("allows changing page size", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const pageSizeSelect = screen.getByDisplayValue("25 per page");
        expect(pageSizeSelect).toBeInTheDocument();

        fireEvent.change(pageSizeSelect, { target: { value: "50" } });
        expect(screen.getByDisplayValue("50 per page")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetching products fails", async () => {
      (api.getProducts as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<ProductsManager />);

      await waitFor(() => {
        expect(screen.getByText("Error loading products")).toBeInTheDocument();
      });
    });

    it("displays error message when deletion fails", async () => {
      (api.deleteProduct as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      render(<ProductsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("🗑️ Delete");
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText("Error deleting product")).toBeInTheDocument();
      });
    });

    it("displays error message when status update fails", async () => {
      (api.updateProduct as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      render(<ProductsManager />);

      await waitFor(() => {
        const deactivateButtons = screen.getAllByText("Deactivate");
        fireEvent.click(deactivateButtons[0]);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Error updating product status")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("has add new product button that navigates to product creation page", async () => {
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<ProductsManager />);

      const createButton = screen.getByText("➕ Add New Product");
      fireEvent.click(createButton);

      expect(window.location.href).toBe("/admin/products/create");
    });
  });

  describe("Category Display", () => {
    it("displays categories with appropriate styling", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const electronicsCategory = screen.getByText("electronics");
        const clothingCategory = screen.getByText("clothing");
        const booksCategory = screen.getByText("books");

        expect(electronicsCategory).toHaveClass("bg-blue-100");
        expect(clothingCategory).toHaveClass("bg-green-100");
        expect(booksCategory).toHaveClass("bg-purple-100");
      });
    });

    it("populates category filter with unique categories", async () => {
      render(<ProductsManager />);

      await waitFor(() => {
        const categorySelect = screen.getByLabelText("Category");
        fireEvent.click(categorySelect);

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Clothing")).toBeInTheDocument();
        expect(screen.getByText("Books")).toBeInTheDocument();
      });
    });
  });
});
