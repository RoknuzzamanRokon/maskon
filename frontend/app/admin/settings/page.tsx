"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  getUserInfo,
  getAdminSettings,
  updateAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
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

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function SettingsContent() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState<
    "general" | "security" | "system" | "profile"
  >("general");
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [profileData, setProfileData] = useState({
    email: "",
  });

  const currentUser = getUserInfo();

  useEffect(() => {
    fetchSettings();
  }, []);

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminSettings();
      setSettings(data);
      setProfileData({ email: data.admin_info.email });
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Fallback to mock data only if API fails
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
            "application/pdf",
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
      setProfileData({ email: mockSettings.admin_info.email });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (section: string, newSettings: any) => {
    setIsSaving(true);
    try {
      // Optimistic update
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

      await updateAdminSettings({ [section]: newSettings });
      showMessage("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      showMessage("Failed to update settings. Please try again.", "error");
      // Revert optimistic update on error
      fetchSettings();
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateAdminProfile(profileData);
      // Update local state
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              admin_info: { ...prev.admin_info, email: profileData.email },
            }
          : null
      );
      showMessage("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("Failed to update profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage("New passwords do not match", "error");
      return;
    }

    if (passwordData.new_password.length < 8) {
      showMessage("Password must be at least 8 characters long", "error");
      return;
    }

    setIsSaving(true);
    try {
      await changeAdminPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      showMessage("Password changed successfully");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage(
        "Failed to change password. Please check your current password.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({
    enabled,
    onToggle,
    label,
    description,
  }: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  const SettingInput = ({
    label,
    value,
    onChange,
    type = "number",
    min,
    max,
    unit,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    type?: string;
    min?: number;
    max?: number;
    unit?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label} {unit && `(${unit})`}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
      />
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading system settings...
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
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Configuration Error
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Unable to load system settings. Please check your connection and
              try again.
            </p>
            <button
              onClick={fetchSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry Loading
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  System Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage application configuration and preferences
                </p>
              </div>
            </div>

            {message.text && (
              <div
                className={`px-4 py-3 rounded-lg border ${
                  message.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                }`}
              >
                <div className="flex items-center">
                  {message.type === "error" ? (
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {message.text}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: "general" as const, label: "General", icon: "⚙️" },
              { id: "security" as const, label: "Security", icon: "🔒" },
              { id: "system" as const, label: "System Info", icon: "📊" },
              { id: "profile" as const, label: "Profile", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {activeTab === "general" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  General Settings
                </h2>

                {/* Theme Settings */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Appearance
                  </h3>
                  <ToggleSwitch
                    enabled={theme === "dark"}
                    onToggle={toggleTheme}
                    label="Dark Mode"
                    description="Toggle between light and dark theme"
                  />
                </div>

                {/* System Features */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    System Features
                  </h3>
                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.system_config.chat_enabled}
                      onToggle={() =>
                        handleSaveSettings("system_config", {
                          chat_enabled: !settings.system_config.chat_enabled,
                        })
                      }
                      label="Chat System"
                      description="Enable real-time chat functionality"
                    />

                    <ToggleSwitch
                      enabled={settings.system_config.file_uploads_enabled}
                      onToggle={() =>
                        handleSaveSettings("system_config", {
                          file_uploads_enabled:
                            !settings.system_config.file_uploads_enabled,
                        })
                      }
                      label="File Uploads"
                      description="Allow users to upload files"
                    />

                    <ToggleSwitch
                      enabled={settings.system_config.rate_limiting_enabled}
                      onToggle={() =>
                        handleSaveSettings("system_config", {
                          rate_limiting_enabled:
                            !settings.system_config.rate_limiting_enabled,
                        })
                      }
                      label="Rate Limiting"
                      description="Protect against API abuse"
                    />

                    <ToggleSwitch
                      enabled={settings.system_config.websocket_enabled}
                      onToggle={() =>
                        handleSaveSettings("system_config", {
                          websocket_enabled:
                            !settings.system_config.websocket_enabled,
                        })
                      }
                      label="WebSocket Support"
                      description="Enable real-time communication"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Security Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingInput
                  label="Session Timeout"
                  value={settings.security_settings.session_timeout_minutes}
                  onChange={(value) =>
                    handleSaveSettings("security_settings", {
                      session_timeout_minutes: value,
                    })
                  }
                  min={5}
                  max={1440}
                  unit="minutes"
                />

                <SettingInput
                  label="Max Login Attempts"
                  value={settings.security_settings.max_login_attempts}
                  onChange={(value) =>
                    handleSaveSettings("security_settings", {
                      max_login_attempts: value,
                    })
                  }
                  min={1}
                  max={10}
                />

                <SettingInput
                  label="Minimum Password Length"
                  value={settings.security_settings.password_min_length}
                  onChange={(value) =>
                    handleSaveSettings("security_settings", {
                      password_min_length: value,
                    })
                  }
                  min={6}
                  max={32}
                />

                <SettingInput
                  label="Max File Size"
                  value={settings.system_config.max_file_size_mb}
                  onChange={(value) =>
                    handleSaveSettings("system_config", {
                      max_file_size_mb: value,
                    })
                  }
                  min={1}
                  max={100}
                  unit="MB"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <ToggleSwitch
                  enabled={settings.security_settings.require_admin_approval}
                  onToggle={() =>
                    handleSaveSettings("security_settings", {
                      require_admin_approval:
                        !settings.security_settings.require_admin_approval,
                    })
                  }
                  label="Require Admin Approval for New Users"
                  description="All new user registrations must be approved by an administrator"
                />
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                System Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Total Posts
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                        {settings.system_stats.total_posts}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                        {settings.system_stats.total_products}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Chat Sessions
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                        {settings.system_stats.total_chat_sessions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Total Messages
                      </p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                        {settings.system_stats.total_messages}
                      </p>
                    </div>
                  </div>
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
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
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
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Settings
              </h2>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Information */}
                <div className="flex-1">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
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
                        Administrator since{" "}
                        {new Date(
                          settings.admin_info.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Update Profile
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={settings.admin_info.username}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Username cannot be changed for security reasons
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Updating..." : "Update Profile"}
                    </button>
                  </form>
                </div>

                {/* Password Change */}
                <div className="flex-1">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Change Password
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            current_password: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            new_password: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        minLength={8}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirm_password: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        minLength={8}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Changing..." : "Change Password"}
                    </button>
                  </form>
                </div>
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
