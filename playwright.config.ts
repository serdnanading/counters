import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testIgnore: ['**/unit/**'],
  use: {
    viewport: { width: 375, height: 812 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
