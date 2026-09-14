import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
const origin = process.env.VIEWER_TEST_URL ?? 'http://127.0.0.1:5175'
const initialTier = process.env.VIEWER_INITIAL_QUALITY ?? 'balanced'
// Default renderer: observe what Chromium actually provides, without forcing a GPU.
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
const report = { initialTier, samples: [], tiers: [] }
const metrics = () => page.locator('[data-viewer-performance]').evaluate((el) => ({ ...el.dataset }))
async function waitIdle() {
  await page.waitForFunction(() => document.querySelector('[data-viewer-performance]')?.getAttribute('data-idle') === 'true')
}

try {
  await page.goto(origin + `/chuyen/TRIP-2026-0914/phuong-an?debug&packages=1000&quality=${initialTier}`)
  await page.getByLabel('Email', { exact: true }).fill('dieuphoi@loadmaster.vn')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('loadmaster')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await waitIdle()
  assert.equal((await metrics()).dpr, { low: '0.5', balanced: '1.5', high: '2' }[initialTier])
  report.environment = await page.locator('canvas').evaluate((canvas) => {
    const gl = canvas.getContext('webgl2')
    const extension = gl?.getExtension('WEBGL_debug_renderer_info')
    return {
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable',
    }
  })
  const bounds = await page.locator('canvas').boundingBox()
  assert.ok(bounds)
  const cx = bounds.x + bounds.width / 2
  const cy = bounds.y + bounds.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  for (let index = 0; index < 24; index++) {
    await page.mouse.move(cx + Math.sin(index / 5) * 120, cy + Math.cos(index / 5) * 60, { steps: 2 })
    await page.waitForTimeout(90)
    report.samples.push(await metrics())
  }
  await page.mouse.up()
  assert.ok(report.samples.some((sample) => Number(sample.fps) > 0 && Number(sample.frameTimeMs) > 0), 'active camera must publish FPS and frame time')
  await waitIdle()
  const settledFrames = (await metrics()).renderedFrames
  await page.waitForTimeout(1200)
  assert.equal((await metrics()).renderedFrames, settledFrames, 'camera must settle back to demand idle')
  report.idleExtraFrames = 0

  for (const [tier, expectedDpr] of [['low', '0.5'], ['high', '2'], ['balanced', '1.5']]) {
    await page.evaluate((quality) => {
      const url = new URL(location.href)
      url.searchParams.set('quality', quality)
      history.pushState({}, '', url)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }, tier)
    await page.waitForFunction((quality) => document.querySelector('[data-viewer-performance]')?.getAttribute('data-quality-tier') === quality, tier)
    await waitIdle()
    const sample = await metrics()
    assert.equal(sample.dpr, expectedDpr)
    assert.equal(sample.placementCount, '1000')
    assert.ok(Number(sample.drawCalls) < 100)
    report.tiers.push(sample)
  }
  assert.deepEqual(errors, [])
  report.errors = errors
  await mkdir('node_modules/.tmp/viewer-ui', { recursive: true })
  await writeFile(`node_modules/.tmp/viewer-ui/demand-quality-${initialTier}.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ initialTier, environment: report.environment, activeFps: report.samples.filter((s) => s.fps).map((s) => Number(s.fps)), tiers: report.tiers, idleExtraFrames: 0, errors }))
} finally {
  await browser.close()
}
