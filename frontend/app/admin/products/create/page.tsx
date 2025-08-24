"use client";

import { useState } from "react";
import { createProduct, getUserInfo, logout } from "../../../lib/api";
import MultiMediaUpload from "../../../components/MultiMediaUpload";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CreateProductContent() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "electronics",
    price: "",
    stock: "",
    discount: "",
    specifications: "",
    image_urls: [] as string[],
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      // Validation: Check if at least one image is selected
      if (formData.image_urls.length === 0) {
        setMessage("Please select at least one product image.");
        setIsSubmitting(false);
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discount: formData.discount ? parseFloat(formData.discount) : null,
        image_urls: formData.image_urls, // Ensure image_urls is included
      };

      await createProduct(productData);
      setMessage("Product created successfully! All images have been saved.");
      setFormData({
        name: "",
        description: "",
        category: "electronics",
        price: "",
        stock: "",
        discount: "",
        specifications: "",
        image_urls: [],
        is_active: true,
      });
      setMediaFiles([]);
    } catch (error: any) {
      console.error("Product creation error:", error);
      const errorMessage =
        error?.message || "Error creating product. Please try again.";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleMediaSelect = (mediaFiles: any[]) => {
    setIsUploadingImages(true);
    setMediaFiles(mediaFiles);
    // Extract all image URLs from the selected media files
    const imageUrls = mediaFiles
      .filter((m) => m.type === "image")
      .map((m) => m.url);

    setFormData((prev) => ({
      ...prev,
      image_urls: imageUrls,
    }));
    setIsUploadingImages(false);

    // Clear any previous error messages when new images are selected
    if (message.includes("Error") || message.includes("Please select")) {
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🛍️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Add New Product
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create a new product for your store
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/products"
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ← Back to Products
                </Link>
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
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter product name"
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
                    <option value="electronics">📱 Electronics</option>
                    <option value="clothing">👕 Clothing</option>
                    <option value="books">📚 Books</option>
                    <option value="accessories">🎒 Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discount"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                  >
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="specifications"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
                >
                  Specifications (Optional)
                </label>
                <textarea
                  id="specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter product specifications..."
                />
              </div>

              {/* Display selected images count */}
              {formData.image_urls.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Selected Images ({formData.image_urls.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.image_urls.slice(0, 4).map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Selected ${index + 1}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                        {index === 0 && (
                          <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                    {formData.image_urls.length > 4 && (
                      <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                        +{formData.image_urls.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  Upload Product Images *
                </label>
                {isUploadingImages && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Processing images...
                      </span>
                    </div>
                  </div>
                )}
                <MultiMediaUpload
                  onMediaSelect={handleMediaSelect}
                  existingMedia={mediaFiles}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Product is active and visible to customers
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="mr-2">💾</span>
                  {isSubmitting ? "Creating Product..." : "Create Product"}
                </button>

                <Link
                  href="/admin/products"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors inline-flex items-center justify-center"
                >
                  <span className="mr-2">❌</span>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <CreateProductContent />
    </ProtectedRoute>
  );
}
