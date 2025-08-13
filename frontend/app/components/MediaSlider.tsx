"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [direction, setDirection] = useState<"left" | "right">("right");
  const videoRef = useRef<HTMLVideoElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          setIsFullscreen(false);
          break;
        case " ":
          if (currentMedia.type === "video") {
            toggleVideoPlay();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentIndex]);

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No media available</p>
        </div>
      </div>
    );
  }

  const currentMedia = mediaFiles[currentIndex];
  const hasMultipleMedia = mediaFiles.length > 1;

  const goToPrevious = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev === 0 ? mediaFiles.length - 1 : prev - 1));
    setIsVideoPlaying(false);
  };

  const goToNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev === mediaFiles.length - 1 ? 0 : prev + 1));
    setIsVideoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
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

  const toggleFullscreen = () => {
    if (!sliderRef.current) return;
    
    if (!document.fullscreenElement) {
      sliderRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const slideVariants = {
    hiddenRight: {
      x: "100%",
      opacity: 0,
    },
    hiddenLeft: {
      x: "-100%",
      opacity: 0,
    },
    visible: {
      x: "0",
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div
      ref={sliderRef}
      className={`relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl ${className} ${
        isFullscreen ? "fixed inset-0 z-50 !rounded-none" : ""
      }`}
    >
      {/* Main Media Display */}
      <div className="relative aspect-video w-full flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            variants={slideVariants}
            initial={direction === "right" ? "hiddenRight" : "hiddenLeft"}
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center bg-black"
          >
            {currentMedia.type === "image" ? (
              <img
                src={currentMedia.url}
                alt={`Media ${currentIndex + 1}`}
                className="w-full h-full object-contain"
                draggable="false"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls={isVideoPlaying}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                />
                {!isVideoPlaying && (
                  <button
                    onClick={toggleVideoPlay}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="absolute w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg
                          className="w-10 h-10 text-white ml-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {hasMultipleMedia && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/80 text-white rounded-full p-3 transition-all duration-300 shadow-xl z-10"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/80 text-white rounded-full p-3 transition-all duration-300 shadow-xl z-10"
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

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          {/* Media Type Indicator */}
          <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
            <span className="mr-2">
              {currentMedia.type === "image" ? "📷" : "🎥"}
            </span>
            {currentIndex + 1} / {mediaFiles.length}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={toggleFullscreen}
              className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-full p-2 transition-all duration-300"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1zm0 10v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1zm10 0v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1zm0-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
            </button>
            
            {currentMedia.type === "video" && (
              <button
                onClick={toggleVideoPlay}
                className={`bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-full p-2 transition-all duration-300 ${
                  isVideoPlaying ? "bg-blue-500/80" : ""
                }`}
              >
                {isVideoPlaying ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {hasMultipleMedia && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex bg-black/60 backdrop-blur-sm rounded-xl px-3 py-3 shadow-lg z-10">
          <div className="flex space-x-3 max-w-full overflow-x-auto scrollbar-hide py-1">
            {mediaFiles.map((media, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 transform ${
                  index === currentIndex
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                }`}
              >
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/80 to-indigo-900/80 flex items-center justify-center">
                    <span className="text-white text-xl">🎥</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar for Video */}
      {currentMedia.type === "video" && isVideoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-10">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: videoRef.current?.duration || 0, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}