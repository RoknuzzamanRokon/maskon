"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Grid, Search, Filter, Briefcase } from "lucide-react";
import { getPortfolio } from "../lib/api";
import ProjectCard from "../components/ProjectCard";
import { PortfolioItem } from "../types/portfolio";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState<string | null>(
    null
  );

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects when search term or technology filter changes
  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedTechnology]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPortfolio();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.technologies.toLowerCase().includes(term)
      );
    }

    // Filter by technology
    if (selectedTechnology) {
      filtered = filtered.filter((project) =>
        project.technologies
          .toLowerCase()
          .includes(selectedTechnology.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  // Get all unique technologies from projects
  const getAllTechnologies = () => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      if (project.technologies) {
        project.technologies.split(",").forEach((tech) => {
          techSet.add(tech.trim());
        });
      }
    });
    return Array.from(techSet).sort();
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTechnology(null);
  };

  const technologies = getAllTechnologies();
  const hasActiveFilters = searchTerm || selectedTechnology;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-80 animate-pulse"
        >
          <div className="h-40 bg-gray-300 dark:bg-gray-600 rounded-t-2xl mb-4"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">⚠️</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {error}
      </p>
      <button
        onClick={fetchProjects}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Try Again
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <Briefcase className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {hasActiveFilters
          ? "No projects match your filters"
          : "No projects yet"}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {hasActiveFilters
          ? "Try adjusting your search terms or clearing the filters to see more projects."
          : "Projects will appear here once they are added to the portfolio."}
      </p>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push("/portfolio")}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Portfolio
              </button>
              <nav className="text-sm text-gray-500 dark:text-gray-400">
                <span>Portfolio</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white">
                  All Projects
                </span>
              </nav>
            </div>

            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                All{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Explore our complete collection of projects, showcasing
                innovative solutions and cutting-edge technologies.
              </p>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col lg:flex-row gap-4 mb-8"
            >
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or technology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Technology Filter */}
              <div className="relative">
                <select
                  value={selectedTechnology || ""}
                  onChange={(e) =>
                    setSelectedTechnology(e.target.value || null)
                  }
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white min-w-[200px]"
                >
                  <option value="">All Technologies</option>
                  {technologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>

            {/* Results Count */}
            {!isLoading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Grid className="w-5 h-5 mr-2" />
                  <span>
                    {filteredProjects.length} project
                    {filteredProjects.length !== 1 ? "s" : ""} found
                    {hasActiveFilters &&
                      ` (filtered from ${projects.length} total)`}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState />
          ) : filteredProjects.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                  <ProjectCard
                    project={project}
                    onClick={() => handleProjectClick(project.id)}
                    size="medium"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
