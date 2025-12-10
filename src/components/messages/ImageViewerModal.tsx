"use client";

import { useEffect } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

export function ImageViewerModal({ isOpen, onClose, imageUrl, imageName }: ImageViewerModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    try {
      // Fetch the file as a blob for better download support
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = imageName || "image";
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback to opening in new tab if download fails
      window.open(imageUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 md:p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button - positioned top-right, responsive */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 md:right-4 md:top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 active:bg-black/80 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Download button - positioned below close button, responsive */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="absolute right-2 top-14 md:right-4 md:top-16 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 active:bg-black/80 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Download"
        >
          <ArrowDownTrayIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Image container - responsive sizing */}
        <div
          className="relative w-full h-full flex items-center justify-center max-h-[calc(100vh-4rem)] md:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={imageUrl}
            alt={imageName || "Image"}
            width={1920}
            height={1080}
            className="max-h-full max-w-full w-auto h-auto object-contain"
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 90vw"
          />
        </div>

        {/* Image name - responsive positioning */}
        {imageName && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2 py-2 md:px-4 md:py-3 text-white text-xs md:text-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate">{imageName}</p>
          </div>
        )}
      </div>
    </div>
  );
}

