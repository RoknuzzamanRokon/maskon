"use client";

import { useState, useEffect } from "react";
import {
  getComments,
  addComment,
  deleteComment,
  isLoggedIn,
  getUserInfo,
  isAdmin,
} from "../lib/api";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const loggedIn = isLoggedIn();
  const userInfo = getUserInfo();
  const adminUser = isAdmin();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !loggedIn) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, newComment.trim());
      setNewComment("");
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(commentId);
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Error deleting comment. Please try again.");
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💬</span>
          Comments ({comments.length})
        </h3>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </button>
      </div>

      {showComments && (
        <div className="space-y-6">
          {/* Add Comment Form */}
          {loggedIn ? (
            <form
              onSubmit={handleSubmitComment}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Commenting as {userInfo?.username}
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600">
                <a href="/login" className="text-blue-600 hover:underline">
                  Login
                </a>{" "}
                to join the conversation
              </p>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                    {(userInfo?.user_id === comment.user_id || adminUser) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 text-sm ml-2"
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">💬</span>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
