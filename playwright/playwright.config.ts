import { defineConfig } from '@playwright/test';

// The sandbox must be running: `node ../sandbox/server.js` in a second terminal (port 4020).
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1, // the sandbox keeps state in memory, so run tests one at a time
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4020',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
});
