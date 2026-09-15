import { test as base, type Page, type PageScreenshotOptions, type TestInfo } from '@playwright/test'

export { expect } from '@playwright/test'

/** Tài khoản demo công khai, khai báo trong `src/features/auth/auth.mock.ts`. */
export const DEMO_ACCOUNT = { email: 'dieuphoi@loadmaster.vn', password: 'loadmaster' } as const

export const PLANNER_ROUTE = '/chuyen/TRIP-2026-0914/phuong-an'

type ViewerFixtures = {
  /** Gom thêm `console.error`; bản `.mjs` chỉ bật ở suite vận hành và scene-first. */
  collectConsoleErrors: boolean
  /** Lỗi trình duyệt của `page`. Test tự khẳng định mảng rỗng ở cuối kịch bản, như bản `.mjs`. */
  browserErrors: string[]
  /**
   * Mở route cần đăng nhập rồi đăng nhập bằng tài khoản demo qua form thật. `RequireAuth`
   * ghi nhớ route kèm query nên app quay lại đúng route. Phiên nằm trong sessionStorage của
   * tab, vì vậy mọi `page.goto` sau đó trong cùng test vẫn giữ đăng nhập.
   */
  login: (route: string) => Promise<void>
}

export const test = base.extend<ViewerFixtures>({
  collectConsoleErrors: [false, { option: true }],
  // Playwright đọc tham số đầu bằng destructuring để suy ra phụ thuộc; fixture này không cần gì.
  // oxlint-disable-next-line no-empty-pattern
  browserErrors: async ({}, provide) => {
    await provide([])
  },
  page: async ({ page, browserErrors, collectConsoleErrors }, provide) => {
    page.on('pageerror', (error) => browserErrors.push(error.message))
    if (collectConsoleErrors) {
      page.on('console', (message) => {
        if (message.type() === 'error') browserErrors.push(message.text())
      })
    }
    await provide(page)
  },
  login: async ({ page, hasTouch }, provide) => {
    await provide(async (route) => {
      await page.goto(route)
      await page.getByLabel('Email', { exact: true }).fill(DEMO_ACCOUNT.email)
      await page.getByLabel('Mật khẩu', { exact: true }).fill(DEMO_ACCOUNT.password)
      const submit = page.getByRole('button', { name: 'Đăng nhập', exact: true })
      await (hasTouch ? submit.tap() : submit.click())
      await page.waitForURL((url) => url.pathname !== '/dang-nhap')
    })
  },
})

/** Ảnh và số đo từng được ghi vào `node_modules/.tmp/…`; nay đính kèm vào báo cáo Playwright. */
export async function attachJson(testInfo: TestInfo, name: string, value: unknown) {
  await testInfo.attach(name, { body: JSON.stringify(value, null, 2), contentType: 'application/json' })
}

export async function attachScreenshot(page: Page, testInfo: TestInfo, name: string, options: PageScreenshotOptions = {}) {
  await testInfo.attach(name, { body: await page.screenshot(options), contentType: 'image/png' })
}
