import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sbgg/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@sbgg/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
      "@sbgg/gamification": path.resolve(__dirname, "../../packages/gamification/src/index.ts"),
      "@sbgg/affiliate": path.resolve(__dirname, "../../packages/affiliate/src/index.ts"),
      "@sbgg/seo": path.resolve(__dirname, "../../packages/seo/src/index.ts"),
      "@sbgg/sports": path.resolve(__dirname, "../../packages/sports/src/index.ts"),
      "@sbgg/odds": path.resolve(__dirname, "../../packages/odds/src/index.ts"),
    },
  },
});
