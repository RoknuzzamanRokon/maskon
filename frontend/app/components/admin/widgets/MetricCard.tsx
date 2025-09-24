"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  loading = false,
  className = "",
  onClick,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!change) return null;

    switch (change.type) {
      case "increase":
        return <TrendingUp className="w-4 h-4" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4" />;
      case "neutral":
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!change) return "";

    switch (change.type) {
      case "increase":
        return "text-green-600 dark:text-green-400";
      case "decrease":
        return "text-red-600 dark:text-red-400";
      case "neutral":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "";
    }
  };

  const cardClasses = `
    bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 
    shadow-sm transition-all duration-200 hover:shadow-md
    ${
      onClick
        ? "cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
        : ""
    }
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        {Icon && <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {change && (
            <div className={`flex items-center text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(change.value)}%
                {change.period && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {change.period}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
