import { defineConfig, devices } from '@playwright/test';

// We rely on Vite's dev server to serve preview/* and dist/* over HTTP.
// `pnpm build` must have produced dist/ before tests run; the CI workflow
// orders `pnpm build` before `pnpm test:e2e` for that reason.
const PORT = 5173;

export default defineConfig({
  testDir: 'tests',
  testMatch: ['smoke/**/*.spec.js', 'behavior/**/*.spec.js', 'visual/**/*.spec.js'],
  // Drop the {-projectName}{-platform} suffix so a single baseline file
  // applies on every machine. Practical because there's one project
  // (chromium) and CI is the source of truth for baselines.
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: `http://localhost:${PORT}/preview/components-btn.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
