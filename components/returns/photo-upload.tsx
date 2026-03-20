"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Camera, ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  className?: string;
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  className,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPhotos.push(e.target?.result as string);
          if (newPhotos.length === files.length) {
            onPhotosChange([...photos, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all",
          isDragging
            ? "border-primary bg-primary/5 dark:border-blue-400 dark:bg-blue-400/5"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-white/4 dark:hover:border-white/15 dark:hover:bg-white/6",
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isDragging
              ? "bg-primary/10 text-primary dark:bg-blue-400/10 dark:text-blue-400"
              : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-white/50",
          )}
        >
          <Upload size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-white/80">
            {isDragging ? "Drop photos here" : "Upload photos of item condition"}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-white/35">
            Drag & drop or click to browse. JPG, PNG up to 10MB.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
            >
              <img
                src={photo}
                alt={`Return photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
          Tips for good photos
        </p>
        <ul className="space-y-1.5">
          {[
            { icon: <Camera size={14} />, text: "Show all sides of the item" },
            { icon: <ImageIcon size={14} />, text: "Show the defect clearly" },
            {
              icon: <ImageIcon size={14} />,
              text: "Include packaging if available",
            },
          ].map((tip, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60"
            >
              <span className="text-primary dark:text-blue-400">
                {tip.icon}
              </span>
              {tip.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
