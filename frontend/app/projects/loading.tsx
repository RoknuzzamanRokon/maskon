"use client";

import { motion } from "framer-motion";

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
              <div className="text-center mb-8">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
