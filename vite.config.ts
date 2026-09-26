import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    port: 43127,
    host: "127.0.0.1",
    proxy: {
      // Personal NYT spike — browser CORS blocks direct nytimes.com (ADR 0009).
      "/api/wordle-nyt": {
        target: "https://www.nytimes.com",
        changeOrigin: true,
        rewrite: (p) =>
          p.replace(
            /^\/api\/wordle-nyt\/(\d{4}-\d{2}-\d{2})$/,
            "/svc/wordle/v2/$1.json",
          ),
      },
    },
  },
  preview: {
    port: 43127,
    host: "127.0.0.1",
  },
  test: {
    environment: "node",
  },
});
