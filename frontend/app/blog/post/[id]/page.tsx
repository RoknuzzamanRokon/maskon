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
  Coffee,
  Activity,
  Code,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  CheckCircle,
  TrendingUp,
  Users,
  Star,
  Award,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

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

  // Reading progress tracker
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", updateReadingProgress);
    return () => window.removeEventListener("scroll", updateReadingProgress);
  }, []);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "Check out this article";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShareMenuOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tech":
        return Code;
      case "food":
        return Coffee;
      case "activity":
        return Activity;
      default:
        return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tech":
        return "blue";
      case "food":
        return "green";
      case "activity":
        return "purple";
      default:
        return "gray";
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: "30%" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            {/* Back button skeleton */}
            <div className="h-10 bg-white/60 dark:bg-gray-700/60 rounded-xl w-32"></div>

            {/* Header skeleton */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="flex gap-4 mb-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-xl w-24"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-xl w-32"></div>
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-xl w-4/5 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-xl w-3/5 mb-8"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-2xl mb-8"></div>

              {/* Content skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <motion.div
          className="text-center p-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-md mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center">
            <Eye className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            The article you're looking for doesn't exist or has been removed.
            Let's get you back to exploring our content.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/blog"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(post.category);
  const categoryColor = getCategoryColor(post.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
          style={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        {/* Share Button */}
        <div className="relative">
          <motion.button
            onClick={() => setShareMenuOpen(!shareMenuOpen)}
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

          {/* Share Menu */}
          <AnimatePresence>
            {shareMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                className="absolute right-16 top-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[200px]"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Share on Twitter
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Share on Facebook
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Share on LinkedIn
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-3 text-gray-500" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bookmark Button */}
        <motion.button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border ${
            isBookmarked
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 border-gray-200 dark:border-gray-700"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bookmark
            className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
          />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium group transition-all duration-300"
          >
            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md group-hover:shadow-lg mr-3 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Back to
              </div>
              <div className="font-semibold">Blog Articles</div>
            </div>
          </Link>
        </motion.div>

        {/* Article Container */}
        <motion.article
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Article Header */}
          <motion.header className="p-8 pb-0" variants={fadeInUp}>
            {/* Category and Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div
                className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-${categoryColor}-100 to-${categoryColor}-200 dark:from-${categoryColor}-900/30 dark:to-${categoryColor}-800/30 text-${categoryColor}-700 dark:text-${categoryColor}-300 rounded-2xl font-semibold text-sm shadow-sm border border-${categoryColor}-200 dark:border-${categoryColor}-700`}
              >
                <CategoryIcon className="w-4 h-4 mr-2" />
                {post.category?.toUpperCase()}
              </div>

              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 mr-2" />
                <span>{Math.ceil(post.content.length / 200)} min read</span>
              </div>

              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-xl">
                <User className="w-4 h-4 mr-2" />
                <span>MASHKON Team</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-3 mb-8">
                {post.tags.split(",").map((tag: string) => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm rounded-xl font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Tag className="w-3 h-3 mr-2" />
                    {tag.trim()}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.header>
          {/* Featured Image/Media */}
          <motion.div className="px-8 mb-8" variants={fadeInUp}>
            {post.media_urls && post.media_urls.length > 0 ? (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <MediaSlider
                  mediaFiles={post.media_urls}
                  className="w-full h-64 md:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
            ) : (
              post.image_url && (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={800}
                    height={400}
                    className="w-full h-64 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

                  {/* Image Caption */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Featured image for "{post.title}"
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </motion.div>

          {/* Article Stats Bar */}
          <motion.div className="px-8 mb-8" variants={fadeInUp}>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
              <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center shadow-inner"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {post.likes_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Likes
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl flex items-center justify-center shadow-inner"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {post.comments_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Comments
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div className="px-8 mb-12" variants={fadeInUp}>
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg space-y-6">
                {post.content
                  .split("\n")
                  .map((paragraph: string, index: number) => (
                    <motion.p
                      key={index}
                      className="leading-relaxed text-justify"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
              </div>
            </div>

            {/* Article Footer Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Was this article helpful?
                  </span>
                  <div className="flex space-x-2">
                    <motion.button
                      className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Yes
                    </motion.button>
                    <motion.button
                      className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Feedback
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Share this article:
                  </span>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleShare("twitter")}
                      className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Twitter className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare("linkedin")}
                      className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare("copy")}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Post Interactions */}
          <motion.div className="px-8 mb-8" variants={fadeInUp}>
            <PostInteractions
              postId={parseInt(params.id)}
              initialLikes={post.likes_count || 0}
              initialDislikes={post.dislikes_count || 0}
            />
          </motion.div>

          {/* Author Section */}
          <motion.div
            className="mx-8 mb-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/30 dark:to-blue-900/20 rounded-3xl p-8 border border-gray-200 dark:border-gray-700"
            variants={fadeInUp}
          >
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    MASHKON Team
                  </h3>
                  <div className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                    <Award className="w-3 h-3 mr-1" />
                    Verified Author
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Passionate content creators and developers sharing knowledge
                  across technology, culinary arts, and lifestyle. We believe in
                  making complex topics accessible and engaging for everyone.
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>500+ Articles</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>50K+ Readers</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span>4.9 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div className="px-8 mb-8" variants={fadeInUp}>
            <Comments postId={parseInt(params.id)} />
          </motion.div>
        </motion.article>

        {/* Related Articles Section */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Continue Reading
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover more articles in the {post.category} category
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Related Article Cards */}
            {[1, 2].map((item) => (
              <motion.div
                key={item}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br from-${categoryColor}-100 to-${categoryColor}-200 dark:from-${categoryColor}-900/30 dark:to-${categoryColor}-800/30 rounded-2xl flex items-center justify-center`}
                  >
                    <CategoryIcon
                      className={`w-5 h-5 text-${categoryColor}-600 dark:text-${categoryColor}-400`}
                    />
                  </div>
                  <span
                    className={`text-${categoryColor}-600 dark:text-${categoryColor}-400 font-medium text-sm`}
                  >
                    {post.category?.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Related Article Title {item}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Discover more insights and tips in this comprehensive guide
                  that builds upon the concepts discussed in this article.
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>5 min read</span>
                  </div>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Navigation Footer */}
        <motion.footer
          className="mt-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/blog/category/${post.category}`}
                className="inline-flex items-center px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Explore
                  </div>
                  <div>More {post.category} Articles</div>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <div className="text-right mr-3">
                  <div className="text-sm opacity-90">Browse</div>
                  <div>All Articles</div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
