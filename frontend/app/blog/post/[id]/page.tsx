"use client";
import Link from "next/link";
import { getBlogPost } from "../../../lib/api";
import PostInteractions from "../../../components/PostInteractions";
import Comments from "../../../components/Comments";
import MediaSlider from "../../../components/MediaSlider";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond, Manrope } from "next/font/google";
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

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const categoryStyles: Record<
  string,
  { badge: string; soft: string; icon: string; glow: string }
> = {
  tech: {
    badge: "bg-slate-900 text-white",
    soft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    icon: "text-slate-700 dark:text-slate-200",
    glow: "ring-1 ring-slate-900/10 dark:ring-slate-100/10",
  },
  food: {
    badge: "bg-emerald-600 text-white",
    soft:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: "text-emerald-600 dark:text-emerald-300",
    glow: "ring-1 ring-emerald-500/20 dark:ring-emerald-400/20",
  },
  activity: {
    badge: "bg-amber-600 text-white",
    soft:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-300",
    glow: "ring-1 ring-amber-500/20 dark:ring-amber-400/20",
  },
  default: {
    badge: "bg-slate-700 text-white",
    soft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    icon: "text-slate-700 dark:text-slate-200",
    glow: "ring-1 ring-slate-900/10 dark:ring-slate-100/10",
  },
};

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const router = useRouter();

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
      <div
        className={`${bodyFont.className} relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-emerald-100/70 dark:bg-emerald-900/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-slate-200/70 dark:bg-slate-800/40 blur-3xl" />
        </div>
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-300"
            style={{ width: "30%" }}
          ></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 md:pt-24">
          <div className="animate-pulse space-y-8">
            {/* Back button skeleton */}
            <div className="h-10 bg-white dark:bg-slate-800 rounded-xl w-32"></div>

            {/* Header skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200/70 dark:border-slate-800">
              <div className="flex gap-4 mb-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-24"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-32"></div>
              </div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-4/5 mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/5 mb-8"></div>
              <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-8"></div>

              {/* Content skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"
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
      <div
        className={`${bodyFont.className} relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-emerald-100/70 dark:bg-emerald-900/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-slate-200/70 dark:bg-slate-800/40 blur-3xl" />
        </div>
        <motion.div
          className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/70 dark:border-slate-800 max-w-md mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center">
            <Eye className="w-10 h-10 text-rose-500 dark:text-rose-300" />
          </div>
          <h1
            className={`${headingFont.className} text-3xl font-semibold mb-4`}
          >
            Article Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            The article you're looking for doesn't exist or has been removed.
            Let's get you back to exploring our content.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/blog"
              className="inline-flex items-center px-8 py-4 bg-slate-900 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
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
  const categoryTone = categoryStyles[post.category] || categoryStyles.default;

  return (
    <div
      className={`${bodyFont.className} relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-emerald-100/70 dark:bg-emerald-900/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-slate-200/70 dark:bg-slate-800/40 blur-3xl" />
      </div>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
        <motion.div
          className="h-full bg-emerald-600 dark:bg-emerald-400"
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
            className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/70 dark:border-slate-800"
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
                className="absolute right-16 top-0 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-800 p-2 min-w-[200px]"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Share on Twitter
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Share on Facebook
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Share on LinkedIn
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-3 text-gray-500" />
                    )}
                    <span className="text-slate-700 dark:text-slate-200">
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
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 border-slate-200/70 dark:border-slate-800"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 md:pt-24">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium group transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm uppercase tracking-[0.2em]">
              Back to Articles
            </span>
          </button>
        </motion.div>

        {/* Article Container */}
        <motion.article
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)] overflow-hidden border border-slate-200/70 dark:border-slate-800"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Article Header */}
          <motion.header className="p-8 pb-0" variants={fadeInUp}>
            {/* Category and Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.16em] ${categoryTone.badge} ${categoryTone.glow}`}
              >
                <CategoryIcon className="w-4 h-4 mr-2" />
                {post.category?.toUpperCase()}
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 mr-2" />
                <span>{Math.ceil(post.content.length / 200)} min read</span>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                <User className="w-4 h-4 mr-2" />
                <span>MASHKON Team</span>
              </div>
            </div>

            {/* Title */}
            <h1
              className={`${headingFont.className} text-4xl md:text-6xl font-semibold mb-8 leading-tight`}
            >
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-3 mb-8">
                {post.tags.split(",").map((tag: string) => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 text-xs uppercase tracking-[0.14em] rounded-full font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700"
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
              <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] border border-slate-200/70 dark:border-slate-800">
                <MediaSlider
                  mediaFiles={post.media_urls}
                  className="w-full h-64 md:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
            ) : (
              post.image_url && (
                <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] border border-slate-200/70 dark:border-slate-800 group">
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
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
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
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shadow-inner"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <ThumbsUp className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
                  </motion.div>
                  <div className="text-3xl font-semibold mb-1">
                    {post.likes_count || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Likes
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <MessageCircle className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                  </motion.div>
                  <div className="text-3xl font-semibold mb-1">
                    {post.comments_count || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Comments
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div className="px-8 mb-12" variants={fadeInUp}>
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
              <div className="text-slate-700 dark:text-slate-200 leading-relaxed text-lg space-y-6">
                {post.content
                  .split("\n")
                  .map((paragraph: string, index: number) => (
                    <motion.p
                      key={index}
                      className="leading-relaxed text-left"
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
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Was this article helpful?
                  </span>
                  <div className="flex space-x-2">
                    <motion.button
                      className="flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Yes
                    </motion.button>
                    <motion.button
                      className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Feedback
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Share this article:
                  </span>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleShare("twitter")}
                      className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Twitter className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare("linkedin")}
                      className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare("copy")}
                      className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
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
            className="mx-8 mb-8 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800"
            variants={fadeInUp}
          >
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-semibold text-2xl">M</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3
                    className={`${headingFont.className} text-xl font-semibold`}
                  >
                    MASHKON Team
                  </h3>
                  <div className="flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">
                    <Award className="w-3 h-3 mr-1" />
                    Verified Author
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Passionate content creators and developers sharing knowledge
                  across technology, culinary arts, and lifestyle. We believe in
                  making complex topics accessible and engaging for everyone.
                </p>
                <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
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
            <h2
              className={`${headingFont.className} text-3xl md:text-4xl font-semibold mb-4`}
            >
              Continue Reading
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Discover more articles in the {post.category} category
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Related Article Cards */}
            {[1, 2].map((item) => (
              <motion.div
                key={item}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200/70 dark:border-slate-800 hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${categoryTone.soft}`}
                  >
                    <CategoryIcon className={`w-5 h-5 ${categoryTone.icon}`} />
                  </div>
                  <span
                    className={`font-semibold text-xs uppercase tracking-[0.2em] ${categoryTone.icon}`}
                  >
                    {post.category?.toUpperCase()}
                  </span>
                </div>

                <h3
                  className={`${headingFont.className} text-xl font-semibold mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors`}
                >
                  Related Article Title {item}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Discover more insights and tips in this comprehensive guide
                  that builds upon the concepts discussed in this article.
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>5 min read</span>
                  </div>
                  <div className="flex items-center text-emerald-700 dark:text-emerald-300 font-medium group-hover:translate-x-1 transition-transform">
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
          className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200/70 dark:border-slate-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/blog/category/${post.category}`}
                className="inline-flex items-center px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Explore
                  </div>
                  <div>More {post.category} Articles</div>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
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
