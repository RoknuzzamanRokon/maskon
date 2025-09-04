"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Github, Code, Calendar } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  technologies: string;
  project_url?: string;
  github_url?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

interface ProjectCardProps {
  project: PortfolioItem;
  onClick?: () => void;
  showFullDescription?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function ProjectCard({
  project,
  onClick,
  showFullDescription = false,
  size = "medium",
  className = "",
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Parse technologies into array
  const technologies = project.technologies
    ? project.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean)
    : [];

  // Truncate description based on size
  const getDescriptionLength = () => {
    if (showFullDescription) return project.description;
    switch (size) {
      case "small":
        return 80;
      case "medium":
        return 120;
      case "large":
        return 200;
      default:
        return 120;
    }
  };

  const truncatedDescription = showFullDescription
    ? project.description
    : project.description.length > getDescriptionLength()
    ? project.description.substring(0, getDescriptionLength()) + "..."
    : project.description;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on external links
    if ((e.target as HTMLElement).closest('a[href^="http"]')) {
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  // Handle external link clicks
  const handleExternalClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const cardSizeClasses = {
    small: "h-64",
    medium: "h-80",
    large: "h-96",
  };

  const imageSizeClasses = {
    small: "h-32",
    medium: "h-40",
    large: "h-48",
  };

  return (
    <motion.div
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 cursor-pointer ${cardSizeClasses[size]} ${className}`}
      onClick={handleCardClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
      aria-label={`View details for ${project.title}`}
    >
      {/* Project Image */}
      <div
        className={`relative ${imageSizeClasses[size]} bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 overflow-hidden`}
      >
        {project.image_url && !imageError ? (
          <>
            <Image
              src={project.image_url}
              alt={`${project.title} project screenshot`}
              fill
              className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Code className="w-12 h-12 text-blue-400 dark:text-blue-300" />
          </div>
        )}

        {/* Overlay with external links */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 right-3 flex space-x-2">
            {project.project_url && (
              <motion.button
                onClick={(e) => handleExternalClick(e, project.project_url!)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Visit ${project.title} live site`}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            )}
            {project.github_url && (
              <motion.button
                onClick={(e) => handleExternalClick(e, project.github_url!)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`View ${project.title} source code on GitHub`}
              >
                <Github className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Technology badge overlay */}
        {technologies.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {technologies[0]}
              {technologies.length > 1 && ` +${technologies.length - 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="flex-1">
          {/* Title and Date */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {project.title}
            </h3>
            {project.created_at && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(project.created_at)}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
            {truncatedDescription}
          </p>
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {technologies
              .slice(0, size === "small" ? 2 : size === "medium" ? 3 : 4)
              .map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-md font-medium"
                >
                  {tech}
                </span>
              ))}
            {technologies.length >
              (size === "small" ? 2 : size === "medium" ? 3 : 4) && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                +
                {technologies.length -
                  (size === "small" ? 2 : size === "medium" ? 3 : 4)}
              </span>
            )}
          </div>
        )}

        {/* Action indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Click to view details
          </span>
          <motion.div
            className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
}
