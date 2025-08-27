// app/blog/category/[category]/PostsGrid.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Tag,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Coffee,
  Code,
  Activity,
  ChevronDown,
} from "lucide-react";

type Post = {
  id: string | number;
  title: string;
  content: string;
  image_url?: string | null;
  category?: string;
  tags?: string | null;
  created_at?: string;
};

function calcReadingTime(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function uniqueTags(posts: Post[]) {
  const set = new Set<string>();
  posts.forEach((p) => {
    if (!p.tags) return;
    p.tags.split(",").forEach((t) => set.add(t.trim()));
  });
  return Array.from(set).filter(Boolean);
}

export default function PostsGrid({
  initialPosts,
  category,
}: {
  initialPosts: Post[];
  category: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"new" | "old" | "readtime">("new");
  const [showAllTags, setShowAllTags] = useState(false);

  const tags = useMemo(() => uniqueTags(initialPosts), [initialPosts]);

  const filtered = useMemo(() => {
    let list = initialPosts.slice();
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        (p.title + " " + p.content + " " + (p.tags || ""))
          .toLowerCase()
          .includes(q)
      );
    }
    if (selectedTag) {
      list = list.filter((p) =>
        (p.tags || "")
          .split(",")
          .map((t) => t.trim())
          .includes(selectedTag)
      );
    }

    if (sortBy === "new") {
      list.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    } else if (sortBy === "old") {
      list.sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
      );
    } else if (sortBy === "readtime") {
      list.sort(
        (a, b) => calcReadingTime(a.content) - calcReadingTime(b.content)
      );
    }

    return list;
  }, [initialPosts, query, selectedTag, sortBy]);

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
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

  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="space-y-8">
      {/* Enhanced Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${category} articles...`}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-12 pr-10 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="new">Newest First</option>
                <option value="old">Oldest First</option>
                <option value="readtime">Quick Reads</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Filter by Tags
              </h3>
              {tags.length > 8 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  {showAllTags ? "Show Less" : `Show All (${tags.length})`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {(showAllTags ? tags : tags.slice(0, 8)).map((t) => (
                <motion.button
                  key={t}
                  onClick={() => setSelectedTag((s) => (s === t ? null : t))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedTag === t
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  #{t}
                </motion.button>
              ))}
            </div>

            {selectedTag && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Filtering by:</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium">
                  #{selectedTag}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}{" "}
              found
              {query && ` for "${query}"`}
              {selectedTag && ` with tag "${selectedTag}"`}
            </span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>
                Sorted by{" "}
                {sortBy === "new"
                  ? "newest"
                  : sortBy === "old"
                  ? "oldest"
                  : "reading time"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Posts Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filtered.map((post, index) => {
          const CategoryIcon = getCategoryIcon(post.category || category);
          const categoryColor = getCategoryColor(post.category || category);

          return (
            <motion.article
              key={post.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700"
            >
              <Link href={`/blog/post/${post.id}`} className="block">
                {/* Enhanced Image Section */}
                <div className="relative h-56 overflow-hidden">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <CategoryIcon className="w-16 h-16 text-blue-400 dark:text-blue-300" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div
                      className={`inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-${categoryColor}-500 to-${categoryColor}-600 text-white rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm`}
                    >
                      <CategoryIcon className="w-4 h-4 mr-2" />
                      {(post.category || category).toUpperCase()}
                    </div>
                  </div>

                  {/* Reading Time */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-xl text-white text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {calcReadingTime(post.content)} min
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white text-sm">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{Math.floor(Math.random() * 500) + 100}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      <span>{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span>{Math.floor(Math.random() * 20) + 2}</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Enhanced Content Section */}
              <div className="p-8">
                {/* Meta Information */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>Featured</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  <Link href={`/blog/post/${post.id}`}>{post.title}</Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3">
                  {post.content?.slice(0, 150)}
                  {post.content && post.content.length > 150 ? "..." : ""}
                </p>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags
                      .split(",")
                      .slice(0, 3)
                      .map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {t.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href={`/blog/post/${post.id}`}
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span>Read Article</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      {/* Enhanced Empty State */}
      {filtered.length === 0 && (
        <motion.div
          className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Articles Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {query || selectedTag
              ? "Try adjusting your search criteria or browse all articles."
              : "No articles have been published in this category yet."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(query || selectedTag) && (
              <motion.button
                onClick={() => {
                  setQuery("");
                  setSelectedTag(null);
                }}
                className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse All Articles
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
