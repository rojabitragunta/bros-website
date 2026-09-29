import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Overlays } from "@/components/layout/Overlays";
import { Providers } from "@/components/layout/Providers";
import { media } from "@/data/media";
import { site } from "@/data/site";
import "@/styles/globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s | BRO'S" },
  description: site.description,
  applicationName: site.name,
  keywords: ["activewear", "gymwear", "performance tee", "training shorts", "joggers", "Hyderabad", "India"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: site.title,
    description: site.description,
    url: "/",
    images: [{ url: media.og.src, width: media.og.width, height: media.og.height, alt: media.og.alt }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [media.og.src] },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${GeistSans.variable} ${GeistMono.variable} ${archivo.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="label fixed left-4 top-4 z-[100] -translate-y-24 bg-bone px-4 py-3 text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <Overlays />
        </Providers>
      </body>
    </html>
  );
}
