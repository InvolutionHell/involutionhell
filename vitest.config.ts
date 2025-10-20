import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData.ts",
        ".next/",
        "generated/",
      ],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@/.source": resolve(__dirname, "./.source"),
    },
  },
});
