"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { getAdminNotifications } from "../../lib/api";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  source: string;
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "info" | "warning" | "error" | "success"
  >("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Try to fetch from API, fallback to mock data
      try {
        const data = await getAdminNotifications();
        if (data.notifications) {
          setNotifications(
            data.notifications.map((n: any) => ({
              ...n,
              timestamp: n.timestamp || new Date().toISOString(),
              source: n.source || "System",
            }))
          );
        }
      } catch (apiError) {
        // Fallback to mock data
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "warning",
            title: "High Memory Usage",
            message:
              "System memory usage has exceeded 85%. Consider optimizing or upgrading.",
            timestamp: new Date().toISOString(),
            isRead: false,
            source: "System Monitor",
            actionUrl: "/admin/system",
            actionLabel: "View System",
          },
          {
            id: "2",
            type: "success",
            title: "Backup Completed",
            message: "Daily system backup completed successfully at 2:00 AM.",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false,
            source: "Backup Service",
          },
          {
            id: "3",
            type: "info",
            title: "New User Registration",
            message:
              'A new user "john.doe@example.com" has registered and is pending approval.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            isRead: true,
            source: "User Management",
            actionUrl: "/admin/users",
            actionLabel: "Manage Users",
          },
          {
            id: "4",
            type: "error",
            title: "Database Connection Failed",
            message:
              "Failed to connect to the backup database. Please check connection settings.",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            isRead: false,
            source: "Database",
          },
          {
            id: "5",
            type: "info",
            title: "System Update Available",
            message:
              "A new system update (v2.1.3) is available for installation.",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            isRead: true,
            source: "Update Manager",
          },
          {
            id: "6",
            type: "warning",
            title: "SSL Certificate Expiring",
            message:
              "Your SSL certificate will expire in 30 days. Please renew it soon.",
            timestamp: new Date(Date.now() - 18000000).toISOString(),
            isRead: false,
            source: "Security",
          },
        ];
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return "🚨";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
      case "success":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
      default:
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesReadFilter =
      filter === "all" ||
      (filter === "read" && n.isRead) ||
      (filter === "unread" && !n.isRead);

    const matchesTypeFilter = typeFilter === "all" || n.type === typeFilter;

    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading notifications...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage system notifications and alerts
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark All Read
                </button>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unread
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === "all"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === "unread"
                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === "read"
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>

            <div className="flex space-x-2">
              {["all", "info", "warning", "error", "success"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    typeFilter === type
                      ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {type === "all"
                    ? "All Types"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === "all"
                  ? "No notifications available."
                  : `No ${filter} notifications.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-6 transition-all hover:shadow-md ${getTypeColor(
                  notification.type
                )} ${
                  !notification.isRead
                    ? "ring-2 ring-blue-200 dark:ring-blue-800"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>📍 {notification.source}</span>
                        <span>
                          🕒 {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <a
                            href={notification.actionUrl}
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          >
                            {notification.actionLabel || "View Details"} →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
