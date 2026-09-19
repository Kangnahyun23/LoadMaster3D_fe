// Bộ ảnh bàn giao (LM-072), chạy tay — không nằm trong `pnpm test:e2e` hay CI.
// Cần dev server chạy riêng: `pnpm dev --host 127.0.0.1 --port 5175 --strictPort`, rồi `node tests/handoff-screenshots.mjs`.
// Ảnh ghi vào `docs/screenshots/handoff/<vi|en>-<màn>.png`. Kho dữ liệu nằm trong bộ nhớ trang: sau khi sửa dữ liệu chỉ đổi route phía client.
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const output = 'docs/research-handoff-2026-09-17/images'
const TRIP = 'TRIP-2026-0914'
const MOCK_DB = '/src/lib/mock-db/index.ts'
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = []

async function session(lang, viewport, route) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(`${lang} ${route}: ${error.message}`))
  await page.goto(`${origin}${route}${route.includes('?') ? '&' : '?'}lang=${lang}`)
  await page.locator('input[type="email"]').fill('dieuphoi@loadmaster.vn')
  await page.locator('input[type="password"]').fill('loadmaster')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname !== '/dang-nhap')
  return { page, close: () => context.close() }
}

const inApp = (page, route) => page.evaluate((to) => { history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')) }, route)
const settle = (page, ms = 1500) => page.waitForLoadState('networkidle').then(() => page.waitForTimeout(ms))
const shot = (page, lang, name) => page.screenshot({ path: `${output}/${lang}-${name}.png` }).then(() => console.log(`${lang}-${name}`))
const DESKTOP = { width: 1600, height: 1000 }

async function optimize(page) {
  await page.getByRole('button', { name: /^(Tối ưu|Optimize)$/ }).click()
  await page.waitForURL(/\/phuong-an\?revision=MOCK-/, { timeout: 60_000 })
  await page.locator('canvas').waitFor()
}

{
  const { page, close } = await session('vi', DESKTOP, `/chuyen/${TRIP}/phuong-an`)
  await page.locator('canvas').waitFor()
  await settle(page, 2000)
  await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click()
  await page.getByRole('combobox', { name: 'Chọn kiện', exact: true }).selectOption({ index: 20 })
  await settle(page, 1500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, 'vi', 'planner-editor')
  await close()
}
{
  const { page, close } = await session('vi', { width: 390, height: 844 }, '/tai-xe/diem-giao')
  await page.getByRole('button', { name: 'Xem vị trí hàng', exact: true }).click()
  await page.locator('canvas').waitFor()
  await settle(page, 2500)
  await shot(page, 'vi', 'driver-3d-phone')
  await close()
}
await browser.close()
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }