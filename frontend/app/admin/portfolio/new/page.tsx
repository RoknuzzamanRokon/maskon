"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPortfolioItem,
  uploadImage,
  getUserInfo,
  logout,
} from "../../../lib/api";
import ProtectedRoute from "../../../components/ProtectedRoute";

interface PortfolioFormData {
  title: string;
  description: string;
  technologies: string;
  project_url: string;
  github_url: string;
  image_url: string;
}

function NewPortfolioContent() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    description: "",
    technologies: "",
    project_url: "",
    github_url: "",
    image_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    if (!formData.technologies.trim()) {
      newErrors.technologies = "Technologies are required";
    } else if (formData.technologies.length > 500) {
      newErrors.technologies = "Technologies must be less than 500 characters";
    }

    if (formData.project_url && !isValidUrl(formData.project_url)) {
      newErrors.project_url = "Please enter a valid URL";
    }

    if (formData.github_url && !isValidUrl(formData.github_url)) {
      newErrors.github_url = "Please enter a valid URL";
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      // Clean up form data - remove empty strings for optional fields
      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        technologies: formData.technologies.trim(),
        project_url: formData.project_url.trim() || null,
        github_url: formData.github_url.trim() || null,
        image_url: formData.image_url.trim() || null,
      };

      await createPortfolioItem(cleanedData);
      setMessage("Portfolio item created successfully!");

      // Redirect to portfolio management after a short delay
      setTimeout(() => {
        router.push("/admin/portfolio");
      }, 1500);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      setMessage("Error creating portfolio item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image file size must be less than 10MB");
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        image_url: result.url,
      }));
      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Error uploading image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">➕</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Add New Project
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Showcase your latest work
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/admin/portfolio")}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ⬅️ Back to Portfolio
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.title
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="technologies"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    Technologies *
                  </label>
                  <input
                    type="text"
                    id="technologies"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.technologies
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                  {errors.technologies && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.technologies}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                >
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.description
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Describe your project, its features, and what makes it special..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="project_url"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    🔗 Project URL (optional)
                  </label>
                  <input
                    type="url"
                    id="project_url"
                    name="project_url"
                    value={formData.project_url}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.project_url
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="https://your-project.com"
                  />
                  {errors.project_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.project_url}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="github_url"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    🐙 GitHub URL (optional)
                  </label>
                  <input
                    type="url"
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.github_url
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="https://github.com/username/project"
                  />
                  {errors.github_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.github_url}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  🖼️ Project Image
                </label>
                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Upload an image (max 10MB) or enter a URL below
                    </p>
                  </div>

                  <div className="text-center text-gray-500 dark:text-gray-400">
                    or
                  </div>

                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.image_url
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.image_url}
                    </p>
                  )}

                  {formData.image_url && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Image Preview:
                      </p>
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="submit"
                  disabled={isSubmitting || imageUploading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="mr-2">💾</span>
                  {isSubmitting ? "Creating Project..." : "Create Project"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/portfolio")}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <span className="mr-2">❌</span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPortfolioPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <NewPortfolioContent />
    </ProtectedRoute>
  );
}
