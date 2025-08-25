"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  ChatError,
  NetworkError,
  ValidationError,
  RateLimitError,
  ServerError,
} from "../lib/errorHandler";

interface ErrorNotificationProps {
  error: Error | null;
  isRetrying?: boolean;
  canRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorNotification({
  error,
  isRetrying = false,
  canRetry = false,
  onRetry,
  onDismiss,
  className = "",
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      // Auto-hide for non-critical errors
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof ServerError)
      ) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, 5000);
        setAutoHideTimer(timer);
      }
    } else {
      setIsVisible(false);
    }

    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [error]);

  const handleDismiss = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for animation to complete
  };

  const handleRetry = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
    onRetry?.();
  };

  const getErrorIcon = () => {
    if (error instanceof NetworkError) {
      return <WifiOff className="w-5 h-5" />;
    }
    if (error instanceof ValidationError) {
      return <Info className="w-5 h-5" />;
    }
    if (error instanceof RateLimitError) {
      return <AlertTriangle className="w-5 h-5" />;
    }
    if (error instanceof ServerError) {
      return <AlertCircle className="w-5 h-5" />;
    }
    return <AlertCircle className="w-5 h-5" />;
  };

  const getErrorColor = () => {
    if (error instanceof NetworkError) {
      return "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200";
    }
    if (error instanceof ValidationError) {
      return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
    }
    if (error instanceof RateLimitError) {
      return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
    }
    if (error instanceof ServerError) {
      return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
    }
    return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
  };

  const getErrorTitle = () => {
    if (error instanceof NetworkError) {
      return "Connection Issue";
    }
    if (error instanceof ValidationError) {
      return "Invalid Input";
    }
    if (error instanceof RateLimitError) {
      return "Rate Limited";
    }
    if (error instanceof ServerError) {
      return "Server Error";
    }
    return "Error";
  };

  if (!error) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-4 right-4 z-50 max-w-md ${className}`}
        >
          <div className={`rounded-lg border p-4 shadow-lg ${getErrorColor()}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">{getErrorIcon()}</div>

              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">{getErrorTitle()}</h3>
                <div className="mt-1 text-sm opacity-90">{error.message}</div>

                {/* Additional error details for development */}
                {process.env.NODE_ENV === "development" &&
                  error instanceof ChatError &&
                  error.code && (
                    <div className="mt-1 text-xs opacity-75 font-mono">
                      Code: {error.code}
                    </div>
                  )}

                {/* Retry information for rate limits */}
                {error instanceof RateLimitError && error.retryAfter && (
                  <div className="mt-1 text-xs opacity-75">
                    Try again in {error.retryAfter} seconds
                  </div>
                )}

                {/* Action buttons */}
                {(canRetry || onDismiss) && (
                  <div className="mt-3 flex space-x-2">
                    {canRetry && (
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-current hover:bg-current hover:bg-opacity-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw
                          className={`w-3 h-3 mr-1 ${
                            isRetrying ? "animate-spin" : ""
                          }`}
                        />
                        {isRetrying ? "Retrying..." : "Retry"}
                      </button>
                    )}

                    {onDismiss && (
                      <button
                        onClick={handleDismiss}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-current hover:bg-current hover:bg-opacity-10 transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="inline-flex rounded-md p-1.5 hover:bg-current hover:bg-opacity-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Connection status indicator component
 */
interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: Error | null;
  className?: string;
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  error,
  className = "",
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (error) return "text-red-500";
    if (isConnecting) return "text-yellow-500";
    if (isConnected) return "text-green-500";
    return "text-gray-400";
  };

  const getStatusText = () => {
    if (error) return "Connection Error";
    if (isConnecting) return "Connecting...";
    if (isConnected) return "Connected";
    return "Disconnected";
  };

  const getStatusIcon = () => {
    if (error) return <WifiOff className="w-3 h-3" />;
    if (isConnecting) return <RefreshCw className="w-3 h-3 animate-spin" />;
    if (isConnected) return <Wifi className="w-3 h-3" />;
    return <WifiOff className="w-3 h-3" />;
  };

  return (
    <div
      className={`flex items-center space-x-1 text-xs ${getStatusColor()} ${className}`}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}

/**
 * Inline error message component for forms
 */
interface InlineErrorProps {
  error: Error | null;
  className?: string;
}

export function InlineError({ error, className = "" }: InlineErrorProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}
    >
      <div className="flex items-center space-x-1">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error.message}</span>
      </div>
    </motion.div>
  );
}
