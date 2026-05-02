"use client";

import { useState } from "react";

type BrandLogoImageProps = {
  url: string | null | undefined;
  alt: string;
  className?: string;
};

/**
 * Renders a retailer logo; hides itself if the URL is missing or fails to load (404, etc.).
 */
export function BrandLogoImage({ url, alt, className }: BrandLogoImageProps) {
  const [visible, setVisible] = useState(true);
  if (!url?.trim() || !visible) return null;
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setVisible(false)}
    />
  );
}
