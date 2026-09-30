import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { height: 900, width: 1280 },
      },
    },
  ],
  retries: process.env.CI ? 2 : 0,
  testDir: './src',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'yarn workspace @training-programs/app build && yarn workspace @training-programs/app preview --host 127.0.0.1 --port 4173',
    cwd: '..',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    url: baseURL,
  },
});
