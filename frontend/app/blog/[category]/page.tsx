import Link from "next/link";
import { getBlogPosts } from "../../lib/api";

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const posts = await getBlogPosts(20, params.category);

  const categoryEmojis = {
    tech: "🚀",
    food: "🍕",
    activity: "🏃",
  };

  const categoryNames = {
    tech: "Technology",
    food: "Food & Recipes",
    activity: "Activities & Life",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {categoryEmojis[params.category as keyof typeof categoryEmojis]}{" "}
          {categoryNames[params.category as keyof typeof categoryNames]}
        </h1>
        <p className="text-gray-600">Explore my {params.category} posts</p>
      </div>

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
                href={`/blog/${post.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No posts found in this category yet.
          </p>
          <Link
            href="/admin"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first post →
          </Link>
        </div>
      )}
    </div>
  );
}
