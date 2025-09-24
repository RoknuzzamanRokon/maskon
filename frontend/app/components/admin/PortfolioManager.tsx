"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DataTable, Column } from "./DataTable";
import {
  getPortfolio,
  updatePortfolioItem,
  deletePortfolioItem,
} from "../../lib/api";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  technologies: string;
  project_url?: string;
  github_url?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

interface PortfolioManagerProps {
  onEdit?: (item: PortfolioItem) => void;
  onView?: (item: PortfolioItem) => void;
  className?: string;
}

export function PortfolioManager({
  onEdit,
  onView,
  className = "",
}: PortfolioManagerProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<PortfolioItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<PortfolioItem>>({});

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      const data = await getPortfolio();
      setPortfolioItems(data);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      setMessage("Error loading portfolio items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    try {
      await deletePortfolioItem(item.id);
      setMessage("Portfolio item deleted successfully!");
      setPortfolioItems(portfolioItems.filter((p) => p.id !== item.id));
      setSelectedItems(selectedItems.filter((p) => p.id !== item.id));
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      setMessage("Error deleting portfolio item");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.length} selected items?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedItems.map((item) => deletePortfolioItem(item.id))
      );
      setMessage(
        `${selectedItems.length} portfolio items deleted successfully!`
      );
      const deletedIds = selectedItems.map((p) => p.id);
      setPortfolioItems(
        portfolioItems.filter((p) => !deletedIds.includes(p.id))
      );
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting portfolio items:", error);
      setMessage("Error deleting some portfolio items");
    }
  };

  const startInlineEdit = (item: PortfolioItem) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      technologies: item.technologies,
      project_url: item.project_url,
      github_url: item.github_url,
    });
  };

  const cancelInlineEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const saveInlineEdit = async () => {
    if (!editingItem || !editForm.title || !editForm.description) {
      setMessage("Title and description are required");
      return;
    }

    try {
      const updatedItem = await updatePortfolioItem(editingItem, editForm);
      setMessage("Portfolio item updated successfully!");
      setPortfolioItems(
        portfolioItems.map((item) =>
          item.id === editingItem ? { ...item, ...updatedItem } : item
        )
      );
      setEditingItem(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      setMessage("Error updating portfolio item");
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchValue) return portfolioItems;

    const searchLower = searchValue.toLowerCase();
    return portfolioItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.technologies.toLowerCase().includes(searchLower)
    );
  }, [portfolioItems, searchValue]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const columns: Column<PortfolioItem>[] = [
    {
      key: "title",
      header: "Project",
      sortable: true,
      render: (_, item) => (
        <div className="flex items-center">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-12 w-12 rounded-lg object-cover mr-4"
            />
          )}
          <div className="min-w-0 flex-1">
            {editingItem === item.id ? (
              <input
                type="text"
                value={editForm.title || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white"
                placeholder="Project title"
              />
            ) : (
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {item.title}
              </div>
            )}
            {editingItem === item.id ? (
              <textarea
                value={editForm.description || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full mt-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-500 dark:text-gray-400"
                placeholder="Project description"
                rows={2}
              />
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.description.substring(0, 100)}...
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "technologies",
      header: "Technologies",
      sortable: true,
      render: (_, item) =>
        editingItem === item.id ? (
          <input
            type="text"
            value={editForm.technologies || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, technologies: e.target.value })
            }
            className="w-full text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-purple-600 dark:text-purple-400"
            placeholder="Technologies used"
          />
        ) : (
          <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            {item.technologies}
          </span>
        ),
    },
    {
      key: "project_url",
      header: "Links",
      render: (_, item) => (
        <div className="space-y-1">
          {editingItem === item.id ? (
            <>
              <input
                type="url"
                value={editForm.project_url || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, project_url: e.target.value })
                }
                className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-blue-600 dark:text-blue-400"
                placeholder="Project URL"
              />
              <input
                type="url"
                value={editForm.github_url || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, github_url: e.target.value })
                }
                className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-600 dark:text-gray-400"
                placeholder="GitHub URL"
              />
            </>
          ) : (
            <>
              {item.project_url && (
                <a
                  href={item.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  🔗 Live Demo
                </a>
              )}
              {item.github_url && (
                <a
                  href={item.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-gray-600 dark:text-gray-400 hover:underline"
                >
                  📁 GitHub
                </a>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, item) => (
        <div className="flex space-x-2">
          {editingItem === item.id ? (
            <>
              <button
                onClick={saveInlineEdit}
                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm"
              >
                ✅ Save
              </button>
              <button
                onClick={cancelInlineEdit}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onView?.(item)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
              >
                👁️ View
              </button>
              <button
                onClick={() => startInlineEdit(item)}
                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onEdit?.(item)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 text-sm"
              >
                📝 Full Edit
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Portfolio Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your portfolio projects ({filteredItems.length} total)
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/admin/portfolio/new")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          ➕ Add New Project
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.includes("Error")
              ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
              : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedItems.length} items selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Inline Editing Notice */}
      {editingItem && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-yellow-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You are currently editing an item. Save or cancel to continue.
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={paginatedItems}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        searchable={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredItems.length / pageSize),
          pageSize,
          totalItems: filteredItems.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        emptyMessage="No portfolio items found"
      />
    </div>
  );
}
