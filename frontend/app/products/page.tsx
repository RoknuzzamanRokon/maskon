"use client";

import Link from "next/link";
import Image from "next/image";
import WhatsAppChat from "../components/WhatsAppChat";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // app-router friendly
import type { CSSProperties } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { useTheme } from "../contexts/ThemeContext";

import { getProducts } from "../lib/api";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Helper: main image URL */
function getMainImageUrl(product: any): string | undefined {
  if (!product) return undefined;

  if (
    product.image_urls &&
    Array.isArray(product.image_urls) &&
    product.image_urls.length > 0
  ) {
    return product.image_urls[0];
  }

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

  if (product.image_url) return product.image_url;

  return undefined;
}

/** Product image component */
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
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
}

/** Main page */
export default function ProductsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const themeVars =
    theme === "dark"
      ? ({
          "--paper": "#0f172a",
          "--ink": "#f8fafc",
          "--muted": "#94a3b8",
          "--accent": "#3b82f6",
          "--accent-strong": "#1d4ed8",
          "--line": "#334155",
        } as CSSProperties)
      : ({
          "--paper": "#f6f4f0",
          "--ink": "#0f172a",
          "--muted": "#64748b",
          "--accent": "#0f766e",
          "--accent-strong": "#115e59",
          "--line": "#e2e8f0",
        } as CSSProperties);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts(20);
        if (Array.isArray(fetchedProducts)) setProducts(fetchedProducts);
        else setProducts([]);
      } catch (err) {
        console.error("Error fetching products:", err);
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
      <div
        className={`${bodyFont.className} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-[color:var(--ink)] py-16 flex items-center justify-center`}
        style={themeVars}
      >
        <div className="text-center">
          <div className="h-14 w-14 rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)] animate-spin mx-auto mb-5" />
          <p className="text-[color:var(--muted)] text-sm uppercase tracking-[0.2em]">
            Loading collection
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${bodyFont.className} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-[color:var(--ink)] py-16 flex items-center justify-center`}
        style={themeVars}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[color:var(--accent)] text-white rounded-lg hover:bg-[color:var(--accent-strong)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bodyFont.className} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-[color:var(--ink)]`}
      style={themeVars}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-900/30" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/40" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] dark:bg-gray-800">
            Signature Collection
          </div>
          <h1
            className={`${headingFont.className} mt-6 text-4xl md:text-5xl font-semibold tracking-tight`}
          >
            Premium Products, Curated With Care
          </h1>
          <p className="text-base md:text-lg text-[color:var(--muted)] max-w-2xl mx-auto mt-5">
            Discover refined essentials crafted for longevity, with transparent
            pricing and concierge-level support.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {["all", "electronics", "apparel", "literature", "accessories"].map(
              (category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                    category === "all"
                      ? "bg-[color:var(--accent)] text-white shadow-md"
                      : "bg-white border border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)] dark:bg-gray-800 dark:text-slate-300"
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
            const productHref = `/products/${product.id}`;

            return (
              <article
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(productHref)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(productHref);
                  }
                }}
                className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[color:var(--line)] cursor-pointer group dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[color:var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-gray-700">
                  <ProductImage
                    imageUrl={imageUrl}
                    alt={product.name || "Product"}
                  />

                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    {product.discount && product.discount > 0 && (
                      <span className="bg-rose-600 text-white px-2.5 py-1 text-xs rounded-full font-semibold shadow-md">
                        -{product.discount}%
                      </span>
                    )}
                    {product.category && (
                      <span
                        className={`inline-block px-2.5 py-1 text-xs rounded-full font-semibold text-white shadow-md ${
                          product.category === "electronics"
                            ? "bg-slate-900"
                            : product.category === "clothing"
                            ? "bg-emerald-700"
                            : product.category === "books"
                            ? "bg-amber-700"
                            : "bg-slate-700"
                        }`}
                      >
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 z-10 relative">
                  <div className="flex justify-between items-start mb-3">
                    <h2
                      className={`${headingFont.className} text-xl font-semibold text-[color:var(--ink)] line-clamp-1`}
                    >
                      {product.name || "Unnamed Product"}
                    </h2>
                    <div className="flex items-center bg-slate-100 px-2 py-1 rounded-full dark:bg-gray-700">
                      <span className="text-amber-500 text-sm">★</span>
                      <span className="text-xs text-slate-700 dark:text-slate-200 ml-1">
                        {product.rating || "4.8"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[color:var(--muted)] text-sm mb-4 line-clamp-2 h-10">
                    {product.description || "No description available"}
                  </p>

                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-baseline gap-2">
                      {product.discount &&
                      product.discount > 0 &&
                      product.price ? (
                        <>
                          <span className="text-xl font-semibold text-[color:var(--ink)]">
                            $
                            {(
                              product.price * (1 - product.discount / 100) || 0
                            ).toFixed(2)}
                          </span>
                          <span className="text-sm text-[color:var(--muted)] line-through">
                            ${(product.price || 0).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-semibold text-[color:var(--ink)]">
                          ${product.price ? product.price.toFixed(2) : "0.00"}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        (product.stock || 0) > 10
                          ? "bg-emerald-100 text-emerald-800"
                          : (product.stock || 0) > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      } dark:bg-slate-700 dark:text-slate-200`}
                    >
                      {(product.stock || 0) > 0
                        ? `${product.stock} available`
                        : "Out of stock"}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {/* View Details: real Link (stops propagation so card click doesn't double fire) */}
                    <Link
                      href={productHref}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex-1 text-center px-4 py-2.5 bg-[color:var(--ink)] text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium group-hover:bg-[color:var(--accent-strong)] dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      View Details
                    </Link>

                    {/* WhatsApp button */}
                    <a
                      href={`https://wa.me/8801739933258?text=${encodeURIComponent(
                        `Hello! I'm interested in ${
                          product.name || "this product"
                        } ($${
                          product.price || "0.00"
                        }). Could you please provide more information?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-[color:var(--line)] rounded-full mb-6 dark:bg-gray-800 dark:border-gray-700">
              <span className="text-3xl">🛒</span>
            </div>
            <h3
              className={`${headingFont.className} text-2xl font-semibold mb-3`}
            >
              Collection Coming Soon
            </h3>
            <p className="text-[color:var(--muted)] max-w-md mx-auto">
              Our premium selection is being curated. Sign up for notifications
              when we launch.
            </p>
          </div>
        )}

        {/* Load More */}
        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-white border border-[color:var(--line)] text-[color:var(--ink)] font-medium rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            View More Products
            <svg
              className="w-4 h-4 ml-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
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
        <div className="bg-[color:var(--ink)] rounded-2xl p-10 md:p-12 shadow-xl dark:bg-gray-900">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className={`${headingFont.className} text-2xl md:text-3xl font-semibold text-white mb-4`}
            >
              Concierge Service Available
            </h2>
            <p className="text-slate-200 mb-8 max-w-2xl mx-auto">
              Our product specialists are ready to provide personalized
              recommendations and assist with your purchase decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
              >
                Schedule Consultation
              </Link>
              <a
                href="mailto:support@luxecurates.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-slate-500 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Global WhatsApp Chat */}
      <WhatsAppChat />
    </div>
  );
}
