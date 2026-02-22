"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Code,
  Share2,
  Clock,
  Tag,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  CheckCircle,
} from "lucide-react";
import { getPortfolio } from "../../lib/api";
import { PortfolioItem } from "../../types/portfolio";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projects = await getPortfolio();
      const foundProject = projects.find(
        (p: PortfolioItem) => p.id === projectId
      );

      if (!foundProject) {
        setError("Project not found");
        return;
      }

      setProject(foundProject);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to load project details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date unavailable";
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = project?.title || "Check out this project";

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

  const technologies = project?.technologies
    ? project.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean)
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              {/* Header skeleton */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8"></div>

              {/* Hero skeleton */}
              <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>

              {/* Content skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {error === "Project not found"
              ? "Project Not Found"
              : "Something went wrong"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {error === "Project not found"
              ? "The project you're looking for doesn't exist or may have been removed."
              : error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/projects")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View All Projects
            </button>
            {error !== "Project not found" && (
              <button
                onClick={fetchProject}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Floating Action Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        <div className="relative">
          <motion.button
            onClick={() => setShareMenuOpen(!shareMenuOpen)}
            className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

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
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 pt-24 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium group transition-all duration-300 mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="text-sm uppercase tracking-[0.2em]">
                    Back to Projects
                  </span>
                </button>
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                  <span>Portfolio</span>
                  <span className="mx-2">/</span>
                  <button
                    onClick={() => router.push("/projects")}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Projects
                  </button>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 dark:text-white">
                    {project.title}
                  </span>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Project Image */}
            {project.image_url && !imageError && (
              <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Image
                  src={project.image_url}
                  alt={`${project.title} project screenshot`}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}

            {/* Project Title and Meta */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {project.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>
                  {project.updated_at &&
                    project.updated_at !== project.created_at && (
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        <span>Updated {formatDate(project.updated_at)}</span>
                      </div>
                    )}
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    <span>
                      {technologies.length} technolog
                      {technologies.length !== 1 ? "ies" : "y"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {project.project_url && (
                  <motion.a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Live Project
                  </motion.a>
                )}
                {project.github_url && (
                  <motion.a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View Source Code
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Technologies Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Code className="w-6 h-6 mr-3" />
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium border border-blue-200 dark:border-blue-800"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About This Project
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </motion.div>

          {/* Additional Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-gray-600 dark:text-gray-400">
                <p>
                  Interested in this project? Feel free to explore the code or
                  reach out!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/projects")}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  View More Projects
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Get In Touch
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
