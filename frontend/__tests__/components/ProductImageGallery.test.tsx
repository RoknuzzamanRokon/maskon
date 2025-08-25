import { render, screen, fireEvent } from "@testing-library/react";
import ProductImageGallery from "../../app/components/ProductImageGallery";

// Mock product data for testing
const mockProductWithMultipleImages = {
  id: 1,
  name: "Test Product",
  images: [
    { id: 1, image_url: "https://example.com/image1.jpg", is_primary: true },
    { id: 2, image_url: "https://example.com/image2.jpg", is_primary: false },
    { id: 3, image_url: "https://example.com/image3.jpg", is_primary: false },
  ],
};

const mockProductWithSingleImage = {
  id: 2,
  name: "Single Image Product",
  image_url: "https://example.com/single.jpg",
};

const mockProductWithNoImages = {
  id: 3,
  name: "No Image Product",
};

describe("ProductImageGallery", () => {
  test("renders multiple images with navigation", () => {
    render(<ProductImageGallery product={mockProductWithMultipleImages} />);

    // Check if main image is displayed
    const mainImage = screen.getByAltText("Test Product - Image 1");
    expect(mainImage).toBeInTheDocument();

    // Check if image counter is displayed
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    // Check if thumbnails are displayed
    const thumbnails = screen.getAllByRole("button");
    expect(thumbnails.length).toBeGreaterThan(3); // Navigation + thumbnails + action buttons
  });

  test("displays primary image first", () => {
    render(<ProductImageGallery product={mockProductWithMultipleImages} />);

    // Primary image should be displayed first
    const mainImage = screen.getByAltText("Test Product - Image 1");
    expect(mainImage).toHaveAttribute("src", "https://example.com/image1.jpg");

    // Primary indicator should be visible on first thumbnail
    expect(screen.getByText("Main")).toBeInTheDocument();
  });

  test("navigates between images using arrow buttons", () => {
    render(<ProductImageGallery product={mockProductWithMultipleImages} />);

    // Find navigation buttons
    const nextButton = screen.getByRole("button", { name: /next/i });

    // Click next button
    fireEvent.click(nextButton);

    // Check if image counter updated
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  test("handles single image product", () => {
    render(<ProductImageGallery product={mockProductWithSingleImage} />);

    // Should display the single image
    const image = screen.getByAltText("Single Image Product - Image 1");
    expect(image).toBeInTheDocument();

    // Should not display navigation arrows or counter
    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
  });

  test("displays placeholder for product with no images", () => {
    render(<ProductImageGallery product={mockProductWithNoImages} />);

    // Should display placeholder
    expect(screen.getByText("No image available")).toBeInTheDocument();
    expect(screen.getByText("📦")).toBeInTheDocument();
  });

  test("zoom functionality works", () => {
    render(<ProductImageGallery product={mockProductWithMultipleImages} />);

    // Find zoom button
    const zoomButton = screen.getByText("🔍 Zoom In");

    // Click zoom button
    fireEvent.click(zoomButton);

    // Check if button text changed
    expect(screen.getByText("🔍 Zoom Out")).toBeInTheDocument();
  });

  test("thumbnail selection changes main image", () => {
    render(<ProductImageGallery product={mockProductWithMultipleImages} />);

    // Find second thumbnail and click it
    const thumbnails = screen.getAllByRole("button");
    const secondThumbnail = thumbnails.find((btn) =>
      btn.querySelector("img")?.getAttribute("alt")?.includes("thumbnail 2")
    );

    if (secondThumbnail) {
      fireEvent.click(secondThumbnail);

      // Check if image counter updated
      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    }
  });
});
