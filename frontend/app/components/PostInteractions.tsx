"use client";

import { useState, useEffect } from "react";
import { interactWithPost, isLoggedIn } from "../lib/api";

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
  const loggedIn = isLoggedIn();

  const handleInteraction = async (type: "like" | "dislike") => {
    if (!loggedIn) {
      alert("Please login to interact with posts");
      return;
    }

    setIsLoading(true);
    try {
      const result = await interactWithPost(postId, type);
      setLikes(result.likes_count);
      setDislikes(result.dislikes_count);

      // Update user interaction state
      if (userInteraction === type) {
        setUserInteraction(null); // Remove interaction
      } else {
        setUserInteraction(type); // Set new interaction
      }
    } catch (error) {
      console.error("Error interacting with post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-t border-gray-200">
      <button
        onClick={() => handleInteraction("like")}
        disabled={isLoading || !loggedIn}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          userInteraction === "like"
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600"
        } ${!loggedIn ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}`}
      >
        <span className="text-lg">👍</span>
        <span className="font-medium">{likes}</span>
        <span className="text-sm">Like</span>
      </button>

      <button
        onClick={() => handleInteraction("dislike")}
        disabled={isLoading || !loggedIn}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          userInteraction === "dislike"
            ? "bg-red-100 text-red-700 border border-red-300"
            : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
        } ${!loggedIn ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}`}
      >
        <span className="text-lg">👎</span>
        <span className="font-medium">{dislikes}</span>
        <span className="text-sm">Dislike</span>
      </button>

      {!loggedIn && (
        <p className="text-sm text-gray-500 ml-4">
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>{" "}
          to like or dislike posts
        </p>
      )}
    </div>
  );
}
