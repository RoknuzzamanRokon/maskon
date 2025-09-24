"use client";

import React, { useState } from "react";
import {
  Bell,
  X,
  Check,
  Trash2,
  ExternalLink,
  CheckCheck,
  Filter,
} from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { useRouter } from "next/navigation";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  maxVisible?: number;
  isMobile?: boolean;
}

export function NotificationCenter({
  isOpen,
  onClose,
  maxVisible = 10,
  isMobile = false,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    removeNotification,
  } = useDashboard();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.isRead
  );

  const handleNotificationAction = (notification: any) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }
  };

  const markAllAsRead = () => {
    notifications
      .filter((n) => !n.isRead)
      .forEach((n) => markNotificationRead(n.id));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  if (!isOpen) return null;

  const containerClasses = isMobile
    ? "fixed inset-x-4 top-20 bottom-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
    : "absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter toggle */}
            <button
              onClick={() => setFilter(filter === "all" ? "unread" : "all")}
              className={`p-1 rounded transition-colors ${
                filter === "unread"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
              title={filter === "all" ? "Show unread only" : "Show all"}
              aria-label={filter === "all" ? "Show unread only" : "Show all"}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                title="Mark all as read"
                aria-label="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className={`overflow-y-auto ${isMobile ? "flex-1" : "max-h-96"}`}>
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications"}
          </div>
        ) : (
          filteredNotifications.slice(0, maxVisible).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Remove notification"
                        aria-label="Remove notification"
                      >
                        <Trash2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {notification.actionUrl && notification.actionLabel && (
                    <button
                      onClick={() => handleNotificationAction(notification)}
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 transition-colors"
                    >
                      <span>{notification.actionLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              router.push("/admin/notifications");
              onClose();
            }}
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
