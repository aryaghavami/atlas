import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts (Geist, Geist Mono, Instrument Serif) load via the <link> below; Tailwind's
// font-sans/mono/serif map to them through CSS vars in globals.css.

export const metadata: Metadata = {
  title: "Atlas · Body",
  description: "The honest date you reach your body-composition target. Three numbers, no charts.",
  applicationName: "Atlas · Body",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Atlas · Body" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..700&family=Geist+Mono:wght@100..500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased grain">{children}</body>
    </html>
  );
}
