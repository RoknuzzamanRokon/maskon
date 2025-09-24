"use client";

import React, { useState, useEffect } from "react";
import { DataTable, Column } from "../../../components/admin/DataTable";
import {
  AdminUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../../lib/api";
import UserDetailsModal from "./UserDetailsModal";
import UserActivityModal from "./UserActivityModal";
import { useNotification } from "../../../contexts/NotificationContext";

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    role: "" as "" | "admin" | "user",
    isActive: "" as "" | "true" | "false",
    sortBy: "username" as "username" | "email" | "created_at" | "last_login",
    sortOrder: "asc" as "asc" | "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 25,
    totalItems: 0,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const { addNotification } = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filterParams = {
        search: searchValue || undefined,
        role: filters.role || undefined,
        isActive: filters.isActive ? filters.isActive === "true" : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await getUsers(
        pagination.currentPage,
        pagination.pageSize,
        filterParams
      );
      setUsers(response.users);
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(response.totalCount / prev.pageSize),
        totalItems: response.totalCount,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, pagination.pageSize, searchValue, filters]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: key as any,
      sortOrder: direction,
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  const handleUserRoleChange = async (
    userId: number,
    newRole: "admin" | "user"
  ) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
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
    }
  };

  const handleUserStatusChange = async (userId: number, isActive: boolean) => {
    try {
      await updateUserStatus(userId, isActive);
      await fetchUsers();
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
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      await fetchUsers();
      addNotification({
        type: "success",
        title: "Success",
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to delete user",
      });
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      addNotification({
        type: "warning",
        title: "Warning",
        message: "Please select users to perform bulk actions",
      });
      return;
    }

    switch (action) {
      case "activate":
        for (const id of selectedIds) {
          await handleUserStatusChange(id, true);
        }
        break;
      case "deactivate":
        for (const id of selectedIds) {
          await handleUserStatusChange(id, false);
        }
        break;
      case "delete":
        if (
          confirm(
            `Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`
          )
        ) {
          for (const id of selectedIds) {
            await handleDeleteUser(id);
          }
        }
        break;
    }
    setSelectedUsers([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const columns: Column<AdminUser>[] = [
    {
      key: "username",
      header: "Username",
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (value) => getRoleBadge(value),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "registrationDate",
      header: "Registered",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "activityCount",
      header: "Activity",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {value} actions
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowDetailsModal(true);
            }}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title="View Details"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowActivityModal(true);
            }}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
            title="View Activity"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>
          <select
            value={user.role}
            onChange={(e) =>
              handleUserRoleChange(user.id, e.target.value as "admin" | "user")
            }
            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => handleUserStatusChange(user.id, !user.isActive)}
            className={`text-xs px-2 py-1 rounded ${
              user.isActive
                ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Delete User"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role Filter
            </label>
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value as any }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Filter
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  isActive: e.target.value as any,
                }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="created_at">Registration Date</option>
              <option value="last_login">Last Login</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: e.target.value as any,
                }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleBulkAction(
                    "activate",
                    selectedUsers.map((u) => u.id)
                  )
                }
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() =>
                  handleBulkAction(
                    "deactivate",
                    selectedUsers.map((u) => u.id)
                  )
                }
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Deactivate
              </button>
              <button
                onClick={() =>
                  handleBulkAction(
                    "delete",
                    selectedUsers.map((u) => u.id)
                  )
                }
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedItems={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onSort={handleSort}
        searchable={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        emptyMessage="No users found"
      />

      {/* Modals */}
      {selectedUser && (
        <>
          <UserDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onUserUpdate={fetchUsers}
          />
          <UserActivityModal
            isOpen={showActivityModal}
            onClose={() => {
              setShowActivityModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
}
