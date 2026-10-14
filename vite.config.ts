import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import tailwindConfig from "./tailwind.config.ts";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // Konfigurasi Tailwind diberikan langsung dari sini. Vite memantau berkas yang diimpor vite.config.ts
  // dan memulai ulang server bila berubah, jadi token warna/jarak yang baru langsung terbaca tanpa Ctrl+C.
  css: { postcss: { plugins: [tailwindcss(tailwindConfig), autoprefixer()] } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/zod")) return "zod";
          if (id.includes("react-router") || id.includes("@remix-run")) return "router";
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
        },
      },
    },
  },
  test: { include: ["tests/**/*.test.{ts,tsx}"] },
});
