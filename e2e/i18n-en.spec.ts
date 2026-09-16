import type { Page, TestInfo } from '@playwright/test'
import { attachJson, attachScreenshot, expect, test } from './fixtures'
import { MOCK_DB, navigateInApp, SEED_TRIP } from './spec-flow-helpers'

/** Planner không bật `?debug` nên không có cờ nghỉ: chờ canvas rồi cho scene dừng vẽ. */
async function settleScene(page: Page) {
  await page.locator('canvas').waitFor()
  await page.waitForTimeout(1_500)
}

/**
 * i18n đợt 1 (LM-070): đi Chi tiết chuyến, Thiết lập tối ưu và Planner bằng `?lang=en`, khẳng định không còn chữ có dấu tiếng Việt
 * trong chữ hiển thị, aria-label, title, placeholder và option. Dữ liệu chuyến tạo trong trang bằng tên tiếng Anh (kho in-memory:
 * không tải lại trang sau khi ghi). Chữ được phép giữ: tên ngôn ngữ trong nút chuyển và tên người dùng demo (dữ liệu).
 * Kèm kiểm tràn chữ: nút, tab, tiêu đề không bị cắt ngoài chủ ý (`text-overflow: ellipsis` hoặc vùng cuộn được coi là chủ ý).
 */
const DATA_NAMES = ['Tiếng Việt', 'Nguyễn Thanh Tùng']

type Viewport = { name: string; width: number; height: number }
const VIEWPORTS: readonly Viewport[] = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'phone-390', width: 390, height: 844 },
]

