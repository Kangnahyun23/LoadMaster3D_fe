import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { metrics, proxyPoint, sceneSnapshot, waitIdle } from './viewer-browser-helpers.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const output = path.resolve('node_modules/.tmp/viewer-editor')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
const viewer = '/chuyen/TRIP-2026-0914/phuong-an'
const report = {}
const button = (name) => page.getByRole('button', { name, exact: true })
const status = page.locator('[data-editor-status]')
const position = () => status.evaluate((el) => [Number(el.dataset.x), Number(el.dataset.y), Number(el.dataset.z)])
async function select(id) { await page.getByRole('combobox', { name: 'Chọn kiện', exact: true }).selectOption(id) }
async function drag(delta, cancel = false, measure = false) {
  const start = await proxyPoint(page), end = await proxyPoint(page, delta)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.waitForFunction(() => document.querySelector('[data-editor-status]')?.dataset.dragging === 'true')
  const during = await sceneSnapshot(page)
  assert.equal(during.eventsEnabled, false, 'captured drag skips cargo raycasts')
  assert.equal(during.controlsEnabled, false, 'camera cannot orbit during a cargo drag')
  if (measure) {
    for (let i = 1; i <= 24; i++) {
      await page.mouse.move(start.x + (end.x - start.x) * i / 24, start.y + (end.y - start.y) * i / 24)
      await page.waitForTimeout(50)
    }
    report.activeDrag = await metrics(page)
  } else await page.mouse.move(end.x, end.y, { steps: 12 })
  if (cancel) await page.keyboard.press('Escape')
  await page.mouse.up()
  await page.waitForFunction(() => document.querySelector('[data-editor-status]')?.dataset.dragging === 'false')
  const after = await sceneSnapshot(page)
  assert.equal(after.controlsEnabled, true)
  assert.equal(after.eventsEnabled, true)
}

