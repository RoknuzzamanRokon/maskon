"use client";

import { useState, useEffect } from "react";
import { getComments, addAnonymousComment } from "../lib/api";

interface Comment {
  id: number;
  post_id: number;
  username: string;
  content: string;
  created_at: string;
  user_type: string;
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetchComments();
    // Load saved username from localStorage
    const savedUsername = localStorage.getItem("anonymous_username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
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
    if (!newComment.trim() || !username.trim()) return;

    setIsSubmitting(true);
    try {
      await addAnonymousComment(postId, newComment.trim(), username.trim());
      setNewComment("");
      // Save username for future comments
      localStorage.setItem("anonymous_username", username.trim());
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <form
            onSubmit={handleSubmitComment}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    💬 Anyone can comment anonymously
                  </span>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || !newComment.trim() || !username.trim()
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>

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
                    {/* Only show delete for admin - removed for anonymous system */}
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
