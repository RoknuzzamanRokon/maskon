"use client";
import Link from "next/link";
import { getBlogPosts } from "./lib/api";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
// import type { Variants } from "framer-motion";

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
        staggerChildren: 0.15,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  // Floating animation for elements
  const floating: Variants = {
    float: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse", // ✅ correct literal type
      },
    },
  };

  // Rotating animation
  const rotating: Variants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
  };

  // Pulse animation
  const pulse: Variants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large floating circles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              filter: "blur(40px)",
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: `hsl(${Math.random() * 60 + 240}, 80%, 80%)`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section with Enhanced Animations */}
        <motion.section
          className="text-center py-16 md:py-24 rounded-3xl mb-16 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 z-0"></div>

          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "linear-gradient(45deg, #ff9a9e, #fad0c4)",
                "linear-gradient(45deg, #a1c4fd, #c2e9fb)",
                "linear-gradient(45deg, #fbc2eb, #a6c1ee)",
                "linear-gradient(45deg, #ff9a9e, #fad0c4)",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[size:200px] opacity-10 z-10"></div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-xl top-1/4 left-1/4"
            variants={floating}
            animate="animate"
          />
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-white/30 blur-xl bottom-1/3 right-1/4"
            variants={floating}
            animate="animate"
          />

          <div className="relative z-20 max-w-4xl mx-auto">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Welcome to{" "}
              <motion.span
                className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400 inline-block"
                variants={pulse}
                animate="animate"
              >
                MASKON
              </motion.span>
            </motion.h1>

            <motion.div
              className="text-xl md:text-2xl mb-10 text-indigo-100 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              <div className="inline-flex items-center">
                <motion.span
                  className="mr-3"
                  variants={floating}
                  animate="animate"
                >
                  Tech insights
                </motion.span>

                <motion.div
                  className="w-2 h-2 rounded-full bg-amber-400"
                  variants={rotating}
                  animate="animate"
                />

                <motion.span
                  className="mx-3"
                  variants={floating}
                  animate="animate"
                  style={{ animationDelay: "0.5s" }}
                >
                  Food adventures
                </motion.span>

                <motion.div
                  className="w-2 h-2 rounded-full bg-amber-400"
                  variants={rotating}
                  animate="animate"
                />

                <motion.span
                  className="ml-3"
                  variants={floating}
                  animate="animate"
                  style={{ animationDelay: "1s" }}
                >
                  Daily activities
                </motion.span>
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

        {/* Categories with Enhanced Animations */}
        <motion.section
          className="mb-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200 relative inline-block"
            variants={item}
          >
            Explore Our{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Categories
            </span>
            {/* Animated underline */}
            <motion.div
              className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ originX: 0 }}
            />
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
                color: "text-blue-500",
              },
              {
                title: "🍕 Food",
                description:
                  "Recipes, restaurant reviews, and culinary adventures",
                href: "/blog/category/food",
                bg: "from-green-50 to-emerald-50",
                border: "border-green-200",
                hover: "hover:shadow-green-200",
                color: "text-green-500",
              },
              {
                title: "🏃 Activity",
                description: "Fitness, hobbies, and daily life experiences",
                href: "/blog/category/activity",
                bg: "from-orange-50 to-amber-50",
                border: "border-orange-200",
                hover: "hover:shadow-orange-200",
                color: "text-orange-500",
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{
                  y: -15,
                  scale: 1.03,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                  },
                }}
              >
                <Link href={category.href}>
                  <motion.div
                    className={`bg-gradient-to-br ${category.bg} border ${category.border} rounded-2xl p-8 h-full flex flex-col transition-all duration-300 shadow-lg hover:shadow-xl ${category.hover}`}
                    whileHover={{
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <motion.div
                      className="text-5xl mb-6"
                      variants={floating}
                      animate="animate"
                    >
                      {category.title.split(" ")[0]}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-grow">
                      {category.description}
                    </p>
                    <motion.div
                      className="flex items-center font-medium"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <span className={category.color}>View all posts</span>
                      <svg
                        className={`w-4 h-4 ml-2 ${category.color}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Futuristic Animated Wave Divider */}
        <motion.div
          className="relative h-40 w-full my-20 overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "10rem",
            transition: { duration: 1.2, ease: "easeInOut" },
          }}
          viewport={{ once: true }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>

          {/* Layered waves */}
          <svg
            viewBox="0 0 1200 120"
            className="absolute bottom-0 left-0 w-full h-full"
            preserveAspectRatio="none"
          >
            {[0.8, 0.5].map((opacity, idx) => (
              <motion.path
                key={idx}
                fill={`url(#waveGradient${idx})`}
                fillOpacity={opacity}
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                animate={{
                  d: [
                    "M0,0V46.29c50,22,120,32,180,28,80-5,150-33,220-37C480,30,550,50,620,70c70,20,150,30,230,20,40-6,80-20,120-32,100-34,230-70,310,0V0Z",
                    "M0,0V20C60,50,150,80,250,70,340,60,430,30,520,20c90-10,180,10,260,40,80,30,160,60,250,40,90-20,180-70,250-80V0Z",
                  ],
                }}
                transition={{
                  duration: idx === 0 ? 14 : 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Gradient defs */}
            <defs>
              <linearGradient
                id="waveGradient0"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient
                id="waveGradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Bubbles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                bottom: `${Math.random() * 40}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
              }}
              animate={{
                y: [0, -60],
                x: [0, Math.random() * 20 - 10],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 4,
              }}
            />
          ))}

          {/* Sparkles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute rounded-full bg-white shadow-lg"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Recent Posts with Enhanced Animations */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100 relative inline-block"
            variants={item}
          >
            Latest{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Articles
            </span>
            {/* Animated underline */}
            <motion.div
              className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ originX: 0 }}
            />
          </motion.h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  variants={item}
                  initial="hidden"
                  animate="show"
                >
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-full h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                  </div>
                  <div className="p-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 mb-4 animate-shimmer" />
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-full mb-2 animate-shimmer" />
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-4/5 mb-4 animate-shimmer" />
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 animate-shimmer" />
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
                  whileHover={{
                    y: -15,
                    rotate: index % 2 === 0 ? -1 : 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                    },
                  }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  {post.image_url && (
                    <div className="relative h-56 overflow-hidden">
                      <motion.img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        whileHover={{
                          scale: 1.2,
                          transition: {
                            duration: 0.5,
                          },
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <motion.span
                          className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                            post.category === "tech"
                              ? "bg-blue-500 text-white"
                              : post.category === "food"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {post.category}
                        </motion.span>
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

                    <motion.h3
                      className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors"
                      whileHover={{
                        x: 5,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                        },
                      }}
                    >
                      {post.title}
                    </motion.h3>

                    <p className="text-gray-600 mb-5">
                      {post.content.substring(0, 100)}...
                    </p>

                    <Link
                      href={`/blog/post/${post.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                      <motion.span
                        whileHover={{
                          x: 5,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                          },
                        }}
                      >
                        Read full article
                      </motion.span>
                      <motion.svg
                        className="w-4 h-4 ml-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{
                          x: 5,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                          },
                        }}
                      >
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <motion.svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </motion.svg>
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
            whileInView={{
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 100,
              },
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/blog"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 inline-flex items-center relative overflow-hidden"
            >
              <motion.span
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
              >
                View All Blog Posts
              </motion.span>
              <svg
                className="w-5 h-5 ml-2 relative z-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.5 }}
              />
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
