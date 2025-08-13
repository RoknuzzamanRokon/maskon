"use client";

import { useState, useRef } from "react";

interface MediaFile {
  url: string;
  type: "image" | "video";
  filename?: string;
  original_name?: string;
}

interface MediaSliderProps {
  mediaFiles: MediaFile[];
  className?: string;
}

export default function MediaSlider({
  mediaFiles,
  className = "",
}: MediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!mediaFiles || mediaFiles.length === 0) {
    return null;
  }

  const currentMedia = mediaFiles[currentIndex];
  const hasMultipleMedia = mediaFiles.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaFiles.length - 1 : prev - 1));
    setIsVideoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaFiles.length - 1 ? 0 : prev + 1));
    setIsVideoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsVideoPlaying(false);
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
    >
      {/* Main Media Display */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {currentMedia.type === "image" ? (
          <img
            src={currentMedia.url}
            alt={`Media ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="max-w-full max-h-full object-contain"
              controls={isVideoPlaying}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
            />
            {!isVideoPlaying && (
              <button
                onClick={toggleVideoPlay}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-200"
              >
                <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all duration-200">
                  <svg
                    className="w-8 h-8 text-gray-800 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleMedia && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Media Type Indicator */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentMedia.type === "image" ? "📷" : "🎥"} {currentIndex + 1} /{" "}
          {mediaFiles.length}
        </div>

        {/* Video Play Indicator */}
        {currentMedia.type === "video" && !isVideoPlaying && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            Click to play
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {hasMultipleMedia && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
          {mediaFiles.map((media, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-12 h-8 rounded overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? "border-white scale-110"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-xs">🎥</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Slide Indicators (dots) */}
      {hasMultipleMedia && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {mediaFiles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
