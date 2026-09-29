import type { Metadata } from "next";
import { site } from "@/data/site";
import { media } from "@/data/media";

interface PageMeta {
  title: string;
  description?: string;
  path: string;
  image?: { src: string; alt: string; width: number; height: number };
  noIndex?: boolean;
}

/** Consistent metadata (canonical, Open Graph, Twitter) for every route. */
export function pageMetadata({ title, description = site.description, path, image = media.og, noIndex }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.src],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}
