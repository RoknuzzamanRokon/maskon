"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DataTable, Column } from "./DataTable";
import { getBlogPosts, deletePost } from "../../lib/api";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
}

interface PostsManagerProps {
  onEdit?: (post: Post) => void;
  onView?: (post: Post) => void;
  className?: string;
}

export function PostsManager({
  onEdit,
  onView,
  className = "",
}: PostsManagerProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [message, setMessage] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getBlogPosts(100); // Get more posts for management
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setMessage("Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      await deletePost(post.id);
      setMessage("Post deleted successfully!");
      setPosts(posts.filter((p) => p.id !== post.id));
      setSelectedPosts(selectedPosts.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error("Error deleting post:", error);
      setMessage("Error deleting post");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedPosts.length} selected posts?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(selectedPosts.map((post) => deletePost(post.id)));
      setMessage(`${selectedPosts.length} posts deleted successfully!`);
      const deletedIds = selectedPosts.map((p) => p.id);
      setPosts(posts.filter((p) => !deletedIds.includes(p.id)));
      setSelectedPosts([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error deleting posts:", error);
      setMessage("Error deleting some posts");
    }
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter);
    }

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [posts, categoryFilter, searchValue]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPosts.slice(startIndex, startIndex + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(posts.map((post) => post.category))
    );
    return uniqueCategories.sort();
  }, [posts]);

  const columns: Column<Post>[] = [
    {
      key: "title",
      header: "Post",
      sortable: true,
      render: (_, post) => (
        <div className="flex items-center">
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="h-12 w-12 rounded-lg object-cover mr-4"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {post.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {post.content.substring(0, 100)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (category) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            category === "tech"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
              : category === "food"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
              : category === "activity"
              ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
        >
          {category === "tech" && "🚀"}
          {category === "food" && "🍕"}
          {category === "activity" && "🏃"}
          {category}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "likes_count",
      header: "Engagement",
      render: (_, post) => (
        <div className="flex space-x-4 text-sm">
          <span className="flex items-center">
            <span className="mr-1">👍</span>
            {post.likes_count || 0}
          </span>
          <span className="flex items-center">
            <span className="mr-1">👎</span>
            {post.dislikes_count || 0}
          </span>
          <span className="flex items-center">
            <span className="mr-1">💬</span>
            {post.comments_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, post) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onView?.(post)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
          >
            👁️ View
          </button>
          <button
            onClick={() => onEdit?.(post)}
            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(post)}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
          >
            🗑️ Delete
          </button>
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
            Posts Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your blog posts ({filteredPosts.length} total)
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/admin")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Create New Post
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedPosts.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              🗑️ Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={paginatedPosts}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedItems={selectedPosts}
        onSelectionChange={setSelectedPosts}
        searchable={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredPosts.length / pageSize),
          pageSize,
          totalItems: filteredPosts.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        emptyMessage="No posts found"
      />
    </div>
  );
}
