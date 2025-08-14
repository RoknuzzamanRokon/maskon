// app/blog/category/[category]/PostsGrid.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-2/3">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${category} posts...`}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
            <option value="readtime">Shortest read</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {tags.slice(0, 8).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag((s) => (s === t ? null : t))}
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedTag === t
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              #{t}
            </button>
          ))}
          {tags.length === 0 && (
            <span className="text-sm text-gray-400">No tags</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition"
          >
            <Link href={`/blog/post/${post.id}`} className="block">
              <div className="relative h-44 w-full bg-gray-50">
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="h-44 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
            </Link>

            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-2 text-xs font-medium">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {post.category ?? category}
                  </span>
                </span>
                <div className="text-xs text-gray-400">
                  {formatDate(post.created_at)}
                </div>
              </div>

              <h3 className="text-lg font-semibold leading-snug mb-2">
                <Link
                  href={`/blog/post/${post.id}`}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {post.content?.slice(0, 140)}
                {post.content && post.content.length > 140 ? "..." : ""}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    ⏱ {calcReadingTime(post.content)} min read
                  </div>
                  {post.tags && (
                    <div className="ml-3 flex items-center gap-2">
                      {post.tags
                        .split(",")
                        .slice(0, 3)
                        .map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-1 rounded-full bg-gray-100"
                          >
                            #{t.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <Link
                  href={`/blog/post/${post.id}`}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Read →
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found.</p>
          <Link
            href="/admin"
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            Create your first post →
          </Link>
        </div>
      )}
    </section>
  );
}
