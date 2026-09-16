import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { MOCK_DB, navigateInApp, SEED_TRIP } from './spec-flow-helpers'

/**
 * Màn tài xế đọc revision đã duyệt (LM-061). Thứ tự kỳ vọng đọc thẳng từ kho in-memory của trang qua đúng module app dùng;
 * sau khi ghi kho chỉ đổi route phía client.
 */
const DRIVER = '/tai-xe/diem-giao'

/** `{ revisionId, ids }`: kiện điểm `stop` của revision đã duyệt mới nhất, theo `unloadingOrder`. */
function approvedUnloadOrder(page: Page, stop: number) {
  return page.evaluate(async ({ url, tripId, stop }) => {
    const { getMockDb } = (await import(url)) as typeof import('@/lib/mock-db')
    const revisions = await getMockDb().listRevisions(tripId)
    const approved = revisions.findLast((revision) => revision.approvedAt !== undefined)!
    const prefixes = approved.request.packages.filter((pkg) => pkg.deliveryStop === stop).map((pkg) => `${pkg.id}-`)
    const ids = approved.result.placements
      .filter((p) => prefixes.some((prefix) => p.packageInstanceId.startsWith(prefix)))
      .sort((a, b) => a.unloadingOrder - b.unloadingOrder)
      .map((p) => p.packageInstanceId)
    return { revisionId: approved.id, ids }
  }, { url: MOCK_DB, tripId: SEED_TRIP, stop })
}

function rowIds(page: Page) {
  return page.locator('li[data-package-id]').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-package-id')))
}

test('phone: unload order equals the approved revision; Three.js loads only on "Xem vị trí hàng"', { tag: '@phone' }, async ({ page, login, browserErrors }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await login(DRIVER)
  await expect(page.getByRole('heading', { name: 'Điểm 1 / 4', exact: true })).toBeVisible()

  const expected = await approvedUnloadOrder(page, 1)
  expect(expected.ids.length).toBeGreaterThan(0)
  expect(await rowIds(page)).toStrictEqual(expected.ids)
  expect(await page.locator('canvas').count()).toBe(0)
  expect(requests.some((url) => /@react-three|three\.module|three\.core/.test(url)), 'driver 2D must not fetch Three.js').toBe(false)

  const viewCargo = page.getByRole('button', { name: 'Xem vị trí hàng', exact: true })
  expect((await viewCargo.boundingBox())!.height).toBeGreaterThanOrEqual(56)
  await viewCargo.tap()
  await expect(page.locator('[data-experience="driver"]')).toHaveCount(1)
  const dialog = page.getByRole('dialog', { name: 'Vị trí hàng tại điểm giao' })
  // Thứ tự dỡ của kết quả, không phải thứ tự gợi ý
  await expect(dialog).toContainText('Thứ tự dỡ · Mô phỏng không đánh dấu giao hàng')
  await expect(dialog).not.toContainText('gợi ý')
  await expect(dialog).toContainText(`Hiện tại ${expected.ids[0]}`)
  expect(browserErrors).toStrictEqual([])
})

test('a newly approved revision reaches the driver screen without reload', async ({ page, login, browserErrors }) => {
  await login(`/chuyen/${SEED_TRIP}/phuong-an`)
  await page.locator('canvas').waitFor()
  await page.getByRole('button', { name: 'Duyệt phương án', exact: true }).click()
  await page.getByRole('dialog', { name: 'Duyệt phương án này?' }).getByRole('button', { name: 'Duyệt', exact: true }).click()
  await expect(page.getByText('Đã duyệt phương án.')).toBeVisible()
  await page.waitForURL(/\/phuong-an\?revision=/)

  await navigateInApp(page, `${DRIVER}?chuyen=${SEED_TRIP}`)
  await expect(page.getByRole('heading', { name: 'Điểm 1 / 4', exact: true })).toBeVisible()
  const expected = await approvedUnloadOrder(page, 1)
  expect(expected.revisionId).not.toBe('REV-002')
  await expect.poll(() => rowIds(page)).toStrictEqual(expected.ids)
  expect(browserErrors).toStrictEqual([])
})
