import Link from "next/link";
import Image from "next/image";
import { getBlogPost, getBlogPosts } from "../../lib/api";
import { Clock, Calendar, Tag, User, ArrowLeft, Share2, BookOpen } from "lucide-react";

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getBlogPost(params.id);
  const relatedPosts = post ? await getBlogPosts(3, post.category) : [];
  const filteredRelatedPosts = relatedPosts.filter((p: any) => p.id !== parseInt(params.id));

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = Math.ceil(post.content.split(' ').length / 200);
  const categoryColors = {
    tech: "bg-blue-100 text-blue-800 border-blue-200",
    food: "bg-green-100 text-green-800 border-green-200",
    activity: "bg-orange-100 text-orange-800 border-orange-200"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                  categoryColors[post.category as keyof typeof categoryColors]
                }`}
              >
                {post.category === 'tech' && '🚀'}
                {post.category === 'food' && '🍕'}
                {post.category === 'activity' && '🏃'}
                <span className="ml-1 capitalize">{post.category}</span>
              </span>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {readingTime} min read
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {post.tags && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.split(",").map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Maskon</p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>
              
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.image_url && (
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              {post.content.split("\n").map((paragraph: string, index: number) => {
                if (paragraph.trim() === '') return null;
                
                return (
                  <p key={index} className="mb-6 leading-relaxed text-gray-700 text-lg">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {filteredRelatedPosts.length > 0 && (
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                More {post.category} posts
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRelatedPosts.slice(0, 3).map((relatedPost: any) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.id}`}
                    className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    {relatedPost.image_url && (
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={relatedPost.image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.content.substring(0, 100)}...
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link
              href={`/blog/${post.category}`}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              More {post.category} posts
            </Link>
            <Link 
              href="/blog" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              All posts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}