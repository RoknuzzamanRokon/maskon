import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DataTable, Column } from "../DataTable";

interface TestItem {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  created_at: string;
}

const mockData: TestItem[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "active",
    created_at: "2024-01-03T00:00:00Z",
  },
];

const mockColumns: Column<TestItem>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
  },
  {
    key: "email",
    header: "Email",
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    render: (status) => (
      <span className={status === "active" ? "text-green-600" : "text-red-600"}>
        {status}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    sortable: true,
    render: (date) => new Date(date).toLocaleDateString(),
  },
];

describe("DataTable", () => {
  const defaultProps = {
    data: mockData,
    columns: mockColumns,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders table with data", () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("renders column headers", () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
    });

    it("renders custom cell content using render function", () => {
      render(<DataTable {...defaultProps} />);

      const activeStatus = screen.getAllByText("active");
      const inactiveStatus = screen.getAllByText("inactive");

      expect(activeStatus.length).toBeGreaterThan(0);
      expect(inactiveStatus.length).toBeGreaterThan(0);
    });

    it("displays empty message when no data", () => {
      render(
        <DataTable {...defaultProps} data={[]} emptyMessage="No items found" />
      );

      expect(screen.getByText("No items found")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading skeleton when loading is true", () => {
      render(<DataTable {...defaultProps} loading={true} />);

      const skeletonElements = document.querySelectorAll(".animate-pulse");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("hides data when loading", () => {
      render(<DataTable {...defaultProps} loading={true} />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    const mockOnSelectionChange = jest.fn();

    it("renders checkboxes when selectable is true", () => {
      render(
        <DataTable
          {...defaultProps}
          selectable={true}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBe(mockData.length + 1); // +1 for select all
    });

    it("calls onSelectionChange when item is selected", () => {
      render(
        <DataTable
          {...defaultProps}
          selectable={true}
          selectedItems={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]); // First data row checkbox

      expect(mockOnSelectionChange).toHaveBeenCalledWith([mockData[0]]);
    });

    it("selects all items when select all checkbox is clicked", () => {
      render(
        <DataTable
          {...defaultProps}
          selectable={true}
          selectedItems={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(selectAllCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(mockData);
    });

    it("deselects all items when select all is unchecked", () => {
      render(
        <DataTable
          {...defaultProps}
          selectable={true}
          selectedItems={mockData}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(selectAllCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe("Sorting", () => {
    const mockOnSort = jest.fn();

    it("calls onSort when sortable column header is clicked", () => {
      render(<DataTable {...defaultProps} onSort={mockOnSort} />);

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);

      expect(mockOnSort).toHaveBeenCalledWith("name", "asc");
    });

    it("toggles sort direction on subsequent clicks", () => {
      render(<DataTable {...defaultProps} onSort={mockOnSort} />);

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      expect(mockOnSort).toHaveBeenCalledWith("name", "desc");
    });

    it("shows sort indicators for sortable columns", () => {
      render(<DataTable {...defaultProps} />);

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveClass("cursor-pointer");
    });
  });

  describe("Search", () => {
    const mockOnSearchChange = jest.fn();

    it("renders search input when searchable is true", () => {
      render(
        <DataTable
          {...defaultProps}
          searchable={true}
          onSearchChange={mockOnSearchChange}
        />
      );

      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("calls onSearchChange when search input changes", () => {
      render(
        <DataTable
          {...defaultProps}
          searchable={true}
          searchValue=""
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "john" } });

      expect(mockOnSearchChange).toHaveBeenCalledWith("john");
    });

    it("displays current search value", () => {
      render(
        <DataTable
          {...defaultProps}
          searchable={true}
          searchValue="test search"
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByDisplayValue("test search");
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    const mockPagination = {
      currentPage: 1,
      totalPages: 3,
      pageSize: 10,
      totalItems: 25,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
    };

    it("renders pagination controls when pagination prop is provided", () => {
      render(<DataTable {...defaultProps} pagination={mockPagination} />);

      expect(
        screen.getByText("Showing 1 to 3 of 25 results")
      ).toBeInTheDocument();
    });

    it("calls onPageChange when page button is clicked", () => {
      render(<DataTable {...defaultProps} pagination={mockPagination} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageSizeChange when page size is changed", () => {
      render(<DataTable {...defaultProps} pagination={mockPagination} />);

      const pageSizeSelect = screen.getByDisplayValue("10 per page");
      fireEvent.change(pageSizeSelect, { target: { value: "25" } });

      expect(mockPagination.onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it("disables previous button on first page", () => {
      render(<DataTable {...defaultProps} pagination={mockPagination} />);

      const prevButton = screen.getByRole("button", { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it("disables next button on last page", () => {
      const lastPagePagination = { ...mockPagination, currentPage: 3 };
      render(<DataTable {...defaultProps} pagination={lastPagePagination} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has proper table structure", () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("columnheader")).toHaveLength(
        mockColumns.length
      );
      expect(screen.getAllByRole("row")).toHaveLength(mockData.length + 1); // +1 for header
    });

    it("has proper checkbox labels for selection", () => {
      render(
        <DataTable
          {...defaultProps}
          selectable={true}
          onSelectionChange={jest.fn()}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute("type", "checkbox");
      });
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <DataTable {...defaultProps} className="custom-table" />
      );

      expect(container.firstChild).toHaveClass("custom-table");
    });

    it("applies column width when specified", () => {
      const columnsWithWidth: Column<TestItem>[] = [
        { ...mockColumns[0], width: "w-1/4" },
      ];

      render(<DataTable data={mockData} columns={columnsWithWidth} />);

      const header = screen.getByText("Name").closest("th");
      expect(header).toHaveClass("w-1/4");
    });
  });

  describe("Error Handling", () => {
    it("handles missing render function gracefully", () => {
      const columnsWithoutRender: Column<TestItem>[] = [
        { key: "name", header: "Name" },
      ];

      expect(() => {
        render(<DataTable data={mockData} columns={columnsWithoutRender} />);
      }).not.toThrow();
    });

    it("handles nested object keys", () => {
      const nestedData = [{ id: 1, user: { profile: { name: "John" } } }];
      const nestedColumns: Column<any>[] = [
        { key: "user.profile.name", header: "Name" },
      ];

      render(<DataTable data={nestedData} columns={nestedColumns} />);

      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });
});
