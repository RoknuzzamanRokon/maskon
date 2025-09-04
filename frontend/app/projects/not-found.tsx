"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Home } from "lucide-react";

export default function ProjectsNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-16 h-16 text-blue-400" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Project Not Found
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The project you're looking for doesn't exist or may have been
            removed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => router.push("/projects")}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </motion.button>

            <motion.button
              onClick={() => router.push("/")}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
