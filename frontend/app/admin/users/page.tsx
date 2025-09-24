"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { getUserInfo } from "../../lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
  status: "active" | "inactive";
}

function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const currentUser = getUserInfo();

  useEffect(() => {
    // Mock user data - in real implementation, fetch from API
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: 1,
          username: "admin",
          email: "admin@example.com",
          is_admin: true,
          created_at: "2024-01-15T10:30:00Z",
          last_login: "2024-03-20T14:22:00Z",
          status: "active",
        },
        {
          id: 2,
          username: "editor",
          email: "editor@example.com",
          is_admin: false,
          created_at: "2024-02-10T09:15:00Z",
          last_login: "2024-03-19T16:45:00Z",
          status: "active",
        },
        {
          id: 3,
          username: "viewer",
          email: "viewer@example.com",
          is_admin: false,
          created_at: "2024-03-01T11:20:00Z",
          last_login: "2024-03-18T13:30:00Z",
          status: "inactive",
        },
      ];
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleStatusToggle = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    );
    setMessage("User status updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRoleToggle = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, is_admin: !user.is_admin } : user
      )
    );
    setMessage("User role updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Users
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage system users and permissions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                ➕ Add New User
              </button>
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-lg mb-6 border bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
              {message}
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300">
              Total users: <span className="font-semibold">{users.length}</span>
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                All ({users.length})
              </button>
              <button className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                Active ({users.filter((u) => u.status === "active").length})
              </button>
              <button className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full">
                Admins ({users.filter((u) => u.is_admin).length})
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading users...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                            <span className="text-blue-600 dark:text-blue-300 font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_admin
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {user.is_admin ? "👑 Admin" : "👤 User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {user.status === "active"
                            ? "🟢 Active"
                            : "🔴 Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRoleToggle(user.id)}
                            disabled={user.id === currentUser?.id}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50"
                          >
                            {user.is_admin ? "👤 Make User" : "👑 Make Admin"}
                          </button>
                          <button
                            onClick={() => handleStatusToggle(user.id)}
                            disabled={user.id === currentUser?.id}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 disabled:opacity-50"
                          >
                            {user.status === "active"
                              ? "🚫 Deactivate"
                              : "✅ Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <UserManagementContent />
    </ProtectedRoute>
  );
}
