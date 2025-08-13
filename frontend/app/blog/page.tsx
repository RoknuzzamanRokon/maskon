import Link from "next/link";
import { getBlogPosts } from "../lib/api";

export default async function BlogPage() {
  const posts = await getBlogPosts(20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 relative inline-block">
            <span className="relative z-10">
              Latest Articles
              <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500 transform -rotate-1 -z-1"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insightful articles on technology, food, and activities
            that inspire and inform.
          </p>

          <div className="mt-8 flex justify-center space-x-4">
            {["all", "tech", "food", "activity"].map((category) => (
              <button
                key={category}
                className="px-5 py-2 rounded-full text-sm font-medium capitalize bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-indigo-300"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              {post.image_url && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                        post.category === "tech"
                          ? "bg-blue-500 text-white"
                          : post.category === "food"
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>5 min read</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                  {post.title}
                </h2>

                <p className="text-gray-600 mb-5">
                  {post.content.substring(0, 150)}...
                </p>

                {post.tags && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {post.tags.split(",").map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 text-xs rounded-full font-medium"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Link
                    href={`/blog/post/${post.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group-hover:underline transition-all"
                  >
                    Read full article
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm font-bold text-gray-700">
                      {post.author?.charAt(0) || "A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center">
            Load More Articles
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

      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Never Miss an Update
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and stay updated with the latest
              articles, tips, and resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
