import { defineConfig } from '@playwright/test'

/**
 * E2E trình duyệt cho viewer 3D (LM-005).
 *
 * - webServer tự bật Vite dev server ở cổng cố định; `--strictPort` báo lỗi ngay nếu cổng
 *   bận thay vì lặng lẽ nhảy sang cổng khác. Máy dev đang chạy sẵn `pnpm dev` ở cổng này thì
 *   dùng lại; CI luôn bật server mới. `E2E_PORT` chỉ để tránh đụng server của checkout khác.
 * - Helper đọc scene R3F qua `/node_modules/.vite/deps/…`, nên chỉ chạy với dev server.
 * - SwiftShader (renderer phần mềm) chậm và các suite đo frame/idle: chạy tuần tự một worker.
 * - Project `tablet`/`phone` chỉ nhận test gắn tag `@tablet`/`@phone`; test không gắn tag chạy ở `desktop`.
 */
const PORT = Number(process.env.E2E_PORT ?? 5175)
const BASE_URL = `http://127.0.0.1:${PORT}`
const TOUCH = { deviceScaleFactor: 1, isMobile: true, hasTouch: true }

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 4 * 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  projects: [
    {
      name: 'desktop',
      grepInvert: /@tablet|@phone/,
      use: { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 },
    },
    { name: 'tablet', grep: /@tablet/, use: { ...TOUCH, viewport: { width: 820, height: 1180 } } },
    { name: 'phone', grep: /@phone/, use: { ...TOUCH, viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
