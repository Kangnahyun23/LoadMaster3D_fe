import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { cameraPreset, openInspector, closeInspector } from './viewer-browser-helpers.mjs'

// Use an existing Playwright installation; this suite never installs dependencies.
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const output = path.resolve('node_modules/.tmp/viewer-ui')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
const viewer = '/chuyen/TRIP-2026-0914/phuong-an'
const report = {}

async function waitForIdle() {
  await page.waitForFunction(() => document.querySelector('[data-viewer-performance]')?.getAttribute('data-idle') === 'true')
}
async function metrics() {
  return page.locator('[data-viewer-performance]').evaluate((el) => ({ ...el.dataset }))
}
async function route(suffix) {
  await page.goto(origin + suffix)
  await page.locator('canvas').waitFor()
  await waitForIdle()
}

try {
  await page.goto(origin + viewer + '?debug&quality=balanced')
  await page.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await waitForIdle()
  report.normal = await metrics()
  assert.equal(report.normal.placementCount, '132')
  const framesBefore = report.normal.renderedFrames
  await page.waitForTimeout(1200)
  assert.equal((await metrics()).renderedFrames, framesBefore, 'debug overlay must not keep rendering')
  const selected = page.getByRole('complementary', { name: 'Kiện đang chọn' })
  await openInspector(page, 'package')
  assert.match(await selected.innerText(), /PKG-00147/)
  await page.screenshot({ path: path.join(output, 'normal.png') })
  await closeInspector(page)

  for (const name of ['Trên', 'Cửa sau', 'Bên hông', 'Trước', 'Góc chéo']) {
    const before = Number((await metrics()).renderedFrames)
    await cameraPreset(page, name)
    await page.waitForTimeout(1100)
    assert.ok(Number((await metrics()).renderedFrames) > before, 'camera preset should wake demand rendering')
  }
  // Geometry-aware edit actions have their own gesture/validation suite.
  await openInspector(page, 'package')
  await selected.getByRole('button', { name: 'Chỉnh sửa kiện', exact: true }).click()
  await page.getByRole('button', { name: 'Ghim', exact: true }).click()
  await page.getByRole('button', { name: 'Bỏ ghim', exact: true }).click()
  await page.getByRole('button', { name: 'Xem', exact: true }).click()
  await openInspector(page, 'display')
  for (const name of ['Theo đơn hàng', 'Theo khối lượng', 'Theo điểm giao']) {
    await page.getByRole('button', { name, exact: true }).click()
  }
  const slice = page.getByRole('slider', { name: 'Cắt lớp theo chiều dài', exact: true })
  await slice.focus()
  await slice.press('Home')
  assert.equal(await slice.inputValue(), '0')
  await slice.press('End')
  assert.equal(await slice.inputValue(), '7200')
  await closeInspector(page)
  const timeline = page.getByRole('slider', { name: 'Bước xếp', exact: true })
  await page.getByRole('button', { name: 'Về đầu', exact: true }).click()
  assert.equal(await timeline.inputValue(), '1')
  await page.getByRole('button', { name: 'Tiến một bước', exact: true }).click()
  assert.equal(await timeline.inputValue(), '2')
  await page.getByRole('combobox', { name: 'Tốc độ phát', exact: true }).selectOption('4')
  await page.getByRole('button', { name: 'Phát', exact: true }).click()
  await page.waitForTimeout(1400)
  await page.getByRole('button', { name: 'Tạm dừng', exact: true }).click()
  assert.ok(Number(await timeline.inputValue()) > 2)
  await waitForIdle()
  report.playback = await timeline.inputValue()

  for (const count of [132, 300, 500, 1000]) {
    await route(viewer + `?debug&packages=${count}&quality=balanced`)
    report[count] = await metrics()
    assert.equal(report[count].placementCount, String(count))
    assert.equal(report[count].qualityTier, 'balanced')
    assert.ok(Number(report[count].drawCalls) < 100)
  }
  await page.screenshot({ path: path.join(output, '1000.png') })
  // Exercise router parameter changes without a page reload: reset source-bound draft.
  await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click()
  await page.getByRole('button', { name: 'Ghim', exact: true }).click()
  await page.evaluate(() => {
    history.pushState({}, '', '?debug&packages=300&quality=balanced')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await page.waitForFunction(() => document.querySelector('[data-viewer-performance]')?.getAttribute('data-placement-count') === '300')
  await openInspector(page, 'package')
  await selected.getByRole('button', { name: 'Chỉnh sửa kiện', exact: true }).waitFor()
  assert.match(await selected.innerText(), /Chưa ghim/)
  report.snapshotReset = true

  for (const tier of ['low', 'high']) {
    await route(viewer + `?debug&packages=1000&quality=${tier}`)
    report[tier] = await metrics()
    assert.equal(report[tier].qualityTier, tier)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Về đầu', exact: true }).click()
  await page.getByRole('button', { name: 'Tiến một bước', exact: true }).click()
  await waitForIdle()
  report.reducedMotion = await metrics()

  await page.goto(origin + viewer + '?packages=1000')
  await page.locator('canvas').waitFor()
  assert.equal(await page.locator('[data-viewer-performance]').count(), 0)
  assert.match(await page.locator('header').innerText(), /132/)
  await page.goto(origin + '/kho')
  await page.locator('canvas').waitFor()
  await page.getByRole('combobox', { name: 'Góc nhìn thùng xe', exact: true }).selectOption('cua-sau')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(output, 'warehouse.png') })
  await page.getByRole('button', { name: 'Xác nhận đã xếp', exact: true }).click()
  await page.waitForTimeout(1400)
  assert.match(await page.locator('body').innerText(), /PKG-00148/)
  report.warehouse = 'camera + next loading step passed'
  await page.goto(origin + '/tai-xe/diem-giao')
  await page.getByRole('button', { name: 'Hoàn tất điểm giao', exact: true }).waitFor()
  assert.equal(await page.locator('canvas').count(), 0)
  report.driver = 'existing 2D route preserved'
  assert.deepEqual(errors, [])
  report.errors = errors
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await browser.close()
}
