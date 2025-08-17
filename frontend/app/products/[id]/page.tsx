import Link from "next/link";
import { getProduct } from "../../lib/api";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Products
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                    product.category === "electronics"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
                      : product.category === "clothing"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                      : product.category === "books"
                      ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300"
                      : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300"
                  }`}
                >
                  {product.category}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {product.rating || "4.5"} (24 reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                {product.discount ? (
                  <>
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      $
                      {(product.price * (1 - product.discount / 100)).toFixed(
                        2
                      )}
                    </span>
                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                      ${product.price}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 text-sm rounded-full font-semibold">
                      Save {product.discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    ${product.price}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    product.stock > 10
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                      : product.stock > 0
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} items in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.specifications && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Specifications
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {product.specifications}
                  </pre>
                </div>
              </div>
            )}

            {/* Purchase Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ready to Purchase?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Contact our sales team to complete your purchase or ask any
                questions about this product.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href={`/contact?product=${product.name}&price=${product.price}`}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={product.stock === 0}
                >
                  💬 Contact to Buy
                </Link>
                <a
                  href={`mailto:sales@maskonvibes.com?subject=Purchase Inquiry: ${product.name}&body=Hi, I'm interested in purchasing ${product.name} for $${product.price}. Please provide more details about the purchase process.`}
                  className="flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors font-medium"
                >
                  📧 Email Sales
                </a>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  🛡️ Purchase Protection
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• 30-day money-back guarantee</li>
                  <li>• Secure payment processing</li>
                  <li>• Free shipping on orders over $50</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
