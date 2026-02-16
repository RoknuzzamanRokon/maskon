import Link from "next/link";
import { getProduct } from "../../lib/api";
import ProductImageGallery from "../../components/ProductImageGallery";
import WhatsAppChat from "../../components/WhatsAppChat";
import BackButton from "../../components/BackButton";
import type { CSSProperties } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  const themeVars = {
    "--paper": "#f6f4f0",
    "--ink": "#0f172a",
    "--muted": "#64748b",
    "--accent": "#0f766e",
    "--accent-strong": "#115e59",
    "--line": "#e2e8f0",
  } as CSSProperties;

  if (!product) {
    return (
      <div
        className={`${bodyFont.className} min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)] flex items-center justify-center px-4`}
        style={themeVars}
      >
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white border border-[color:var(--line)] flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
          <h1
            className={`${headingFont.className} text-3xl font-semibold mb-3`}
          >
            Product Not Found
          </h1>
          <p className="text-[color:var(--muted)] mb-8">
            The item you're looking for is no longer available or has been
            moved.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-5 py-3 bg-[color:var(--ink)] text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            ← Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bodyFont.className} min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)] dark:bg-slate-950 dark:text-slate-100`}
      style={themeVars}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-emerald-100/70 dark:bg-emerald-900/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-slate-200/70 dark:bg-slate-800/40 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <BackButton
            className="inline-flex items-center text-[color:var(--muted)] hover:text-[color:var(--ink)] dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Collection
          </BackButton>
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] dark:text-slate-400">
            Product Detail
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            <ProductImageGallery product={product} />
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header Section */}
            <div className="border-b border-[color:var(--line)] dark:border-slate-800 pb-6">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] rounded-full ${
                    product.category === "electronics"
                      ? "bg-slate-900 text-white"
                      : product.category === "clothing"
                      ? "bg-emerald-700 text-white"
                      : product.category === "books"
                      ? "bg-amber-700 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {product.category}
                </span>

                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(Number(product.rating) || 4)
                            ? "text-amber-500"
                            : "text-slate-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-[color:var(--muted)] dark:text-slate-400 ml-2">
                    {product.rating || "4.8"} (24 reviews)
                  </span>
                </div>
              </div>

              <h1
                className={`${headingFont.className} text-3xl md:text-4xl font-semibold tracking-tight mb-4`}
              >
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-baseline gap-2">
                  {product.discount ? (
                    <>
                      <span className="text-3xl font-semibold">
                        $
                        {(product.price * (1 - product.discount / 100)).toFixed(
                          2
                        )}
                      </span>
                      <span className="text-lg text-[color:var(--muted)] dark:text-slate-400 line-through">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold">
                      ${product.price}
                    </span>
                  )}
                </div>
                {product.discount && (
                  <span className="bg-rose-600 text-white px-3 py-1 text-sm rounded-full font-medium">
                    Save {product.discount}%
                  </span>
                )}
              </div>

              <div className="mb-2">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        product.stock > 10
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : product.stock > 0
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      product.stock > 10
                        ? "bg-emerald-500 dark:bg-emerald-300"
                        : product.stock > 0
                        ? "bg-amber-500 dark:bg-amber-300"
                        : "bg-slate-500 dark:bg-slate-400"
                    }`}
                  ></span>
                  {product.stock > 0
                    ? `${product.stock} units available`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-[color:var(--line)] dark:border-slate-800">
              <h3
                className={`${headingFont.className} text-xl font-semibold mb-4`}
              >
                Product Details
              </h3>
              <p className="text-[color:var(--muted)] dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="pb-6">
                <h3
                  className={`${headingFont.className} text-xl font-semibold mb-4`}
                >
                  Technical Specifications
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-[color:var(--line)] dark:border-slate-800 rounded-xl p-5">
                  {(() => {
                    // Check if specifications is a valid string
                    if (
                      !product.specifications ||
                      typeof product.specifications !== "string"
                    ) {
                      return (
                        <p className="text-sm text-[color:var(--muted)] dark:text-slate-400 italic">
                          No specifications available
                        </p>
                      );
                    }

                    // Clean the specifications string
                    const cleanSpecs = product.specifications.trim();

                    // Check if it's empty after trimming
                    if (!cleanSpecs) {
                      return (
                        <p className="text-sm text-[color:var(--muted)] dark:text-slate-400 italic">
                          No specifications available
                        </p>
                      );
                    }

                    try {
                      // Try to parse as JSON array
                      const specs = JSON.parse(cleanSpecs);
                      if (Array.isArray(specs) && specs.length > 0) {
                        return (
                          <div className="space-y-3">
                            {specs.map(
                              (
                                spec: { key: string; value: string },
                                index: number
                              ) => (
                                <div
                                  key={index}
                                  className="flex border-b border-[color:var(--line)] dark:border-slate-800 pb-3 last:border-0 last:pb-0"
                                >
                                  <div className="w-1/3 text-[color:var(--muted)] dark:text-slate-400 font-medium">
                                    {spec.key || "N/A"}
                                  </div>
                                  <div className="w-2/3 text-[color:var(--ink)] dark:text-slate-100">
                                    {spec.value || "N/A"}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Fallback to raw display if parsing fails
                      console.warn(
                        "Failed to parse specifications as JSON:",
                        e
                      );
                    }

                    // Check if it looks like invalid JSON (contains random characters)
                    if (cleanSpecs.length < 10 && !/^[\[\{]/.test(cleanSpecs)) {
                      return (
                        <p className="text-sm text-[color:var(--muted)] dark:text-slate-400 italic">
                          Specifications data is being updated
                        </p>
                      );
                    }

                    // Default display for non-JSON specs
                    return (
                      <div className="text-sm text-[color:var(--muted)] dark:text-slate-300">
                        <p className="whitespace-pre-wrap break-words">
                          {cleanSpecs}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Purchase Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-[color:var(--line)] dark:border-slate-800">
              <h3
                className={`${headingFont.className} text-xl font-semibold mb-4`}
              >
                Purchase Options
              </h3>
              <p className="text-[color:var(--muted)] dark:text-slate-300 mb-6">
                For inquiries or to complete your purchase, contact our sales
                team.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.stock > 0 ? (
                  <a
                    href={`https://wa.me/8801739933258?text=${encodeURIComponent(
                      `I need a "${product.name}" how can i get this?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-3.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-center"
                  >
                    Request Purchase
                  </a>
                ) : (
                  <button
                    className="flex items-center justify-center px-6 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed font-medium"
                    disabled
                  >
                    Currently Unavailable
                  </button>
                )}
                <a
                  href={`mailto:sales@luxecurates.com?subject=Inquiry: ${product.name}&body=Hello,%0D%0A%0D%0AI'm interested in the ${product.name} ($${product.price}).%0D%0APlease provide more information about:%0D%0A- Availability%0D%0A- Shipping options%0D%0A- Bulk pricing (if applicable)%0D%0A%0D%0AThank you`}
                  className="flex items-center justify-center px-6 py-3.5 border border-[color:var(--line)] dark:border-slate-700 text-[color:var(--ink)] dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-center"
                >
                  Contact Sales
                </a>
              </div>

              <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-[color:var(--line)] dark:border-slate-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-emerald-700 dark:text-emerald-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-[color:var(--ink)] dark:text-slate-100 mb-1">
                      Premium Purchase Protection
                    </h4>
                    <ul className="text-sm text-[color:var(--muted)] dark:text-slate-300 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>30-day satisfaction guarantee</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Secure payment processing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Complimentary shipping on orders over $100</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Dedicated support team</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Chat */}
      <WhatsAppChat 
        productId={product.id} 
        productName={product.name}
        productPrice={product.price}
      />
    </div>
  );
}
