"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

interface OfflineState {
  isOffline: boolean;
  wasOffline: boolean;
}

export function useOfflineDetection() {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOffline: false,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState((prev) => ({
        isOffline: false,
        wasOffline: prev.isOffline,
      }));
    };

    const handleOffline = () => {
      setOfflineState((prev) => ({
        isOffline: true,
        wasOffline: prev.isOffline,
      }));
    };

    // Set initial state
    setOfflineState({
      isOffline: !navigator.onLine,
      wasOffline: false,
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return offlineState;
}

export function OfflineBanner() {
  const { isOffline, wasOffline } = useOfflineDetection();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOffline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, wasOffline]);

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 text-center text-sm font-medium animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-center space-x-2">
          <Wifi className="w-4 h-4" />
          <span>Connection restored</span>
        </div>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span>
            You are currently offline. Some features may not be available.
          </span>
        </div>
      </div>
    );
  }

  return null;
}

export function OfflineIndicator({ className = "" }: { className?: string }) {
  const { isOffline } = useOfflineDetection();

  if (!isOffline) return null;

  return (
    <div
      className={`flex items-center space-x-2 text-red-600 dark:text-red-400 ${className}`}
    >
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Offline</span>
    </div>
  );
}
