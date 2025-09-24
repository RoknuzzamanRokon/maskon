"use client";

import React, { useState, useEffect } from "react";
import { AdminUser, updateUserRole, updateUserStatus } from "../../../lib/api";
import { useNotification } from "../../../contexts/NotificationContext";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onUserUpdate: () => void;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = useState<AdminUser | null>(user);
  const [updating, setUpdating] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    setUserDetails(user);
  }, [user]);

  const handleRoleUpdate = async (newRole: "admin" | "user") => {
    setUpdating(true);
    try {
      await updateUserRole(user.id, newRole);
      setUserDetails((prev) => (prev ? { ...prev, role: newRole } : null));
      onUserUpdate();
      addNotification({
        type: "success",
        title: "Success",
        message: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update user role",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (isActive: boolean) => {
    setUpdating(true);
    try {
      await updateUserStatus(user.id, isActive);
      setUserDetails((prev) => (prev ? { ...prev, isActive } : null));
      onUserUpdate();
      addNotification({
        type: "success",
        title: "Success",
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update user status",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isActive: boolean) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const getRoleBadge = (role: string) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === "admin"
          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      }`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                User Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {userDetails ? (
              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-700 dark:text-gray-300">
                        {userDetails.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userDetails.username}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userDetails.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleBadge(userDetails.role)}
                      {getStatusBadge(userDetails.isActive)}
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Activity
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userDetails.activityCount}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account Age
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.floor(
                        (Date.now() -
                          new Date(userDetails.registrationDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      User ID
                    </label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">
                      {userDetails.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Registration Date
                    </label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(userDetails.registrationDate)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Login
                    </label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(userDetails.lastLogin)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <div className="mt-1">
                      <select
                        value={userDetails.role}
                        onChange={(e) =>
                          handleRoleUpdate(e.target.value as "admin" | "user")
                        }
                        disabled={updating}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Status
                    </label>
                    <div className="mt-1">
                      <button
                        onClick={() =>
                          handleStatusUpdate(!userDetails.isActive)
                        }
                        disabled={updating}
                        className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${
                          userDetails.isActive
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {userDetails.isActive
                          ? "Deactivate Account"
                          : "Activate Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Failed to load user details
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
