"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "../../contexts/SidebarContext";
import NotificationCenter from "./NotificationCenter";

interface MobileHeaderProps {
  title?: string;
}

export default function MobileHeader({
  title = "Admin Dashboard",
}: MobileHeaderProps) {
  const { toggleMobileOpen } = useSidebar();

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <button
        onClick={toggleMobileOpen}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Header actions */}
      <div className="flex items-center space-x-2">
        <NotificationCenter />
      </div>
    </div>
  );
}
