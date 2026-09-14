import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { cameraPreset, openInspector, closeInspector, selectedPlacementId, instancePoint, metrics, sceneSnapshot, visibleCargo, waitIdle } from './viewer-browser-helpers.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const output = path.resolve('node_modules/.tmp/viewer-operations')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage(), errors = []
const collect = (p) => { p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) }) }
collect(page)
const viewer = '/chuyen/TRIP-2026-0914/phuong-an'
const button = (p, name) => p.getByRole('button', { name, exact: true })
const report = {}
async function login(p, route) {
  await p.goto(origin + route)
  await p.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await p.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await button(p, 'Đăng nhập').click()
}
async function settle(p) { await p.waitForTimeout(650); await waitIdle(p) }
async function cameraMotion(p) {
  const r = await p.locator('canvas').boundingBox()
  await p.mouse.move(r.x + r.width * 0.18, r.y + r.height * 0.5)
  await p.mouse.down()
  for (let i = 1; i <= 24; i++) {
    await p.mouse.move(r.x + r.width * 0.18 + i * 3, r.y + r.height * 0.5 + Math.sin(i / 3) * 12)
    await p.waitForTimeout(60)
  }
  const active = await metrics(p)
  await p.mouse.up()
  return active
}

try {
  await login(page, viewer + '?debug&packages=1000&quality=low')
  await settle(page)
  assert.equal(await page.locator('[data-experience="planner"]').count(), 1)
  assert.ok(Number(await page.locator('[data-timeline-bins]').getAttribute('data-timeline-bins')) <= 80)
  await button(page, 'Về đầu').click(); await settle(page)
  assert.deepEqual(await visibleCargo(page), { 'cargo-opaque': 1, 'cargo-dim': 1 })
  await button(page, 'Tiến một bước').click(); await settle(page)
  assert.equal((await visibleCargo(page))['cargo-opaque'], 2)
  const loadingSlider = page.getByRole('slider', { name: 'Bước xếp', exact: true })
  await loadingSlider.fill('1000'); await cameraPreset(page, 'Trên'); await settle(page)
  const point = await instancePoint(page, 999)
  await page.mouse.click(point.x, point.y)
  assert.equal(await selectedPlacementId(page), 'BENCH-01000')
  await openInspector(page, 'display')
  await button(page, 'Hiện tâm khối lượng hàng').click(); await settle(page)
  await closeInspector(page)
  assert.equal(await page.evaluate(async () => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    return Boolean(_roots.get(document.querySelector('canvas')).store.getState().scene.getObjectByName('cargo-center-of-mass'))
  }), true)
  await button(page, 'Dỡ hàng').click(); await settle(page)
  await openInspector(page, 'operations')
  assert.match(await page.getByRole('dialog').innerText(), /Thứ tự dỡ gợi ý/)
  await closeInspector(page)
  await button(page, 'Tiến một bước').click(); await settle(page)
  let cargo = await visibleCargo(page)
  assert.equal(cargo['cargo-opaque'] + cargo['cargo-dim'], 999)
  await page.getByRole('combobox', { name: 'Tập trung điểm giao', exact: true }).selectOption('2'); await settle(page)
  cargo = await visibleCargo(page)
  assert.equal(cargo['cargo-opaque'] + cargo['cargo-dim'], 750, 'prior stop is removed from the simulation')
  const blockedIndex = await page.evaluate(async () => {
    const { createBenchmarkPlan } = await import('/src/features/viewer3d/benchmark.mock.ts')
    const { suggestedUnloadOrder, potentialBlockers } = await import('/src/features/viewer3d/operations/operations-model.ts')
    const plan = createBenchmarkPlan(1000), order = suggestedUnloadOrder(plan.placements)
    return order.findIndex((p, i) => p.stop === 2 && potentialBlockers(p, order.slice(i), plan.vehicle).length)
  })
  assert.ok(blockedIndex >= 0)
  const unloadSlider = page.getByRole('slider', { name: 'Đã dỡ (gợi ý)', exact: true })
  await unloadSlider.fill(String(blockedIndex)); await button(page, 'Tiến một bước').click(); await settle(page)
  assert.equal(await unloadSlider.inputValue(), String(blockedIndex), 'advisory pauses the simulation')
  cargo = await visibleCargo(page)
  assert.ok(cargo['cargo-hull'] > 0, 'blocker warning hull survives low tier')
  await openInspector(page, 'operations')
  const blockerPanel = page.getByRole('region', { name: 'Kiện có khả năng cản đường', exact: true })
  assert.match(await blockerPanel.innerText(), /có khả năng cản đường/)
  const blockerName = await blockerPanel.getByRole('button').first().innerText()
  await blockerPanel.getByRole('button').first().click(); await settle(page)
  assert.equal(await selectedPlacementId(page), blockerName.split(' · ')[0])
  assert.equal(await unloadSlider.inputValue(), String(blockedIndex), 'inspecting a blocker cannot replace the unload target')
  await button(page, 'Quay lại kiện cần dỡ').click(); await settle(page)
  await button(page, 'Duyệt phương án').click()
  const approval = page.getByRole('dialog')
  assert.match(await approval.innerText(), /Thứ tự xếp phù hợp thứ tự điểm giao/)
  assert.match(await approval.innerText(), /giới hạn phương án gốc/)
  assert.doesNotMatch(await approval.innerText(), /LIFO hoàn toàn hợp lệ|Tuân thủ thứ tự dỡ/)
  await button(page, 'Huỷ').click()
  await page.screenshot({ path: path.join(output, 'planner-unloading.png') })
  report.planner = { selected: await selectedPlacementId(page), cargo, metrics: await metrics(page) }

  report.benchmarks = []
  for (const count of [132, 300, 500, 1000]) {
    await page.goto(origin + viewer + `?debug&packages=${count}&quality=low`); await settle(page)
    const active = await cameraMotion(page)
    await settle(page)
    const resting = await metrics(page), scene = await sceneSnapshot(page)
    assert.ok(Number(resting.drawCalls) < 100)
    assert.ok(scene.instances.filter((mesh) => mesh.name.startsWith('cargo-')).every((mesh) => mesh.count === count))
    report.benchmarks.push({ count, active, resting, meshes: scene.meshes })
  }
  for (const tier of ['balanced', 'high']) {
    await page.goto(origin + viewer + `?debug&packages=1000&quality=${tier}`); await settle(page)
    report[tier] = await metrics(page)
    assert.equal(report[tier].qualityTier, tier)
    assert.equal((await sceneSnapshot(page)).instances.filter((mesh) => mesh.name.startsWith('cargo-')).length, 3)
  }
  await page.goto(origin + '/kho?debug&packages=1000&quality=low'); await settle(page)
  assert.equal(await page.locator('[data-experience="warehouse"]').count(), 1)
  assert.equal((await visibleCargo(page))['cargo-opaque'], 47)
  assert.equal((await visibleCargo(page))['cargo-dim'], 1)
  await page.getByRole('combobox', { name: 'Góc nhìn thùng xe', exact: true }).selectOption('cua-sau')
  await button(page, 'Chỉ kiện này').click(); await settle(page)
  assert.deepEqual(await visibleCargo(page), { 'cargo-opaque': 1, 'cargo-dim': 0 })
  await button(page, 'Hiện xung quanh').click()
  await button(page, 'Xác nhận đã xếp').click(); await page.waitForTimeout(1400)
  assert.match(await page.locator('body').innerText(), /BENCH-00048/)
  await settle(page)
  report.warehouse = { scene: await sceneSnapshot(page), metrics: await metrics(page) }
  await page.screenshot({ path: path.join(output, 'warehouse.png') })

  for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    const touch = await browser.newContext({ viewport, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
    const mobile = await touch.newPage(); collect(mobile)
    const requests = []; mobile.on('request', (r) => requests.push(r.url()))
    await login(mobile, '/tai-xe/diem-giao?debug&packages=1000&quality=low')
    await button(mobile, 'Xem vị trí hàng').waitFor()
    assert.equal(await mobile.locator('canvas').count(), 0)
    assert.equal(requests.some((url) => /@react-three|three\.module|three\.core/.test(url)), false, 'driver 2D must not fetch Three.js')
    await button(mobile, 'Xem vị trí hàng').tap(); await settle(mobile)
    assert.equal(await mobile.locator('[data-experience="driver"]').count(), 1)
    assert.equal(await button(mobile, 'Chỉnh sửa').count(), 0)
    const before = await visibleCargo(mobile)
    await button(mobile, 'Tiến một bước').tap(); await settle(mobile)
    const after = await visibleCargo(mobile)
    assert.equal(after['cargo-opaque'] + after['cargo-dim'], before['cargo-opaque'] + before['cargo-dim'] - 1)
    const bounds = await mobile.locator('canvas').boundingBox()
    assert.ok(bounds.width >= viewport.width - 10 && bounds.height >= 192)
    report[`driver${viewport.width}`] = { bounds, metrics: await metrics(mobile), scene: await sceneSnapshot(mobile) }
    await mobile.screenshot({ path: path.join(output, `driver-${viewport.width}.png`) })
    await button(mobile, 'Đóng 3D').tap()
    assert.equal(await mobile.locator('canvas').count(), 0)
    await button(mobile, 'Hoàn tất điểm giao').waitFor()

    await mobile.goto(origin + viewer + '?debug&packages=1000&quality=low'); await settle(mobile)
    await button(mobile, 'Dỡ hàng').tap()
    await button(mobile, 'Chi tiết / Hiển thị').tap()
    const drawer = mobile.getByRole('dialog')
    await drawer.getByRole('button', { name: 'Hiển thị', exact: true }).tap()
    await drawer.getByRole('button', { name: 'Hiện tâm khối lượng hàng', exact: true }).tap()
    await drawer.getByRole('button', { name: 'Theo khối lượng', exact: true }).tap()
    await drawer.getByRole('button', { name: 'Đóng', exact: true }).tap()
    assert.equal(await mobile.getByRole('dialog').count(), 0)
    await mobile.screenshot({ path: path.join(output, `planner-${viewport.width}.png`) })
    report[`planner${viewport.width}`] = { bounds: await mobile.locator('canvas').boundingBox() }
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
