import Link from "next/link";

export default function BlogTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Blog
          </Link>

          <h1 className="text-4xl font-bold mb-4">Blog Test Page</h1>
          <p className="text-gray-600 mb-6">
            This is a test page for the blog functionality.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Route</h3>
              <p className="text-gray-600">/blog/test</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Purpose</h3>
              <p className="text-gray-600">
                Static test page for blog functionality verification
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Status</h3>
              <p className="text-green-600">✅ Working correctly</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-900">
            Available Blog Routes
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/blog" className="text-blue-600 hover:underline">
                /blog - Main blog page
              </Link>
            </li>
            <li>
              <Link
                href="/blog/category/tech"
                className="text-blue-600 hover:underline"
              >
                /blog/category/tech - Tech category
              </Link>
            </li>
            <li>
              <Link
                href="/blog/category/food"
                className="text-blue-600 hover:underline"
              >
                /blog/category/food - Food category
              </Link>
            </li>
            <li>
              <Link
                href="/blog/category/activity"
                className="text-blue-600 hover:underline"
              >
                /blog/category/activity - Activity category
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Blog Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
