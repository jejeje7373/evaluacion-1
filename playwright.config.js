import { defineConfig } from '@playwright/test';

const externalBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalBaseUrl || 'http://127.0.0.1:4173',
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROME_BIN || '/home/jejej/.local/bin/google-chrome',
    },
    viewport: { width: 1280, height: 800 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: 'npm run preview -- --port 4173 --host 127.0.0.1',
          url: 'http://127.0.0.1:4173',
          reuseExistingServer: true,
          timeout: 30000,
        },
      }),
});
