import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  retries: 0,
  timeout: 30000,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3107", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run start -- --port 3107",
    url: "http://localhost:3107",
    env: {
      ...process.env,
      PROMO_PREMIUM_PLANNING_ENABLED: "true",
      PROMO_PREMIUM_SITE_ORIGIN: "http://localhost:3107",
    },
    reuseExistingServer: false,
    timeout: 30000,
  },
});
