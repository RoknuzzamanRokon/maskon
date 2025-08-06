"use client";

import { useState, useCallback } from "react";
import { createPost } from "../lib/api";
import ImageUpload from "../components/ImageUpload";
import { Save, Eye, FileText, Tag, Image as ImageIcon } from "lucide-react";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "tech",
    tags: "",
    image_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      // In a real app, you'd upload the image to a storage service here
      // For now, we'll use a placeholder URL if an image is selected
      const finalFormData = {
        ...formData,
        image_url: selectedImage ? `https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg` : formData.image_url
      };
      
      await createPost(finalFormData);
      setMessage("Post created successfully!");
      setFormData({
        title: "",
        content: "",
        category: "tech",
        tags: "",
        image_url: "",
      });
      setSelectedImage(null);
      setImagePreview("");
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

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image_url: "" }));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
                <p className="text-gray-600">Share your thoughts with the world</p>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg mb-6 border ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
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
                    className="block text-sm font-semibold text-gray-900 mb-2"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter an engaging title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="block text-sm font-semibold text-gray-900 mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your post content here... Use line breaks to separate paragraphs."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-semibold text-gray-900 mb-2 flex items-center"
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., python, fastapi, web development"
                  />
                </div>

                <div>
                  <label
                    htmlFor="image_url"
                    className="block text-sm font-semibold text-gray-900 mb-2 flex items-center"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Upload Image (alternative to URL)
                </label>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  currentImage={imagePreview}
                  onRemoveImage={handleRemoveImage}
                />
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Creating Post..." : "Create Post"}
                </button>
                
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  Preview
                </button>
              </div>
            </form>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold mb-4 text-blue-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Writing Tips:
              </h2>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Use clear, descriptive titles for better SEO</li>
                <li>• Add relevant tags to help categorize your content</li>
                <li>• Include high-quality images to make posts more engaging</li>
                <li>• Write engaging content that provides value to readers</li>
                <li>• Use line breaks to separate paragraphs for better readability</li>
                <li>• Keep your audience in mind when choosing topics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
