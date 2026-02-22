"use client";

import React, { useState, useEffect } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import { Notification } from "../../types/notification";
import {
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

function NotificationToast({
  notification,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-yellow-500";
      case "error":
        return "border-l-red-500";
      default:
        return "border-l-blue-500";
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "error":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isExiting
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        ${isExiting ? "translate-x-full opacity-0" : ""}
      `}
    >
      <div
        className={`
          max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto
          border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor()}
          ${getBackgroundColor()}
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon()}</div>

            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {notification.message}
              </p>

              {notification.actionUrl && (
                <div className="mt-2">
                  <button
                    onClick={() =>
                      window.open(notification.actionUrl, "_blank")
                    }
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    {notification.actionLabel || "View Details"}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>
              )}
            </div>

            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast container component
export default function NotificationToastContainer() {
  const { state } = useNotifications();
  const [toasts, setToasts] = useState<Notification[]>([]);

  // Show toasts for new unread notifications
  useEffect(() => {
    const newNotifications = state.notifications.filter(
      (notification) =>
        !notification.isRead &&
        !toasts.some((toast) => toast.id === notification.id)
    );

    if (newNotifications.length > 0) {
      setToasts((prev) => [...prev, ...newNotifications]);
    }
  }, [state.notifications, toasts]);

  const removeToast = (notificationId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== notificationId));
  };

  // return (
  //   <div className="fixed top-4 right-4 z-50 space-y-2">
  //     {toasts.map((notification) => (
  //       <NotificationToast
  //         key={notification.id}
  //         notification={notification}
  //         onClose={() => removeToast(notification.id)}
  //       />
  //     ))}
  //   </div>
  // );
}
