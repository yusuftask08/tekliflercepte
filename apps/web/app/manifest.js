export default function manifest() {
  return {
    name: "Teklifler Cepte",
    short_name: "Teklifler Cepte",
    description: "Ustanı bul, ücretsiz teklif al. Teklif vermek de komisyon da yok.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9f8",
    theme_color: "#0c7c67",
    icons: [
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
