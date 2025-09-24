"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { touchFriendlyProps } from "../utils/responsive";

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
  requiredRole?: "admin" | "user";
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "📊",
    path: "/admin/dashboard",
  },
  {
    id: "content",
    label: "Content",
    icon: "📝",
    path: "/admin/content",
    children: [
      {
        id: "posts",
        label: "Posts",
        icon: "📄",
        path: "/admin/content/posts",
      },
      {
        id: "portfolio",
        label: "Portfolio",
        icon: "🎨",
        path: "/admin/content/portfolio",
      },
      {
        id: "products",
        label: "Products",
        icon: "🛍️",
        path: "/admin/content/products",
      },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: "👥",
    path: "/admin/users",
    requiredRole: "admin",
  },
  {
    id: "system",
    label: "System",
    icon: "⚙️",
    path: "/admin/system",
    requiredRole: "admin",
  },
];

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobile = false,
  mobileMenuOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const isActiveRoute = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  // Mobile sidebar classes
  const mobileClasses = isMobile
    ? `fixed left-0 top-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 z-50 ${
        mobileMenuOpen
          ? "translate-x-0 animate-slide-in-left"
          : "-translate-x-full"
      }`
    : "";

  // Desktop sidebar classes
  const desktopClasses = !isMobile
    ? `fixed left-0 top-0 h-full transition-all duration-300 z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`
    : "";

  const sidebarClasses = `${
    isMobile ? mobileClasses : desktopClasses
  } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`;

  return (
    <div
      id={isMobile ? "mobile-sidebar" : "desktop-sidebar"}
      className={sidebarClasses}
    >
      {/* Logo/Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Admin Dashboard
            </span>
          </div>
        )}

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${touchFriendlyProps.className}`}
            style={touchFriendlyProps.style}
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${touchFriendlyProps.className}`}
            style={touchFriendlyProps.style}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-gray-600 dark:text-gray-400">
              {isCollapsed ? "→" : "←"}
            </span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 pb-20">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Link
              href={item.path}
              onClick={handleLinkClick}
              className={`flex items-center p-3 rounded-lg transition-colors group ${
                touchFriendlyProps.className
              } ${
                isActiveRoute(item.path)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              }`}
              style={touchFriendlyProps.style}
            >
              <span className="text-lg mr-3 flex-shrink-0">{item.icon}</span>
              {(!isCollapsed || isMobile) && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </Link>

            {/* Sub-menu items */}
            {item.children &&
              (!isCollapsed || isMobile) &&
              isActiveRoute(item.path) && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.path}
                      onClick={handleLinkClick}
                      className={`flex items-center p-2 rounded-lg transition-colors text-sm ${
                        touchFriendlyProps.className
                      } ${
                        isActiveRoute(child.path)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                      }`}
                      style={touchFriendlyProps.style}
                    >
                      <span className="text-sm mr-2 flex-shrink-0">
                        {child.icon}
                      </span>
                      <span className="truncate">{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>

      {/* Mobile-only footer with swipe hint */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Swipe left to close menu
          </p>
        </div>
      )}
    </div>
  );
}
