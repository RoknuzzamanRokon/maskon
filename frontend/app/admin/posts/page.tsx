"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBlogPosts, deletePost, getUserInfo, logout } from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";

function PostsManagementContent() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const userInfo = getUserInfo();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getBlogPosts(50); // Get more posts for management
      setPosts(data);
    } catch (error) {
      setMessage("Error fetching posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: number, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      return;
    }

    try {
      await deletePost(postId);
      setMessage("Post deleted successfully!");
      setPosts(posts.filter((post: any) => post.id !== postId));
    } catch (error) {
      setMessage("Error deleting post");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Manage Posts
                  </h1>
                  <p className="text-gray-600">
                    View and manage all blog posts
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Back to Admin
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg mb-6 border ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Total posts:{" "}
                <span className="font-semibold">{posts.length}</span>
              </p>
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Create New Post
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {post.content.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.category === "tech"
                              ? "bg-blue-100 text-blue-800"
                              : post.category === "food"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {post.category === "tech" && "🚀"}
                          {post.category === "food" && "🍕"}
                          {post.category === "activity" && "🏃"}
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <span>👍 {post.likes_count || 0}</span>
                          <span>👎 {post.dislikes_count || 0}</span>
                          <span>💬 {post.comments_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/blog/post/${post.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️ View
                          </Link>
                          <button
                            onClick={() =>
                              handleDeletePost(post.id, post.title)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first blog post to get started.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ➕ Create New Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostsManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <PostsManagementContent />
    </ProtectedRoute>
  );
}
