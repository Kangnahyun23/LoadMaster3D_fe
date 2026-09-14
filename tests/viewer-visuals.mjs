import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { cameraPreset, metrics, sceneSnapshot, waitIdle } from './viewer-browser-helpers.mjs'
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const output = path.resolve('node_modules/.tmp/viewer-visuals')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 })
  Object.defineProperty(navigator, 'deviceMemory', { get: () => 4 })
})
const page = await context.newPage(), errors = [], report = {}
page.on('pageerror', (e) => errors.push(e.message))
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const viewer = '/chuyen/TRIP-2026-0914/phuong-an'
const button = (name) => page.getByRole('button', { name, exact: true })
async function settle() { await page.waitForTimeout(800); await waitIdle(page) }
// Record real rendered transforms after a real DOM control action; no production bridge.
async function animationFrames(kind) {
  return page.evaluate(async (kind) => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    const state = _roots.get(document.querySelector('canvas')).store.getState()
    const samples = [], matrix = state.camera.matrixWorld.clone()
    document.querySelector('button[aria-label="Tiến một bước"]').click()
    const started = performance.now()
    await new Promise((resolve) => {
      const sample = () => {
        if (kind === 'loading') {
          state.scene.getObjectByName('cargo-opaque').getMatrixAt(1, matrix)
          samples.push({ y: matrix.elements[13] })
        } else {
          const mesh = state.scene.getObjectByName('unloading-motion')
          samples.push({ x: mesh.position.x, visible: mesh.visible, opacity: mesh.material.opacity })
        }
        if (performance.now() - started > 850) resolve(); else requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
    return samples
  }, kind)
}
try {
  await page.goto(origin + viewer + '?debug&quality=high')
  await page.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await button('Đăng nhập').click(); await settle()
  await cameraPreset(page, 'Trước'); await settle()
  const bounds = await page.locator('canvas').boundingBox()
  await page.mouse.move(bounds.x + 45, bounds.y + bounds.height / 2)
  await page.mouse.down(); await page.mouse.move(bounds.x + 165, bounds.y + bounds.height / 2, { steps: 15 }); await page.mouse.up()
  await settle()
  report.truck = { metrics: await metrics(page), scene: await sceneSnapshot(page) }
  assert.ok(Number(report.truck.metrics.drawCalls) < 100)
  await page.screenshot({ path: path.join(output, 'planner-truck.png') })
  await cameraPreset(page, 'Góc chéo'); await settle()
  await page.screenshot({ path: path.join(output, 'planner-overview.png') })
  await button('Về đầu').click(); await settle()
  const load = await animationFrames('loading')
  assert.ok(Math.max(...load.map((p) => p.y)) - Math.min(...load.map((p) => p.y)) > 0.15, 'loading spring updates the active instance')
  await settle(); await button('Dỡ hàng').click(); await settle()
  const exit = await animationFrames('unloading'), visible = exit.filter((p) => p.visible)
  assert.ok(visible.length > 1 && visible.some((p) => p.opacity < 0.8), 'unloading fade is rendered')
  assert.ok(Math.max(...visible.map((p) => p.x)) - Math.min(...visible.map((p) => p.x)) > 0.1, 'unblocked package travels toward rear door')
  await settle()
  const frameCount = (await metrics(page)).renderedFrames
  await page.waitForTimeout(800)
  assert.equal((await metrics(page)).renderedFrames, frameCount, 'all animation returns to idle')
  report.animations = { loadingFrames: load.length, unloadingFrames: visible.length, idle: true }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = await animationFrames('unloading'), reducedVisible = reduced.filter((p) => p.visible)
  assert.ok(new Set(reducedVisible.map((p) => p.x)).size <= 1, 'reduced motion never translates the cargo')
  await settle()
  report.animations.reducedMotion = true
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(origin + viewer + '?debug&packages=1000')
  await settle()
  report.adaptation = { initial: (await metrics(page)).qualityTier, samples: [] }
  const r = await page.locator('canvas').boundingBox()
  await page.mouse.move(r.x + 40, r.y + r.height * 0.5); await page.mouse.down()
  for (let i = 0; i < 85; i++) {
    await page.mouse.move(r.x + 40 + i * 2, r.y + r.height * 0.5 + Math.sin(i / 4) * 20)
    await page.waitForTimeout(40)
    if (i % 10 === 9) {
      const sample = await metrics(page)
      report.adaptation.samples.push(sample)
      if (sample.qualityTier === 'low') break
    }
  }
  await page.mouse.up(); await settle()
  report.adaptation.final = (await metrics(page)).qualityTier
  assert.equal(report.adaptation.final, 'low', 'runtime monitor downgrades under sustained software-renderer load')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(origin + '/tai-xe/diem-giao?debug&quality=balanced')
  await button('Xem vị trí hàng').click(); await settle()
  await page.screenshot({ path: path.join(output, 'driver-phone.png') })
  report.phone = await page.locator('canvas').boundingBox()
  assert.equal(report.phone.width, 390)
  assert.deepEqual(errors, [])
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (e) {
  await writeFile(path.join(output, 'partial.json'), JSON.stringify(report, null, 2))
  await page.screenshot({ path: path.join(output, 'failure.png') })
  throw e
} finally { await browser.close() }
