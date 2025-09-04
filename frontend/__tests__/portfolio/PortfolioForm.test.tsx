import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";
import NewPortfolioPage from "../../app/admin/portfolio/new/page";
import * as api from "../../app/lib/api";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock API functions
jest.mock("../../app/lib/api", () => ({
  createPortfolioItem: jest.fn(),
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

describe("PortfolioForm", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.getUserInfo as jest.Mock).mockReturnValue({
      username: "admin",
      is_admin: true,
    });
    jest.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders new portfolio form with all fields", () => {
      render(<NewPortfolioPage />);

      expect(screen.getByText("Add New Project")).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Technologies/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project URL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/GitHub URL/)).toBeInTheDocument();
      expect(screen.getByText("🖼️ Project Image")).toBeInTheDocument();
    });

    it("shows required field indicators", () => {
      render(<NewPortfolioPage />);

      expect(screen.getByText("Project Title *")).toBeInTheDocument();
      expect(screen.getByText("Technologies *")).toBeInTheDocument();
      expect(screen.getByText("Project Description *")).toBeInTheDocument();
    });

    it("has proper form buttons", () => {
      render(<NewPortfolioPage />);

      expect(
        screen.getByRole("button", { name: /Create Project/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Cancel/ })
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("shows validation errors for empty required fields", async () => {
      render(<NewPortfolioPage />);

      const submitButton = screen.getByRole("button", {
        name: /Create Project/,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
        expect(
          screen.getByText("Technologies are required")
        ).toBeInTheDocument();
      });
    });

    it("validates title length", async () => {
      render(<NewPortfolioPage />);

      const titleInput = screen.getByLabelText(/Project Title/);
      const longTitle = "x".repeat(300); // Exceeds 255 character limit

      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Title must be less than 255 characters")
        ).toBeInTheDocument();
      });
    });

    it("validates description length", async () => {
      render(<NewPortfolioPage />);

      const descriptionInput = screen.getByLabelText(/Project Description/);
      const longDescription = "x".repeat(2100); // Exceeds 2000 character limit

      fireEvent.change(descriptionInput, {
        target: { value: longDescription },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Description must be less than 2000 characters")
        ).toBeInTheDocument();
      });
    });

    it("validates URL format", async () => {
      render(<NewPortfolioPage />);

      const projectUrlInput = screen.getByLabelText(/Project URL/);
      const githubUrlInput = screen.getByLabelText(/GitHub URL/);

      fireEvent.change(projectUrlInput, { target: { value: "invalid-url" } });
      fireEvent.change(githubUrlInput, { target: { value: "also-invalid" } });
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        const errorMessages = screen.getAllByText("Please enter a valid URL");
        expect(errorMessages).toHaveLength(2);
      });
    });

    it("clears validation errors when user starts typing", async () => {
      render(<NewPortfolioPage />);

      // Trigger validation error
      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });

      // Start typing in title field
      const titleInput = screen.getByLabelText(/Project Title/);
      fireEvent.change(titleInput, { target: { value: "New Title" } });

      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid data", async () => {
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
        id: 1,
      });

      render(<NewPortfolioPage />);

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Test Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React, Node.js" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(api.createPortfolioItem).toHaveBeenCalledWith({
          title: "Test Project",
          description: "Test description",
          technologies: "React, Node.js",
          project_url: null,
          github_url: null,
          image_url: null,
        });
      });
    });

    it("submits form with all fields filled", async () => {
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
        id: 1,
      });

      render(<NewPortfolioPage />);

      // Fill in all fields
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Complete Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Complete description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "Vue.js, Express.js" },
      });
      fireEvent.change(screen.getByLabelText(/Project URL/), {
        target: { value: "https://project.com" },
      });
      fireEvent.change(screen.getByLabelText(/GitHub URL/), {
        target: { value: "https://github.com/user/project" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(api.createPortfolioItem).toHaveBeenCalledWith({
          title: "Complete Project",
          description: "Complete description",
          technologies: "Vue.js, Express.js",
          project_url: "https://project.com",
          github_url: "https://github.com/user/project",
          image_url: null,
        });
      });
    });

    it("shows success message and redirects after successful submission", async () => {
      (api.createPortfolioItem as jest.Mock).mockResolvedValue({
        message: "Success",
        id: 1,
      });

      render(<NewPortfolioPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Test Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Portfolio item created successfully!")
        ).toBeInTheDocument();
      });

      // Should redirect after delay
      await waitFor(
        () => {
          expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio");
        },
        { timeout: 2000 }
      );
    });

    it("handles submission error gracefully", async () => {
      (api.createPortfolioItem as jest.Mock).mockRejectedValue(
        new Error("Submission failed")
      );

      render(<NewPortfolioPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Test Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        expect(
          screen.getByText("Error creating portfolio item. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("disables submit button during submission", async () => {
      (api.createPortfolioItem as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<NewPortfolioPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Project Title/), {
        target: { value: "Test Project" },
      });
      fireEvent.change(screen.getByLabelText(/Project Description/), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Technologies/), {
        target: { value: "React" },
      });

      const submitButton = screen.getByRole("button", {
        name: /Create Project/,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Creating Project...")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Image Upload", () => {
    it("handles image upload successfully", async () => {
      (api.uploadImage as jest.Mock).mockResolvedValue({
        url: "https://example.com/uploaded.jpg",
      });

      render(<NewPortfolioPage />);

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
    });

    it("validates image file type", async () => {
      render(<NewPortfolioPage />);

      const fileInput = screen
        .getByRole("button", { name: /Choose file/ })
        .closest("input") as HTMLInputElement;
      const file = new File(["test"], "test.txt", { type: "text/plain" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText("Please select a valid image file")
        ).toBeInTheDocument();
      });
    });

    it("validates image file size", async () => {
      render(<NewPortfolioPage />);

      const fileInput = screen
        .getByRole("button", { name: /Choose file/ })
        .closest("input") as HTMLInputElement;
      // Create a file larger than 10MB
      const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(largeFile, "size", { value: 11 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(
          screen.getByText("Image file size must be less than 10MB")
        ).toBeInTheDocument();
      });
    });

    it("shows image preview when URL is entered", () => {
      render(<NewPortfolioPage />);

      const imageUrlInput = screen.getByPlaceholderText(
        "https://example.com/image.jpg"
      );
      fireEvent.change(imageUrlInput, {
        target: { value: "https://example.com/test.jpg" },
      });

      expect(screen.getByText("Image Preview:")).toBeInTheDocument();
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("navigates back to portfolio management on cancel", () => {
      render(<NewPortfolioPage />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/ });
      fireEvent.click(cancelButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio");
    });

    it("navigates back via back button", () => {
      render(<NewPortfolioPage />);

      const backButton = screen.getByText("⬅️ Back to Portfolio");
      fireEvent.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/portfolio");
    });
  });

  describe("Accessibility", () => {
    it("has proper form labels", () => {
      render(<NewPortfolioPage />);

      expect(screen.getByLabelText(/Project Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Technologies/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Description/)).toBeInTheDocument();
    });

    it("associates error messages with form fields", async () => {
      render(<NewPortfolioPage />);

      fireEvent.click(screen.getByRole("button", { name: /Create Project/ }));

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Project Title/);
        const errorMessage = screen.getByText("Title is required");

        expect(titleInput).toHaveAttribute("aria-invalid");
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