try {
  await page.goto(origin + viewer + '?debug&packages=1000&quality=low')
  await page.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await button('Đăng nhập').click()
  await waitIdle(page)
  assert.equal((await sceneSnapshot(page)).proxy, undefined, 'view mode has no draggable proxy')
  await button('Chỉnh sửa').click()
  await select('BENCH-01000')
  const initial = await position()
  await button('Tăng X').click()
  assert.equal((await position())[0], initial[0] + 10)
  await button('Hoàn tác').click()
  assert.deepEqual(await position(), initial)
  await button('Làm lại').click()
  assert.equal((await position())[0], initial[0] + 10)
  await page.keyboard.press('Control+z')
  assert.deepEqual(await position(), initial)
  await page.keyboard.press('Control+Shift+z')
  assert.equal((await position())[0], initial[0] + 10)
  await button('Ghim').click()
  assert.equal(await button('Tăng X').isEnabled(), false)
  await button('Bỏ ghim').click()
  await button('R×D×C').click()
  assert.match(await status.innerText(), /Không thể xoay/)
  assert.equal(await status.getAttribute('data-orientation'), '0')
  await button('C×R×D').click()
  assert.equal(await status.getAttribute('data-orientation'), '2')
  await button('Khôi phục kiện này').click()
  assert.equal(await status.getAttribute('data-orientation'), '0')
  assert.deepEqual(await position(), initial)
  await button('Tăng Z').click()
  assert.match(await status.innerText(), /nâng đỡ/)
  await button('Khôi phục mọi chỉnh sửa').click()
  await button('Giữ chỉnh sửa').click()
  assert.equal((await position())[2], initial[2] + 10)
  await button('Khôi phục mọi chỉnh sửa').click()
  await button('Khôi phục tất cả').click()
  assert.deepEqual(await position(), initial)
  await button('Hoàn tác').click()
  assert.equal((await position())[2], initial[2] + 10)
  await button('Làm lại').click()
  await button('Trên').click()
  await waitIdle(page)
  const beforeFocus = await sceneSnapshot(page)
  await button('Tập trung vào kiện').click()
  await waitIdle(page)
  const afterFocus = await sceneSnapshot(page)
  assert.ok(beforeFocus.direction.every((value, i) => Math.abs(value - afterFocus.direction[i]) < 0.001))
  assert.notDeepEqual(beforeFocus.target, afterFocus.target)
  await button('Hút khi kéo: Bật').click()
  await drag([-20, 0, 0], false, true)
  const moved = await position()
  assert.ok(moved[0] < initial[0], 'direct drag commits a move')
  await button('Hoàn tác').click()
  assert.deepEqual(await position(), initial, 'one complete gesture is exactly one command')
  await drag([-20, 0, 0], true)
  assert.deepEqual(await position(), initial, 'Escape cancels without a command')
  await drag([200, 0, 0])
  assert.match(await status.innerText(), /Không thể đặt/)
  assert.deepEqual(await position(), initial, 'invalid drop restores original placement')
  await drag([-300, 0, 0])
  assert.match(await status.innerText(), /Chồng lấn/)
  assert.deepEqual(await position(), initial)
  const frameBefore = (await metrics(page)).renderedFrames
  await page.waitForTimeout(1800)
  const resting = await metrics(page)
  await page.waitForTimeout(1100)
  assert.equal((await metrics(page)).renderedFrames, resting.renderedFrames, 'editor also sleeps when idle')
  report.gestures = { initial, moved, framesAfterDrop: frameBefore, scene: await sceneSnapshot(page) }
  await page.screenshot({ path: path.join(output, 'desktop.png') })

  report.benchmarks = []
  for (const count of [132, 300, 500, 1000]) {
    await page.goto(origin + viewer + `?debug&packages=${count}&quality=low`)
    await waitIdle(page)
    const viewMetrics = await metrics(page)
    await button('Chỉnh sửa').click()
    await page.waitForFunction((previous) => Number(document.querySelector('[data-viewer-performance]')?.dataset.renderedFrames) > previous,
      Number(viewMetrics.renderedFrames))
    await waitIdle(page)
    const editMetrics = await metrics(page), scene = await sceneSnapshot(page)
    assert.ok(Number(editMetrics.drawCalls) < 100)
    assert.equal(scene.instances.length, 2)
    assert.ok(scene.instances.every((mesh) => mesh.count === count))
    assert.ok(scene.meshes < 50)
    report.benchmarks.push({ count, view: viewMetrics, edit: editMetrics, scene })
  }

  for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    const touch = await browser.newContext({ viewport, isMobile: true, hasTouch: true, storageState: await context.storageState(), reducedMotion: 'reduce' })
    // Login uses sessionStorage, which storageState deliberately does not persist.
    const mobile = await touch.newPage()
    mobile.on('pageerror', (error) => errors.push(error.message))
    await mobile.goto(origin + viewer + '?debug&packages=1000&quality=low')
    await mobile.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
    await mobile.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
    await mobile.getByRole('button', { name: 'Đăng nhập', exact: true }).tap()
    await mobile.getByRole('button', { name: 'Chỉnh sửa', exact: true }).tap()
    await mobile.getByRole('combobox', { name: 'Chọn kiện', exact: true }).selectOption('BENCH-01000')
    const nudge = mobile.getByRole('button', { name: 'Tăng X', exact: true })
    await nudge.tap()
    assert.equal(await mobile.locator('[data-editor-status]').getAttribute('data-x'), String(initial[0] + 10))
    await mobile.getByRole('button', { name: 'Hoàn tác', exact: true }).tap()
    const bounds = await nudge.boundingBox()
    assert.ok(bounds.height >= 56 && bounds.width >= 56)
    const sceneBounds = await mobile.locator('canvas').boundingBox()
    assert.ok(sceneBounds.width >= viewport.width - 20 && sceneBounds.height >= 192)
    if (viewport.width === 820) {
      await mobile.getByRole('button', { name: 'Trên', exact: true }).tap()
      await mobile.getByRole('button', { name: 'Tập trung vào kiện', exact: true }).tap()
      await mobile.getByRole('button', { name: 'Hút khi kéo: Bật', exact: true }).tap()
      await mobile.getByRole('button', { name: 'Tập trung vào kiện', exact: true }).tap()
      await waitIdle(mobile)
      const start = await proxyPoint(mobile), end = await proxyPoint(mobile, [-20, 0, 0])
      const cdp = await touch.newCDPSession(mobile)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y, id: 1 }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: end.x, y: end.y, id: 1 }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await mobile.waitForFunction((x) => Number(document.querySelector('[data-editor-status]')?.dataset.x) < x, initial[0])
      await mobile.getByRole('button', { name: 'Hoàn tác', exact: true }).tap()
      assert.equal(await mobile.locator('[data-editor-status]').getAttribute('data-x'), String(initial[0]))
      report.touchDrag = 'captured touch move + undo passed (emulated tablet)'
    }
    await mobile.getByRole('link', { name: 'Quay lại chuyến', exact: true }).waitFor()
    await mobile.screenshot({ path: path.join(output, `touch-${viewport.width}.png`) })
    report[`touch${viewport.width}`] = { sceneBounds, nudgeBounds: bounds }
    await touch.close()
  }
  assert.deepEqual(errors, [])
  report.errors = errors
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  await page.screenshot({ path: path.join(output, 'failure.png') })
  console.error('Browser errors:', errors)
  throw error
} finally { await browser.close() }
