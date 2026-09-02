import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.HERMES_VISUAL_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "visual-chromium", testMatch: /hermes-visual.spec.ts/, use: { browserName: "chromium" } },
    { name: "visual-webkit", testMatch: /hermes-visual.spec.ts/, use: { browserName: "webkit" } },
    { name: "visual-firefox", testMatch: /hermes-visual.spec.ts/, use: { browserName: "firefox" } },
  ],
  webServer: process.env.HERMES_VISUAL_BASE_URL ? undefined : {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
