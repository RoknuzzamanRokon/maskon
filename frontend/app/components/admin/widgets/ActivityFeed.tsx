"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Briefcase,
  ShoppingBag,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "post" | "portfolio" | "product" | "user";
  action: "created" | "updated" | "deleted" | "viewed";
  title: string;
  description?: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onItemClick?: (activity: ActivityItem) => void;
}

const getActivityIcon = (type: string, action: string) => {
  const iconClass = "w-4 h-4";

  if (action === "created") return <Plus className={iconClass} />;
  if (action === "updated") return <Edit className={iconClass} />;
  if (action === "deleted") return <Trash2 className={iconClass} />;
  if (action === "viewed") return <Eye className={iconClass} />;

  switch (type) {
    case "post":
      return <FileText className={iconClass} />;
    case "portfolio":
      return <Briefcase className={iconClass} />;
    case "product":
      return <ShoppingBag className={iconClass} />;
    case "user":
      return <User className={iconClass} />;
    default:
      return <MoreHorizontal className={iconClass} />;
  }
};

const getActivityColor = (action: string) => {
  switch (action) {
    case "created":
      return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400";
    case "updated":
      return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";
    case "deleted":
      return "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400";
    case "viewed":
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  }
};

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Unknown time";
  }
};

export default function ActivityFeed({
  activities,
  loading = false,
  className = "",
  maxItems = 10,
  showViewAll = true,
  onViewAll,
  onItemClick,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        {showViewAll && onViewAll && activities.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View All
          </button>
        )}
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-8">
          <MoreHorizontal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                onItemClick
                  ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  : ""
              }`}
              onClick={() => onItemClick?.(activity)}
            >
              {/* Activity Icon */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(
                  activity.action
                )}`}
              >
                {getActivityIcon(activity.type, activity.action)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.user.name}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.action}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {activity.type}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  {activity.title}
                </p>

                {activity.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                    {activity.description}
                  </p>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>

              {/* User Avatar */}
              <div className="flex-shrink-0">
                {activity.user.avatar ? (
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