async function vietnameseText(page: Page): Promise<string[]> {
  return page.evaluate((allowed) => {
    const vietnamese = /[À-ÃÈ-ÊÌÍÒ-ÕÙÚÝà-ãè-êìíò-õùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/
    const texts = [document.body.innerText]
    const attributes = ['aria-label', 'title', 'placeholder', 'aria-valuetext']
    for (const element of document.querySelectorAll(attributes.map((name) => `[${name}]`).join(','))) {
      for (const name of attributes) texts.push(element.getAttribute(name) ?? '')
    }
    for (const option of document.querySelectorAll('option')) texts.push(option.textContent ?? '')
    return [...new Set(texts.flatMap((text) => text.split('\n'))
      .map((line) => allowed.reduce((rest, name) => rest.replaceAll(name, ''), line))
      .filter((line) => vietnamese.test(line)))]
  }, DATA_NAMES)
}

/** Phần tử có chữ bị tràn ngang ngoài chủ ý, và trang có cuộn ngang hay không. */
async function overflow(page: Page) {
  return page.evaluate(() => {
    const clipped: string[] = []
    for (const element of document.querySelectorAll<HTMLElement>('header, button, a, label, h1, h2, h3, [role="tab"], dt, dd')) {
      if (!element.offsetParent || element.closest('canvas, [data-sr-only], .sr-only')) continue
      const style = getComputedStyle(element)
      if (style.textOverflow === 'ellipsis' || /auto|scroll/.test(style.overflowX)) continue
      if (element.scrollWidth > element.clientWidth + 1) clipped.push(`${element.tagName.toLowerCase()}: ${element.innerText.slice(0, 60)}`)
    }
    return { pageScroll: document.documentElement.scrollWidth > window.innerWidth + 1, clipped }
  })
}

async function check(page: Page, testInfo: TestInfo, name: string, { layout: checkLayout = true } = {}) {
  await attachScreenshot(page, testInfo, name)
  const found = await vietnameseText(page)
  const layout = await overflow(page)
  await attachJson(testInfo, `${name}.overflow`, layout)
  expect(found, `${name}: Vietnamese text in the en UI`).toStrictEqual([])
  if (!checkLayout) return
  expect(layout.pageScroll, `${name}: horizontal page scroll`).toBe(false)
  expect(layout.clipped, `${name}: clipped labels`).toStrictEqual([])
}

/** Chuyến tiếng Anh dựng từ kiện của chuyến mẫu, cùng xe. */
async function createEnglishTrip(page: Page): Promise<string> {
  return page.evaluate(async ({ url, seedId }) => {
    const { getMockDb } = (await import(url)) as typeof import('@/lib/mock-db')
    const db = getMockDb()
    const seed = await db.getTrip(seedId)
    const trip = await db.createTrip({
      name: 'Riverside route',
      vehicleId: seed.vehicleId,
      stops: [
        { id: 'STOP-01', name: 'North Market', address: '12 River Road' },
        { id: 'STOP-02', name: 'Harbor Foods', address: '30 Harbor Avenue' },
        { id: 'STOP-03', name: 'Green Pharmacy', address: '215 Hill Street' },
        { id: 'STOP-04', name: 'East Depot', address: '58 Station Lane' },
      ],
      packages: seed.packages.map((pkg, index) => ({ ...pkg, name: `Carton line ${index + 1}`, notes: pkg.notes ? 'Fragile goods' : undefined })),
    })
    return trip.id
  }, { url: MOCK_DB, seedId: SEED_TRIP })
}

for (const viewport of VIEWPORTS) {
  test(`${viewport.name}: trip detail, optimization setup and Planner in English`, async ({ page, login, browserErrors }, testInfo) => {
    const phone = viewport.width < 600
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await login('/chuyen')
    // `?lang=en` đọc lúc tải trang; tải lại trước khi ghi kho, phiên đăng nhập nằm trong sessionStorage.
    await page.goto('/chuyen?lang=en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    if (!phone) {
      await expect(page.getByRole('heading', { name: 'Trips', exact: true })).toBeVisible()
      await attachScreenshot(page, testInfo, `${viewport.name}-trip-list`)
      expect((await overflow(page)).clipped, 'trip list: clipped labels').toStrictEqual([])
    }

    if (viewport.width >= 1440) {
      await navigateInApp(page, '/chuyen/moi')
      await expect(page.getByRole('heading', { name: 'Create trip', exact: true })).toBeVisible()
      await check(page, testInfo, `${viewport.name}-trip-form`)
    }

    const tripId = await createEnglishTrip(page)
    await navigateInApp(page, `/chuyen/${tripId}`)
    await expect(page.getByRole('link', { name: 'Run optimization', exact: true })).toBeVisible()
    await expect(page.getByRole('row', { name: /PKG-001/ })).toBeVisible()
    // Màn điều phối là màn desktop (AGENTS mục 1): trên điện thoại chỉ kiểm chữ, không kiểm bố cục.
    await check(page, testInfo, `${viewport.name}-trip-detail`, { layout: !phone })

    await page.getByRole('link', { name: 'Run optimization', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Optimization setup', exact: true })).toBeVisible()
    await check(page, testInfo, `${viewport.name}-optimization-setup`, { layout: !phone })

    const optimize = page.getByRole('button', { name: 'Optimize', exact: true })
    await expect(optimize).toBeEnabled()
    await optimize.click()
    await page.waitForURL(/\/phuong-an\?revision=MOCK-/, { timeout: 60_000 })
    await page.locator('canvas').waitFor()
    await settleScene(page)
    await expect(page.locator('header').first()).toContainText('MOCK RESULT')
    // Toast "đã tối ưu" che thanh trên: đóng nó để ảnh chụp thấy header.
    await page.locator('[data-sonner-toast] [data-close-button]').click()
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0)
    await check(page, testInfo, `${viewport.name}-planner`)

    // Hộp thông tin: từng tab
    await page.getByRole('button', { name: 'Details / Display', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Plan details' })
    await expect(dialog).toBeVisible()
    await check(page, testInfo, `${viewport.name}-inspector-operations`)
    await dialog.getByRole('button', { name: 'Package', exact: true }).click()
    await dialog.getByRole('combobox', { name: 'Select package', exact: true }).selectOption({ index: 1 })
    await expect(dialog.getByText('Source package', { exact: true })).toBeVisible()
    await check(page, testInfo, `${viewport.name}-inspector-package`)
    await dialog.getByRole('button', { name: 'Display', exact: true }).click()
    await expect(dialog.getByRole('heading', { name: 'Display layers', exact: true })).toBeVisible()
    await check(page, testInfo, `${viewport.name}-inspector-display`)
    await dialog.getByRole('button', { name: 'List', exact: true }).click()
    await check(page, testInfo, `${viewport.name}-inspector-packages`)
    await dialog.getByRole('button', { name: 'Metrics', exact: true }).click()
    await check(page, testInfo, `${viewport.name}-inspector-metrics`)
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(dialog).toHaveCount(0)

    // Dỡ hàng: HUD, timeline và panel vận hành đổi nhãn
    await page.getByRole('button', { name: 'Unloading', exact: true }).click()
    await settleScene(page)
    await check(page, testInfo, `${viewport.name}-planner-unloading`)

    if (!phone) {
      // Chế độ chỉnh sửa: thanh công cụ và panel editor
      await page.getByRole('button', { name: 'Edit', exact: true }).first().click()
      await page.getByRole('combobox', { name: 'Select package', exact: true }).selectOption({ index: 1 })
      await expect(page.getByRole('complementary', { name: 'Edit package' })).toBeVisible()
      await settleScene(page)
      await check(page, testInfo, `${viewport.name}-planner-editor`)
    }

    expect(browserErrors).toStrictEqual([])
  })
}
