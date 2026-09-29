"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image with a shimmer placeholder and a soft fade-in once decoded.
 * The wrapper is the sizing box: give it an aspect ratio or explicit size.
 */
export function SmartImage({
  className,
  wrapperClassName,
  tone = "dark",
  ...props
}: ImageProps & { wrapperClassName?: string; tone?: "dark" | "light" }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden", tone === "light" ? "on-light bg-[#e4e2dd]" : "bg-graphite", wrapperClassName)}>
      {!loaded && <div aria-hidden className="skeleton absolute inset-0" />}
      <Image
        {...props}
        alt={props.alt}
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
        className={cn(
          "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
