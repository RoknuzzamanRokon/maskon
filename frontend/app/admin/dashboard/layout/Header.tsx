"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { NotificationCenter } from "../components/NotificationCenter";
import { UserMenu } from "../components/UserMenu";
import { touchFriendlyProps } from "../utils/responsive";

interface HeaderProps {
  onToggleSidebar: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
}

export function Header({
  onToggleSidebar,
  isMobile = false,
  mobileMenuOpen = false,
}: HeaderProps) {
  const { unreadCount } = useDashboard();

  // State for dropdowns
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Refs for click outside detection
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key to close dropdowns
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close dropdowns when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      setIsNotificationOpen(false);
      setIsUserMenuOpen(false);
    }
  }, [mobileMenuOpen]);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-4 md:px-6 relative z-40">
      {/* Left side - Mobile menu button and title */}
      <div className="flex items-center min-w-0 flex-1">
        <button
          id="mobile-menu-button"
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors ${
            isMobile ? "block" : "hidden md:block"
          } ${touchFriendlyProps.className}`}
          style={touchFriendlyProps.style}
          aria-label={isMobile ? "Open menu" : "Toggle sidebar"}
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="ml-2 md:ml-4 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {isMobile ? "Admin" : "Dashboard"}
          </h1>
        </div>
      </div>

      {/* Right side - User controls */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
        {/* Theme toggle */}
        <div className="hidden xs:block">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors relative ${touchFriendlyProps.className}`}
            style={touchFriendlyProps.style}
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
            aria-haspopup="true"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[1.25rem]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationCenter
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            isMobile={isMobile}
          />
        </div>

        {/* User menu */}
        <div ref={userMenuRef}>
          <UserMenu
            isOpen={isUserMenuOpen}
            onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
            onClose={() => setIsUserMenuOpen(false)}
            isMobile={isMobile}
          />
        </div>
      </div>
    </header>
  );
}
