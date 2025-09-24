"use client";

import { useState } from "react";
import { createPost, getUserInfo, logout } from "../lib/api";
import MultiMediaUpload from "../components/MultiMediaUpload";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import { useRouter } from "next/navigation";

function AdminPageContent() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "tech",
    tags: "",
    image_url: "",
    media_urls: [] as any[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await createPost(formData);
      setMessage("Post created successfully!");
      setFormData({
        title: "",
        content: "",
        category: "tech",
        tags: "",
        image_url: "",
        media_urls: [],
      });
      setMediaFiles([]);
    } catch (error) {
      setMessage("Error creating post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMediaSelect = (mediaFiles: any[]) => {
    setMediaFiles(mediaFiles);
    setFormData((prev) => ({
      ...prev,
      media_urls: mediaFiles,
      // Keep backward compatibility - set first image as image_url
      image_url: mediaFiles.find((m) => m.type === "image")?.url || "",
    }));
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back, {userInfo?.username}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin/posts")}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                📋 Manage Posts
              </button>
              <button
                onClick={() => router.push("/admin/portfolio")}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                🎨 Manage Portfolio
              </button>
              <button
                onClick={() => router.push("/admin/products")}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                🛍️ Manage Products
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter an engaging title"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="tech">🚀 Tech</option>
                  <option value="food">🍕 Food</option>
                  <option value="activity">🏃 Activity</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
              >
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Write your post content here... Use line breaks to separate paragraphs."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 flex items-center"
                >
                  <span className="mr-1">#</span>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., python, fastapi, web development"
                />
              </div>

              <div>
                <label
                  htmlFor="image_url"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 flex items-center"
                >
                  <span className="mr-1">🖼️</span>
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 flex items-center">
                <span className="mr-1">🎬</span>
                Upload Images & Videos
              </label>
              <MultiMediaUpload
                onMediaSelect={handleMediaSelect}
                existingMedia={mediaFiles}
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="mr-2">💾</span>
                {isSubmitting ? "Creating Post..." : "Create Post"}
              </button>

              <button
                type="button"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                <span className="mr-2">👁️</span>
                Preview
              </button>
            </div>
          </form>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-200 flex items-center">
              <span className="mr-2">💡</span>
              Writing Tips:
            </h2>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>• Use clear, descriptive titles for better SEO</li>
              <li>• Add relevant tags to help categorize your content</li>
              <li>• Include high-quality images to make posts more engaging</li>
              <li>• Write engaging content that provides value to readers</li>
              <li>
                • Use line breaks to separate paragraphs for better readability
              </li>
              <li>• Keep your audience in mind when choosing topics</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminPageContent />
    </ProtectedRoute>
  );
}
