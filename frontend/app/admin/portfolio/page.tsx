"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getPortfolio,
  deletePortfolioItem,
  getUserInfo,
  logout,
} from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";

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

function PortfolioManagementContent() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      setIsLoading(true);
      const items = await getPortfolio();
      setPortfolioItems(items);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      setMessage("Error loading portfolio items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePortfolioItem(id);
      setMessage("Portfolio item deleted successfully!");
      setDeleteConfirm(null);
      fetchPortfolioItems(); // Refresh the list
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      setMessage("Error deleting portfolio item");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Portfolio Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage your featured projects
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/admin/portfolio/new")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  ➕ Add New Project
                </button>
                <button
                  onClick={() => router.push("/admin")}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ⬅️ Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg mb-6 border ${
                  message.includes("Error")
                    ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                    : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                }`}
              >
                {message}
              </div>
            )}

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📁</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Portfolio Items Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start showcasing your work by adding your first project.
                </p>
                <button
                  onClick={() => router.push("/admin/portfolio/new")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  ➕ Add Your First Project
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {item.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                        {item.description}
                      </p>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Technologies:
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          {item.technologies}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/portfolio/edit/${item.id}`)
                          }
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      {item.project_url && (
                        <a
                          href={item.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          🔗 View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this portfolio item? It will be
              permanently removed from your portfolio.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                🗑️ Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortfolioManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <PortfolioManagementContent />
    </ProtectedRoute>
  );
}
