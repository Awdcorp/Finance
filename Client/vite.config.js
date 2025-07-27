import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // ✅ Add this import

export default defineConfig({
  plugins: [
    react(),

    // ✅ PWA plugin config
    VitePWA({
      registerType: "autoUpdate", // auto-updates service worker
      includeAssets: ["favicon.png"], // static asset
      manifest: {
        name: "Finance Tracker",
        short_name: "Finance",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#0f172a",
        orientation: "portrait",
        icons: [
          {
            src: "/favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/favicon.png",
            sizes: "512x512",
            type: "image/png",
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
