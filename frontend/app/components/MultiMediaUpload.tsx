"use client";

import { useState, useRef } from "react";

interface MediaFile {
  url: string;
  type: "image" | "video";
  filename: string;
  original_name: string;
}

interface MultiMediaUploadProps {
  onMediaSelect: (mediaFiles: MediaFile[]) => void;
  existingMedia?: MediaFile[];
}

export default function MultiMediaUpload({
  onMediaSelect,
  existingMedia = [],
}: MultiMediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(existingMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMultipleFiles = async (files: FileList) => {
    setIsUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();

      // Add all files to FormData
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:8000/api/upload-media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const result = await response.json();
      const newMediaFiles = [...mediaFiles, ...result.uploaded_files];
      setMediaFiles(newMediaFiles);
      onMediaSelect(newMediaFiles);
      setUploadMessage(
        `${result.uploaded_files.length} file(s) uploaded successfully!`
      );
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadMessage("Error uploading files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        errors.push(`${file.name}: Only images and videos are allowed`);
        return;
      }

      // Check file size (50MB for videos, 10MB for images)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(
          `${file.name}: File too large (max ${isVideo ? "50MB" : "10MB"})`
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadMessage(errors.join(", "));
      return;
    }

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach((file) => fileList.items.add(file));
      await uploadMultipleFiles(fileList.files);
    }
  };

  const removeMedia = (index: number) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newMediaFiles);
    onMediaSelect(newMediaFiles);
    setUploadMessage("");
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    const newMediaFiles = [...mediaFiles];
    const [movedItem] = newMediaFiles.splice(fromIndex, 1);
    newMediaFiles.splice(toIndex, 0, movedItem);
    setMediaFiles(newMediaFiles);
    onMediaSelect(newMediaFiles);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="media-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <span className="text-2xl mb-2">🎬</span>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> images and
              videos
            </p>
            <p className="text-xs text-gray-500">
              Images: PNG, JPG, GIF, WebP (max 10MB) | Videos: MP4, WebM, MOV
              (max 50MB)
            </p>
          </div>
          <input
            id="media-upload"
            type="file"
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700">Uploading files...</span>
        </div>
      )}

      {uploadMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            uploadMessage.includes("Error")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {uploadMessage}
        </div>
      )}

      {/* Media Preview Grid */}
      {mediaFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Uploaded Media ({mediaFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaFiles.map((media, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt={media.original_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <span className="text-3xl block mb-2">🎥</span>
                        <span className="text-xs text-gray-600 block truncate px-2">
                          {media.original_name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Controls */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={() => moveMedia(index, index - 1)}
                      className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {index < mediaFiles.length - 1 && (
                    <button
                      onClick={() => moveMedia(index, index + 1)}
                      className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>

                {/* Order indicator */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
