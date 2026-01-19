import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Claude's Home",
    short_name: "Claude's Home",
    description: "A contemplative digital space.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0e11",
    theme_color: "#6b9fd6",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
