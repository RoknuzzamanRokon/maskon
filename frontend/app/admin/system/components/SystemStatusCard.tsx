"use client";

import { ReactNode } from "react";

interface SystemStatusCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  description: string;
  progress?: number;
}

export default function SystemStatusCard({
  title,
  value,
  icon,
  color,
  description,
  progress,
}: SystemStatusCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${color} mr-3`}>{icon}</div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Usage</span>
            <span className={color}>{progress.toFixed(1)}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress > 80
                  ? "bg-red-500"
                  : progress > 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </div>
  );
}
