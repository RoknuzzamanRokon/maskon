"use client";
import Link from "next/link";
import { createSubscriber, getBlogPosts } from "./lib/api";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Star,
  Users,
  BookOpen,
  Code,
  Coffee,
  Activity,
  TrendingUp,
  Award,
  Globe,
  Zap,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Clock,
  ChevronRight,
  Play,
  Sparkles,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

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

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Tech Lead at Microsoft",
      content:
        "MASHKON's technical insights have been invaluable for our team. The depth of knowledge and practical examples are outstanding.",
      avatar: "SJ",
      rating: 5,
    },
    {
      name: "Ahmed Rahman",
      role: "Food Blogger",
      content:
        "The culinary content here is exceptional. Every recipe I've tried has been a hit with my family and followers.",
      avatar: "AR",
      rating: 5,
    },
    {
      name: "Emily Chen",
      role: "Fitness Enthusiast",
      content:
        "The lifestyle and fitness content has transformed my daily routine. Practical, motivating, and genuinely helpful.",
      avatar: "EC",
      rating: 5,
    },
  ];

  // Enhanced stats
  const stats = [
    { number: "500K+", label: "Monthly Readers", icon: Users, color: "blue" },
    {
      number: "1,200+",
      label: "Articles Published",
      icon: BookOpen,
      color: "green",
    },
    { number: "50+", label: "Countries Reached", icon: Globe, color: "purple" },
    { number: "98%", label: "Reader Satisfaction", icon: Heart, color: "red" },
  ];

  // Features section
  const features = [
    {
      icon: Lightbulb,
      title: "Expert Insights",
      description:
        "In-depth analysis and expert perspectives on trending topics",
      color: "yellow",
    },
    {
      icon: Rocket,
      title: "Latest Trends",
      description:
        "Stay ahead with cutting-edge content and emerging technologies",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Quality Content",
      description:
        "Thoroughly researched and fact-checked articles you can trust",
      color: "green",
    },
    {
      icon: Target,
      title: "Practical Value",
      description:
        "Actionable advice and real-world applications for immediate use",
      color: "purple",
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section - Completely Redesigned */}
        <motion.section
          className="text-center py-20 md:py-32 mb-20 relative"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto">
            {/* Brand Badge */}
            {/* Main Heading */}
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  MASHKON
                </span>
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                <div className="w-4 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                <div className="w-2 h-1 bg-gradient-to-r from-pink-600 to-red-600 rounded-full"></div>
              </div>
              <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-light">
                Where Innovation Meets Inspiration
              </p>
            </motion.div>

            {/* Enhanced Description */}
            <motion.div variants={fadeInUp} className="mb-12">
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
                Discover a world of{" "}
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  cutting-edge technology
                </span>
                ,{" "}
                <span className="font-semibold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  culinary excellence
                </span>
                , and{" "}
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  lifestyle inspiration
                </span>
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Expert-Verified Content</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Updated Daily</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Community Driven</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced CTA Buttons */}
            <motion.div variants={fadeInUp} className="mb-16">
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/blog"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    <span>Start Exploring</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/portfolio"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    <span>View Portfolio</span>
                  </Link>
                </motion.div>
              </div>

              {/* Social proof */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Join{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  500,000+
                </span>{" "}
                readers worldwide
              </p>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div variants={fadeInUp}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900/30 dark:to-${stat.color}-800/30 rounded-xl flex items-center justify-center`}
                    >
                      <stat.icon
                        className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                      />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
        {/* Features Section - New */}
        <motion.section
          className="py-20 mb-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MASHKON
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the difference with our commitment to quality,
              innovation, and community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 dark:from-${feature.color}-900/30 dark:to-${feature.color}-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color}-600 dark:text-${feature.color}-400`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced Content Categories */}
        <motion.section
          className="mb-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Universe
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Dive deep into expertly curated content across our specialized
              domains
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: "Technology",
                icon: Code,
                emoji: "💻",
                description:
                  "Cutting-edge insights in web development, AI, and emerging technologies that shape our future",
                href: "/blog/category/tech",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient:
                  "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                stats: "350+ Articles",
                trending: "React 18, AI/ML, Web3",
                features: [
                  "Latest Frameworks",
                  "Code Tutorials",
                  "Tech Reviews",
                  "Industry Insights",
                ],
              },
              {
                title: "Culinary Arts",
                icon: Coffee,
                emoji: "🍽️",
                description:
                  "Gastronomic journeys featuring authentic recipes, restaurant reviews, and culinary culture exploration",
                href: "/blog/category/food",
                gradient: "from-green-500 to-emerald-500",
                bgGradient:
                  "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                stats: "280+ Recipes",
                trending: "Plant-based, Fusion, Local Cuisine",
                features: [
                  "Authentic Recipes",
                  "Restaurant Reviews",
                  "Cooking Techniques",
                  "Food Culture",
                ],
              },
              {
                title: "Lifestyle & Wellness",
                icon: Activity,
                emoji: "🌟",
                description:
                  "Personal growth, fitness insights, travel experiences, and daily life inspirations for holistic living",
                href: "/blog/category/activity",
                gradient: "from-purple-500 to-pink-500",
                bgGradient:
                  "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
                stats: "200+ Stories",
                trending: "Mindfulness, Fitness, Travel",
                features: [
                  "Wellness Tips",
                  "Travel Guides",
                  "Fitness Routines",
                  "Life Hacks",
                ],
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ y: -15, scale: 1.02 }}
                className="group"
              >
                <Link href={category.href}>
                  <div
                    className={`relative bg-gradient-to-br ${category.bgGradient} border border-gray-200 dark:border-gray-700 rounded-3xl p-8 h-full transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                      <div className="text-8xl">{category.emoji}</div>
                    </div>

                    {/* Header */}
                    <div className="relative z-10 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <category.icon className="w-7 h-7 text-white" />
                        </div>
                        <div
                          className={`px-3 py-1 bg-gradient-to-r ${category.gradient} text-white text-sm font-semibold rounded-full shadow-md`}
                        >
                          {category.stats}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {category.title}
                      </h3>

                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="font-medium">Trending:</span>{" "}
                        {category.trending}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed relative z-10">
                      {category.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-6 relative z-10">
                      {category.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                        >
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                      className="flex items-center justify-between font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10"
                      whileHover={{ x: 5 }}
                    >
                      <span>Explore {category.title}</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>

                    {/* Hover Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                    ></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section - New */}
        <motion.section
          className="py-20 mb-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                What Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Community Says
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Join thousands of satisfied readers who trust MASHKON for
                quality content
              </p>
            </div>

            <div className="relative">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700 text-center max-w-4xl mx-auto"
              >
                {/* Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current"
                      />
                    )
                  )}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900 rounded-full flex items-center justify-center mr-4 text-xl font-bold text-blue-800 dark:text-blue-200">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial Indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? "bg-blue-600 w-8"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>
        {/* Enhanced Featured Articles Section */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <motion.div className="text-center mb-16" variants={item}>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Latest{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Insights
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Stay ahead of the curve with our freshest content and trending
              topics
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  variants={item}
                >
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 w-full h-64 animate-pulse" />
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 animate-pulse" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-4/5 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded w-1/2 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {recentPosts.map((post: any, index) => (
                <Link
                  key={post.id}
                  href={`/blog/post/${post.id}`}
                  className="block group"
                >
                  <motion.article
                    variants={item}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-500 cursor-pointer h-full flex flex-col"
                  >
                    {/* Enhanced Image Section */}
                    <div className="relative h-64 overflow-hidden">
                      {post.image_url ? (
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-blue-400 dark:text-blue-300" />
                        </div>
                      )}

                      {/* Enhanced Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                            post.category === "tech"
                              ? "bg-blue-500/90 text-white border-blue-400/50"
                              : post.category === "food"
                              ? "bg-green-500/90 text-white border-green-400/50"
                              : "bg-purple-500/90 text-white border-purple-400/50"
                          }`}
                        >
                          {post.category === "tech" && (
                            <Code className="w-3 h-3 mr-1" />
                          )}
                          {post.category === "food" && (
                            <Coffee className="w-3 h-3 mr-1" />
                          )}
                          {post.category === "activity" && (
                            <Activity className="w-3 h-3 mr-1" />
                          )}
                          {post.category?.toUpperCase()}
                        </span>
                      </div>

                      {/* Reading Time */}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>
                            {Math.ceil(post.content.length / 200)} min read
                          </span>
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{Math.floor(Math.random() * 1000) + 100}</span>
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

                    {/* Enhanced Content Section */}
                    <div className="p-8 flex-grow flex flex-col">
                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(post.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>Trending</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-grow">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {post.content.substring(0, 150)}...
                      </p>

                      {/* Enhanced CTA */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                          <span>Read More</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>

                        {/* Author Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-800 dark:text-blue-200">
                          M
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-600"
              variants={item}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Content Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                We're working hard to bring you amazing content. Check back soon
                for the latest articles and insights.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                Explore Blog
              </Link>
            </motion.div>
          )}

          {/* Enhanced CTA Section */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Dive Deeper?
                </h3>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join our community of curious minds and stay updated with the
                  latest insights across technology, culinary arts, and
                  lifestyle.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/blog"
                      className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Explore All Articles
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/products"
                      className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Browse Products
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Newsletter Section - New */}
        <motion.section
          className="py-20 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Stay in the Loop
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Get the latest articles, exclusive content, and insider tips
                delivered straight to your inbox. No spam, just quality content.
              </p>

              <form
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSubscribeMessage(null);
                  setSubscribeError(null);

                  if (!subscriberEmail.trim()) {
                    setSubscribeError("Please enter a valid email address.");
                    return;
                  }

                  try {
                    setIsSubscribing(true);
                    const result = await createSubscriber(
                      subscriberEmail.trim(),
                      "homepage"
                    );
                    if (result?.already_subscribed) {
                      setSubscribeMessage("You're already subscribed. Thanks for staying with us!");
                    } else {
                      setSubscribeMessage("Thanks for subscribing! You'll hear from us soon.");
                    }
                    setSubscriberEmail("");
                  } catch (error: any) {
                    setSubscribeError(error?.message || "Subscription failed. Please try again.");
                  } finally {
                    setIsSubscribing(false);
                  }
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={subscriberEmail}
                  onChange={(event) => setSubscriberEmail(event.target.value)}
                  className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
                />
                <motion.button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={isSubscribing ? undefined : { scale: 1.05 }}
                  whileTap={isSubscribing ? undefined : { scale: 0.95 }}
                >
                  <span>{isSubscribing ? "Subscribing..." : "Subscribe"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </form>

              {(subscribeMessage || subscribeError) && (
                <p
                  className={`mt-4 text-sm ${
                    subscribeError
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {subscribeError || subscribeMessage}
                </p>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Join 50,000+ subscribers • Unsubscribe anytime
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
