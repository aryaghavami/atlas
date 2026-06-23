import type { Metadata } from "next";
import "./globals.css";

// Fonts (Geist, Geist Mono, Instrument Serif) load via the <link> below. Tailwind's
// font-sans/font-mono map to them through CSS vars in globals.css :root.

export const metadata: Metadata = {
  title: "Atlas",
  description: "Net worth, runway, target date. Nothing else.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
