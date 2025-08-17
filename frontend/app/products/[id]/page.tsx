import Link from "next/link";
import { getProduct } from "../../lib/api";
import ProductImageGallery from "../../components/ProductImageGallery";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The item you're looking for is no longer available or has been moved.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-5 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            ← Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-medium"
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
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            <ProductImageGallery product={product} />
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span
                  className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize ${
                    product.category === "electronics"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                      : product.category === "clothing"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : product.category === "books"
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
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
                            ? "text-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {product.rating || "4.8"} (24 reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-baseline gap-2">
                  {product.discount ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        $
                        {(product.price * (1 - product.discount / 100)).toFixed(
                          2
                        )}
                      </span>
                      <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                  )}
                </div>
                {product.discount && (
                  <span className="bg-red-600 text-white px-3 py-1 text-sm rounded-full font-medium">
                    Save {product.discount}%
                  </span>
                )}
              </div>

              <div className="mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    product.stock > 10
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : product.stock > 0
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      product.stock > 10
                        ? "bg-green-500"
                        : product.stock > 0
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></span>
                  {product.stock > 0
                    ? `${product.stock} units available`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Details
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="pb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Technical Specifications
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                  {(() => {
                    try {
                      // Try to parse as JSON array
                      const specs = JSON.parse(product.specifications);
                      if (Array.isArray(specs)) {
                        return (
                          <div className="space-y-3">
                            {specs.map(
                              (
                                spec: { key: string; value: string },
                                index: number
                              ) => (
                                <div
                                  key={index}
                                  className="flex border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                                >
                                  <div className="w-1/3 text-gray-600 dark:text-gray-400 font-medium">
                                    {spec.key}
                                  </div>
                                  <div className="w-2/3 text-gray-800 dark:text-gray-200">
                                    {spec.value}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Fallback to raw display if parsing fails
                      console.error("Failed to parse specifications:", e);
                    }

                    // Default display for non-JSON specs
                    return (
                      <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {product.specifications}
                      </pre>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Purchase Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Purchase Options
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                For inquiries or to complete your purchase, contact our sales
                team.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.stock > 0 ? (
                  <Link
                    href={`/contact?product=${product.name}&price=${product.price}`}
                    className="flex items-center justify-center px-6 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
                  >
                    Request Purchase
                  </Link>
                ) : (
                  <button
                    className="flex items-center justify-center px-6 py-3.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                    disabled
                  >
                    Currently Unavailable
                  </button>
                )}
                <a
                  href={`mailto:sales@luxecurates.com?subject=Inquiry: ${product.name}&body=Hello,%0D%0A%0D%0AI'm interested in the ${product.name} ($${product.price}).%0D%0APlease provide more information about:%0D%0A- Availability%0D%0A- Shipping options%0D%0A- Bulk pricing (if applicable)%0D%0A%0D%0AThank you`}
                  className="flex items-center justify-center px-6 py-3.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium text-center"
                >
                  Contact Sales
                </a>
              </div>

              <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Premium Purchase Protection
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
    </div>
  );
}


