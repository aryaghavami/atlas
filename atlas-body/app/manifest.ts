import type { MetadataRoute } from "next";

// PWA manifest — "Add to Home Screen" gives a standalone, full-bleed app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Atlas · Body",
    short_name: "Atlas Body",
    description: "The honest date you reach your body-composition target.",
    start_url: "/body",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
