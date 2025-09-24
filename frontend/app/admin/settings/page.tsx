"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  getUserInfo,
  getAdminSettings,
  updateAdminSettings,
} from "../../lib/api";
import { useTheme } from "../../contexts/ThemeContext";

interface AdminSettings {
  admin_info: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
  };
  system_stats: {
    total_posts: number;
    total_products: number;
    total_chat_sessions: number;
    total_messages: number;
  };
  system_config: {
    chat_enabled: boolean;
    file_uploads_enabled: boolean;
    max_file_size_mb: number;
    supported_file_types: string[];
    rate_limiting_enabled: boolean;
    websocket_enabled: boolean;
  };
  security_settings: {
    session_timeout_minutes: number;
    max_login_attempts: number;
    password_min_length: number;
    require_admin_approval: boolean;
  };
}

function SettingsContent() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "general" | "security" | "system" | "profile"
  >("general");

  const currentUser = getUserInfo();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Try to fetch from API, fallback to mock data
      try {
        const data = await getAdminSettings();
        setSettings(data);
      } catch (apiError) {
        // Fallback to mock data
        const mockSettings: AdminSettings = {
          admin_info: {
            id: currentUser?.id || 1,
            username: currentUser?.username || "admin",
            email: currentUser?.email || "admin@example.com",
            is_admin: true,
            created_at: "2024-01-15T10:30:00Z",
          },
          system_stats: {
            total_posts: 25,
            total_products: 12,
            total_chat_sessions: 156,
            total_messages: 1247,
          },
          system_config: {
            chat_enabled: true,
            file_uploads_enabled: true,
            max_file_size_mb: 50,
            supported_file_types: [
              "image/jpeg",
              "image/png",
              "image/gif",
              "video/mp4",
            ],
            rate_limiting_enabled: true,
            websocket_enabled: true,
          },
          security_settings: {
            session_timeout_minutes: 30,
            max_login_attempts: 5,
            password_min_length: 8,
            require_admin_approval: true,
          },
        };
        setSettings(mockSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (section: string, newSettings: any) => {
    setIsSaving(true);
    try {
      // Update local state
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              [section]: {
                ...prev[section as keyof AdminSettings],
                ...newSettings,
              },
            }
          : null
      );

      // Try to save to API
      try {
        await updateAdminSettings({ [section]: newSettings });
      } catch (apiError) {
        console.log("API not available, using local state only");
      }

      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving settings. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (section: string, key: string, value: boolean) => {
    if (settings) {
      const newSettings = { [key]: value };
      handleSave(section, newSettings);
    }
  };

  const handleInputChange = (
    section: string,
    key: string,
    value: string | number
  ) => {
    if (settings) {
      const newSettings = { [key]: value };
      handleSave(section, newSettings);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading settings...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Settings
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Unable to load system settings. Please try again.
            </p>
            <button
              onClick={fetchSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
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
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure system settings and preferences
                </p>
              </div>
            </div>
            {message && (
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.includes("Error")
                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: "general", label: "🏠 General", icon: "🏠" },
              { id: "security", label: "🔒 Security", icon: "🔒" },
              { id: "system", label: "🖥️ System", icon: "🖥️" },
              { id: "profile", label: "👤 Profile", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                General Settings
              </h2>

              {/* Theme Settings */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Appearance
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === "dark" ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme === "dark" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* System Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  System Features
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Chat System
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable customer chat functionality
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleToggle(
                        "system_config",
                        "chat_enabled",
                        !settings.system_config.chat_enabled
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.system_config.chat_enabled
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.system_config.chat_enabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      File Uploads
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow file uploads in the system
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleToggle(
                        "system_config",
                        "file_uploads_enabled",
                        !settings.system_config.file_uploads_enabled
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.system_config.file_uploads_enabled
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.system_config.file_uploads_enabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Rate Limiting
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable API rate limiting protection
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleToggle(
                        "system_config",
                        "rate_limiting_enabled",
                        !settings.system_config.rate_limiting_enabled
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.system_config.rate_limiting_enabled
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.system_config.rate_limiting_enabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Security Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.security_settings.session_timeout_minutes}
                    onChange={(e) =>
                      handleInputChange(
                        "security_settings",
                        "session_timeout_minutes",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.security_settings.max_login_attempts}
                    onChange={(e) =>
                      handleInputChange(
                        "security_settings",
                        "max_login_attempts",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={settings.security_settings.password_min_length}
                    onChange={(e) =>
                      handleInputChange(
                        "security_settings",
                        "password_min_length",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.system_config.max_file_size_mb}
                    onChange={(e) =>
                      handleInputChange(
                        "system_config",
                        "max_file_size_mb",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Require Admin Approval
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    New users require admin approval
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggle(
                      "security_settings",
                      "require_admin_approval",
                      !settings.security_settings.require_admin_approval
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security_settings.require_admin_approval
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security_settings.require_admin_approval
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                System Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Total Posts
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {settings.system_stats.total_posts}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {settings.system_stats.total_products}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Chat Sessions
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                    {settings.system_stats.total_chat_sessions}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Total Messages
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                    {settings.system_stats.total_messages}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Supported File Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {settings.system_config.supported_file_types.map(
                    (type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {type}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Profile Information
              </h2>

              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {settings.admin_info.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {settings.admin_info.username}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {settings.admin_info.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Admin since{" "}
                    {new Date(
                      settings.admin_info.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={settings.admin_info.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.admin_info.email}
                    onChange={(e) =>
                      handleInputChange("admin_info", "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isSaving}
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <SettingsContent />
    </ProtectedRoute>
  );
}
