// Bộ ảnh bàn giao (LM-072), chạy tay — không nằm trong `pnpm test:e2e` hay CI.
// Cần dev server chạy riêng: `pnpm dev --host 127.0.0.1 --port 5175 --strictPort`, rồi `node tests/handoff-screenshots.mjs`.
// Ảnh ghi vào `docs/screenshots/handoff/<vi|en>-<màn>.png`. Kho dữ liệu nằm trong bộ nhớ trang: sau khi sửa dữ liệu chỉ đổi route phía client.
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const output = 'docs/screenshots/handoff'
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

for (const lang of ['vi', 'en']) {
  for (const [name, route] of [['dashboard', '/'], ['vehicle-detail', '/doi-xe/VEHICLE-002'], ['trip-packages', `/chuyen/${TRIP}`], ['optimization-setup', `/chuyen/${TRIP}/toi-uu`], ['planner-success', `/chuyen/${TRIP}/phuong-an`]]) {
    const { page, close } = await session(lang, DESKTOP, route)
    if (name.startsWith('planner')) await page.locator('canvas').waitFor()
    await settle(page, name.startsWith('planner') ? 2500 : 1200)
    await shot(page, lang, name)
    await close()
  }

  // Kết quả một phần: thêm 60 kiện không bắt buộc cho chuyến rồi chạy tối ưu thật.
  {
    const { page, close } = await session(lang, DESKTOP, '/doi-xe')
    await page.evaluate(async ({ url, tripId }) => {
      const db = (await import(url)).getMockDb()
      const trip = await db.getTrip(tripId)
      const bulky = { ...trip.packages[0], id: 'PKG-950', name: 'Extra cartons', quantity: 60, mustLoad: false, priority: 0 }
      await db.updateTrip(tripId, { packages: [...trip.packages, bulky] })
    }, { url: MOCK_DB, tripId: TRIP })
    await inApp(page, `/chuyen/${TRIP}/toi-uu`)
    await optimize(page)
    await settle(page, 2500)
    await shot(page, lang, 'planner-partial')
    await close()
  }

  // Lỗi thời: sửa khối lượng một kiện sau khi đã tối ưu.
  {
    const { page, close } = await session(lang, DESKTOP, '/doi-xe')
    await page.evaluate(async ({ url, tripId }) => {
      const db = (await import(url)).getMockDb()
      const trip = await db.getTrip(tripId)
      await db.updateTrip(tripId, { packages: trip.packages.map((pkg, i) => (i === 0 ? { ...pkg, weightKg: pkg.weightKg + 1 } : pkg)) })
    }, { url: MOCK_DB, tripId: TRIP })
    await inApp(page, `/chuyen/${TRIP}/phuong-an`)
    await page.getByRole('alert').first().waitFor()
    await page.locator('canvas').waitFor()
    await settle(page, 2500)
    await shot(page, lang, 'planner-stale')
    await close()
  }

  for (const [name, viewport, route] of [['warehouse-tablet', { width: 1024, height: 768 }, '/kho'], ['driver-phone', { width: 390, height: 844 }, '/tai-xe/diem-giao']]) {
    const { page, close } = await session(lang, viewport, route)
    await settle(page, 2500)
    await shot(page, lang, name)
    await close()
  }
}

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
}
