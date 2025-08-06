import Link from "next/link";
import { getBlogPosts } from "../lib/api";

export default async function BlogPage() {
  const posts = await getBlogPosts(20);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">All Blog Posts</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: any) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    post.category === "tech"
                      ? "bg-blue-100 text-blue-800"
                      : post.category === "food"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">
                {post.content.substring(0, 150)}...
              </p>
              {post.tags && (
                <div className="mb-4">
                  {post.tags.split(",").map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded mr-2"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={`/blog/post/${post.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
