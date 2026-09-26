import { defineConfig, devices } from "@playwright/test";

const PORT = 43128;
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm exec vite --port ${PORT} --host 127.0.0.1`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
      grep: /@smoke/,
    },
    {
      name: "chromium-phone-md",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      grep: /@smoke/,
    },
    {
      name: "webkit-phone-md",
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      grep: /@smoke/,
    },
  ],
});
