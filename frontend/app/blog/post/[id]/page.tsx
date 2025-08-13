import Link from "next/link";
import { getBlogPost } from "../../../lib/api";
import PostInteractions from "../../../components/PostInteractions";
import Comments from "../../../components/Comments";
import MediaSlider from "../../../components/MediaSlider";

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getBlogPost(params.id);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                post.category === "tech"
                  ? "bg-blue-100 text-blue-800"
                  : post.category === "food"
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {post.category}
            </span>
            <span className="text-gray-500">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {post.tags && (
            <div className="mb-6">
              {post.tags.split(",").map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded mr-2 mb-2"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media Display - Multiple Images/Videos with Slider */}
        {post.media_urls && post.media_urls.length > 0 ? (
          <div className="mb-8">
            <MediaSlider
              mediaFiles={post.media_urls}
              className="w-full h-64 md:h-96"
            />
          </div>
        ) : (
          post.image_url && (
            <div className="mb-8">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )
        )}

        <div className="blog-content prose prose-lg max-w-none">
          {post.content.split("\n").map((paragraph: string, index: number) => (
            <p key={index} className="mb-4 leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Post Interactions (Like/Dislike) */}
        <PostInteractions
          postId={parseInt(params.id)}
          initialLikes={post.likes_count || 0}
          initialDislikes={post.dislikes_count || 0}
        />

        {/* Comments Section */}
        <Comments postId={parseInt(params.id)} />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href={`/blog/category/${post.category}`}
              className="text-blue-600 hover:underline"
            >
              ← More {post.category} posts
            </Link>
            <Link href="/blog" className="text-blue-600 hover:underline">
              All posts →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
