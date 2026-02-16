"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Briefcase,
  ShoppingBag,
  Users,
  Settings,
  Monitor,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: MenuItem[];
  requiredRole?: "admin" | "user";
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentPath: string;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/admin",
  },
  {
    id: "posts",
    label: "Posts",
    icon: FileText,
    path: "/admin/posts",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: Briefcase,
    path: "/admin/portfolio",
  },
  {
    id: "products",
    label: "Products",
    icon: ShoppingBag,
    path: "/admin/products",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/admin/users",
    requiredRole: "admin",
  },
  {
    id: "system",
    label: "System Monitor",
    icon: Monitor,
    path: "/admin/system",
    requiredRole: "admin",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function Sidebar({
  isCollapsed,
  onToggle,
  currentPath,
  isMobileOpen,
  onMobileToggle,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    // Close mobile menu after navigation
    if (isMobileOpen) {
      onMobileToggle();
    }
  };

  const isActiveRoute = (itemPath: string) => {
    if (itemPath === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(itemPath);
  };

  if (!mounted) {
    return null;
  }

  // Mobile overlay
  if (isMobileOpen) {
    return (
      <>
        {/* Mobile backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileToggle}
        />

        {/* Mobile sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden">
          <div className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mashkon Vibes
            </h2>
            <button
              onClick={onMobileToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  // Desktop sidebar - always full width (w-64)
  return (
    <div className="hidden md:flex sticky top-0 h-screen flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64">
      {/* Removed transition and conditional width - always w-64 */}
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white animate-fade-slide">
          Mashkon Vibes
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors group ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={isCollapsed ? item.label : undefined}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 font-medium">{item.label}</span>
              {/* Always show labels since sidebar is always expanded */}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
