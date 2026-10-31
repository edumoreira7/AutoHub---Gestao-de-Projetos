import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './test/browser',
    workers: 1,
    timeout: 30000,
    use: { baseURL: 'http://127.0.0.1:5174', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
    reporter: [['list'], ['html', { open: 'never' }]],
    webServer: { command: 'node test/browser-server.mjs', url: 'http://127.0.0.1:5174', timeout: 120000, reuseExistingServer: false },
});
