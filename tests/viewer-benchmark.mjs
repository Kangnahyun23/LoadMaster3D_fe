import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { metrics, sceneSnapshot, waitIdle } from './viewer-browser-helpers.mjs'
import assert from 'node:assert/strict'
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const output = 'node_modules/.tmp/viewer-final'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const route = origin + '/chuyen/TRIP-2026-0914/phuong-an'
const errors = [], report = { renderer: 'Chromium SwiftShader; emulated desktop 1600×1000; not a physical-device benchmark', samples: [] }
const lowOnly = process.argv.includes('--low-only')
page.on('pageerror', (e) => errors.push(e.message))
async function settle() { await page.waitForTimeout(700); await waitIdle(page) }
try {
  await page.goto(route + '?debug&packages=132&quality=low')
  await page.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await page.locator('canvas').waitFor()
  const profiles = [[132, 'low'], [300, 'low'], [500, 'low'], [1000, 'low'], ...lowOnly ? [] : [[1000, 'balanced'], [1000, 'high']]]
  for (const [count, tier] of profiles) {
    await page.goto(route + `?debug&packages=${count}&quality=${tier}`); await settle()
    const r = await page.locator('canvas').boundingBox()
    await page.mouse.move(r.x + 40, r.y + r.height * 0.5); await page.mouse.down()
    for (let i = 0; i < 24; i++) {
      await page.mouse.move(r.x + 40 + i * 3, r.y + r.height * 0.5 + Math.sin(i / 3) * 12)
      await page.waitForTimeout(60)
    }
    const active = await metrics(page)
    await page.mouse.up(); await settle()
    const rest = await metrics(page), scene = await sceneSnapshot(page)
    assert.ok(Number(rest.drawCalls) < 100)
    assert.ok(scene.instances.filter((m) => m.name.startsWith('cargo-')).every((m) => m.count === count))
    report.samples.push({ count, tier, active, rest, scene })
    console.log(`${count} ${tier}: ${active.fps} FPS, ${rest.drawCalls} calls, ${rest.triangles} triangles, DPR ${rest.dpr}`)
  }
  if (lowOnly) {
    assert.deepEqual(errors, [])
    await writeFile(`${output}/low-report.json`, JSON.stringify(report, null, 2))
    process.exitCode = 0
  } else {
  await page.goto(route + '?debug&quality=high'); await settle()
  await page.screenshot({ path: `${output}/planner-overview.png` })
  await page.getByRole('button', { name: 'Trước', exact: true }).click(); await settle()
  const r = await page.locator('canvas').boundingBox()
  await page.mouse.move(r.x + 45, r.y + r.height / 2); await page.mouse.down()
  await page.mouse.move(r.x + 165, r.y + r.height / 2, { steps: 15 }); await page.mouse.up(); await settle()
  await page.screenshot({ path: `${output}/truck-details.png` })
  // Hide debug through the real URL; the final mobile screenshot represents product UI.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(origin + '/tai-xe/diem-giao')
  await page.getByRole('button', { name: 'Xem vị trí hàng', exact: true }).click()
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${output}/driver-phone.png` })
  assert.deepEqual(errors, [])
  report.errors = errors
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  }
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` })
  console.error(errors)
  throw error
} finally { await browser.close() }
