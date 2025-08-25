"use client";
import Link from "next/link";
import { getBlogPost } from "../../../lib/api";
import PostInteractions from "../../../components/PostInteractions";
import Comments from "../../../components/Comments";
import MediaSlider from "../../../components/MediaSlider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Bookmark,
  Eye,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const fetchedPost = await getBlogPost(params.id);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Professional Header */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>
          </motion.div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Category and Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm ${
                post.category === "tech"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
                  : post.category === "food"
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                  : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300"
              }`}
            >
              {post.category?.toUpperCase()}
            </span>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span>5 min read</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <User className="w-4 h-4 mr-2" />
              <span>MASKON</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.split(",").map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <motion.button
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </motion.button>
            <motion.button
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </motion.button>
          </div>
        </motion.header>

        {/* Featured Image/Media */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {post.media_urls && post.media_urls.length > 0 ? (
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <MediaSlider
                mediaFiles={post.media_urls}
                className="w-full h-64 md:h-96"
              />
            </div>
          ) : (
            post.image_url && (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )
          )}
        </motion.div>

        {/* Article Content */}
        <motion.div
          className="prose prose-lg max-w-none mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {post.content
              .split("\n")
              .map((paragraph: string, index: number) => (
                <p key={index} className="mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </div>
        </motion.div>

        {/* Article Stats */}
        <motion.div
          className="flex items-center justify-center gap-8 py-8 mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl mb-2">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              1.2K
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Views
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl mb-2">
              <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {post.likes_count || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Likes
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl mb-2">
              <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              24
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Comments
            </div>
          </div>
        </motion.div>

        {/* Post Interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <PostInteractions
            postId={parseInt(params.id)}
            initialLikes={post.likes_count || 0}
            initialDislikes={post.dislikes_count || 0}
          />
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Comments postId={parseInt(params.id)} />
        </motion.div>

        {/* Navigation Footer */}
        <motion.footer
          className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              href={`/blog/category/${post.category}`}
              className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              More {post.category} articles
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              View All Articles
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </motion.footer>
      </article>
    </div>
  );
}
