import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 30000,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3107", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start -- --port 3107",
    url: "http://localhost:3107",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
