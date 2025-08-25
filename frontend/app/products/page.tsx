"use client";

import Link from "next/link";
import { getProducts } from "../lib/api";
import Image from "next/image";
import ChatWidget from "../components/ChatWidget";
import { useEffect, useState } from "react";

// Helper function to get the main image URL
function getMainImageUrl(product: any): string | undefined {
  if (!product) return undefined;

  // Priority 1: images array with is_primary
  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const primary = product.images.find((img: any) => img && img.is_primary);
    if (primary && primary.image_url) return primary.image_url;
    if (product.images[0] && product.images[0].image_url)
      return product.images[0].image_url;
  }
  // Priority 2: image_urls array
  if (
    product.image_urls &&
    Array.isArray(product.image_urls) &&
    product.image_urls.length > 0
  ) {
    return product.image_urls[0];
  }
  // Priority 3: single image_url
  if (product.image_url) {
    return product.image_url;
  }
  return undefined;
}

// Component for handling product images
function ProductImage({
  imageUrl,
  alt,
}: {
  imageUrl: string | undefined;
  alt: string;
}) {
  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
        <span className="text-gray-500 dark:text-gray-400">
          No Image Available
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 hover:scale-105"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts(20);
        // Ensure products is an array
        if (Array.isArray(fetchedProducts)) {
          setProducts(fetchedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              Premium Collection
            </h1>
            <div className="absolute bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80 -z-10"></div>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-6">
            Curated excellence for discerning tastes - discover products
            designed to elevate your experience
          </p>

          {/* Category Filters */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {["all", "electronics", "apparel", "literature", "accessories"].map(
              (category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                    category === "all"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any) => {
            if (!product || !product.id) return null;

            const imageUrl = getMainImageUrl(product);

            return (
              <Link href={`/products/${product.id}`} key={product.id}>
                <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group">
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <ProductImage
                      imageUrl={imageUrl}
                      alt={product.name || "Product"}
                    />

                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {product.discount && product.discount > 0 && (
                        <span className="bg-red-600 text-white px-2.5 py-1 text-xs rounded-full font-semibold shadow-md">
                          -{product.discount}%
                        </span>
                      )}
                      {product.category && (
                        <span
                          className={`inline-block px-2.5 py-1 text-xs rounded-full font-semibold text-white shadow-md ${
                            product.category === "electronics"
                              ? "bg-blue-600"
                              : product.category === "clothing"
                              ? "bg-emerald-600"
                              : product.category === "books"
                              ? "bg-violet-600"
                              : "bg-amber-600"
                          }`}
                        >
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {product.name || "Unnamed Product"}
                      </h2>
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 ml-1">
                          {product.rating || "4.8"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                      {product.description || "No description available"}
                    </p>

                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-baseline gap-2">
                        {product.discount &&
                        product.discount > 0 &&
                        product.price ? (
                          <>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              $
                              {(
                                product.price *
                                (1 - product.discount / 100)
                              ).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ${product.price ? product.price.toFixed(2) : "0.00"}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          (product.stock || 0) > 10
                            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                            : (product.stock || 0) > 0
                            ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {(product.stock || 0) > 0
                          ? `${product.stock} available`
                          : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="flex-1 text-center px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium group-hover:bg-blue-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Handle view details - the Link wrapper will handle navigation
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          (product.stock || 0) === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                        disabled={(product.stock || 0) === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Handle add to cart
                          console.log("Add to cart:", product.id);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Collection Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Our premium selection is being curated. Sign up for notifications
              when we launch.
            </p>
          </div>
        )}

        {/* Load More */}
        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors inline-flex items-center shadow-sm hover:shadow-md">
            View More Products
            <svg
              className="w-4 h-4 ml-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="max-w-7xl mx-auto mt-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-10 md:p-12 shadow-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Concierge Service Available
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Our product specialists are ready to provide personalized
              recommendations and assist with your purchase decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all"
              >
                Schedule Consultation
              </Link>
              <a
                href="mailto:support@luxecurates.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-gray-500 text-white rounded-lg font-medium hover:bg-gray-700/30 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
