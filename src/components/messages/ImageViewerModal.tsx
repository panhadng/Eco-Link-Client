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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageName || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -right-12 top-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Download button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="absolute -right-12 top-16 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10"
          aria-label="Download"
        >
          <ArrowDownTrayIcon className="h-6 w-6" />
        </button>

        {/* Image */}
        <div
          className="relative max-h-[90vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={imageUrl}
            alt={imageName || "Image"}
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            unoptimized
            priority
          />
        </div>

        {/* Image name */}
        {imageName && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2 text-white text-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {imageName}
          </div>
        )}
      </div>
    </div>
  );
}

