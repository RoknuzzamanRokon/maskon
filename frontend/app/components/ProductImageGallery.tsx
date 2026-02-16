"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
  product: {
    id: number;
    name: string;
    image_url?: string; // Keep for backward compatibility
    image_urls?: string[]; // New array of image URLs
    images?: Array<{
      id: number;
      image_url: string;
      is_primary: boolean;
    }>;
  };
}

export default function ProductImageGallery({
  product,
}: ProductImageGalleryProps) {
  // Combine all images from different sources
  const allImages = [];

  // Priority 1: Use image_urls array if available
  if (product.image_urls && product.image_urls.length > 0) {
    product.image_urls.forEach((url, index) => {
      allImages.push({
        id: index,
        image_url: url,
        is_primary: index === 0, // First image is primary
      });
    });
  }
  // Priority 2: Use detailed images array if available (from backend)
  else if (product.images && product.images.length > 0) {
    allImages.push(...product.images);
  }
  // Priority 3: Fallback to single image_url for backward compatibility
  else if (product.image_url) {
    allImages.push({
      id: 0,
      image_url: product.image_url,
      is_primary: true,
    });
  }

  // If no images at all, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <p>No image available</p>
          </div>
        </div>
      </div>
    );
  }

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg relative group">
        <img
          src={allImages[selectedImageIndex].image_url}
          alt={`${product.name} - Image ${selectedImageIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${
            isZoomed ? "scale-150" : "hover:scale-105"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          🔍 Click to zoom
        </div>

        {/* Navigation arrows for multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedImageIndex(
                  selectedImageIndex === 0
                    ? allImages.length - 1
                    : selectedImageIndex - 1
                )
              }
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setSelectedImageIndex(
                  selectedImageIndex === allImages.length - 1
                    ? 0
                    : selectedImageIndex + 1
                )
              }
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              onClick={() => {
                setSelectedImageIndex(index);
                setIsZoomed(false);
              }}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === index
                  ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <img
                src={image.image_url}
                alt={`${product.name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
              {image.is_primary && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Main
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          {isZoomed ? "🔍 Zoom Out" : "🔍 Zoom In"}
        </button>

        {allImages.length > 1 && (
          <button
            onClick={() => {
              // Simple slideshow functionality
              const interval = setInterval(() => {
                setSelectedImageIndex((prev) =>
                  prev === allImages.length - 1 ? 0 : prev + 1
                );
              }, 2000);

              // Stop after one full cycle
              setTimeout(
                () => clearInterval(interval),
                2000 * allImages.length
              );
            }}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
          >
            ▶️ Slideshow
          </button>
        )}
      </div>
    </div>
  );
}
