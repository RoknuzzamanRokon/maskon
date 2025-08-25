"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  AlertTriangle,
  MessageSquare,
  Clock,
  User,
  Package,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Wifi,
  WifiOff,
} from "lucide-react";

interface NotificationStats {
  email_configured: boolean;
  admin_emails_count: number;
  websocket_enabled: boolean;
  notifications_sent_today: number;
}

interface PendingInquiry {
  id: number;
  session_id: string;
  product_id: number;
  product_name: string;
  customer_name: string;
  customer_email?: string;
  priority: string;
  status: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
  unread_count: number;
}

interface RecentMessage {
  id: number;
  message_text: string;
  sender_name: string;
  created_at: string;
  session_id: string;
  product_id: number;
  product_name: string;
  customer_name: string;
  priority: string;
}

interface NotificationDashboard {
  pending_inquiries: PendingInquiry[];
  recent_unread_messages: RecentMessage[];
  my_assigned_inquiries: PendingInquiry[];
  notification_stats: NotificationStats;
  last_updated: string;
}

interface AdminNotificationDashboardProps {
  onInquirySelect?: (inquiry: PendingInquiry) => void;
}

export default function AdminNotificationDashboard({
  onInquirySelect,
}: AdminNotificationDashboardProps) {
  const [dashboard, setDashboard] = useState<NotificationDashboard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<string | null>(null);
  const [websocketStatus, setWebsocketStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/admin/notifications/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Failed to load notification dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailNotification = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/admin/notifications/test-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmailTestResult(
          data.success
            ? "Test email sent successfully!"
            : "Email test failed - check configuration"
        );
      } else {
        setEmailTestResult("Failed to send test email");
      }
    } catch (error) {
      setEmailTestResult("Error testing email notification");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Failed to load notification dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                dashboard.notification_stats.email_configured
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              <Mail
                className={`w-6 h-6 ${
                  dashboard.notification_stats.email_configured
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboard.notification_stats.email_configured
                  ? "Configured"
                  : "Not Setup"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                dashboard.notification_stats.websocket_enabled
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              {dashboard.notification_stats.websocket_enabled ? (
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                WebSocket
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboard.notification_stats.websocket_enabled
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Urgent</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {
                  dashboard.pending_inquiries.filter(
                    (i) => i.priority === "urgent" || i.priority === "high"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Assigned
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboard.my_assigned_inquiries.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Inquiries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Urgent Inquiries
              </h3>
              <button
                onClick={loadDashboard}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {dashboard.pending_inquiries.filter(
              (i) => i.priority === "urgent" || i.priority === "high"
            ).length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No urgent inquiries
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboard.pending_inquiries
                  .filter(
                    (i) => i.priority === "urgent" || i.priority === "high"
                  )
                  .slice(0, 5)
                  .map((inquiry) => (
                    <motion.div
                      key={inquiry.id}
                      onClick={() => onInquirySelect?.(inquiry)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {inquiry.customer_name || "Anonymous"}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(
                                inquiry.priority
                              )}`}
                            >
                              {inquiry.priority}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <Package className="w-3 h-3 mr-1" />
                            <span>{inquiry.product_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(inquiry.last_message_at)}
                            </span>
                            {inquiry.unread_count > 0 && (
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {inquiry.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Unread Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
              Recent Messages
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {dashboard.recent_unread_messages.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No unread messages
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboard.recent_unread_messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {message.customer_name || "Anonymous"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(
                              message.priority
                            )}`}
                          >
                            {message.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {message.product_name}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                          {message.message_text}
                        </p>
                        <span className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-500" />
            Notification Settings
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Email Notifications
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Status
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      dashboard.notification_stats.email_configured
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {dashboard.notification_stats.email_configured
                      ? "Configured"
                      : "Not Setup"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Admin Emails
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dashboard.notification_stats.admin_emails_count}
                  </span>
                </div>
                <button
                  onClick={testEmailNotification}
                  disabled={
                    isTestingEmail ||
                    !dashboard.notification_stats.email_configured
                  }
                  className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isTestingEmail ? "Sending..." : "Test Email"}
                </button>
                {emailTestResult && (
                  <p
                    className={`text-xs mt-1 ${
                      emailTestResult.includes("success")
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {emailTestResult}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Real-time Notifications
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    WebSocket
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      dashboard.notification_stats.websocket_enabled
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {dashboard.notification_stats.websocket_enabled
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Connection
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      websocketStatus === "connected"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {websocketStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
