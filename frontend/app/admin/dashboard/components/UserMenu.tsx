"use client";

import React from "react";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  HelpCircle,
} from "lucide-react";
import { getUserInfo, logout } from "../../../lib/api";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isMobile?: boolean;
}

export function UserMenu({
  isOpen,
  onToggle,
  onClose,
  isMobile = false,
}: UserMenuProps) {
  const router = useRouter();
  const userInfo = getUserInfo();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors min-h-touch min-w-touch`}
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {userInfo?.username?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        {!isMobile && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            {userInfo?.username}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* User dropdown menu */}
      {isOpen && (
        <div
          className={`${
            isMobile
              ? "fixed inset-x-4 top-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
              : "absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          }`}
        >
          <div className="p-2">
            {/* User info header */}
            <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userInfo?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userInfo?.username}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {userInfo?.is_admin && (
                      <span className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => handleNavigation("/admin/profile")}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => handleNavigation("/admin/settings")}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => handleNavigation("/admin/help")}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
            </div>

            <hr className="my-1 border-gray-200 dark:border-gray-700" />

            {/* Logout */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
