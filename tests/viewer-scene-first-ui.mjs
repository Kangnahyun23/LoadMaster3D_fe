import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { cameraPreset, openInspector, closeInspector, selectPlacement, enterEdit, proxyPoint, instancePoint, waitIdle, metrics, sceneSnapshot } from './viewer-browser-helpers.mjs'
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const output = 'node_modules/.tmp/viewer-scene-first'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage(), errors = [], report = { scenes: [] }
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const route = origin + '/chuyen/TRIP-2026-0914/phuong-an'
const button = (name) => page.getByRole('button', { name, exact: true })
async function settle() { await page.waitForTimeout(700); await waitIdle(page) }
async function shot(name, idle = true) {
  if (idle) await settle()
  await page.screenshot({ path: `${output}/${name}.png`, style: '[data-viewer-performance] { visibility: hidden !important; }' })
  report.scenes.push({ name, canvas: await page.locator('canvas').boundingBox(), metrics: await metrics(page) })
  console.log(name)
}
try {
  await page.goto(route + '?debug&quality=balanced')
  await page.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await button('Đăng nhập').click(); await settle()
  assert.equal(await page.getByRole('dialog').count(), 0)
  assert.ok((await page.locator('canvas').boundingBox()).width >= 1580)
  assert.equal(await page.evaluate(async () => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    return Boolean(_roots.get(document.querySelector('canvas')).store.getState().scene.getObjectByName('stop-distribution'))
  }), false)
  await shot('01-planner-default')
  await page.getByRole('slider', { name: 'Bước xếp', exact: true }).fill('47'); await shot('02-loading-middle')
  await button('Theo bước: Tắt').click(); await settle()
  const before = await sceneSnapshot(page)
  await button('Tiến một bước').click(); await settle()
  const after = await sceneSnapshot(page)
  assert.notDeepEqual(before.target, after.target)
  const r = await page.locator('canvas').boundingBox()
  await page.mouse.move(r.x + r.width * 0.65, r.y + r.height * 0.5); await page.mouse.down()
  await page.mouse.move(r.x + r.width * 0.65 + 50, r.y + r.height * 0.5 + 20, { steps: 8 }); await page.mouse.up()
  await button('Tiếp tục theo bước').waitFor(); await page.keyboard.press('Escape')
  await settle()
  await button('Xem toàn xe').click(); await settle()
  await page.getByRole('combobox', { name: 'Tập trung điểm giao', exact: true }).selectOption('2'); await shot('03-stop-two')
  assert.equal(await page.evaluate(async () => {
    const { LOAD_PLAN } = await import('/src/lib/load-plan.mock.ts')
    return LOAD_PLAN.placements.find((p) => p.step === Number(document.querySelector('input[aria-label="Bước xếp"]').value))?.stop
  }), 2, 'stop focus must not leave the current label on a different stop')
  await button('Dỡ hàng').click(); await shot('04-unloading-clear')
  const blocked = await page.evaluate(async () => {
    const { LOAD_PLAN } = await import('/src/lib/load-plan.mock.ts')
    const { suggestedUnloadOrder, potentialBlockers } = await import('/src/features/viewer3d/operations/operations-model.ts')
    const ordered = suggestedUnloadOrder(LOAD_PLAN.placements)
    return ordered.findIndex((p, i) => potentialBlockers(p, ordered.slice(i), LOAD_PLAN.vehicle).length)
  })
  assert.ok(blocked >= 0, 'canonical plan contains an advisory case')
  await page.getByRole('slider', { name: 'Đã dỡ (gợi ý)', exact: true }).fill(String(blocked))
  await button('Tiến một bước').click(); await shot('05-unloading-blocked')
  assert.equal(await page.getByRole('slider', { name: 'Đã dỡ (gợi ý)', exact: true }).inputValue(), String(blocked))
  await button('Bỏ qua bước trong mô phỏng').waitFor()
  await openInspector(page, 'display'); await page.getByRole('dialog').getByRole('button', { name: 'Hiện tâm khối lượng hàng', exact: true }).click()
  await closeInspector(page); await cameraPreset(page, 'Góc chéo'); await shot('06-center-of-mass')
  await page.goto(route + '?debug&packages=1000&quality=balanced'); await settle()
  await cameraPreset(page, 'Trên'); await settle()
  const point = await instancePoint(page, 999), cameraBefore = await sceneSnapshot(page)
  await page.mouse.move(point.x, point.y); await page.waitForTimeout(200)
  assert.equal(await page.locator('canvas').evaluate((el) => el.style.cursor), 'pointer')
  await page.mouse.dblclick(point.x, point.y); await settle()
  const cameraAfter = await sceneSnapshot(page)
  assert.ok(cameraBefore.direction.every((v, i) => Math.abs(v - cameraAfter.direction[i]) < 0.001))
  assert.notDeepEqual(cameraBefore.target, cameraAfter.target)
  await button('Xem toàn xe').click(); await settle()
  const cameraReset = await sceneSnapshot(page)
  assert.ok(cameraBefore.target.every((v, i) => Math.abs(v - cameraReset.target[i]) < 0.001))
  await enterEdit(page); await selectPlacement(page, 'BENCH-01000'); await cameraPreset(page, 'Trên'); await settle()
  await button('Tập trung vào kiện').click(); await settle()
  let start = await proxyPoint(page), end = await proxyPoint(page, [55, 0, 0])
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(end.x, end.y, { steps: 10 })
  assert.equal(await page.locator('[data-editor-status]').getAttribute('data-valid'), 'true')
  await page.waitForTimeout(250)
  await shot('07-edit-valid-snap', false); await page.mouse.up(); await settle()
  start = await proxyPoint(page); end = await proxyPoint(page, [-380, 0, 0])
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(end.x, end.y, { steps: 10 })
  await page.waitForTimeout(150)
  assert.equal(await page.locator('[data-editor-status]').getAttribute('data-valid'), 'false')
  await shot('08-edit-overlap', false); await page.keyboard.press('Escape'); await page.mouse.up()
  for (const [width, height] of [[1024, 900], [820, 1180], [390, 844]]) {
    await page.setViewportSize({ width, height }); await page.goto(route + '?debug&quality=balanced'); await settle()
    await page.getByRole('slider', { name: 'Bước xếp', exact: true }).fill('47')
    const cells = page.locator('[data-sequence-cell]')
    assert.ok(await cells.count() <= 64)
    const heights = await cells.evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().height))
    assert.equal(new Set(heights).size, 1)
    await shot(`09-planner-${width}`)
    const canvas = await page.locator('canvas').boundingBox()
    for (const callout of await page.locator('[data-scene-callout]').all()) {
      const bounds = await callout.boundingBox()
      if (bounds) assert.ok(bounds.x >= canvas.x - 1 && bounds.x + bounds.width <= canvas.x + canvas.width + 1, 'world labels stay inside the viewport')
    }
  }
  await page.goto(origin + '/tai-xe/diem-giao?debug&quality=balanced')
  await button('Xem vị trí hàng').click(); await shot('10-driver-phone')
  assert.deepEqual(errors, [])
  report.errors = errors
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
} catch (error) {
  console.error(errors)
  await page.screenshot({ path: `${output}/failure.png` })
  await writeFile(`${output}/partial.json`, JSON.stringify(report, null, 2))
  throw error
} finally { await browser.close() }
