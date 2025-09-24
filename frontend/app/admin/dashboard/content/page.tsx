"use client";

import React, { useState } from "react";
import { PostsManager } from "../../../components/admin/PostsManager";
import { PortfolioManager } from "../../../components/admin/PortfolioManager";
import { ProductsManager } from "../../../components/admin/ProductsManager";
import ProtectedRoute from "../../../components/ProtectedRoute";

type ContentType = "posts" | "portfolio" | "products";

function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<ContentType>("posts");

  const handleEdit = (item: any) => {
    console.log("Edit item:", item);
    // Navigate to edit page or open modal
  };

  const handleView = (item: any) => {
    console.log("View item:", item);
    // Navigate to view page or open modal
  };

  const tabs = [
    { id: "posts" as ContentType, label: "Posts", icon: "📝" },
    { id: "portfolio" as ContentType, label: "Portfolio", icon: "🎨" },
    { id: "products" as ContentType, label: "Products", icon: "🛍️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Content Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage all your content from one centralized location
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {activeTab === "posts" && (
              <div className="p-6">
                <PostsManager onEdit={handleEdit} onView={handleView} />
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="p-6">
                <PortfolioManager onEdit={handleEdit} onView={handleView} />
              </div>
            )}

            {activeTab === "products" && (
              <div className="p-6">
                <ProductsManager onEdit={handleEdit} onView={handleView} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentManagementPageWrapper() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <ContentManagementPage />
    </ProtectedRoute>
  );
}
