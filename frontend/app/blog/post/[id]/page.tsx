"use client";
import Link from "next/link";
import { getBlogPost } from "../../../lib/api";
import PostInteractions from "../../../components/PostInteractions";
import Comments from "../../../components/Comments";
import MediaSlider from "../../../components/MediaSlider";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Heart,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Enhanced loading skeleton */}
          <div className="animate-pulse">
            <div className="h-6 bg-white/60 dark:bg-gray-700/60 rounded-xl w-32 mb-8"></div>

            <div className="h-10 bg-white/60 dark:bg-gray-700/60 rounded-xl w-4/5 mb-6"></div>
            <div className="h-8 bg-white/60 dark:bg-gray-700/60 rounded-xl w-3/5 mb-10"></div>

            <div className="flex flex-wrap gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-white/60 dark:bg-gray-700/60 rounded-xl w-24"
                ></div>
              ))}
            </div>

            <div className="h-96 bg-white/60 dark:bg-gray-700/60 rounded-2xl mb-10"></div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-white/60 dark:bg-gray-700/60 rounded-xl w-full"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center"
          >
            <Eye className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-200/20 to-transparent dark:from-blue-900/10 pointer-events-none"></div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-500/20 rounded-full"
            initial={{
              x: Math.random() * 100 + "vw",
              y: Math.random() * 100 + "vh",
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium group transition-all duration-300"
          >
            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md mr-2 transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Blog
          </Link>
        </motion.div>

        <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
          {/* Article Header */}
          <motion.header
            className="p-8 pb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Category and Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
                  post.category === "tech"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : post.category === "food"
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                    : "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                }`}
              >
                {post.category === "tech" && (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {post.category === "food" && <Heart className="w-4 h-4 mr-2" />}
                {post.category === "activity" && (
                  <BookOpen className="w-4 h-4 mr-2" />
                )}
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
                <span>MASHKON</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.split(",").map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <motion.button
                className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-300 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </motion.button>

              <motion.button
                className={`inline-flex items-center px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                  isBookmarked
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
                    : "bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark
                  className={`w-4 h-4 mr-2 ${
                    isBookmarked ? "fill-current" : ""
                  }`}
                />
                {isBookmarked ? "Saved" : "Save"}
              </motion.button>
            </div>
          </motion.header>

          {/* Featured Image/Media */}
          <motion.div
            className="px-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {post.media_urls && post.media_urls.length > 0 ? (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <MediaSlider
                  mediaFiles={post.media_urls}
                  className="w-full h-64 md:h-96"
                />
              </div>
            ) : (
              post.image_url && (
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
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
            className="p-8 pt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {post.content
                .split("\n")
                .map((paragraph: string, index: number) => (
                  <motion.p
                    key={index}
                    className="mb-6 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
            </div>
          </motion.div>

          {/* Article Stats */}
          <motion.div
            className="p-8 py-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 mx-8 mb-8 rounded-2xl shadow-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl mb-3 mx-auto shadow-inner"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  1.2K
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Views
                </div>
              </div>

              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl mb-3 mx-auto shadow-inner"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </motion.div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {post.likes_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Likes
                </div>
              </div>

              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl mb-3 mx-auto shadow-inner"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  24
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Comments
                </div>
              </div>
            </div>
          </motion.div>

          {/* Post Interactions */}
          <motion.div
            className="px-8 mb-8"
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
            className="px-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Comments postId={parseInt(params.id)} />
          </motion.div>

          {/* Author Info */}
          <motion.div
            className="p-8 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border-t border-gray-100 dark:border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md mr-4">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  MASHKON
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Content Creator & Developer
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Passionate about sharing knowledge and experiences
                </p>
              </div>
            </div>
          </motion.div>
        </article>

        {/* Navigation Footer */}
        <motion.footer
          className="mt-12 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/blog/category/${post.category}`}
                className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                More {post.category} articles
              </Link>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                View All Articles
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
