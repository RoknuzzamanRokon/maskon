import Link from "next/link";
import { getBlogPosts } from "./lib/api";

export default async function Home() {
  const recentPosts = await getBlogPosts(6);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to MASKON Blog</h1>
        <p className="text-xl mb-8">
          Tech insights, Food adventures, and Daily activities
        </p>
        <div className="space-x-4">
          <Link
            href="/blog"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Read Blog
          </Link>
          <Link
            href="/portfolio"
            className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
          >
            View Portfolio
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Explore Categories
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/blog/category/tech"
            className="bg-blue-100 p-6 rounded-lg hover:bg-blue-200 transition"
          >
            <h3 className="text-xl font-semibold mb-2">🚀 Tech</h3>
            <p>Latest in web development, programming, and technology</p>
          </Link>
          <Link
            href="/blog/category/food"
            className="bg-green-100 p-6 rounded-lg hover:bg-green-200 transition"
          >
            <h3 className="text-xl font-semibold mb-2">🍕 Food</h3>
            <p>Recipes, restaurant reviews, and culinary adventures</p>
          </Link>
          <Link
            href="/blog/category/activity"
            className="bg-orange-100 p-6 rounded-lg hover:bg-orange-200 transition"
          >
            <h3 className="text-xl font-semibold mb-2">🏃 Activity</h3>
            <p>Fitness, hobbies, and daily life experiences</p>
          </Link>
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Recent Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post: any) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full mb-2 ${
                    post.category === "tech"
                      ? "bg-blue-100 text-blue-800"
                      : post.category === "food"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {post.category}
                </span>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">
                  {post.content.substring(0, 100)}...
                </p>
                <Link
                  href={`/blog/post/${post.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
