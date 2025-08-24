"use client";

import Image from "next/image";

interface ProductImageProps {
  imageUrl: string | undefined;
  alt: string;
}

export default function ProductImage({ imageUrl, alt }: ProductImageProps) {
  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
        <span className="text-gray-500 dark:text-gray-400">
          No Image Available
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 hover:scale-105"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
}
