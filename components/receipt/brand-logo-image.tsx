"use client";

import { useState, type CSSProperties } from "react";

type BrandLogoImageProps = {
  url: string | null | undefined;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Renders a retailer logo; hides itself if the URL is missing or fails to load (404, etc.).
 */
export function BrandLogoImage({
  url,
  alt,
  className,
  style,
}: BrandLogoImageProps) {
  const [visible, setVisible] = useState(true);
  if (!url?.trim() || !visible) return null;
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      onError={() => setVisible(false)}
    />
  );
}
