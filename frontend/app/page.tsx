"use client";
import Link from "next/link";
import { getBlogPosts } from "./lib/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await getBlogPosts(6);
        setRecentPosts(posts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-100"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <motion.section
          className="text-center py-16 md:py-24 rounded-3xl mb-16 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 z-0"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[length:200px] opacity-10 z-10"></div>

          <div className="relative z-20 max-w-4xl mx-auto">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Welcome to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">
                MASKON
              </span>
            </motion.h1>

            <motion.div
              className="text-xl md:text-2xl mb-10 text-indigo-100 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              <div className="inline-flex items-center">
                <span className="mr-3">Tech insights</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-2 h-2 rounded-full bg-amber-400"
                />
                <span className="mx-3">Food adventures</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-2 h-2 rounded-full bg-amber-400"
                />
                <span className="ml-3">Daily activities</span>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                href="/blog"
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Explore Blog</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.div>
              </Link>
              <Link
                href="/portfolio"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <span>View Portfolio</span>
                <motion.div
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="group-hover:rotate-6 transition-transform"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Categories */}
        <motion.section
          className="mb-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
            variants={item}
          >
            Explore Our{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Categories
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "🚀 Tech",
                description:
                  "Latest in web development, programming, and technology",
                href: "/blog/category/tech",
                bg: "from-blue-50 to-indigo-50",
                border: "border-blue-200",
                hover: "hover:shadow-blue-200",
              },
              {
                title: "🍕 Food",
                description:
                  "Recipes, restaurant reviews, and culinary adventures",
                href: "/blog/category/food",
                bg: "from-green-50 to-emerald-50",
                border: "border-green-200",
                hover: "hover:shadow-green-200",
              },
              {
                title: "🏃 Activity",
                description: "Fitness, hobbies, and daily life experiences",
                href: "/blog/category/activity",
                bg: "from-orange-50 to-amber-50",
                border: "border-orange-200",
                hover: "hover:shadow-orange-200",
              },
            ].map((category, index) => (
              <motion.div key={index} variants={item} whileHover={{ y: -10 }}>
                <Link href={category.href}>
                  <div
                    className={`bg-gradient-to-br ${category.bg} border ${category.border} rounded-2xl p-8 h-full flex flex-col transition-all duration-300 shadow-lg hover:shadow-xl ${category.hover}`}
                  >
                    <div className="text-5xl mb-6">
                      {category.title.split(" ")[0]}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-grow">
                      {category.description}
                    </p>
                    <div className="flex items-center text-indigo-600 font-medium">
                      <span>View all posts</span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Posts */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
            variants={item}
          >
            Latest{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Articles
            </span>
          </motion.h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  variants={item}
                >
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-4/5 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post: any, index) => (
                <motion.div
                  key={post.id}
                  variants={item}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  {post.image_url && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                            post.category === "tech"
                              ? "bg-blue-500 text-white"
                              : post.category === "food"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-5">
                      {post.content.substring(0, 100)}...
                    </p>

                    <Link
                      href={`/blog/post/${post.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group-hover:underline"
                    >
                      Read full article
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
              variants={fadeIn}
            >
              <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No posts available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any recent blog posts. Please check back later.
              </p>
            </motion.div>
          )}

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/blog"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 inline-flex items-center"
            >
              View All Blog Posts
              <svg
                className="w-5 h-5 ml-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
