"use client";

import { useState, useEffect } from "react";
import { interactWithPost } from "../lib/api";

interface PostInteractionsProps {
  postId: number;
  initialLikes: number;
  initialDislikes: number;
}

export default function PostInteractions({
  postId,
  initialLikes,
  initialDislikes,
}: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userInteraction, setUserInteraction] = useState<
    "like" | "dislike" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  // Load user's previous interaction from localStorage
  useEffect(() => {
    const savedInteraction = localStorage.getItem(`post_${postId}_interaction`);
    if (savedInteraction) {
      setUserInteraction(savedInteraction as "like" | "dislike");
    }
  }, [postId]);

  const handleInteraction = async (type: "like" | "dislike") => {
    setIsLoading(true);
    try {
      const result = await interactWithPost(postId, type);
      setLikes(result.likes_count);
      setDislikes(result.dislikes_count);

      // Update user interaction state
      if (userInteraction === type) {
        setUserInteraction(null); // Remove interaction (toggle off)
        localStorage.removeItem(`post_${postId}_interaction`);
      } else {
        setUserInteraction(type); // Set new interaction
        localStorage.setItem(`post_${postId}_interaction`, type);
      }
    } catch (error) {
      console.error("Error interacting with post:", error);
      alert("Error updating your reaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-t border-gray-200">
      <button
        onClick={() => handleInteraction("like")}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          userInteraction === "like"
            ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
            : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600 border-2 border-transparent hover:border-green-200"
        } ${
          isLoading
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-md cursor-pointer"
        }`}
      >
        <span className="text-xl">👍</span>
        <span className="font-semibold">{likes}</span>
        <span className="text-sm font-medium">Like</span>
      </button>

      <button
        onClick={() => handleInteraction("dislike")}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          userInteraction === "dislike"
            ? "bg-red-100 text-red-700 border-2 border-red-300 shadow-sm"
            : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border-2 border-transparent hover:border-red-200"
        } ${
          isLoading
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-md cursor-pointer"
        }`}
      >
        <span className="text-xl">👎</span>
        <span className="font-semibold">{dislikes}</span>
        <span className="text-sm font-medium">Dislike</span>
      </button>

      {isLoading && (
        <div className="flex items-center text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Updating...
        </div>
      )}

      <div className="text-sm text-gray-500 ml-4">
        <span>👥 Anyone can react to this post</span>
      </div>
    </div>
  );
}
