import Link from "next/link";
import { getProducts } from "../lib/api";

export default async function ProductsPage() {
  const products = await getProducts(20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 relative inline-block">
            <span className="relative z-10">
              Our Products
              <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500 transform -rotate-1 -z-1"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our carefully curated collection of premium products
            designed to enhance your lifestyle.
          </p>

          <div className="mt-8 flex justify-center space-x-4">
            {["all", "electronics", "clothing", "books", "accessories"].map(
              (category) => (
                <button
                  key={category}
                  className="px-5 py-2 rounded-full text-sm font-medium capitalize bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300"
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              {product.image_url && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                        product.category === "electronics"
                          ? "bg-blue-500 text-white"
                          : product.category === "clothing"
                          ? "bg-green-500 text-white"
                          : product.category === "books"
                          ? "bg-purple-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {product.category}
                    </span>
                  </div>
                  {product.discount && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full font-semibold">
                        -{product.discount}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {product.name}
                  </h2>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {product.rating || "4.5"}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {product.description.substring(0, 100)}...
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {product.discount ? (
                      <>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          $
                          {(
                            product.price *
                            (1 - product.discount / 100)
                          ).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${product.price}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      product.stock > 10
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                        : product.stock > 0
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors font-medium"
                    disabled={product.stock === 0}
                  >
                    🛒 Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Products Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We're working on adding amazing products. Check back soon!
            </p>
          </div>
        )}

        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center">
            Load More Products
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Need Help with Your Purchase?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect product and answer
              any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                💬 Contact Us
              </Link>
              <a
                href="mailto:sales@maskonvibes.com"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                📧 Email Sales Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
