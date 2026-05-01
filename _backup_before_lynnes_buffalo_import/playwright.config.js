import { defineConfig, devices } from "@playwright/test";

const testPort = Number(process.env.PW_PORT || 3010);
const testBaseUrl = `http://localhost:${testPort}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: testBaseUrl,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: `${testBaseUrl}/health`,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      PORT: String(testPort),
    },
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
